import { spawn } from 'node:child_process';
import { basename, isAbsolute, join, relative, resolve } from 'node:path';
import { copyFile } from 'node:fs/promises';
import filenamify from 'filenamify';
import type { Cvar, Profile, UniqueFileRecord } from '../../shared/config';
import { getPhobos } from '../../main';
import { ipcHandler, PhobosApi } from '../api';
import { backupStore, getStore } from '../store/store';
import { simpleHash } from '../util';

export interface FsError extends Error {
  code: string;
}

type CvarContext = Record<string, string>;

export class ProfileService extends PhobosApi {
  public constructor() {
    super();
  }

  @ipcHandler('profile.getProfiles')
  getProfiles(): Profile[] {
    return getStore().data.profiles;
  }

  getProfileByName(name: string): Profile | null {
    return this.getProfiles().find((p) => p.name === name) ?? null;
  }

  @ipcHandler('profile.save')
  async saveProfile(config: Profile) {
    // Ensure profile icon is stored in user data dir
    const dataDir = getPhobos().userDataService.dataPath;
    const targetDir = join(dataDir, 'profile-images');
    const resolvedPath = resolve(dataDir, config.icon ?? '');

    if (
      config.icon &&
      (isAbsolute(config.icon) ||
        relative(dataDir, resolvedPath).startsWith('..'))
    ) {
      const filename = `${simpleHash(config.icon)}_${basename(config.icon)}`;
      const newIconPath = join(targetDir, filename);
      copyFile(config.icon, newIconPath);
      config.icon = relative(dataDir, newIconPath);
    }

    return getStore().update(({ profiles }) => {
      const matchingProfileIndex = profiles.findIndex(
        (p) => p.id === config.id
      );
      if (matchingProfileIndex !== -1) {
        profiles[matchingProfileIndex] = config;
      } else {
        profiles.unshift(config);
      }
    });
  }

  @ipcHandler('profile.delete')
  deleteProfileById(id: string) {
    return getStore().update(({ profiles }) => {
      const profileIndex = profiles.findIndex((p) => p.id === id);
      if (profileIndex !== -1) {
        profiles.splice(profileIndex, 1);
      }
    });
  }

  @ipcHandler('profile.launchCustom')
  async launchProfile(config: Profile | string) {
    const allProfiles = this.getProfiles();
    // Get the matching profile for this ID or profile
    let profile: Profile;
    if (typeof config === 'string') {
      const matchingProfile = allProfiles.find((p) => p.id === config);
      if (!matchingProfile) {
        return;
      }
      profile = matchingProfile;
    } else {
      profile = config;
    }

    // Set profile last played
    this.saveProfile({ ...profile, lastPlayed: new Date().toISOString() });

    // Prepare args
    // TODO: Logic to actually parse these settings should live elsewhere
    const engines = getPhobos().engineService.getEngines();
    const bases = (getPhobos().settingsService.getSetting('bases') ??
      []) as UniqueFileRecord[];
    const dataDirs = (getPhobos().settingsService.getSetting('dataDirs') ??
      []) as string[];
    const base = bases.find((b) => b.id === profile.base);
    const engine = engines.find((e) => e.id === profile.engine);
    if (!base || !engine) {
      // TODO: Handle this error condition
      return;
    }
    const configArg = engine.config ? ['-config', engine.config] : [];
    const baseArg = [
      '-iwad',
      await getPhobos().userDataService.resolveFilePath(base.path, dataDirs),
    ];

    // TODO: Probably worth deduplicating these files
    const files: string[] = [];
    const cvarCtx: CvarContext = {
      slug: filenamify(profile.name, { replacement: '' }),
    };
    const defaultCvars = (getPhobos().settingsService.getSetting(
      'defaultCvars'
    ) ?? []) as Cvar[];

    let cvars: string[] = this.prepareCvars(defaultCvars, cvarCtx);
    for (const parentId of profile.parents) {
      const parent = this.getProfileById(parentId);
      files.push(...(await this.getProfileFiles(parent, dataDirs)));
      cvars.push(...this.prepareCvars(parent?.cvars ?? [], cvarCtx));
    }
    files.push(...(await this.getProfileFiles(profile, dataDirs)));
    cvars.push(...this.prepareCvars(profile.cvars, cvarCtx));

    // Don't use cvars for prboom style doom engines
    if (engine.style === 'prboom') {
      cvars = [];
    }

    const _process = spawn(engine.path, [
      ...configArg,
      ...baseArg,
      ...files,
      ...cvars,
    ]);
  }

  /**
   * Update all resource paths to use data dirs if they are children of
   * a data dir
   */
  @ipcHandler('profile.updateAllPaths')
  public async updateAllPaths(id: string) {
    const dataDirs = (getPhobos().settingsService.getSetting('dataDirs') ??
      []) as string[];
    const profile = this.getProfileById(id);
    if (dataDirs.length === 0 || !profile) {
      return;
    }

    let anyChanged = false;
    const newFiles: string[] = [];
    for (const file of profile.files) {
      const newPath = await getPhobos().userDataService.resolveShortestPath(
        file,
        dataDirs
      );
      if (newPath !== file) {
        anyChanged = true;
      }
      newFiles.push(newPath);
    }

    if (anyChanged) {
      await this.saveProfile({ ...profile, files: newFiles });
    }
  }

  public async absolutizePaths(id: string) {
    const dataDirs = (getPhobos().settingsService.getSetting('dataDirs') ??
      []) as string[];
    const profile = this.getProfileById(id);
    if (dataDirs.length === 0 || !profile) {
      return;
    }

    let anyChanged = false;
    const newFiles: string[] = [];
    for (const file of profile.files) {
      const newPath = await getPhobos().userDataService.resolveFilePath(
        file,
        dataDirs
      );
      if (newPath !== file) {
        anyChanged = true;
      }
      newFiles.push(newPath);
    }

    if (anyChanged) {
      await this.saveProfile({ ...profile, files: newFiles });
    }
  }

  @ipcHandler('profile.updateAllProfilesPaths')
  public async updateAllProfilesPaths() {
    // Create backup of store before actually doing this
    const backupPath = await backupStore();
    console.log(`Backed up store to ${backupPath}`);

    const profileIds = this.getProfiles().map((p) => p.id);
    for (const id of profileIds) {
      await this.updateAllPaths(id);
    }
  }

  @ipcHandler('profile.absolutizeAllProfilesPaths')
  public async asbolutizeAllProfilesPaths() {
    // Create backup of store before actually doing this
    const backupPath = await backupStore();
    console.log(`Backed up store to ${backupPath}`);

    const profileIds = this.getProfiles().map((p) => p.id);
    for (const id of profileIds) {
      await this.absolutizePaths(id);
    }
  }

  private getProfileById(id: string) {
    return this.getProfiles().find((p) => p.id === id);
  }

  private async getProfileFiles(
    profile: Profile | undefined,
    dataDirs: string[]
  ): Promise<string[]> {
    const filePaths: string[] = [];
    for (const file of profile?.files ?? []) {
      filePaths.push(
        await getPhobos().userDataService.resolveFilePath(file, dataDirs)
      );
    }
    return filePaths.flatMap((f) => ['-file', f]) ?? [];
  }

  private prepareCvars(cvars: Cvar[], ctx: CvarContext): string[] {
    // Do template replacements inside vars
    const template = (v: string) => {
      let result = v;
      for (const [templateVar, templateValue] of Object.entries(ctx)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        result = result.replaceAll(`{${templateVar}}`, templateValue);
      }
      return result;
    };
    return (
      cvars.flatMap((v) => ['+set', template(v.var), template(v.value)]) ?? []
    );
  }
}
