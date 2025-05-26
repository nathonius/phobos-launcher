import { get, set } from 'lodash-es';
import type { JSONValue } from '../../shared/json';
import { ipcHandler, PhobosApi } from '../api';
import { getStore, openInEditor } from '../store/store';
import type { PhobosStore } from '../../shared/config';

export class SettingsService extends PhobosApi {
  public constructor() {
    super();
  }

  @ipcHandler('settings.getAll')
  public getSettings() {
    return getStore().data.settings;
  }

  @ipcHandler('settings.get')
  public getSetting(key: string) {
    return get(getStore().data.settings, key as keyof PhobosStore['settings']);
  }

  @ipcHandler('settings.set')
  public saveSetting(key: string, value: JSONValue) {
    return getStore().update(({ settings }) => {
      set(settings, key, value);
    });
  }

  @ipcHandler('settings.openConfig')
  public openConfig() {
    return openInEditor();
  }
}
