import { contextBridge, ipcRenderer } from 'electron';
import type { Channel } from '@shared/public-api';

export const clientApi = {
  'category.getByName': (name: string) =>
    ipcRenderer.invoke('category.getByName', [name]),
  'category.getCategoryList': () =>
    ipcRenderer.invoke('category.getCategoryList'),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
} satisfies Record<Channel, Function>;
export type ClientApi = typeof clientApi;

contextBridge.exposeInMainWorld('api', clientApi);
