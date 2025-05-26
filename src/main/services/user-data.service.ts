import { readFile, writeFile, stat, mkdir } from 'node:fs/promises';
import { resolve, extname, join, basename, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { dialog, protocol, net } from 'electron';
import { defaultFormats, defaultPlugins } from 'jimp';
import { createJimp } from '@jimp/core';
import { filenamifyPath } from 'filenamify';
import { get, set } from 'lodash-es';
import { ipcHandler, PhobosApi } from '../api';
import { asBase64Image, simpleHash } from '../util';
import { getPhobos } from '../../main';
import type { CompressedImage } from '../../shared/config';
import { getStore } from '../store';

// TODO: Figure out how to include the jimp wasm webp plugin
const JIMP_SUPPORTED_FORMATS = [
  '.bmp',
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.tiff',
];

export class UserDataService extends PhobosApi {
  public static readonly scheme = 'phobos-data';
  private readonly dataPath: string;
  private readonly jimp = createJimp({
    formats: [...defaultFormats],
    plugins: defaultPlugins,
  });
  constructor(dataPath: string) {
    super();
    this.dataPath = dataPath;
    protocol.handle(UserDataService.scheme, async (req) => {
      const url = new URL(req.url);
      switch (url.hostname) {
        case 'save-to-app-data': {
          const filePath = url.searchParams.get('path');
          if (!filePath) {
            return new Response(null, { status: 400 });
          }
          const compress = url.searchParams.get('compress') ?? '';
          const extension = extname(filePath).toLowerCase();
          if (
            JIMP_SUPPORTED_FORMATS.includes(extension) &&
            compress !== 'false'
          ) {
            try {
              const imageBuffer = await (
                await net.fetch(pathToFileURL(filePath).href)
              ).arrayBuffer();
              const { buffer, ...compressed } = await this.createCompressed(
                imageBuffer,
                filePath
              );
              const compressedImageConfig: CompressedImage = {
                ...compressed,
                originalPath: compressed.compressedPath,
                neverReplace: true,
              };
              // Store the compressed image as the original path
              const compressedKey = `processed-image.${compressed.compressedPath}`;
              await getStore().update(({ internal }) => {
                set(internal, compressedKey, compressedImageConfig);
              });
              // Return the path of the copied image
              return new Response(JSON.stringify(compressed.compressedPath));
            } catch (err) {
              // If something fails, let the UI know
              console.error(`COULD NOT SAVE FILE TO APP DATA`);
              console.error(err);
            }
          } else {
            return new Response(null, {
              status: 400,
              statusText: 'Endpoint only supports compressible images',
            });
          }
          return new Response(null, {
            status: 500,
            statusText: 'Failed to save.',
          });
        }
        case 'get-file': {
          const filePath = url.searchParams.get('path');
          if (!filePath) {
            return new Response(null, { status: 400 });
          }
          const compress = url.searchParams.get('compress') ?? '';
          const extension = extname(filePath).toLowerCase();
          if (
            JIMP_SUPPORTED_FORMATS.includes(extension) &&
            compress !== 'false'
          ) {
            try {
              return new Response(await this.getOrCreateCompressed(filePath));
            } catch (err) {
              // If something fails, fall back to returning the original file
              console.error(`COULD NOT LOAD COMPRESSED FILE`);
              console.error(err);
            }
          }

          const imageResponse = await net.fetch(pathToFileURL(filePath).href);

          const buffer: ArrayBuffer | Buffer<ArrayBufferLike> =
            await imageResponse.arrayBuffer();

          return new Response(buffer);
        }
        default:
          return new Response('Unknown endpoint.', { status: 400 });
      }
    });
  }

  public wadDataDir(): string {
    const userTempDir = getPhobos().settingsService.getSetting(
      'tempDataPath'
    ) as string | null;
    const dataPath = userTempDir ?? this.dataPath;
    return join(dataPath, 'extracted-graphics');
  }

  async getOrCreateCompressed(
    path: string
  ): Promise<ArrayBuffer | Buffer<ArrayBufferLike>> {
    const store = getStore();
    const compressedKey = `processed-image.${path}`;
    const fileStats = await stat(path);
    const maybeCompressed = get(store.data.internal, compressedKey) as
      | CompressedImage
      | undefined;
    let compressedExists = false;
    if (maybeCompressed?.compressedPath) {
      compressedExists = Boolean(await stat(maybeCompressed.compressedPath));
    }

    if (compressedExists && fileStats.mtimeMs === maybeCompressed?.modifiedMs) {
      return (
        await net.fetch(pathToFileURL(maybeCompressed.compressedPath).href)
      ).arrayBuffer();
    }

    const imageBuffer = await (
      await net.fetch(pathToFileURL(path).href)
    ).arrayBuffer();
    const { buffer, ...compressed } = await this.createCompressed(
      imageBuffer,
      path,
      fileStats.mtimeMs
    );
    await store.update(({ internal }) => {
      set(internal, compressedKey, compressed);
    });
    return buffer;
  }

  public async createCompressed(
    imageBuffer: ArrayBuffer,
    originalPath: string,
    modifiedMs: number = 0
  ): Promise<
    CompressedImage & { buffer: ArrayBuffer | Buffer<ArrayBufferLike> }
  > {
    // Compress image
    const compressed = (await this.jimp.fromBuffer(imageBuffer)).scaleToFit({
      w: 300,
      h: 300,
    });

    // Hash the original path for uniqueness
    const hash = simpleHash(originalPath);

    // Write to disk
    const compressedPath = join(
      this.dataPath,
      'processed-images',
      `${hash}_${basename(originalPath)}`
    );
    const buffer = await compressed.getBuffer('image/png');
    // Write buffer
    await mkdir(dirname(compressedPath), { recursive: true });
    await writeFile(compressedPath, buffer);

    // Return written path and buffer
    return {
      originalPath,
      compressedPath,
      modifiedMs,
      buffer,
      neverReplace: false,
    };
  }

  readDataFile(path: string) {
    // TODO: This probably allows reading outside the data dir
    // Ensure that the path is within the dir
    return readFile(resolve(this.dataPath, path));
  }

  @ipcHandler('fileSystem.getBase64Image')
  async getBase64Image(path: string) {
    // TODO: This is probably super unreliable
    if (path) {
      const extension = path.split('.').pop() ?? 'png';
      const data = await readFile(path);
      return asBase64Image(data, extension);
    }
    return '';
  }

  @ipcHandler('fileSystem.showOpenDialog')
  showOpenDialog(args?: Electron.OpenDialogOptions) {
    return dialog.showOpenDialog(args ?? {});
  }

  async writeDataFile(path: string, value: ArrayBuffer) {
    const fullPath = resolve(this.dataPath, path);
    await writeFile(resolve(this.dataPath, path), Buffer.from(value));
    return fullPath;
  }

  async makeWadDataDir(wadPath: string) {
    const base = this.wadDataDir();
    const wadSafePath = basename(filenamifyPath(wadPath, { replacement: '' }))
      .replaceAll(/\s/g, '_')
      .toLowerCase();
    const path = join(base, wadSafePath);
    await mkdir(path, { recursive: true });

    // Make graphics, lumps subfolders as well to help with pk3s
    await mkdir(join(path, 'graphics'), { recursive: true });
    await mkdir(join(path, 'lumps'), { recursive: true });

    return path;
  }
}
