/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copied from https://github.com/SteamGridDB/node-steamgriddb/blob/master/src/index.ts
 * Modified to use electron's fetch instead of axios
 */

import { URLSearchParams } from 'node:url';
import { net } from 'electron';
import type {
  SGDBGame,
  SGDBImage,
  SGDBImageBooleanOption,
  SGDBGridDimension,
  SGDBGridMime,
  SGDBGridStyle,
  SGDBImageType,
  SGDBHeroDimension,
  SGDBHeroMime,
  SGDBHeroStyle,
  SGDBLogoStyle,
  SGDBIconStyle,
  SGDBIconDimension,
  SGDBLogoMime,
  SGDBIconMime,
} from '../../shared/lib/SGDB';

export interface SGDBOptions {
  key?: string;
  headers?: Headers;
  baseURL?: string;
}

export interface SGDBImageOptions {
  id: number;
  type: string;
  styles?: (SGDBGridStyle | SGDBHeroStyle | SGDBLogoStyle | SGDBIconStyle)[];
  dimensions?: (SGDBGridDimension | SGDBHeroDimension | SGDBIconDimension)[];
  mimes?: (SGDBGridMime | SGDBHeroMime | SGDBLogoMime | SGDBIconMime)[];
  types?: SGDBImageType[];
  nsfw?: SGDBImageBooleanOption;
  epilepsy?: SGDBImageBooleanOption;
  humor?: SGDBImageBooleanOption;
  oneoftag?: string;
  page?: number;
}

export interface SGDBGetGameOptions {
  platformdata: string[];
}

/**
 * JavaScript wrapper for the SteamGridDB API.
 */
export default class SGDB {
  private readonly key: string;
  private readonly baseURL: string;
  private readonly headers: Headers;

  /**
   * Creates a new SGDB instance.
   * @param options The api key or SGDB options.
   */
  constructor(options: SGDBOptions | string) {
    // Allow passing just the API key as a string
    if (typeof options === 'string') {
      options = { key: options };
    }

    this.baseURL = options.baseURL ?? 'https://www.steamgriddb.com/api/v2';
    this.key = options.key ?? '';
    this.headers = new Headers();

    if (options.headers) {
      this.headers = Object.assign({}, options.headers);
    }

    if (this.key) {
      this.headers.set('Authorization', `Bearer ${this.key}`);
    } else {
      process.emitWarning("API Key not provided, some methods won't work.");
    }
  }

  private buildQuery(options: any): URLSearchParams {
    const multiParams = [
      'styles',
      'dimensions',
      'mimes',
      'types',
      'platformdata',
    ];
    const singleParams = ['nsfw', 'humor', 'epilepsy', 'oneoftag', 'page'];
    const params = new URLSearchParams();

    multiParams.forEach((queryParam) => {
      if (options[queryParam]?.length) {
        params.set(queryParam, options[queryParam].join(','));
      }
    });

    singleParams.forEach((queryParam) => {
      if (typeof options[queryParam] !== 'undefined') {
        params.set(queryParam, options[queryParam]);
      }
    });
    return params;
  }

  /**
   * General request function for intereacting with the SteamGridDB api.
   * @param method The http method.
   * @param url The api request url.
   * @param params Optional request parameters.
   * @param formData Optional form data.
   * @returns A promise resolving to the request's result.
   */
  async handleRequest(
    method: string,
    url: string,
    params?: URLSearchParams
  ): Promise<any> {
    const resource = `${this.baseURL}${url}?${params?.toString() ?? ''}`;
    const options = new Request(resource, {
      method,
      headers: this.headers,
    });

    let response: Response;

    try {
      response = await net.fetch(options);
      // response = await axios(options as AxiosRequestConfig);
    } catch (error) {
      error.message = error.response.data?.errors?.join(', ') ?? error.message;
      throw error;
    }

    const result = await response.json();
    if (result?.success) {
      return result?.data ?? result.success;
    }

    const error = new Error();
    error.message = result?.errors?.join(', ') ?? 'Unknown SteamGridDB error.';
    throw error;
  }

  /**
   * Gets a list of possible matches for a query.
   * @param query The search query.
   * @returns A promise resolving to a list of possible matches.
   */
  async searchGame(query: string): Promise<SGDBGame[]> {
    return await this.handleRequest(
      'get',
      `/search/autocomplete/${encodeURIComponent(query)}`
    );
  }

  /**
   * Gets information for a game.
   * @param options The SGDB request options.
   * @param params Optional request parameters.
   * @returns A promise resolving to the game's information.
   */
  async getGame(
    options: { type: string; id: number },
    params?: SGDBGetGameOptions
  ): Promise<SGDBGame> {
    if (params) {
      return await this.handleRequest(
        'get',
        `/games/${options.type}/${options.id}`,
        this.buildQuery(params)
      );
    }
    return await this.handleRequest(
      'get',
      `/games/${options.type}/${options.id}`
    );
  }

  /**
   * Gets information for a game given its id.
   * @param id The game's id.
   * @param parmas Optional request parameters.
   * @returns A promise resolving to the game's information.
   */
  async getGameById(
    id: number,
    params?: SGDBGetGameOptions
  ): Promise<SGDBGame> {
    return this.getGame({ type: 'id', id: id }, params);
  }

  /**
   * Gets information for a steam game given its id.
   * @param id The game's id.
   * @param params Optional request parameters.
   * @returns A promise resolving to the game's information.
   */
  async getGameBySteamAppId(
    id: number,
    params?: SGDBGetGameOptions
  ): Promise<SGDBGame> {
    return this.getGame({ type: 'steam', id: id }, params);
  }

  /**
   * Gets grids for a game given its platform and id.
   * @param options The SGDB request options.
   * @returns A promise resolving to the game's grids.
   */
  async getGrids(options: SGDBImageOptions): Promise<SGDBImage[]> {
    return await this.handleRequest(
      'get',
      `/grids/${options.type}/${options.id}`,
      this.buildQuery(options)
    );
  }

  /**
   * Gets a list of grids based on the provided game id and filters.
   * @param id The game's id.
   * @param styles List of styles to include.
   * @param dimensions List of dimensions to include.
   * @param mimes List of mimes to include.
   * @param types List of types to include.
   * @param nsfw Whether the result should include nsfw images.
   * @param humor Whether the result should include humor images.
   * @returns A promise resolving to a list of grids for the desired game matching the provided filters.
   */
  async getGridsById(
    id: number,
    styles?: SGDBGridStyle[],
    dimensions?: SGDBGridDimension[],
    mimes?: SGDBGridMime[],
    types?: SGDBImageType[],
    nsfw?: SGDBImageBooleanOption,
    humor?: SGDBImageBooleanOption
  ): Promise<SGDBImage[]> {
    return this.getGrids({
      type: 'game',
      id: id,
      styles: styles,
      dimensions: dimensions,
      mimes: mimes,
      types: types,
      nsfw: nsfw,
      humor: humor,
    });
  }

  /**
   * Gets a list of grids based on the provided steam game id and filters.
   * @param id The game's id.
   * @param styles List of styles to include.
   * @param dimensions List of dimensions to include.
   * @param mimes List of mimes to include.
   * @param types List of types to include.
   * @param nsfw Whether the result should include nsfw images.
   * @param humor Whether the result should include humor images.
   * @returns A promise resolving to a list of grids for the desired steam game matching the provided filters.
   */
  async getGridsBySteamAppId(
    id: number,
    styles?: SGDBGridStyle[],
    dimensions?: SGDBGridDimension[],
    mimes?: SGDBGridMime[],
    types?: SGDBImageType[],
    nsfw?: SGDBImageBooleanOption,
    humor?: SGDBImageBooleanOption
  ): Promise<SGDBImage[]> {
    return this.getGrids({
      type: 'steam',
      id: id,
      styles: styles,
      dimensions: dimensions,
      mimes: mimes,
      types: types,
      nsfw: nsfw,
      humor: humor,
    });
  }

  /**
   * Gets heros for a game given its platform and id.
   * @param options The SGDB request options.
   * @returns A promise resolving to the game's heros.
   */
  async getHeroes(options: SGDBImageOptions): Promise<SGDBImage[]> {
    return await this.handleRequest(
      'get',
      `/heroes/${options.type}/${options.id}`,
      this.buildQuery(options)
    );
  }

  /**
   * Gets a list of heroes based on the provided game id and filters.
   * @param id The game's id.
   * @param styles List of styles to include.
   * @param dimensions List of dimensions to include.
   * @param mimes List of mimes to include.
   * @param types List of types to include.
   * @param nsfw Whether the result should include nsfw images
   * @param humor Whether the result should include humor images
   * @returns A promise resolving to a list of heroes for the desired game matching the provided filters.
   */
  async getHeroesById(
    id: number,
    styles?: SGDBHeroStyle[],
    dimensions?: SGDBHeroDimension[],
    mimes?: SGDBHeroMime[],
    types?: SGDBImageType[],
    nsfw?: SGDBImageBooleanOption,
    humor?: SGDBImageBooleanOption
  ): Promise<SGDBImage[]> {
    return this.getHeroes({
      type: 'game',
      id: id,
      styles: styles,
      dimensions: dimensions,
      mimes: mimes,
      types: types,
      nsfw: nsfw,
      humor: humor,
    });
  }

  /**
   * Gets a list of heroes based on the provided steam game id and filters.
   * @param id The game's id.
   * @param styles List of styles to include.
   * @param dimensions List of dimensions to include.
   * @param mimes List of mimes to include.
   * @param types List of types to include.
   * @param nsfw Whether the result should include nsfw images
   * @param humor Whether the result should include humor images
   * @returns A promise resolving to a list of heroes for the desired steam game matching the provided filters.
   */
  async getHeroesBySteamAppId(
    id: number,
    styles?: SGDBHeroStyle[],
    dimensions?: SGDBHeroDimension[],
    mimes?: SGDBHeroMime[],
    types?: SGDBImageType[],
    nsfw?: SGDBImageBooleanOption,
    humor?: SGDBImageBooleanOption
  ): Promise<SGDBImage[]> {
    return this.getHeroes({
      type: 'steam',
      id: id,
      styles: styles,
      dimensions: dimensions,
      mimes: mimes,
      types: types,
      nsfw: nsfw,
      humor: humor,
    });
  }

  /**
   * Gets icons for a game given its platform and id.
   * @param options The SGDB request options.
   * @returns A promise resolving to the game's icons.
   */
  async getIcons(options: SGDBImageOptions): Promise<SGDBImage[]> {
    return await this.handleRequest(
      'get',
      `/icons/${options.type}/${options.id}`,
      this.buildQuery(options)
    );
  }

  /**
   * Gets a list of icons based on the provided game id and filters.
   * @param id The game's id.
   * @param styles List of styles to include.
   * @param dimensions List of dimensions to include.
   * @param mimes List of mimes to include.
   * @param types List of types to include.
   * @param nsfw Whether the result should include nsfw images.
   * @param humor Whether the result should include humor images.
   * @returns A promise resolving to a list of heroes for the desired game matching the provided filters.
   */
  async getIconsById(
    id: number,
    styles?: SGDBIconStyle[],
    dimensions?: SGDBIconDimension[],
    mimes?: SGDBIconMime[],
    types?: SGDBImageType[],
    nsfw?: SGDBImageBooleanOption,
    humor?: SGDBImageBooleanOption
  ): Promise<SGDBImage[]> {
    return this.getIcons({
      type: 'game',
      id: id,
      styles: styles,
      dimensions: dimensions,
      mimes: mimes,
      types: types,
      nsfw: nsfw,
      humor: humor,
    });
  }

  /**
   * Gets a list of icons based on the provided steam game id and filters.
   * @param id The game's id.
   * @param styles List of styles to include.
   * @param dimensions List of dimensions to include.
   * @param mimes List of mimes to include.
   * @param types List of types to include.
   * @param nsfw Whether the result should include nsfw images.
   * @param humor Whether the result should include humor images.
   * @returns A promise resolving to a list of icons for the desired steam game matching the provided filters.
   */
  async getIconsBySteamAppId(
    id: number,
    styles?: SGDBIconStyle[],
    dimensions?: SGDBIconDimension[],
    mimes?: SGDBIconMime[],
    types?: SGDBImageType[],
    nsfw?: SGDBImageBooleanOption,
    humor?: SGDBImageBooleanOption
  ): Promise<SGDBImage[]> {
    return this.getIcons({
      type: 'steam',
      id: id,
      styles: styles,
      dimensions: dimensions,
      mimes: mimes,
      types: types,
      nsfw: nsfw,
      humor: humor,
    });
  }

  /**
   * Gets logos for a game given its platform and id.
   * @param options The SGDB request options.
   * @returns A promise resolving to the game's logos.
   */
  async getLogos(options: SGDBImageOptions): Promise<SGDBImage[]> {
    return await this.handleRequest(
      'get',
      `/logos/${options.type}/${options.id}`,
      this.buildQuery(options)
    );
  }

  /**
   * Gets a list of logos based on the provided game id and filters.
   * @param id The game's id.
   * @param styles List of styles to include.
   * @param mimes List of mimes to include.
   * @param types List of types to include.
   * @param nsfw Whether the result should include nsfw images.
   * @param humor Whether the result should include humor images.
   * @returns A promise resolving to a list of logos for the desired game matching the provided filters.
   */
  async getLogosById(
    id: number,
    styles?: SGDBLogoStyle[],
    mimes?: SGDBLogoMime[],
    types?: SGDBImageType[],
    nsfw?: SGDBImageBooleanOption,
    humor?: SGDBImageBooleanOption
  ): Promise<SGDBImage[]> {
    return this.getLogos({
      type: 'game',
      id: id,
      styles: styles,
      mimes: mimes,
      types: types,
      nsfw: nsfw,
      humor: humor,
    });
  }

  /**
   * Gets a list of logos based on the provided steam game id and filters.
   * @param id The game's id.
   * @param styles List of styles to include.
   * @param mimes List of mimes to include.
   * @param types List of types to include.
   * @param nsfw Whether the result should include nsfw images.
   * @param humor Whether the result should include humor images.
   * @returns A promise resolving to a list of logos for the desired steam game matching the provided filters.
   */
  async getLogosBySteamAppId(
    id: number,
    styles?: SGDBLogoStyle[],
    mimes?: SGDBLogoMime[],
    types?: SGDBImageType[],
    nsfw?: SGDBImageBooleanOption,
    humor?: SGDBImageBooleanOption
  ): Promise<SGDBImage[]> {
    return this.getLogos({
      type: 'steam',
      id: id,
      styles: styles,
      mimes: mimes,
      types: types,
      nsfw: nsfw,
      humor: humor,
    });
  }
}
