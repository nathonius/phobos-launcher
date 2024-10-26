import { contextBridge, ipcRenderer, webUtils } from 'electron';
import type { Channel } from '@shared/public-api';
import type { Category, Profile } from '@shared/config';
import type { JSONValue } from '@shared/json';

export const clientApi = {
  'settings.getAll': () => ipcRenderer.invoke('settings.getAll'),
  'settings.get': (key: string) => ipcRenderer.invoke('settings.get', key),
  'settings.set': (key: string, value: JSONValue) =>
    ipcRenderer.invoke('settings.set', key, value),
  'category.getByName': (name: string) =>
    ipcRenderer.invoke('category.getByName', name),
  'category.getCategories': () => ipcRenderer.invoke('category.getCategories'),
  'category.save': (category: Category) =>
    ipcRenderer.invoke('category.save', category),
  'category.delete': (category: Category) =>
    ipcRenderer.invoke('category.delete', category),
  'profile.getProfiles': () => ipcRenderer.invoke('profile.getProfiles'),
  'profile.launch': (profile: string) =>
    ipcRenderer.invoke('profile.launch', profile),
  'profile.launchCustom': (profile: Profile) =>
    ipcRenderer.invoke('profile.launchCustom', profile),
  'profile.save': (profile: Profile) =>
    ipcRenderer.invoke('profile.save', profile),
  'profile.delete': (profile: Profile) =>
    ipcRenderer.invoke('profile.delete', profile),
  'fileSystem.getPathForFile': webUtils.getPathForFile,
  'fileSystem.showOpenDialog': (config: Electron.OpenDialogOptions) =>
    ipcRenderer.invoke('fileSystem.showOpenDialog', config),
  'fileSystem.getBase64Image': (path: string) =>
    ipcRenderer.invoke('fileSystem.getBase64Image', path),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
} satisfies Record<Channel, Function>;
export type ClientApi = typeof clientApi;

contextBridge.exposeInMainWorld('api', clientApi);
