import { readFile, access, rm } from 'node:fs/promises';
import { join, normalize, resolve } from 'node:path';
import { readWad, readLumpData } from '@nrkn/wad';
import type { Wad } from '@nrkn/wad/dist/wad/types';
import { ipcHandler, PhobosApi } from '../api';
import type { WadInfo } from '../../shared/lib/wad';
import { deutexExtract } from '../lib/deutex';
import { pk3Extract } from '../lib/pk3';
import { getPhobos } from '../../main';

const mapname = /^map\s+MAP\d+.*"(?<mapname>.+)"/gm;

export class WadService extends PhobosApi {
  @ipcHandler('wad.clearDataDir')
  public async clearDataDir(_subdir?: string) {
    const dataDir = getPhobos().userDataService.wadDataDir();
    const subdir = normalize(_subdir ?? '');
    // Triple check we aren't deleting something we shouldn't
    if (
      subdir.startsWith('..') ||
      !resolve(dataDir, subdir).startsWith(dataDir)
    ) {
      throw new Error(
        `Tried to delete ${subdir}, which is not a valid wad data dir.`
      );
    }
    const path = join(dataDir, normalize(subdir ?? ''));
    try {
      await access(path);
      await rm(path, { force: true, recursive: true });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  @ipcHandler('wad.getGraphics')
  public async getGraphic(wadPath: string, lumpNames: string[]) {
    let dir: string;
    try {
      if (wadPath.toLowerCase().endsWith('.pk3')) {
        dir = await pk3Extract(wadPath, lumpNames);
      } else {
        dir = await deutexExtract(wadPath);
      }
    } catch (err) {
      console.error(`Could not read graphics for ${wadPath}`);
      console.error(err);
      return null;
    }

    if (!dir) {
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
    if (!wadPath.toLowerCase().endsWith('.wad')) {
      console.warn(`Can't read non-wad file ${wadPath}`);
      return null;
    }
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
