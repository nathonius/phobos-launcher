import type { Profile } from '@shared/config';
import type Store from 'electron-store';

export interface FsError extends Error {
  code: string;
}

export class ProfileService {
  public constructor(private readonly store: Store) {}

  getProfiles(): Profile[] {
    return this.store.get('profiles', []) as Profile[];
  }

  getProfileByName(name: string): Profile | null {
    return this.getProfiles().find((p) => p.name === name) ?? null;
  }

  saveProfile(config: Profile): void {
    const profiles = this.getProfiles();
    profiles.unshift(config);
    this.store.set('profiles', profiles);
  }

  deleteProfileById(id: string): void {
    const profiles = this.getProfiles();
    const profileIndex = profiles.findIndex((p) => p.id === id);
    if (profileIndex !== -1) {
      profiles.splice(profileIndex, 1);
      this.store.set('profiles', profiles);
    }
  }
}
