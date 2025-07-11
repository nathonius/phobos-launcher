import { contextBridge, ipcRenderer, webUtils } from 'electron';
import type { LogEntry } from 'winston';
import type { Channel } from './shared/public-api';
import type { Category, Engine, Profile } from './shared/config';
import type { JSONValue } from './shared/json';
import type {
  SGDBDimensionOptions,
  SGDBGame,
  SGDBImage,
  SGDBImageCategory,
  SGDBLimitOptions,
} from './shared/lib/SGDB';

export const clientApi = {
  'settings.getAll': () => ipcRenderer.invoke('settings.getAll'),
  'settings.get': (key: string) => ipcRenderer.invoke('settings.get', key),
  'settings.set': (key: string, value: JSONValue) =>
    ipcRenderer.invoke('settings.set', key, value),
  'settings.openConfig': () => ipcRenderer.invoke('settings.openConfig'),
  'category.getByName': (name: string) =>
    ipcRenderer.invoke('category.getByName', name),
  'category.getCategories': () => ipcRenderer.invoke('category.getCategories'),
  'category.save': (category: Category) =>
    ipcRenderer.invoke('category.save', category),
  'category.delete': (categoryId: string) =>
    ipcRenderer.invoke('category.delete', categoryId),
  'engine.getEngines': () => ipcRenderer.invoke('engine.getEngines'),
  'engine.save': (engine: Engine) => ipcRenderer.invoke('engine.save', engine),
  'engine.delete': (engineId: string) =>
    ipcRenderer.invoke('engine.delete', engineId),
  'profile.getProfiles': () => ipcRenderer.invoke('profile.getProfiles'),
  'profile.launchCustom': (profile: Profile) =>
    ipcRenderer.invoke('profile.launchCustom', profile),
  'profile.save': (profile: Profile) =>
    ipcRenderer.invoke('profile.save', profile),
  'profile.delete': (profileId: string) =>
    ipcRenderer.invoke('profile.delete', profileId),
  'fileSystem.getPathForFile': webUtils.getPathForFile,
  'fileSystem.showOpenDialog': (config: Electron.OpenDialogOptions) =>
    ipcRenderer.invoke('fileSystem.showOpenDialog', config),
  'fileSystem.getBase64Image': (path: string) =>
    ipcRenderer.invoke('fileSystem.getBase64Image', path),
  'sgdb.queryGames': (query: string, withIcons?: boolean) =>
    ipcRenderer.invoke('sgdb.queryGames', query, withIcons),
  'sgdb.getImages': (
    game: SGDBGame,
    categories: SGDBImageCategory[],
    dimensions?: Partial<SGDBDimensionOptions>,
    limits?: Partial<SGDBLimitOptions>
  ) =>
    ipcRenderer.invoke('sgdb.getImages', game, categories, dimensions, limits),
  'sgdb.downloadImage': (image: SGDBImage) =>
    ipcRenderer.invoke('sgdb.downloadImage', image),
  'import.arachnotron': (basePath: string) =>
    ipcRenderer.invoke('import.arachnotron', basePath),
  'wad.getInfo': (wadPath: string) =>
    ipcRenderer.invoke('wad.getInfo', wadPath),
  'wad.getGraphics': (wadPath: string, lumpNames: string[]) =>
    ipcRenderer.invoke('wad.getGraphics', wadPath, lumpNames),
  'wad.clearDataDir': (subdir?: string) =>
    ipcRenderer.invoke('wad.clearDataDir', subdir),
  'logger.log': (entry: LogEntry) => ipcRenderer.invoke('logger.log', entry),
  'logger.debug': (message: any, ...meta: any[]) =>
    ipcRenderer.invoke('logger.debug', message, ...meta),
  'logger.warn': (message: any, ...meta: any[]) =>
    ipcRenderer.invoke('logger.warn', message, ...meta),
  'logger.info': (message: any, ...meta: any[]) =>
    ipcRenderer.invoke('logger.info', message, ...meta),
  'logger.error': (message: any, ...meta: any[]) =>
    ipcRenderer.invoke('logger.error', message, ...meta),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
} satisfies Record<Channel, Function>;
export type ClientApi = typeof clientApi;

contextBridge.exposeInMainWorld('api', clientApi);
contextBridge.exposeInMainWorld('openConfig', () =>
  ipcRenderer.invoke('settings.openConfig')
);
