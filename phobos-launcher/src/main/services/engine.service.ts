import type Store from 'electron-store';
import type { Engine } from '../../shared/config';
import { ipcHandler, PhobosApi } from '../api';

export class EngineService extends PhobosApi {
  public constructor(private readonly store: Store) {
    super();

    // Migrate from settings.engines to engines
    const oldEngines = this.store.get('settings.engines');
    if (oldEngines && Array.isArray(oldEngines)) {
      this.store.set('engines', oldEngines);
      this.store.delete('settings.engines');
    }
  }

  @ipcHandler('engine.getEngines')
  getEngines(): Engine[] {
    return this.store.get('engines', []) as Engine[];
  }

  @ipcHandler('engine.save')
  saveEngine(config: Engine): void {
    const engines = this.getEngines();
    // Find existing category
    const matchingEngineIndex = engines.findIndex((e) => e.id === config.id);
    if (matchingEngineIndex !== -1) {
      engines[matchingEngineIndex] = config;
    } else {
      engines.unshift(config);
    }
    this.store.set('engines', engines);
  }

  @ipcHandler('engine.delete')
  deleteEngineById(id: string): void {
    const engines = this.getEngines();
    const engineIndex = engines.findIndex((e) => e.id === id);
    if (engineIndex !== -1) {
      engines.splice(engineIndex, 1);
      this.store.set('engines', engines);
    }
  }
}
