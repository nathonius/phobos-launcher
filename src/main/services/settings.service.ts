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
  public getSetting(key: string) {
    return get(getStore().data.settings, key as keyof PhobosSettings);
  }

  @ipcHandler('settings.set')
  public saveSetting(key: string, value: JSONValue) {
    return getStore().update(({ settings }) => {
      set(settings, key, value);
    });
  }

  @ipcHandler('settings.patch')
  public async patchSettings(value: Partial<PhobosSettings>) {
    await getStore().update((store) => {
      store.settings = { ...store.settings, ...value };
    });
    return getStore().data.settings;
  }

  @ipcHandler('settings.openConfig')
  public openConfig() {
    return openInEditor();
  }
}
