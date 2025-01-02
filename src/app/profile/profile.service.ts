import { Injectable, signal } from '@angular/core';
import type { Profile } from '@shared/config';
import { Api } from '../api/api';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  public readonly selectedProfile = signal<Profile | undefined>(undefined);
  public readonly allProfiles = signal<Profile[]>([]);

  constructor() {
    void this.getAllProfiles();
  }

  public async getAllProfiles(selectProfile?: Profile): Promise<Profile[]> {
    const profiles = await Api['profile.getProfiles']();
    this.allProfiles.set(profiles);
    if (selectProfile) {
      const matchingProfile = profiles.find((p) => p.id === selectProfile.id);
      this.selectedProfile.set(matchingProfile);
    } else {
      const selectedProfile = this.selectedProfile();
      if (selectedProfile) {
        const stillExists = profiles.find((p) => p.id === selectedProfile.id);
        this.selectedProfile.set(stillExists);
      }
    }
    return profiles;
  }

  public async save(profile?: Profile) {
    const _profile = profile ?? this.selectedProfile();
    if (_profile) {
      await Api['profile.save'](_profile);
    }
    await this.getAllProfiles(_profile);
  }

  public async deleteProfile(profile: Profile) {
    await Api['profile.delete'](profile.id);
    await this.getAllProfiles();
  }

  public launch(profile: Profile) {
    void Api['profile.launchCustom'](profile);

    // Set last played date locally, so we don't have to refetch all profiles
    const allProfiles = this.allProfiles();
    const profileIndex = allProfiles.findIndex((p) => p.id === profile.id);
    if (profileIndex !== -1) {
      allProfiles.splice(profileIndex, 1, {
        ...profile,
        lastPlayed: new Date().toISOString(),
      });
      this.allProfiles.set(allProfiles);
    }
  }

  public async getProfileIcon(profile: Profile | string) {
    const path = typeof profile === 'string' ? profile : profile.icon;
    if (path) {
      return await Api['fileSystem.getBase64Image'](path);
    }
    return Promise.resolve('');
  }
}
