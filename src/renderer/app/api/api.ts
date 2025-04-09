import type { Category, Engine, Profile } from '../../../shared/config';
import type { Channel } from '../../../shared/public-api';
import type { JSONValue } from '../../../shared/json';
import type {
  SGDBGame,
  SGDBImage,
  SGDBImageCategory,
} from '../../../shared/lib/SGDB';
import type { ClientApi } from '../../../preload';

declare global {
  interface Window {
    api: ClientApi;
  }
}

/**
 * A wrapper around the window api to type the responses
 */
export const Api = {
  'settings.getAll': () => window.api['settings.getAll']() as Promise<unknown>,
  'settings.get': (key: string) =>
    window.api['settings.get'](key) as Promise<unknown>,
  'settings.set': (key: string, value: JSONValue) =>
    window.api['settings.set'](key, value) as Promise<void>,
  'settings.openConfig': () => window.api['settings.openConfig'](),
  'category.getByName': (name: string) =>
    window.api['category.getByName'](name) as Promise<string[]>,
  'category.getCategories': () =>
    window.api['category.getCategories']() as Promise<Category[]>,
  'category.save': (category: Category) =>
    window.api['category.save'](category) as Promise<void>,
  'category.delete': (categoryId: string) =>
    window.api['category.delete'](categoryId) as Promise<void>,
  'engine.getEngines': () =>
    window.api['engine.getEngines']() as Promise<Engine[]>,
  'engine.save': (engine: Engine) =>
    window.api['engine.save'](engine) as Promise<void>,
  'engine.delete': (engineId: string) =>
    window.api['engine.delete'](engineId) as Promise<void>,
  'profile.getProfiles': () =>
    window.api['profile.getProfiles']() as Promise<Profile[]>,
  'profile.launchCustom': (profile: Profile) =>
    window.api['profile.launchCustom'](profile) as Promise<void>,
  'profile.save': (profile: Profile) =>
    window.api['profile.save'](profile) as Promise<void>,
  'profile.delete': (profileId: string) =>
    window.api['profile.delete'](profileId) as Promise<void>,
  'fileSystem.getPathForFile': (file: File) =>
    window.api['fileSystem.getPathForFile'](file),
  'fileSystem.showOpenDialog': (config: Electron.OpenDialogOptions) =>
    window.api['fileSystem.showOpenDialog'](
      config
    ) as Promise<Electron.OpenDialogReturnValue>,
  'fileSystem.getBase64Image': (path: string) =>
    window.api['fileSystem.getBase64Image'](path) as Promise<string>,
  'sgdb.queryGames': (query: string) =>
    window.api['sgdb.queryGames'](query) as Promise<SGDBGame[]>,
  'sgdb.getImages': (game: SGDBGame, categories: SGDBImageCategory[]) =>
    window.api['sgdb.getImages'](game, categories) as Promise<SGDBImage[]>,
  'sgdb.downloadImage': (image: SGDBImage) =>
    window.api['sgdb.downloadImage'](image) as Promise<string>,
  'import.arachnotron': (basepath: string) =>
    window.api['import.arachnotron'](basepath),
  'wad.listLumps': (wadPath: string) =>
    window.api['wad.listLumps'](wadPath) as Promise<string[]>,
  'wad.getLump': (wadPath: string, lumpName: string) =>
    window.api['wad.getLump'](wadPath, lumpName) as Promise<unknown>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
} satisfies Record<Channel, Function>;
