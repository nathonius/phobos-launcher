import type { Category } from '@shared/config';
import type { Channel, Profile } from '@shared/public-api';
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
    window.api['category.getByName'](name) as Promise<Profile[]>,
  'category.getCategoryList': () =>
    window.api['category.getCategoryList']() as Promise<Category[]>,
  'profile.launch': (profile: string) =>
    window.api['profile.launch'](profile) as Promise<void>,
  'fileSystem.getPathForFile': (file: File) =>
    window.api['fileSystem.getPathForFile'](file),
  'fileSystem.showOpenDialog': (config: Electron.OpenDialogOptions) =>
    window.api['fileSystem.showOpenDialog'](
      config
    ) as Promise<Electron.OpenDialogReturnValue>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
} satisfies Record<Channel, Function>;
