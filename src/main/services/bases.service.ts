import type { BaseWad } from '../../shared/config';
import { ipcHandler, PhobosApi } from '../api';
import type { PhobosStore } from '../store';

export class BasesService extends PhobosApi {
  public constructor(private readonly store: PhobosStore) {
    super();
  }

  @ipcHandler('bases.getAll')
  getBases(): Promise<BaseWad[]> {
    return this.store.bases.values().all();
  }

  @ipcHandler('bases.save')
  saveBase(base: BaseWad) {
    return this.store.bases.put(base.id, base);
  }
}
