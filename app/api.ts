import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import type { Category, Profile } from '@shared/config';
import type { Channel } from '@shared/public-api';
import type { IpcMainInvokeEvent } from 'electron';
import { dialog, ipcMain } from 'electron';
import type { JSONValue } from '@shared/json';
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
      const process = spawn('D:\\Games\\GZDoom\\GZDoom\\gzdoom.exe', []);
      return Promise.resolve(null);
    },
    'profile.launchCustom': (_event, ...args) => {
      const profile = args[0] as Profile;
      const base = ['-iwad', profile.base];
      const files = profile.files.flatMap((f) => ['-file', f]);
      const cvars = profile.cvars.flatMap((v) => ['+set', v.var, v.value]);
      const process = spawn(profile.engine, [...base, ...files, ...cvars]);
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
