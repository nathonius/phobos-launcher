import type { JSONValue } from '@shared/json';
import type Store from 'electron-store';

export class SettingsService {
  public constructor(private readonly store: Store) {}
  public getSettings() {
    return this.store.get('settings');
  }
  public getSetting(key: string) {
    return this.store.get(`settings.${key}`);
  }
  public saveSetting(key: string, value: JSONValue) {
    this.store.set(`settings.${key}`, value);
  }
}
