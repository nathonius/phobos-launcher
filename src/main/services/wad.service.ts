import { readFile } from 'node:fs/promises';
import { readWad, readLumpData } from '@nrkn/wad';
import type { Wad } from '@nrkn/wad/dist/wad/types';
import { ipcHandler, PhobosApi } from '../api';
import type { WadInfo } from '../../shared/lib/wad';

const mapname = /^map\s+MAP\d+.*"(?<mapname>.+)"/gm;

export class WadService extends PhobosApi {
  @ipcHandler('wad.getInfo')
  public async getInfo(wadPath: string): Promise<WadInfo | null> {
    const wad = await this.getWad(wadPath);
    if (!wad) {
      return null;
    }
    const wadInfo: WadInfo = {
      maps: [],
      info: this.readTextLump(wad, 'WADINFO') ?? '',
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
      const data = readLumpData(lump.data, 'raw') as DataView;
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
}
