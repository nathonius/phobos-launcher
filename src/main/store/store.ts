import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import type { Low } from 'lowdb/lib';
import { app, shell } from 'electron';
import { JSONFilePreset } from 'lowdb/node';

import type { PhobosStore } from '../../shared/config';
import { DEFAULT_THEME } from '../../renderer/app/shared/services/theme.service';

export type PhobosDb = Low<PhobosStore>;

export const STORE_DEFAULT_VALUE: PhobosStore = {
  categories: [],
  engines: [],
  profiles: [],
  settings: {
    bases: [],
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
  return storePromise;
}

export async function backupStore(path?: string): Promise<string> {
  const timestamp = new Date().valueOf();
  const defaultPath = join(
    app.getPath('userData'),
    `config-backup-${timestamp}.json`
  );
  const backupPath = path ?? defaultPath;
  const store = getStore();
  const backup = JSON.stringify(store.data);
  await writeFile(backupPath, backup);
  return backupPath;
}
