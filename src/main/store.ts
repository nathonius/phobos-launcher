import { join } from 'node:path';
import type { Low } from 'lowdb/lib';
import { app, shell } from 'electron';
import { JSONFilePreset } from 'lowdb/node';

import type { PhobosStore } from '../shared/config';

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
    theme: 'synthwave',
  },
  internal: {
    'processed-image': {},
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
    storePromise = JSONFilePreset(storePath, STORE_DEFAULT_VALUE).then((db) => {
      store = db;
      store.read();
      return store;
    });
  }
  return storePromise;
}
