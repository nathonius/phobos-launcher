import { spawn } from 'node:child_process';
import { basename, isAbsolute, join, relative, resolve } from 'node:path';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import filenamify from 'filenamify';
import { v4 } from 'uuid';
import unzipper from 'unzipper';
import type { Cvar, Profile } from '../../shared/config';
import { getPhobos } from '../../main';
import { ipcHandler, PhobosApi } from '../api';
import { backupStore, getStore } from '../store/store';
import { simpleHash } from '../util';
import { logger } from '../logger';

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
        (p) => p.id === config.id,
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

  @ipcHandler('profile.newProfileFromArchive')
  async newProfileFromArchive(archivePath: string) {
    // Get defaults
    const defaultBase = getPhobos().settingsService.getSetting(
      'defaultBase',
    ) as string;
    const defaultEngine = getPhobos().settingsService.getSetting(
      'defaultEngine',
    ) as string;

    // Set up the profile
    const profile: Profile = {
      background: '',
      base: defaultBase ?? '',
      categories: [],
      complete: false,
      created: new Date().toISOString(),
      cvars: [],
      engine: defaultEngine ?? '',
      files: [],
      icon: '',
      id: v4(),
      lastPlayed: null,
      modified: new Date().toISOString(),
      name: '',
      parents: [],
      rating: null,
      tags: [],
      description: '',
      extraArgs: '',
    };

    // Create directory for profile files
    const profilePath = join(
      getPhobos().userDataService.dataPath,
      'profiles',
      profile.id,
    );
    await mkdir(profilePath, { recursive: true });

    // Extract to dir
    const archive = await unzipper.Open.file(archivePath);
    const files = archive.files.map((f) => f.path);
    await archive.extract({ path: profilePath });

    // Find wads/pk3s
    const gameFiles = files.filter(
      (path) =>
        path.toLowerCase().endsWith('.wad') ||
        path.toLowerCase().endsWith('.pk3'),
    );

    // TODO: Parse a text file for metadata on the wad
    const textFile = files.find((f) => f.toLowerCase().endsWith('.txt'));
    if (textFile) {
      logger.info(`Parsing text file ${textFile}`);
      const contents = await readFile(join(profilePath, textFile), {
        encoding: 'utf-8',
      });
      const titleRegex = /[Tt]itle\s*:\s*(?<title>.+)$/m;
      const match = contents.match(titleRegex);
      if (match && match[1]) {
        profile.name = match[1].trim();
      }
    }

    if (gameFiles.length > 0) {
      profile.files = gameFiles.map((path) => join(profilePath, path));
      if (!profile.name) {
        profile.name = basename(profile.files[0]);
      }
    }

    await this.saveProfile(profile);

    return profile.id;
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
    const bases = getPhobos().baseService.getBases() ?? [];
    const dataDirs = (getPhobos().settingsService.getSetting('dataDirs') ??
      []) as string[];
    const base = bases.find((b) => b.id === profile.base);
    const engine = engines.find((e) => e.id === profile.engine);
    const extraArgs = (profile.extraArgs ?? '')
      .split(' ')
      .filter((arg) => Boolean(arg));
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
      'defaultCvars',
    ) ?? []) as Cvar[];
    logger.debug(`Got ${defaultCvars.length} default cvars`);

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

    const args = [...configArg, ...baseArg, ...files, ...cvars, ...extraArgs];
    logger.info(`Launching with ${engine.path} with args`, args);
    logger.info(`${engine.path} ${args.join(' ')}`);

    const _process = spawn(engine.path, args, { detached: true });
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
        dataDirs,
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
        dataDirs,
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
    dataDirs: string[],
  ): Promise<string[]> {
    const filePaths: string[] = [];
    for (const file of profile?.files ?? []) {
      filePaths.push(
        await getPhobos().userDataService.resolveFilePath(file, dataDirs),
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
