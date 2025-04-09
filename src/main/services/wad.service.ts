import { readFile } from 'node:fs/promises';
import { readWad, readLumpData } from '@nrkn/wad';
import type { Wad } from '@nrkn/wad/dist/wad/types';
import { ipcHandler, PhobosApi } from '../api';
import type { LumpType } from '../../shared/lib/wad';

export class WadService extends PhobosApi {
  @ipcHandler('wad.listLumps')
  public async listLumps(wadPath: string) {
    const wad = await this.getWad(wadPath);
    return wad.lumps.map((l) => l.name);
  }

  @ipcHandler('wad.getLump')
  public async getLump(
    wadPath: string,
    lumpName: string,
    lumpType: LumpType
  ): Promise<unknown> {
    const wad = await this.getWad(wadPath);
    if (!wad) {
      return null;
    }
    const lump = wad.lumps.find((l) => l.name === lumpName);
    if (!lump) {
      return null;
    }
    const data = readLumpData(lump.data, lumpType);
    return data;
  }

  private async getWad(wadPath: string): Promise<Wad | null> {
    const wadFile = await readFile(wadPath);
    if (!wadFile) {
      return null;
    }
    const wad = readWad(wadFile);
    if (!wad) {
      return null;
    }
    return wad;
  }
}
