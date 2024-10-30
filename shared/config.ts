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

export interface Cvar {
  var: string;
  value: string;
}

export interface Engine extends FileRecord {
  config: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Settings {
  engines: Engine[];
  iwads: FileRecord[];
  profiles: string[];
  categories: Category[];
}

export interface Profile {
  id: string;
  name: string;
  engine: string;
  base: string;
  icon: string;
  files: string[];
  categories: string[];
  cvars: Cvar[];
}
