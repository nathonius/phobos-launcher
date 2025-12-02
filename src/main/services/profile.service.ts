import { spawn } from 'node:child_process';
import filenamify from 'filenamify';
import type { Cvar, Profile, UniqueFileRecord } from '../../shared/config';
import { getPhobos } from '../../main';
import { ipcHandler, PhobosApi } from '../api';
import { getStore } from '../store/store';

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
  saveProfile(config: Profile) {
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
  launchProfile(config: Profile | string) {
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
    const base = bases.find((b) => b.id === profile.base);
    const engine = engines.find((e) => e.id === profile.engine);
    if (!base || !engine) {
      // TODO: Handle this error condition
      return;
    }
    const configArg = engine.config ? ['-config', engine.config] : [];
    const baseArg = ['-iwad', base.path];

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
      files.push(...this.getProfileFiles(parent));
      cvars.push(...this.prepareCvars(parent?.cvars ?? [], cvarCtx));
    }
    files.push(...this.getProfileFiles(profile));
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

  private getProfileById(id: string) {
    return this.getProfiles().find((p) => p.id === id);
  }

  private getProfileFiles(profile: Profile | undefined): string[] {
    return profile?.files.flatMap((f) => ['-file', f]) ?? [];
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
