import { net } from 'electron';
import type {
  SGDBGame,
  SGDBImage,
  SGDBImageCategory,
} from '../../shared/lib/SGDB';
import SGDB from '../lib/SGDB';
import { getPhobos } from '../../main';
import { ipcHandler, PhobosApi } from '../api';

export class SGDBService extends PhobosApi {
  @ipcHandler('sgdb.queryGames')
  public async searchGames(query: string) {
    const client = this.getClient();
    if (!client) {
      return [];
    }
    const games = await client.searchGame(query);
    if (!games || games.length === 0) {
      return [];
    }
    return games;
  }

  @ipcHandler('sgdb.getImages')
  public async getImages(game: SGDBGame, categories: SGDBImageCategory[]) {
    const results: SGDBImage[] = [];
    for (const category of categories) {
      switch (category) {
        case 'grid':
          results.push(...(await this.getGrids(game)));
          break;
        case 'hero':
          results.push(...(await this.getHeroes(game)));
          break;
        case 'logo':
          results.push(...(await this.getLogos(game)));
          break;
        case 'icon':
          results.push(...(await this.getIcons(game)));
          break;
      }
    }
    return results;
  }

  public async getGrids(game: SGDBGame) {
    const client = this.getClient();
    if (!client) {
      return [];
    }
    const grids = await client.getGrids({
      id: game.id,
      type: 'game',
      types: ['static'],
    });
    if (!grids || grids.length === 0) {
      return [];
    }
    return grids;
  }

  public async getHeroes(game: SGDBGame) {
    const client = this.getClient();
    if (!client) {
      return [];
    }
    const heroes = await client.getHeroes({
      id: game.id,
      type: 'game',
      types: ['static'],
    });
    if (!heroes || heroes.length === 0) {
      return [];
    }
    return heroes;
  }

  public async getLogos(game: SGDBGame) {
    const client = this.getClient();
    if (!client) {
      return [];
    }
    const logos = await client.getLogos({
      id: game.id,
      type: 'game',
      types: ['static'],
    });
    if (!logos || logos.length === 0) {
      return [];
    }
    return logos;
  }

  public async getIcons(game: SGDBGame) {
    const client = this.getClient();
    if (!client) {
      return [];
    }
    const icons = await client.getIcons({
      id: game.id,
      type: 'game',
      types: ['static'],
    });
    if (!icons || icons.length === 0) {
      return [];
    }
    return icons;
  }

  @ipcHandler('sgdb.downloadImage')
  public async downloadImage(image: SGDBImage) {
    const request = new Request(image.url, { method: 'get' });
    const filename = image.url.split('/').pop();
    if (!filename) {
      throw new Error('Invalid filename from SGDB image.');
    }
    const response = await net.fetch(request);
    const buffer = await response.arrayBuffer();
    const path = await getPhobos().userDataService.writeDataFile(
      filename,
      buffer
    );
    return path;
  }

  private getClient(): SGDB | null {
    const key = getPhobos().settingsService.getSetting('steamGridApiKey');
    if (typeof key !== 'string' || !key) {
      console.error('No SGDB key found.');
      return null;
    }
    return new SGDB(key);
  }
}
