import type { Category } from '@shared/config';
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
      Category[]
    >;
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
} satisfies Record<Channel, Function>;
