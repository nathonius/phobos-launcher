import { contextBridge, ipcRenderer, webUtils } from 'electron';
import type { Channel } from '@shared/public-api';
import type { Profile } from '@shared/config';

export const clientApi = {
  'category.getByName': (name: string) =>
    ipcRenderer.invoke('category.getByName', name),
  'category.getCategoryList': () =>
    ipcRenderer.invoke('category.getCategoryList'),
  'profile.launch': (profile: string) =>
    ipcRenderer.invoke('profile.launch', profile),
  'profile.launchCustom': (profile: Profile) =>
    ipcRenderer.invoke('profile.launchCustom', profile),
  'profile.save': (profile: Profile) =>
    ipcRenderer.invoke('profile.save', profile),
  'fileSystem.getPathForFile': webUtils.getPathForFile,
  'fileSystem.showOpenDialog': (config: Electron.OpenDialogOptions) =>
    ipcRenderer.invoke('fileSystem.showOpenDialog', config),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
} satisfies Record<Channel, Function>;
export type ClientApi = typeof clientApi;

contextBridge.exposeInMainWorld('api', clientApi);
