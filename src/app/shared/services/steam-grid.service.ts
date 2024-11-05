import { computed, Injectable, signal } from '@angular/core';
import { Api } from '../../api/api';

@Injectable({
  providedIn: 'root',
})
export class SteamGridService {
  public readonly apiKey = computed(() => this._apiKey());
  private readonly _apiKey = signal<string | null>(null);

  public constructor() {
    Api['settings.get']('steamGridApiKey').then((val) => {
      if (typeof val === 'string' || val === null) {
        this._apiKey.set(val);
      }
    });
  }

  public setKey(key: string | null) {
    Api['settings.set']('steamGridApiKey', key);
    this._apiKey.set(key);
  }
}
