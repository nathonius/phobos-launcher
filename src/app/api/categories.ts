import type { Channel, Profile } from '@shared/public-api';

/**
 * A wrapper around the window api to type the responses
 */
export const Api = {
  'category.getByName': async (name: string) => {
    return (await window.api['category.getByName'](name)) as Promise<Profile[]>;
  },
  'category.getCategoryList': async () => {
    return (await window.api['category.getCategoryList']()) as Promise<
      string[]
    >;
  },
} satisfies Record<Channel, Function>;
