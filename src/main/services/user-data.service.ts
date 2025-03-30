/* eslint-disable no-case-declarations */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { dialog, protocol, net } from 'electron';
import { Jimp } from 'jimp';
import { ipcHandler, PhobosApi } from '../api';

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
  constructor(private readonly dataPath: string) {
    super();
    protocol.handle('phobos-data', async (req) => {
      const url = new URL(req.url);
      switch (url.hostname) {
        case 'get-file':
          const fileUrl = pathToFileURL(
            url.searchParams.get('path') as string
          ).href;
          const extension = extname(fileUrl).toLowerCase();
          const imageResponse = await net.fetch(
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            pathToFileURL(url.searchParams.get('path') as string).href
          );

          let buffer: ArrayBuffer | Buffer<ArrayBufferLike> =
            await imageResponse.arrayBuffer();
          if (JIMP_SUPPORTED_FORMATS.includes(extension)) {
            buffer = await (await Jimp.read(buffer))
              .scaleToFit({ w: 300, h: 300 })
              .getBuffer('image/png');
          }
          return new Response(buffer);
        default:
          return new Response('Unknown endpoint.', { status: 400 });
      }
    });
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
      return `data:image/${extension};base64,${data.toString('base64')}`;
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
}
