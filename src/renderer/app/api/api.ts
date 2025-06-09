import type {
  Category,
  Engine,
  PhobosSettings,
  Profile,
} from '../../../shared/config';
import type { Channel } from '../../../shared/public-api';
import type { JSONValue } from '../../../shared/json';
import type {
  SGDBDimensionOptions,
  SGDBGame,
  SGDBGameWithIcon,
  SGDBImage,
  SGDBImageCategory,
  SGDBLimitOptions,
} from '../../../shared/lib/SGDB';
import type { ClientApi } from '../../../preload';
import type { WadInfo } from '../../../shared/lib/wad';

declare global {
  interface Window {
    api: ClientApi;
  }
}

/**
 * A wrapper around the window api to type the responses
 */
export const Api = {
  'settings.getAll': () =>
    window.api['settings.getAll']() as Promise<PhobosSettings>,
  'settings.get': <K extends keyof PhobosSettings>(key: K) =>
    window.api['settings.get'](key) as Promise<PhobosSettings[K]>,
  'settings.set': <K extends keyof PhobosSettings>(
    key: K,
    value: PhobosSettings[K]
  ) => window.api['settings.set'](key, value as JSONValue) as Promise<void>,
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
  'sgdb.queryGames': (query: string, withIcons?: boolean) =>
    window.api['sgdb.queryGames'](query, withIcons) as Promise<
      SGDBGame[] | SGDBGameWithIcon[]
    >,
  'sgdb.getImages': (
    game: SGDBGame,
    categories: SGDBImageCategory[],
    dimensions?: Partial<SGDBDimensionOptions>,
    limits?: Partial<SGDBLimitOptions>
  ) =>
    window.api['sgdb.getImages'](
      game,
      categories,
      dimensions,
      limits
    ) as Promise<SGDBImage[]>,
  'sgdb.downloadImage': (image: SGDBImage) =>
    window.api['sgdb.downloadImage'](image) as Promise<string>,
  'import.arachnotron': (basepath: string) =>
    window.api['import.arachnotron'](basepath),
  'wad.getInfo': (wadPath: string) =>
    window.api['wad.getInfo'](wadPath) as Promise<WadInfo | null>,
  'wad.getGraphics': (wadPath: string, lumpNames: string[]) =>
    window.api['wad.getGraphics'](wadPath, lumpNames) as Promise<
      string[] | null
    >,
  'wad.clearDataDir': (subdir?: string) =>
    window.api['wad.clearDataDir'](subdir) as Promise<boolean>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
} satisfies Record<Channel, Function>;
