import { readFile, access } from 'node:fs/promises';
import { join, dirname, resolve as resolvePath } from 'node:path';
import { spawn } from 'node:child_process';
import { readWad, readLumpData } from '@nrkn/wad';
import type { Wad } from '@nrkn/wad/dist/wad/types';
import type { Picture } from '@nrkn/wad/dist/lumps/types';
import { ipcHandler, PhobosApi } from '../api';
import type { WadInfo } from '../../shared/lib/wad';
import { getPhobos } from '../../main';
import type { UniqueFileRecord } from '../../shared/config';

const mapname = /^map\s+MAP\d+.*"(?<mapname>.+)"/gm;

export class WadService extends PhobosApi {
  public async extractGraphics(wadPath: string) {
    const deutexPath = getPhobos().settingsService.getSetting('deutexPath') as
      | string
      | null;
    if (!deutexPath) {
      console.error('DeuTex path not set.');
      return;
    }
    const bases = (getPhobos().settingsService.getSetting('bases') ??
      []) as UniqueFileRecord[];
    const doom2 = bases.find((b) => b.path.toLowerCase().endsWith('doom2.wad'));
    if (!doom2) {
      console.error('Could not find doom 2 wad for deutex extraction.');
      return;
    }

    const wadDataDir = resolvePath(
      await getPhobos().userDataService.makeWadDataDir(wadPath)
    );
    const args = [
      '-doom2',
      `${resolvePath(dirname(doom2.path))}`,
      '-dir',
      `${resolvePath(wadDataDir)}`,
      '-overwrite',
      '-graphics',
      '-extract',
      `${resolvePath(wadPath)}`,
    ];

    const { promise, resolve } = Promise.withResolvers();
    const _process = spawn(deutexPath, args);
    _process.on('close', (code) => {
      resolve(code);
    });
    _process.stdout.on('data', (data) => {
      console.debug(`stdout: ${data}`);
    });
    _process.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    await promise;
    return wadDataDir;
  }

  @ipcHandler('wad.getGraphics')
  public async getGraphic(wadPath: string, lumpNames: string[]) {
    let dir: string;
    try {
      dir = await this.extractGraphics(wadPath);
    } catch (err) {
      console.error(`Could not read graphics for ${wadPath}`);
      console.error(err);
      return null;
    }
    const foundFiles: string[] = [];
    for (const lumpName of lumpNames) {
      const path = join(dir, 'graphics', `${lumpName.toLowerCase()}.png`);
      try {
        await access(path);
        foundFiles.push(path);
      } catch (_err) {
        console.debug(`No file found at ${path}`);
      }
    }
    return foundFiles;
  }

  @ipcHandler('wad.getInfo')
  public async getInfo(wadPath: string): Promise<WadInfo | null> {
    const wad = await this.getWad(wadPath);
    if (!wad) {
      return null;
    }
    const wadInfo: WadInfo = {
      maps: [],
      info: this.readTextLump(wad, 'WADINFO') ?? '',
      lumps: wad.lumps.map((l) => l.name),
    };

    const mapinfoLump = this.readTextLump(wad, 'MAPINFO');
    const zmapinfoLump = this.readTextLump(wad, 'ZMAPINFO');
    if (mapinfoLump) {
      let result: RegExpExecArray | null = mapname.exec(mapinfoLump);
      while (result !== null) {
        wadInfo.maps.push(result.groups.mapname);
        result = mapname.exec(mapinfoLump);
      }
    } else if (zmapinfoLump) {
      let result: RegExpExecArray | null = mapname.exec(zmapinfoLump);
      while (result !== null) {
        wadInfo.maps.push(result.groups.mapname);
        result = mapname.exec(zmapinfoLump);
      }
    }
    return wadInfo;
  }

  private readTextLump(wad: Wad, lumpName: string): string | null {
    const lump = wad.lumps.find(
      (l) => l.name.toUpperCase() === lumpName.toUpperCase()
    );
    if (!lump) {
      return null;
    }
    try {
      const data = this.readLumpData(lump.data, 'raw') as DataView;
      const decoder = new TextDecoder();
      return decoder.decode(data);
    } catch (err) {
      console.warn(`Could not read ${lumpName}`);
      console.warn(err);
      return null;
    }
  }

  private async getWad(wadPath: string): Promise<Wad | null> {
    const wadFile = await readFile(wadPath);
    if (!wadFile) {
      return null;
    }
    let wad: Wad | null = null;
    try {
      wad = readWad(wadFile);
    } catch (err) {
      console.warn(`Failed to read wad file ${wadPath}`);
      console.warn(err);
    }
    if (!wad) {
      return null;
    }
    return wad;
  }

  private readLumpData(lumpData: Uint8Array, lumpType: string = 'raw') {
    const name = lumpType.toLowerCase().trim();
    if (name === 'picture') {
      return this.readPicture(new DataView(lumpData.buffer));
    }
    return readLumpData(lumpData, lumpType) as DataView;
  }

  readUint8(view: DataView, offset: number) {
    return view.getUint8(offset);
  }

  readInt16(view: DataView, offset: number) {
    return view.getInt16(offset, true);
  }

  readUint16(view: DataView, offset: number) {
    return view.getUint16(offset, true);
  }

  readInt32(view: DataView, offset: number) {
    return view.getInt32(offset, true);
  }

  readPicture(view: DataView): Picture {
    const width = this.readInt16(view, 0);
    const height = this.readInt16(view, 2);
    const left = this.readInt16(view, 4);
    const top = this.readInt16(view, 6);
    const columnOffsets = [];
    const columns = [];
    let offset = 8;
    for (let i = 0; i < width; i++) {
      try {
        columnOffsets.push(this.readInt32(view, offset));
        offset += 4;
        columns.push(new Uint8Array(height));
      } catch (err) {
        console.error(err);
      }
    }
    for (let i = 0; i < width; i++) {
      offset = columnOffsets[i];
      let rowStart = 0;
      while (rowStart !== 255) {
        rowStart = this.readUint8(view, offset);
        offset++;
        if (rowStart === 255) break;
        const pixelCount = this.readUint8(view, offset);
        offset++;
        //skip dummy byte
        offset++;
        for (let j = 0; j < pixelCount; j++) {
          columns[i][j + rowStart] = this.readUint8(view, offset);
          offset++;
        }
        //skip dummy byte
        offset++;
      }
    }
    return {
      width,
      height,
      left,
      top,
      columns,
    };
  }
}
