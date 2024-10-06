import { writeFile, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { Profile } from '@shared/config';
import slugify from 'slugify';
import { PROFILE_DIR } from '../main';

export interface FsError extends Error {
  code: string;
}

export class ProfileService {
  private readonly profiles: Profile[] = [];

  async init(): Promise<void> {
    // Create profile dir if it doesn't already exist
    let files: string[] = [];
    try {
      files = await readdir(PROFILE_DIR);
    } catch (_) {
      // No files found
    }

    // Read all json files from profile dir
    for (const filePath of files) {
      if (filePath.toLowerCase().endsWith('.json')) {
        const jsonContent = await readFile(filePath, { encoding: 'utf-8' });
        try {
          const config = JSON.parse(jsonContent) as Profile;
          // TODO: Validate the config first
          this.profiles.push(config);
        } catch {
          console.error(`Poorly formatted config file: ${filePath}`);
        }
      }
    }
  }
  getProfiles(): Profile[] {
    return this.profiles;
  }

  getProfileByName(name: string): Profile | null {
    return this.profiles.find((p) => p.name === name) ?? null;
  }

  async saveProfile(config: Profile): Promise<void> {
    const profilePath = join(PROFILE_DIR, `${slugify(config.name)}.json`);
    await writeFile(profilePath, JSON.stringify(config));
  }

  deleteProfileByName(name: string): Promise<void> {
    throw new Error('not implemented');
  }
}
