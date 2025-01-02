import { isAbsolute, resolve, dirname } from 'node:path';
import { readFile } from 'node:fs/promises';
import type {
  Category,
  Cvar,
  Engine,
  Profile,
  UniqueFileRecord,
} from '@shared/config';

import { v4 as uuid } from 'uuid';
import type { JSONValue } from '@shared/json';
import { ipcHandler, PhobosApi } from '../api';
import type { Arachnotron } from '../lib/arachnotron';
import type { Phobos } from '../phobos';

export class ImportService extends PhobosApi {
  public constructor(private readonly phobos: Phobos) {
    super();
  }

  @ipcHandler('import.arachnotron')
  public async arachnotronImport(basePath: string) {
    const profilesJsonPath = resolve(basePath, 'config', 'profiles.json');
    const categoriesJsonPath = resolve(basePath, 'config', 'categories.json');
    const settingsJsonPath = resolve(basePath, 'config', 'settings.json');

    const arachnotronSettings =
      await this.arachnotronReadFile<Arachnotron.SettingsJson>(
        settingsJsonPath
      );
    const arachnotronCategories =
      await this.arachnotronReadFile<Arachnotron.CategoriesJson>(
        categoriesJsonPath
      );
    const arachnotronProfiles =
      await this.arachnotronReadFile<Arachnotron.ProfilesJson>(
        profilesJsonPath
      );

    if (!arachnotronSettings) {
      throw new Error('Could not read Arachnotron settings.');
    }

    // Engines
    const engines: Arachnotron.Engine[] = arachnotronSettings.engines;
    console.log(`Found ${engines.length} engines to add.`);

    // IWads
    const iwads: Arachnotron.IWad[] = arachnotronSettings.iwads;
    console.log(`Found ${iwads.length} bases to add.`);

    // Categories
    const categories: Arachnotron.Category[] = [];
    for (const categoryPath of arachnotronCategories?.categories ?? []) {
      const resolvedCategoryPath = this.resolvePath(categoryPath, basePath);
      if (resolvedCategoryPath) {
        const category = await this.arachnotronReadFile<Arachnotron.Category>(
          resolvedCategoryPath
        );
        if (category) {
          category._path = dirname(resolvedCategoryPath);
          categories.push(category);
        }
      }
    }
    console.log(`Found ${categories.length} categories to add.`);

    // Profiles
    const profiles: Arachnotron.Profile[] = [];
    for (const profilePath of arachnotronProfiles?.profiles ?? []) {
      const resolvedProfilePath = this.resolvePath(profilePath, basePath);
      if (resolvedProfilePath) {
        const profile = await this.arachnotronReadFile<Arachnotron.Profile>(
          resolvedProfilePath
        );
        if (profile) {
          profile._path = dirname(resolvedProfilePath);
          profiles.push(profile);
        }
      }
    }
    console.log(`Found ${profiles.length} profiles to add.`);

    this.arachnotronImportCategories(categories, basePath);
    this.arachnotronImportEngines(engines, basePath);
    this.arachnotronImportBases(iwads, basePath);
    this.arachnotronImportProfiles(profiles, basePath);
  }

  public arachnotronImportCategories(
    categories: Arachnotron.Category[],
    basePath: string
  ) {
    const existingCategories = this.phobos.categoryService.getCategories();
    for (const cat of categories) {
      if (
        existingCategories.find(
          (c) => c.name.toLowerCase() === cat.name.toLowerCase()
        )
      ) {
        console.warn(`Skipping category ${cat.name}`);
        continue;
      }
      const newCategory: Category = {
        id: uuid(),
        icon:
          this.resolvePath(
            cat.iconPath,
            cat._path ?? resolve(basePath, 'config', 'categories')
          ) ?? '',
        name: cat.name,
      };
      this.phobos.categoryService.saveCategory(newCategory);
    }
  }

  public arachnotronImportEngines(
    engines: Arachnotron.Engine[],
    basePath: string
  ) {
    const currentEngines = this.phobos.settingsService.getSetting(
      'engines'
    ) as Engine[];
    const newEngines: Engine[] = [];
    for (const engine of engines) {
      const path = this.resolvePath(engine.path, basePath);
      if (!path) {
        console.warn(`Skipping engine ${engine.name}, it has no path.`);
        continue;
      }
      const newEngine: Engine = {
        id: uuid(),
        config: engine.config,
        name: engine.name,
        path,
      };
      if (
        currentEngines.find(
          (e) => e.name.toLowerCase() === newEngine.name.toLowerCase()
        )
      ) {
        console.warn(`Skipping engine ${newEngine.name}`);
        continue;
      }
      newEngines.push(newEngine);
    }

    currentEngines.push(...newEngines);
    console.info(
      `Adding ${newEngines.length} new engines from arachnotron config.`
    );
    this.phobos.settingsService.saveSetting(
      'engines',
      currentEngines as unknown as JSONValue
    );
  }

  public arachnotronImportBases(
    baseWads: Arachnotron.IWad[],
    basePath: string
  ) {
    const currentBases = this.phobos.settingsService.getSetting(
      'bases'
    ) as UniqueFileRecord[];
    const newBases: UniqueFileRecord[] = [];
    for (const base of baseWads) {
      const path = this.resolvePath(base.path, basePath);
      if (!path) {
        console.warn(`Skipping IWad ${base.name}, it has no path.`);
        continue;
      }
      const newBase: UniqueFileRecord = {
        id: uuid(),
        name: base.name,
        path,
      };
      if (
        currentBases.find(
          (e) => e.name.toLowerCase() === newBase.name.toLowerCase()
        )
      ) {
        console.warn(`Skipping base ${newBase.name}`);
        continue;
      }
      newBases.push(newBase);
    }
    currentBases.push(...newBases);
    console.info(
      `Adding ${newBases.length} new base WADs from arachnotron config.`
    );
    this.phobos.settingsService.saveSetting(
      'bases',
      currentBases as unknown as JSONValue
    );
  }

  public arachnotronImportProfiles(
    profiles: Arachnotron.Profile[],
    basePath: string
  ) {
    const currentProfiles = this.phobos.profileService.getProfiles();
    const newProfiles: Profile[] = [];
    for (const profile of profiles) {
      if (
        currentProfiles.find(
          (p) => p.name.toLowerCase() === profile.name.toLowerCase()
        )
      ) {
        console.warn(`Skipping profile ${profile.name}`);
        continue;
      }
      const engine = this.resolveUniqueRecord<Engine>(
        this.phobos.settingsService.getSetting('engines') as Engine[],
        profile.engine
      );
      const base = this.resolveUniqueRecord<UniqueFileRecord>(
        this.phobos.settingsService.getSetting('bases') as UniqueFileRecord[],
        profile.iwad
      );
      const categories = profile.categories
        .map((c) =>
          this.resolveUniqueRecord<Category>(
            this.phobos.categoryService.getCategories(),
            c
          )
        )
        .filter((c) => Boolean(c)) as Category[];
      console.log(profile.resources);
      const files = profile.resources
        .map((r) => this.resolvePath(r, basePath))
        .filter((r) => Boolean(r)) as string[];
      const parents = (profile.inheritProfiles ?? [])
        .map((p) =>
          this.resolveUniqueRecord<Profile>(
            this.phobos.profileService.getProfiles(),
            p
          )
        )
        .filter((p) => Boolean(p)) as Profile[];
      const icon =
        this.resolvePath(
          profile.iconPath,
          profile._path ?? resolve(basePath, 'config', 'profiles')
        ) ?? '';
      const newProfile: Profile = {
        id: uuid(),
        name: profile.name,
        base: base?.id ?? '',
        categories: categories.map((c) => c.id),
        cvars: profile.cvars.map((cv) => this.transformCvar(cv)),
        engine: engine?.id ?? '',
        files,
        parents: parents.map((p) => p.name),
        icon,
        tags: [],
        created: new Date().toISOString(),
        lastPlayed: null,
      };
      newProfiles.push(newProfile);
    }

    // Resolve parents
    for (const profile of newProfiles) {
      if (profile.parents.length > 0) {
        const newParents: string[] = [];
        for (const parentName of profile.parents) {
          const resolvedProfile = this.resolveUniqueRecord(
            newProfiles,
            parentName
          );
          if (resolvedProfile) {
            newParents.push(resolvedProfile.id);
          }
        }
        profile.parents = newParents;
      }
    }

    console.info(
      `Adding ${newProfiles.length} new profiles from arachnotron config.`
    );

    for (const p of newProfiles) {
      this.phobos.profileService.saveProfile(p);
    }
  }

  private resolveUniqueRecord<T extends { name: string; id: string }>(
    collection: T[],
    name: string
  ) {
    return collection.find((b) => b.name.toLowerCase() === name.toLowerCase());
  }

  private transformCvar(source: Arachnotron.Cvar): Cvar {
    return {
      value: source.value.replace(/^["']|["']$/g, ''),
      var: source.name,
    };
  }

  private resolvePath(path: string, basePath: string): string | null {
    if (!path || typeof path !== 'string') {
      return null;
    }
    if (isAbsolute(path)) {
      return path;
    }
    return resolve(basePath, path);
  }

  private async arachnotronReadFile<T>(path: string): Promise<T | null> {
    let jsonContent: T;
    try {
      const fileContent = await readFile(path, { encoding: 'utf-8' });
      jsonContent = JSON.parse(fileContent);
    } catch (_err) {
      return null;
    }
    return jsonContent ?? null;
  }
}
