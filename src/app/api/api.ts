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
  'category.getByName': async (name: string) => {
    return (await window.api['category.getByName'](name)) as Promise<Profile[]>;
  },
  'category.getCategoryList': async () => {
    return (await window.api['category.getCategoryList']()) as Promise<
      Category[]
    >;
  },
  'profile.launch': async (profile: string) =>
    (await window.api['profile.launch'](profile)) as Promise<void>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
} satisfies Record<Channel, Function>;
