import type { Category, Profile } from '@shared/config';
import type { Channel } from '@shared/public-api';
import type { ClientApi } from '../../../app/preload';

declare global {
  interface Window {
    api: ClientApi;
  }
}

/**
 * A wrapper around the window api to type the responses
 */
export const Api = {
  'category.getByName': (name: string) =>
    window.api['category.getByName'](name) as Promise<string[]>,
  'category.getCategories': () =>
    window.api['category.getCategories']() as Promise<Category[]>,
  'category.save': (category: Category) =>
    window.api['category.save'](category) as Promise<void>,
  'category.delete': (category: Category) =>
    window.api['category.delete'](category) as Promise<void>,
  'profile.getProfiles': () =>
    window.api['profile.getProfiles']() as Promise<Profile[]>,
  'profile.launch': (profile: string) =>
    window.api['profile.launch'](profile) as Promise<void>,
  'profile.launchCustom': (profile: Profile) =>
    window.api['profile.launchCustom'](profile) as Promise<void>,
  'profile.save': (profile: Profile) =>
    window.api['profile.save'](profile) as Promise<void>,
  'profile.delete': (profile: Profile) =>
    window.api['profile.delete'](profile) as Promise<void>,
  'fileSystem.getPathForFile': (file: File) =>
    window.api['fileSystem.getPathForFile'](file),
  'fileSystem.showOpenDialog': (config: Electron.OpenDialogOptions) =>
    window.api['fileSystem.showOpenDialog'](
      config
    ) as Promise<Electron.OpenDialogReturnValue>,
  'fileSystem.getBase64Image': (path: string) =>
    window.api['fileSystem.getBase64Image'](path) as Promise<string>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
} satisfies Record<Channel, Function>;
