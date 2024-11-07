import type { Category } from '@shared/config';
import type Store from 'electron-store';
import { ipcHandler, PhobosApi } from '../api';

export class CategoryService extends PhobosApi {
  public constructor(private readonly store: Store) {
    super();
  }

  @ipcHandler('category.getCategories')
  getCategories(): Category[] {
    return this.store.get('categories', []) as Category[];
  }

  @ipcHandler('category.getByName')
  getCategoryByName(name: string): Category | null {
    return this.getCategories().find((p) => p.name === name) ?? null;
  }

  @ipcHandler('category.save')
  saveCategory(config: Category): void {
    const categories = this.getCategories();
    // Find existing category
    const matchingCategoryIndex = categories.findIndex(
      (p) => p.id === config.id
    );
    if (matchingCategoryIndex !== -1) {
      categories[matchingCategoryIndex] = config;
    } else {
      categories.unshift(config);
    }
    this.store.set('categories', categories);
  }

  @ipcHandler('category.delete')
  deleteCategoryById(id: string): void {
    const categories = this.getCategories();
    const categoryIndex = categories.findIndex((p) => p.id === id);
    if (categoryIndex !== -1) {
      categories.splice(categoryIndex, 1);
      this.store.set('categories', categories);
    }
  }
}
