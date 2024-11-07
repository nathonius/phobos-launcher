import { spawn } from 'node:child_process';
import type { Engine, Profile, UniqueFileRecord } from '@shared/config';
import type Store from 'electron-store';
import { getPhobos } from '../main';
import { ipcHandler, PhobosApi } from '../api';

export interface FsError extends Error {
  code: string;
}

export class ProfileService extends PhobosApi {
  public constructor(private readonly store: Store) {
    super();
  }

  @ipcHandler('profile.getProfiles')
  getProfiles(): Profile[] {
    return this.store.get('profiles', []) as Profile[];
  }

  getProfileByName(name: string): Profile | null {
    return this.getProfiles().find((p) => p.name === name) ?? null;
  }

  @ipcHandler('profile.save')
  saveProfile(config: Profile): void {
    const profiles = this.getProfiles();
    // Find existing profile
    const matchingProfileIndex = profiles.findIndex((p) => p.id === config.id);
    if (matchingProfileIndex !== -1) {
      profiles[matchingProfileIndex] = config;
    } else {
      profiles.unshift(config);
    }
    this.store.set('profiles', profiles);
  }

  @ipcHandler('profile.delete')
  deleteProfileById(id: string): void {
    const profiles = this.getProfiles();
    const profileIndex = profiles.findIndex((p) => p.id === id);
    if (profileIndex !== -1) {
      profiles.splice(profileIndex, 1);
      this.store.set('profiles', profiles);
    }
  }

  @ipcHandler('profile.launchCustom')
  launchProfile(config: Profile | string) {
    // Get the matching profile for this ID or profile
    let profile: Profile;
    if (typeof config === 'string') {
      const matchingProfile = this.getProfiles().find((p) => p.id === config);
      if (!matchingProfile) {
        return;
      }
      profile = matchingProfile;
    } else {
      profile = config;
    }

    // Prepare args
    // TODO: Logic to actually parse these settings should live elsewhere
    const engines = (getPhobos().settingsService.getSetting('engines') ??
      []) as Engine[];
    const bases = (getPhobos().settingsService.getSetting('bases') ??
      []) as UniqueFileRecord[];
    const base = bases.find((b) => b.id === profile.base);
    const engine = engines.find((e) => e.id === profile.engine);
    if (!base || !engine) {
      // TODO: Handle this error condition
      return;
    }
    const baseArg = ['-iwad', base.path];
    const files = profile.files.flatMap((f) => ['-file', f]);
    const cvars = profile.cvars.flatMap((v) => ['+set', v.var, v.value]);
    const process = spawn(engine.path, [...baseArg, ...files, ...cvars]);
  }
}
