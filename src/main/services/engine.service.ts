import type Store from 'electron-store';
import type { Engine, UUID } from '../../shared/config';
import { ipcHandler, PhobosApi } from '../api';
import type { PhobosStore } from '../store';

export class EngineService extends PhobosApi {
  public constructor(
    private readonly store: PhobosStore,
    private readonly oldStore: Store
  ) {
    super();

    // Migrate from settings.engines to engines
    const oldEngines = this.oldStore.get('settings.engines');
    if (oldEngines && Array.isArray(oldEngines)) {
      this.oldStore.set('engines', oldEngines);
      this.oldStore.delete('settings.engines');
    }
  }

  @ipcHandler('engine.getEngines')
  getEngines(): Promise<Engine[]> {
    return this.store.engines.values().all();
  }

  /**
   * @deprecated - Uses old store, should only be used for migration
   */
  _getEngines(): Engine[] {
    return this.oldStore.get('engines', []) as Engine[];
  }

  @ipcHandler('engine.save')
  saveEngine(config: Engine): Promise<void> {
    return this.store.engines.put(config.id, config);
  }

  @ipcHandler('engine.delete')
  deleteEngineById(id: UUID): Promise<void> {
    return this.store.engines.del(id);
  }
}
