import { computed, Injectable, signal } from '@angular/core';
import { Wrench, Play, Trash, Check } from 'lucide-angular';
import type { Profile } from '../../../shared/config';
import { Api } from '../api/api';
import {
  BACKGROUND_TEXTURES,
  BACKGROUND_TEXTURES_CONST,
} from '../shared/images/background-textures/background-textures';
import type { ProfileItem } from './profile-item/profile-item.interface';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  public readonly selectedProfile = signal<Profile | undefined>(undefined);
  public readonly allProfiles = signal<Profile[]>([]);
  public readonly displayProfiles = computed<ProfileItem[]>(() => {
    const profiles = this.allProfiles();
    return profiles.map((p) => ({
      ...p,
      icon: this.getProfileIcon(p),
      background: this.getProfileBackground(p),
      actions: [
        {
          name: 'edit',
          label: 'Edit',
          icon: Wrench,
        },
        {
          name: 'launch',
          label: 'Launch',
          icon: Play,
        },
        {
          name: 'delete',
          label: 'Delete',
          icon: Trash,
        },
      ],
      statuses: p.complete ? [{ name: 'Complete', icon: Check }] : [],
    }));
  });

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

  public getProfileBackground(profile: Profile) {
    if (profile.background) {
      return `url(${BACKGROUND_TEXTURES[profile.background]})`;
    } else {
      return `url(${BACKGROUND_TEXTURES_CONST.RockWall})`;
    }
  }

  public getProfileIcon(profile: Profile | string, compress?: boolean) {
    const path = typeof profile === 'string' ? profile : profile.icon;
    const params = new URLSearchParams({ path });
    if (compress !== undefined) {
      params.set('compress', `${compress}`);
    }
    if (path) {
      return `phobos-data://get-file?${params.toString()}`;
    }
    return '';
  }
}
