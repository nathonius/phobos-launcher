import { contextBridge, ipcRenderer, webUtils } from 'electron';
import type { Channel } from '@shared/public-api';

export const clientApi = {
  'category.getByName': (name: string) =>
    ipcRenderer.invoke('category.getByName', [name]),
  'category.getCategoryList': () =>
    ipcRenderer.invoke('category.getCategoryList'),
  'profile.launch': (profile: string) =>
    ipcRenderer.invoke('profile.launch', [profile]),
  'fileSystem.getPathForFile': webUtils.getPathForFile,
  'fileSystem.showOpenDialog': (config: Electron.OpenDialogOptions) =>
    ipcRenderer.invoke('fileSystem.showOpenDialog', config),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
} satisfies Record<Channel, Function>;
export type ClientApi = typeof clientApi;

contextBridge.exposeInMainWorld('api', clientApi);
