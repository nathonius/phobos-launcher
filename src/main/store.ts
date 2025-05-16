import type { DatabaseOptions } from 'classic-level';
import { ClassicLevel } from 'classic-level';
import type { AbstractSublevel } from 'abstract-level';
import type {
  BaseWad,
  Category,
  CompressedImage,
  Engine,
  LegacyCompressedImages,
  Profile,
  Settings,
  UUID,
} from '../shared/config';
import { getPhobos } from '../main';

type PhobosSublevel<KDefault, VDefault> = AbstractSublevel<
  ClassicLevel,
  string | Buffer | Uint8Array,
  KDefault,
  VDefault
>;
const opts: DatabaseOptions<any, any> = { valueEncoding: 'json' };

export class PhobosStore {
  profiles: PhobosSublevel<UUID, Profile>;
  categories: PhobosSublevel<UUID, Category>;
  engines: PhobosSublevel<UUID, Engine>;
  bases: PhobosSublevel<UUID, BaseWad>;
  settings: PhobosSublevel<keyof Settings, Settings[keyof Settings]>;
  processedImages: PhobosSublevel<string, CompressedImage>;
  private readonly db: ClassicLevel;

  constructor() {
    console.log('PHOBOS DB CONSTRUCTOR');
    this.db = new ClassicLevel('./phobos-db', opts);
    this.profiles = this.db.sublevel<UUID, Profile>('profiles', opts);
    this.categories = this.db.sublevel<UUID, Category>('categories', opts);
    this.engines = this.db.sublevel<UUID, Engine>('engines', opts);
    this.bases = this.db.sublevel<UUID, BaseWad>('bases', opts);
    this.settings = this.db.sublevel<keyof Settings, Settings[keyof Settings]>(
      'settings',
      opts
    );
    this.processedImages = this.db.sublevel<string, CompressedImage>(
      'processed-images',
      opts
    );

    this.db.once('open', () => {
      const dbVersion = this.db.getSync('db-version');
      if (!dbVersion || dbVersion !== '2') {
        this.migrate('2');
      }
    });
  }

  private async migrate(version: string) {
    const phobos = getPhobos();
    const profiles = phobos.profileService._getProfiles();
    const categories = phobos.categoryService._getCategories();
    const engines = phobos.engineService._getEngines();
    const settings = {
      ...(phobos.settingsService._getSettings() as Settings & {
        bases?: BaseWad[];
      }),
    };
    const bases = [...settings.bases!];
    // Remove bases since they are stored separately
    delete settings.bases;
    const internal = phobos.store.get('internal') as LegacyCompressedImages;

    await this.profiles.batch(
      profiles.map((p) => ({
        type: 'put',
        key: p.id,
        value: p,
      }))
    );
    await this.categories.batch(
      categories.map((c) => ({
        type: 'put',
        key: c.id,
        value: c,
      }))
    );
    await this.engines.batch(
      engines.map((e) => ({
        type: 'put',
        key: e.id,
        value: e,
      }))
    );
    await this.bases.batch(
      bases.map((b) => ({
        type: 'put',
        key: b.id,
        value: b,
      }))
    );
    await this.settings.batch(
      Object.entries(settings).map(([k, v]) => ({
        type: 'put',
        key: k as keyof Settings,
        value: v as Settings[keyof Settings],
      }))
    );
    await this.processedImages.batch(
      Object.values(internal['processed-image']).map((img) => ({
        type: 'put',
        key: img.originalPath,
        value: img,
      }))
    );
    await this.db.put('db-version', version);
  }
}
