import type { Profile } from '@shared/public-api';

export async function getCategory(_name: string): Promise<Profile[]> {
  const profiles = (await window.api['category.getByName']('a')) as Profile[];
  // Do stuff with profiles
  return profiles;
}
