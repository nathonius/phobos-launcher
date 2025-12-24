import type { PhobosDb } from '../store';
import { addEngineStyle } from './add-engine-style';
import type { Migration } from './migration';
import { moveProfileImages } from './move-profile-images';
import { fixProcessedImagesKeys } from './processed-images-keys';

const migrations: Migration[] = [
  fixProcessedImagesKeys,
  addEngineStyle,
  moveProfileImages,
];

export async function executeMigrations(store: PhobosDb, userDataPath: string) {
  // Ensure the migrations object is actually defined
  if (!store.data.internal.migrations) {
    console.log(
      `Initializing migrations object on the store. You probably shouldn't see this.`
    );
    store.data.internal.migrations = {};
    await store.write();
    await store.read();
  }

  // Execute migrations
  for (const migration of migrations) {
    if (!store.data.internal.migrations[migration.key]) {
      await store.update((data) => {
        try {
          migration.fn(data, userDataPath);
          data.internal.migrations[migration.key] = true;
          console.log(`Migration ${migration.key} completed.`);
        } catch (err) {
          data.internal.migrations[migration.key] = false;
          console.error(`Failed to execute migration ${migration.key}`);
          throw err;
        }
      });
    }
  }
}
