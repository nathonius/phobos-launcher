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
};
