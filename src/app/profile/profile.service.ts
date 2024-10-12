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

  public async getAllProfiles(): Promise<Profile[]> {
    const profiles = await Api['profile.getProfiles']();
    this.allProfiles.set(profiles);
    const selectedProfile = this.selectedProfile();
    if (selectedProfile) {
      const stillExists = profiles.find((p) => p.id === selectedProfile.id);
      this.selectedProfile.set(stillExists);
    }
    return profiles;
  }

  public async save(profile?: Profile) {
    const _profile = profile ?? this.selectedProfile();
    if (_profile) {
      await Api['profile.save'](_profile);
    }
    await this.getAllProfiles();
  }

  public async deleteProfile(profile: Profile) {
    await Api['profile.delete'](profile);
    await this.getAllProfiles();
  }

  public launch(profile: Profile) {
    void Api['profile.launchCustom'](profile);
  }

  public async getProfileIcon(profile: Profile | string) {
    const path = typeof profile === 'string' ? profile : profile.icon;
    if (path) {
      return await Api['fileSystem.getBase64Image'](path);
    }
    return Promise.resolve('');
  }
}
