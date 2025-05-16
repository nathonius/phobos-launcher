export type UUID = `${string}-${string}-${string}-${string}-${string}`;

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
  id: UUID;
}

export type BaseWad = UniqueFileRecord;

export interface Cvar {
  var: string;
  value: string;
}

export interface Engine extends UniqueFileRecord {
  config: string;
}

export interface CompressedImage {
  originalPath: string;
  compressedPath: string;
  modifiedMs: number;
  neverReplace: boolean;
}

export interface Category {
  id: UUID;
  name: string;
  icon: string;
}

export type ProfileSort =
  | 'alphabetical'
  | 'date_added'
  | 'last_played'
  | 'rating'
  | 'date_completed';

export type SortDirection = 'asc' | 'desc';

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

export interface Settings {
  defaultCvars: Cvar[];
  steamGridApiKey: string;
  tempDataPath: string;
  deutexPath: string;
  home: {
    sort: ProfileSort;
    sortDirection: SortDirection;
  };
  theme: AppTheme;
}

export interface LegacyCompressedImages {
  'processed-image': {
    [key: string]: CompressedImage;
  };
}

export interface Profile {
  id: UUID;
  name: string;
  /**
   * ISO timestamp
   */
  created: string;
  /**
   * ISO timestamp
   */
  lastPlayed: string | null;
  /**
   * ISO timestamp
   */
  completedDate: string | null;
  engine: UUID;
  base: UUID;
  icon: string;
  files: string[];
  categories: string[];
  cvars: Cvar[];
  parents: UUID[];
  tags: string[];
  complete: boolean;
  rating: number | null;
  background: string;
}
