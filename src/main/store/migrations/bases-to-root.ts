import type { Base } from '../../../shared/config';
import type { Migration } from './migration';

export const basesToRoot: Migration = {
  key: 'bases-to-root',
  fn: (data) => {
    const oldBases = (data.settings as any).bases as Base[] | undefined;
    // Don't migrate if new bases have been added somehow
    if (!oldBases || (data.bases && data.bases.length > 0)) {
      return;
    }
    // Migrate from settings up to root
    if (Array.isArray(oldBases)) {
      data.bases = [...oldBases];
      delete (data.settings as any).bases;
    }
  },
};
