import type { SGDBGame } from '@shared/lib/SGDB';
import SGDB from '../lib/SGDB';
import { getPhobos } from '../main';

export class SGDBService {
  public async searchGames(query: string) {
    const games = await this.client.searchGame(query);
    if (!games || games.length === 0) {
      return [];
    }
    return games;
  }

  public async getGrids(game: SGDBGame) {
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

  private get client(): SGDB {
    const key = getPhobos().settingsService.getSetting('steamGridApiKey');
    if (typeof key !== 'string' || !key) {
      throw new Error('No SGDB API Key');
    }
    return new SGDB(key);
  }
}
