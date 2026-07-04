import type { Base } from '../../shared/config';
import { ipcHandler, PhobosApi } from '../api';
import { getStore } from '../store/store';

export class BaseService extends PhobosApi {
  @ipcHandler('bases.save')
  saveBases(configs: Base[]) {
    return getStore().update((data) => {
      data.bases = [...configs];
    });
  }

  @ipcHandler('bases.delete')
  deleteBase(id: string) {
    return getStore().update(({ bases }) => {
      const baseIndex = bases.findIndex((p) => p.id === id);
      if (baseIndex !== -1) {
        bases.splice(baseIndex, 1);
      }
    });
  }

  @ipcHandler('bases.getAll')
  getBases() {
    return getStore().data.bases;
  }
}
