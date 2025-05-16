import type Store from 'electron-store';
import { ipcHandler, PhobosApi } from '../api';
import type { PhobosStore } from '../store';
import type { Settings } from '../../shared/config';

export class SettingsService extends PhobosApi {
  public constructor(
    private readonly store: PhobosStore,
    private readonly oldStore: Store
  ) {
    super();
  }

  @ipcHandler('settings.getAll')
  public async getSettings() {
    const settingsEntries = await this.store.settings.iterator().all();
    const settings = Object.fromEntries(settingsEntries) as unknown as Settings;
    return settings;
  }

  /**
   * @deprecated - Uses the old store, should only be used for migration.
   */
  public _getSettings() {
    return this.oldStore.get('settings');
  }

  @ipcHandler('settings.get')
  public getSetting<K extends keyof Settings>(key: K): Promise<Settings[K]> {
    return this.store.settings.get(key) as Promise<Settings[K]>;
  }

  public getSettingSync<K extends keyof Settings>(key: K): Settings[K] {
    return this.store.settings.getSync(key) as Settings[K];
  }

  @ipcHandler('settings.set')
  public saveSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    return this.store.settings.put(key, value);
  }

  /**
   * @deprecated - Uses the old store. Should no longer be used.
   */
  @ipcHandler('settings.openConfig')
  public _openConfig() {
    this.oldStore.openInEditor();
  }
}
