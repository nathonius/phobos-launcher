import { readFile } from 'node:fs/promises';
import type { Category, Profile } from '@shared/config';
import type { Channel } from '@shared/public-api';
import type { IpcMainInvokeEvent } from 'electron';
import { dialog, ipcMain } from 'electron';
import type { JSONValue } from '@shared/json';
import type { SGDBGame } from '@shared/lib/SGDB';
import { getPhobos } from './main';

type IpcHandler = (
  event: IpcMainInvokeEvent,
  ...args: unknown[]
) => Promise<unknown>;

type ApiHandlerMap = Record<Channel, IpcHandler>;

export class PhobosApi {
  // TODO: Figure out a better way to do this. It's ugly.
  public readonly handlers: ApiHandlerMap = {
    'settings.getAll': () =>
      Promise.resolve(getPhobos().settingsService.getSettings()),
    'settings.get': (_event, ...args) => {
      const key = args[0] as string;
      return Promise.resolve(getPhobos().settingsService.getSetting(key));
    },
    'settings.set': (_event, ...args) => {
      const key = args[0] as string;
      const value = args[1] as JSONValue;
      return Promise.resolve(
        getPhobos().settingsService.saveSetting(key, value)
      );
    },
    'category.getByName': () => Promise.resolve(['wad1', 'wad2']),
    'category.getCategories': (): Promise<Category[]> => {
      return Promise.resolve(getPhobos().categoryService.getCategories());
    },
    'category.save': (_event, ...args) => {
      const category = args[0] as Category;
      return Promise.resolve(
        getPhobos().categoryService.saveCategory(category)
      );
    },
    'category.delete': (_event, ...args) => {
      const category = args[0] as Category;
      return Promise.resolve(
        getPhobos().categoryService.deleteCategoryById(category.id)
      );
    },
    'profile.getProfiles': () => {
      return Promise.resolve(getPhobos().profileService.getProfiles());
    },
    'profile.launch': () => {
      return Promise.resolve(null);
    },
    // TODO: This should be launchProfile, the other launch api should be removed
    'profile.launchCustom': (_event, ...args) => {
      const profile = args[0] as Profile;
      getPhobos().profileService.launchProfile(profile);
      return Promise.resolve(null);
    },
    'profile.save': (_event, ...args) => {
      const profile = args[0] as Profile;
      return Promise.resolve(getPhobos().profileService.saveProfile(profile));
    },
    'profile.delete': (_event, ...args) => {
      const profile = args[0] as Profile;
      return Promise.resolve(
        getPhobos().profileService.deleteProfileById(profile.id)
      );
    },
    'fileSystem.getPathForFile': () => Promise.resolve(),
    'fileSystem.showOpenDialog': (_event, ...args) => {
      const config = (args[0] as Electron.OpenDialogOptions | undefined) ?? {};
      return dialog.showOpenDialog(config);
    },
    'fileSystem.getBase64Image': async (_event, ...args) => {
      const path = args[0] as string;
      // TODO: This is probably super unreliable
      if (path) {
        const extension = path.split('.').pop() ?? 'png';
        const data = await readFile(path);
        return `data:image/${extension};base64,${data.toString('base64')}`;
      }
      return '';
    },
    'sgdb.queryGames': async (_event, ...args) => {
      const query = args[0] as string;
      return await getPhobos().steamGridService.searchGames(query);
    },
    'sgdb.getGrids': async (_event, ...args) => {
      const game = args[0] as SGDBGame;
      return await getPhobos().steamGridService.getGrids(game);
    },
    'sgdb.downloadGrid': (_event, ...args) => {
      throw new Error('Not implemented');
    },
  };

  public _attachHandlers(): void {
    for (const [channel, handler] of Object.entries(this.handlers)) {
      ipcMain.handle(channel, handler);
    }
    ipcMain.handle('settings.openConfig', () => {
      getPhobos().settingsService.openConfig();
    });
  }
}
