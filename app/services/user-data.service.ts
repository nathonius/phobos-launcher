/* eslint-disable no-case-declarations */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { dialog, protocol, net } from 'electron';
import sharp from 'sharp';
import { ipcHandler, PhobosApi } from '../api';

export class UserDataService extends PhobosApi {
  constructor(private readonly dataPath: string) {
    super();
    protocol.handle('phobos-data', async (req) => {
      const url = new URL(req.url);
      switch (url.hostname) {
        case 'get-file':
          const imageResponse = await net.fetch(
            pathToFileURL(url.searchParams.get('path') as string).href
          );
          const buffer = await imageResponse.arrayBuffer();
          const compressed = await sharp(buffer)
            .resize({
              width: 300,
              height: 300,
              fit: 'inside',
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .toBuffer();
          return new Response(compressed);
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
