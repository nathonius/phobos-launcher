import { spawn } from 'node:child_process';
import type Store from 'electron-store';
import filenamify from 'filenamify';
import type { Cvar, Profile, UUID } from '../../shared/config';
import { getPhobos } from '../../main';
import { ipcHandler, PhobosApi } from '../api';
import type { PhobosStore } from '../store';

export interface FsError extends Error {
  code: string;
}

type CvarContext = Record<string, string>;

export class ProfileService extends PhobosApi {
  public constructor(
    private readonly store: PhobosStore,
    private readonly oldStore: Store
  ) {
    super();
  }

  @ipcHandler('profile.getProfiles')
  getProfiles(): Promise<Profile[]> {
    return this.store.profiles.values().all();
  }

  /**
   * @deprecated - Uses old store, should only be used for migration
   */
  _getProfiles(): Profile[] {
    return this.oldStore.get('profiles', []) as Profile[];
  }

  getProfileByName(name: string): Promise<Profile | null> {
    return this.getProfiles().then(
      (profiles) => profiles.find((p) => p.name === name) ?? null
    );
  }

  @ipcHandler('profile.save')
  saveProfile(config: Profile): Promise<void> {
    return this.store.profiles.put(config.id, config);
  }

  @ipcHandler('profile.delete')
  deleteProfileById(id: UUID): Promise<void> {
    return this.store.profiles.del(id);
  }

  @ipcHandler('profile.launchCustom')
  async launchProfile(config: Profile | UUID) {
    // Get the matching profile for this ID or profile
    let profile: Profile;
    if (typeof config === 'string') {
      const matchingProfile = await this.store.profiles.get(config);
      if (!matchingProfile) {
        return;
      }
      profile = matchingProfile;
    } else {
      profile = config;
    }

    // Set profile last played
    await this.saveProfile({
      ...profile,
      lastPlayed: new Date().toISOString(),
    });

    // Prepare args
    // TODO: Logic to actually parse these settings should live elsewhere
    const engine = await this.store.engines.get(profile.engine);
    const base = await this.store.bases.get(profile.base);
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

    const cvars: string[] = this.prepareCvars(defaultCvars, cvarCtx);
    const parents = await this.store.profiles.getMany(profile.parents);
    for (const parent of parents) {
      files.push(...this.getProfileFiles(parent));
      cvars.push(...this.prepareCvars(parent?.cvars ?? [], cvarCtx));
    }
    files.push(...this.getProfileFiles(profile));
    cvars.push(...this.prepareCvars(profile.cvars, cvarCtx));

    const _process = spawn(engine.path, [
      ...configArg,
      ...baseArg,
      ...files,
      ...cvars,
    ]);
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
