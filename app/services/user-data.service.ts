import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { protocol } from 'electron';

export class UserDataService {
  constructor(private readonly dataPath: string) {}
  init() {
    protocol.handle('phobos-data', async (req) => {
      if (req.method === 'GET') {
        const filePath = req.url.slice('phobos-data://'.length);
        return new Response(await this.readDataFile(filePath));
      } else if (req.method === 'POST') {
        const filePath = req.url.slice('phobos-data://'.length);
        const data = await req.arrayBuffer();
        await this.writeDataFile(filePath, data);
        return new Response();
      }
      return new Response(null);
    });
  }

  readDataFile(path: string) {
    // TODO: This probably allows reading outside the data dir
    // Ensure that the path is within the dir
    return readFile(resolve(this.dataPath, path));
  }

  async getBase64Image(path: string) {
    // TODO: This is probably super unreliable
    if (path) {
      const extension = path.split('.').pop() ?? 'png';
      const data = await readFile(path);
      return `data:image/${extension};base64,${data.toString('base64')}`;
    }
    return '';
  }

  async writeDataFile(path: string, value: ArrayBuffer) {
    const fullPath = resolve(this.dataPath, path);
    await writeFile(resolve(this.dataPath, path), Buffer.from(value));
    return fullPath;
  }
}
