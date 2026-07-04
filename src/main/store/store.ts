import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import type { Low } from 'lowdb';
import { app, shell } from 'electron';
import { JSONFilePreset } from 'lowdb/node';

import type { PhobosStore } from '../../shared/config';
import { DEFAULT_THEME } from '../../renderer/app/shared/services/theme.service';
import {
  DEFAULT_BASES,
  DEFAULT_CATEGORIES,
  DEFAULT_PROFILES,
} from './defaults';

export type PhobosDb = Low<PhobosStore>;

export const STORE_DEFAULT_VALUE: PhobosStore = {
  categories: DEFAULT_CATEGORIES,
  engines: [],
  profiles: DEFAULT_PROFILES,
  bases: DEFAULT_BASES,
  settings: {
    defaultCvars: [],
    deutexPath: '',
    home: {
      sort: 'last_played',
      sortDirection: 'desc',
    },
    steamGridApiKey: '',
    tempDataPath: '',
    theme: DEFAULT_THEME,
    gamepadEnabled: false,
    dataDirs: [],
    useDataDirs: true,
  },
  internal: {
    'processed-image': {},
    migrations: {},
  },
  window: null,
};

let storePromise: Promise<PhobosDb> | null = null;
let store: PhobosDb | null = null;
let storePath: string | null = null;

export function getStore(): PhobosDb {
  if (!store) {
    throw new Error('Store not yet initialized');
  }
  return store;
}

export function openInEditor() {
  if (storePath) {
    shell.openPath(storePath);
  }
}

export async function initStore(path?: string): Promise<PhobosDb> {
  const defaultPath = join(app.getPath('userData'), 'config.json');
  storePath = path ?? defaultPath;
  if (!storePromise) {
    storePromise = JSONFilePreset(storePath, STORE_DEFAULT_VALUE);
  }
  const db = await storePromise;
  store = db;
  await store.read();

  // Make sure all keys of the store exist
  await store.update((data) => {
    // Root
    for (const _key of Object.keys(STORE_DEFAULT_VALUE)) {
      const key = _key as keyof PhobosStore;
      if (data[key] === undefined) {
        data[key] = STORE_DEFAULT_VALUE[key] as any;
      }
    }

    // Internal
    for (const _key of Object.keys(STORE_DEFAULT_VALUE.internal)) {
      const key = _key as keyof PhobosStore['internal'];
      if (data.internal[key] === undefined) {
        data.internal[key] = STORE_DEFAULT_VALUE.internal[key] as any;
      }
    }

    // Settings
    for (const _key of Object.keys(STORE_DEFAULT_VALUE.settings)) {
      const key = _key as keyof PhobosStore['settings'];
      if (data.settings[key] === undefined) {
        (data as any).settings[key] = STORE_DEFAULT_VALUE.settings[key] as any;
      }
    }
  });

  return storePromise;
}

export async function backupStore(path?: string): Promise<string> {
  const timestamp = new Date().valueOf();
  const defaultPath = join(
    app.getPath('userData'),
    `config-backup-${timestamp}.json`,
  );
  const backupPath = path ?? defaultPath;
  const store = getStore();
  const backup = JSON.stringify(store.data);
  await writeFile(backupPath, backup);
  return backupPath;
}
