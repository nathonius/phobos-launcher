export interface FileRecord {
  /**
   * Name of the record
   */
  name: string;
  /**
   * Absolute or relative path of the record
   */
  path: string;
}

export interface UniqueFileRecord extends FileRecord {
  /**
   * Unique identifier to store when linking from another entity
   */
  id: string;
}

export interface Cvar {
  var: string;
  value: string;
}

export interface Engine extends UniqueFileRecord {
  config: string;
}

export type Base = UniqueFileRecord;

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CompressedImage {
  originalPath: string;
  compressedPath: string;
  modifiedMs: number;
  neverReplace: boolean;
}

export type AppTheme =
  | 'light'
  | 'dark'
  | 'cupcake'
  | 'bumblebee'
  | 'emerald'
  | 'corporate'
  | 'synthwave'
  | 'retro'
  | 'cyberpunk'
  | 'valentine'
  | 'halloween'
  | 'garden'
  | 'forest'
  | 'aqua'
  | 'lofi'
  | 'pastel'
  | 'fantasy'
  | 'wireframe'
  | 'black'
  | 'luxury'
  | 'dracula'
  | 'cmyk'
  | 'autumn'
  | 'business'
  | 'acid'
  | 'lemonade'
  | 'night'
  | 'coffee'
  | 'winter'
  | 'dim'
  | 'nord'
  | 'sunset'
  | 'caramellatte'
  | 'abyss'
  | 'silk';

export type ProfileSort =
  | 'alphabetical'
  | 'date_added'
  | 'last_played'
  | 'rating';

export type SortDirection = 'asc' | 'desc';

export interface PhobosSettings {
  theme: AppTheme;
  defaultCvars: Cvar[];
  deutexPath: string;
  tempDataPath: string;
  steamGridApiKey: string;
  home: {
    sort: ProfileSort;
    sortDirection: SortDirection;
  };
  // TODO: Move bases to top level
  bases: Base[];
  gamepadEnabled: boolean;
}

export interface PhobosStore {
  window: Electron.Rectangle | null;
  settings: PhobosSettings;
  categories: Category[];
  engines: Engine[];
  profiles: Profile[];
  internal: {
    'processed-image': Record<string, CompressedImage>;
    migrations: Record<string, boolean | undefined>;
  };
}

export interface Profile {
  id: string;
  name: string;
  /**
   * ISO timestamp
   */
  created: string;
  /**
   * ISO timestamp
   */
  lastPlayed: string | null;
  modified: string | null;
  engine: string;
  base: string;
  icon: string;
  files: string[];
  categories: string[];
  cvars: Cvar[];
  parents: string[];
  tags: string[];
  complete: boolean;
  rating: number | null;
  background: string;
}
