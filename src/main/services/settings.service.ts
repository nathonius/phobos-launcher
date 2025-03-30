import type Store from 'electron-store';
import type { JSONValue } from '../../shared/json';
import { ipcHandler, PhobosApi } from '../api';

export class SettingsService extends PhobosApi {
  public constructor(private readonly store: Store) {
    super();
  }

  @ipcHandler('settings.getAll')
  public getSettings() {
    return this.store.get('settings');
  }

  @ipcHandler('settings.get')
  public getSetting(key: string) {
    return this.store.get(`settings.${key}`);
  }

  @ipcHandler('settings.set')
  public saveSetting(key: string, value: JSONValue) {
    this.store.set(`settings.${key}`, value);
  }

  @ipcHandler('settings.openConfig')
  public openConfig() {
    this.store.openInEditor();
  }
}
