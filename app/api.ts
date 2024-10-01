import { spawn } from 'node:child_process';
import type { Category } from '@shared/config';
import type { Channel } from '@shared/public-api';
import type { IpcMainInvokeEvent } from 'electron';
import { ipcMain } from 'electron';

type IpcHandler = (
  event: IpcMainInvokeEvent,
  ...args: unknown[]
) => Promise<unknown>;

type ApiHandlerMap = Record<Channel, IpcHandler>;

export function attachHandlers(handlers: ApiHandlerMap): void {
  for (const [channel, handler] of Object.entries(handlers)) {
    ipcMain.handle(channel, handler);
  }
}

export const handlers: ApiHandlerMap = {
  'category.getByName': () => Promise.resolve(['wad1', 'wad2']),
  'category.getCategoryList': (): Promise<Category[]> =>
    Promise.resolve([
      { displayName: 'Category 1', id: 'category-1' },
      { displayName: 'Category 2', id: 'category-2' },
    ]),
  'profile.launch': () => {
    spawn('"D:/Games/GZDoom/GZDoom/gzdoom.exe"', [
      '-config',
      '"C:/Users/natha/Documents/My Games/GZDoom/gzdoom.ini"',
      '-iwad',
      '"D:/Games/GZDoom/Officialdoom2.wad"',
      '-file',
      '"D:/Games/GZDoom/Total Conversions/Space Cats Saga +(Full 1.2)/Space Cats Saga+ (Full 1.2).wad"',
    ]);
    return Promise.resolve(null);
  },
};
