import { net } from 'electron';
import type {
  SGDBDimensionOptions,
  SGDBGame,
  SGDBGameWithIcon,
  SGDBGridDimension,
  SGDBHeroDimension,
  SGDBIconDimension,
  SGDBImage,
  SGDBImageCategory,
  SGDBLimitOptions,
} from '../../shared/lib/SGDB';
import SGDB from '../lib/SGDB';
import { getPhobos } from '../../main';
import { ipcHandler, PhobosApi } from '../api';

export class SGDBService extends PhobosApi {
  @ipcHandler('sgdb.queryGames')
  public async searchGames(
    query: string,
    withIcons = false
  ): Promise<SGDBGame[] | SGDBGameWithIcon[]> {
    const client = this.getClient();
    if (!client || !query) {
      return [];
    }
    const games = await client.searchGame(query);
    if (!games || games.length === 0) {
      return [];
    }
    if (!withIcons) {
      return games;
    }
    const withIcon: SGDBGameWithIcon[] = [];
    for (const game of games) {
      const images = await this.getImages(game, ['icon'], undefined, {
        icon: 1,
      });

      withIcon.push({ ...game, icon: images[0]?.url });
    }
    return withIcon;
  }

  @ipcHandler('sgdb.getImages')
  public async getImages(
    game: SGDBGame,
    categories: SGDBImageCategory[],
    dimensions?: Partial<SGDBDimensionOptions>,
    limits?: Partial<SGDBLimitOptions>
  ) {
    const results: SGDBImage[] = [];
    for (const category of categories) {
      switch (category) {
        case 'grid':
          results.push(
            ...(await this.getGrids(game, dimensions?.grid, limits?.grid))
          );
          break;
        case 'hero':
          results.push(
            ...(await this.getHeroes(game, dimensions?.hero, limits?.hero))
          );
          break;
        case 'logo':
          results.push(...(await this.getLogos(game, limits?.logo)));
          break;
        case 'icon':
          results.push(
            ...(await this.getIcons(game, dimensions?.icon, limits?.icon))
          );
          break;
      }
    }
    return results.filter((r) => r !== null);
  }

  public async getGrids(
    game: SGDBGame,
    dimensions?: SGDBGridDimension[],
    limit?: number
  ) {
    const client = this.getClient();
    if (!client || !game) {
      return [];
    }
    const grids = await client.getGrids({
      id: game.id,
      type: 'game',
      types: ['static'],
      dimensions,
      limit,
    });
    if (!grids || grids.length === 0) {
      return [];
    }
    return grids;
  }

  public async getHeroes(
    game: SGDBGame,
    dimensions?: SGDBHeroDimension[],
    limit?: number
  ) {
    const client = this.getClient();
    if (!client || !game) {
      return [];
    }
    const heroes = await client.getHeroes({
      id: game.id,
      type: 'game',
      types: ['static'],
      dimensions,
      limit,
    });
    if (!heroes || heroes.length === 0) {
      return [];
    }
    return heroes;
  }

  public async getLogos(game: SGDBGame, limit?: number) {
    const client = this.getClient();
    if (!client || !game) {
      return [];
    }
    const logos = await client.getLogos({
      id: game.id,
      type: 'game',
      types: ['static'],
      limit,
    });
    if (!logos || logos.length === 0) {
      return [];
    }
    return logos;
  }

  public async getIcons(
    game: SGDBGame,
    dimensions?: SGDBIconDimension[],
    limit?: number
  ) {
    const client = this.getClient();
    if (!client || !game) {
      return [];
    }
    const icons = await client.getIcons({
      id: game.id,
      type: 'game',
      types: ['static'],
      dimensions,
      limit,
    });
    if (!icons || icons.length === 0) {
      return [];
    }
    return icons;
  }

  @ipcHandler('sgdb.downloadImage')
  public async downloadImage(image: SGDBImage) {
    if (!image) {
      return '';
    }
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
