import type { Migration } from './migration';

export const addEngineStyle: Migration = {
  key: 'add-engine-style',
  fn: ({ engines }) => {
    for (const engine of engines) {
      engine.style = 'zdoom';
    }
  },
};
