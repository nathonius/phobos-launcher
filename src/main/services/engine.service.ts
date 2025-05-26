import type { Engine } from '../../shared/config';
import { ipcHandler, PhobosApi } from '../api';
import { getStore } from '../store/store';

export class EngineService extends PhobosApi {
  public constructor() {
    super();
  }

  @ipcHandler('engine.getEngines')
  getEngines(): Engine[] {
    return getStore().data.engines;
  }

  @ipcHandler('engine.save')
  saveEngine(config: Engine) {
    return getStore().update(({ engines }) => {
      // Find existing category
      const matchingEngineIndex = engines.findIndex((e) => e.id === config.id);
      if (matchingEngineIndex !== -1) {
        engines[matchingEngineIndex] = config;
      } else {
        engines.unshift(config);
      }
    });
  }

  @ipcHandler('engine.delete')
  deleteEngineById(id: string) {
    return getStore().update(({ engines }) => {
      const engineIndex = engines.findIndex((e) => e.id === id);
      if (engineIndex !== -1) {
        engines.splice(engineIndex, 1);
      }
    });
  }
}
