import { readFile, writeFile, stat, mkdir } from 'node:fs/promises';
import { resolve, extname, join, basename, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { dialog, protocol, net } from 'electron';
import { defaultFormats, defaultPlugins } from 'jimp';
import { createJimp } from '@jimp/core';
import type Store from 'electron-store';
import { filenamifyPath } from 'filenamify';
import { ipcHandler, PhobosApi } from '../api';
import { asBase64Image, simpleHash } from '../util';

// TODO: Figure out how to include the jimp wasm webp plugin
const JIMP_SUPPORTED_FORMATS = [
  '.bmp',
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.tiff',
];

interface CompressedImage {
  originalPath: string;
  compressedPath: string;
  modifiedMs: number;
}

export class UserDataService extends PhobosApi {
  private readonly dataPath: string;
  private readonly store: Store;
  private readonly jimp = createJimp({
    formats: [...defaultFormats],
    plugins: defaultPlugins,
  });
  constructor(dataPath: string, store: Store) {
    super();
    this.dataPath = dataPath;
    this.store = store;
    protocol.handle('phobos-data', async (req) => {
      const url = new URL(req.url);
      switch (url.hostname) {
        case 'get-file': {
          const filePath = url.searchParams.get('path');
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
    return join(this.dataPath, 'extracted-graphics');
  }

  async getOrCreateCompressed(
    path: string
  ): Promise<ArrayBuffer | Buffer<ArrayBufferLike>> {
    const compressedKey = `internal.processed-image.${path}`;
    const fileStats = await stat(path);
    const maybeCompressed = this.store.get(
      compressedKey
    ) as CompressedImage | null;
    const compressedExists =
      Boolean(maybeCompressed?.compressedPath) &&
      Boolean(await stat(maybeCompressed.compressedPath));

    if (compressedExists && fileStats.mtimeMs === maybeCompressed.modifiedMs) {
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
    this.store.set(compressedKey, compressed);
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
    const path = join(
      this.dataPath,
      'extracted-graphics',
      basename(filenamifyPath(wadPath, { replacement: '' }))
    );
    await mkdir(path, { recursive: true });

    // Make graphics subfolder as well to help with pk3s
    await mkdir(join(path, 'graphics'), { recursive: true });

    return path;
  }
}
