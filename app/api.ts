import { spawn } from 'node:child_process';
import type { Category, Profile } from '@shared/config';
import type { Channel } from '@shared/public-api';
import type { IpcMainInvokeEvent } from 'electron';
import { dialog, ipcMain } from 'electron';
import { getPhobos } from './main';

type IpcHandler = (
  event: IpcMainInvokeEvent,
  ...args: unknown[]
) => Promise<unknown>;

type ApiHandlerMap = Record<Channel, IpcHandler>;

export class PhobosApi {
  // TODO: Figure out a better way to do this. It's ugly.
  public readonly handlers: ApiHandlerMap = {
    'category.getByName': () => Promise.resolve(['wad1', 'wad2']),
    'category.getCategoryList': (): Promise<Category[]> =>
      Promise.resolve([
        { displayName: 'Category 1', id: 'category-1' },
        { displayName: 'Category 2', id: 'category-2' },
      ]),
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
      const process = spawn(profile.engine, [...base, ...files]);
      return Promise.resolve(null);
    },
    'profile.save': async (_event, ...args) => {
      const profile = args[0] as Profile;
      await getPhobos().profileService.saveProfile(profile);
    },
    'fileSystem.getPathForFile': () => Promise.resolve(),
    'fileSystem.showOpenDialog': (_event, ...args) => {
      const config = (args[0] as Electron.OpenDialogOptions | undefined) ?? {};
      return dialog.showOpenDialog(config);
    },
  };

  public _attachHandlers(): void {
    for (const [channel, handler] of Object.entries(this.handlers)) {
      ipcMain.handle(channel, handler);
    }
  }
}
