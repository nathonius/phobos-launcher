import { get, set } from 'lodash-es';
import type { JSONValue } from '../../shared/json';
import { ipcHandler, PhobosApi } from '../api';
import { getStore, openInEditor } from '../store/store';
import type { PhobosSettings } from '../../shared/config';

export class SettingsService extends PhobosApi {
  public constructor() {
    super();
  }

  @ipcHandler('settings.getAll')
  public getSettings(): PhobosSettings {
    return getStore().data.settings;
  }

  @ipcHandler('settings.get')
  public getSetting<K extends keyof PhobosSettings>(key: K): PhobosSettings[K] {
    return get(getStore().data.settings, key);
  }

  @ipcHandler('settings.set')
  public saveSetting<K extends keyof PhobosSettings>(
    key: K,
    value: JSONValue | PhobosSettings[K]
  ) {
    return getStore().update(({ settings }) => {
      set(settings, key, value);
    });
  }

  @ipcHandler('settings.openConfig')
  public openConfig() {
    return openInEditor();
  }
}
