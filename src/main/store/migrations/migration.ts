import type { PhobosStore } from '../../../shared/config';

export type MigrationFn = (store: PhobosStore) => void;
export interface Migration {
  key: string;
  fn: MigrationFn;
}
