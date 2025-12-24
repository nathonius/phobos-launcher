import { relative, join, basename } from 'node:path';
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { simpleHash } from '../../util';
import type { Migration } from './migration';

/**
 * Move all profile images into the user data dir and store
 * paths as relative to the user data dir
 */
export const moveProfileImages: Migration = {
  key: 'move-profile-images',
  fn: (store, userDataPath) => {
    const targetDir = join(userDataPath, 'profile-images');
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir);
    }

    for (const profile of store.profiles) {
      if (!profile.icon) {
        continue;
      }
      const relativePath = relative(userDataPath, profile.icon);

      // Copy the image
      if (relativePath.startsWith('..') || relativePath === profile.icon) {
        const filename = `${simpleHash(profile.icon)}_${basename(
          profile.icon
        )}`;
        const newIconPath = join(targetDir, filename);
        copyFileSync(profile.icon, newIconPath);
        profile.icon = relative(userDataPath, newIconPath);
      } else {
        profile.icon = relativePath;
      }
    }
  },
};
