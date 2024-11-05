import { computed, effect, Injectable, signal } from '@angular/core';
import type { SGDBGame } from 'steamgriddb';
import SGDB from 'steamgriddb';
import { Api } from '../../api/api';

@Injectable({
  providedIn: 'root',
})
export class SteamGridService {
  public readonly apiKey = computed(() => this._apiKey());
  private readonly _apiKey = signal<string | null>(null);
  private client: SGDB | undefined;

  public constructor() {
    effect(() => {
      const key = this._apiKey();
      if (key) {
        this.client = new SGDB(key);
      } else {
        delete this.client;
      }
    });
    Api['settings.get']('steamGridApiKey').then((val) => {
      if (typeof val === 'string' || val === null) {
        this._apiKey.set(val);
      }
    });
  }

  public setKey(key: string) {
    Api['settings.set']('steamGridApiKey', key);
    this._apiKey.set(key);
  }

  public async searchGames(query: string) {
    if (!this.client) {
      throw new Error('SteamGrid API key not set.');
    }
    const games = await this.client.searchGame(query);
    if (!games || games.length === 0) {
      return [];
    }
    return games;
  }

  public async getGrids(game: SGDBGame) {
    if (!this.client) {
      throw new Error('SteamGrid API key not set.');
    }
    // assume first game for now
    const grids = await this.client.getGrids({
      id: game.id,
      type: 'game',
      dimensions: ['1024x1024', '512x512', '460x215', '920x430'],
    });
    if (!grids || grids.length === 0) {
      return [];
    }
    return grids;
  }
}
