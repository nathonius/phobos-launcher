import type Store from 'electron-store';
import type { Category, UUID } from '../../shared/config';
import { ipcHandler, PhobosApi } from '../api';
import type { PhobosStore } from '../store';

export class CategoryService extends PhobosApi {
  public constructor(
    private readonly store: PhobosStore,
    private readonly oldStore: Store
  ) {
    super();
  }

  @ipcHandler('category.getCategories')
  getCategories(): Promise<Category[]> {
    return this.store.categories.values().all();
  }

  /**
   * @deprecated - Uses old store, should only be used for migration
   */
  _getCategories(): Category[] {
    return this.oldStore.get('categories', []) as Category[];
  }

  @ipcHandler('category.getByName')
  getCategoryByName(name: string): Promise<Category | null> {
    return this.getCategories().then(
      (categories) => categories.find((c) => c.name === name) ?? null
    );
  }

  @ipcHandler('category.save')
  saveCategory(config: Category): Promise<void> {
    return this.store.categories.put(config.id, config);
  }

  @ipcHandler('category.delete')
  deleteCategoryById(id: UUID): Promise<void> {
    return this.store.categories.del(id);
  }
}
