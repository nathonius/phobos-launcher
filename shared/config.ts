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

export interface Engine extends FileRecord {
  config: string;
}

export interface Settings {
  engines: Engine[];
  iwads: FileRecord[];
  profiles: string[];
  categories: string[];
}
