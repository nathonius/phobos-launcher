import type { Category } from '../../shared/config';
import { ipcHandler, PhobosApi } from '../api';
import { getStore } from '../store/store';

export class CategoryService extends PhobosApi {
  public constructor() {
    super();
  }

  @ipcHandler('category.getCategories')
  getCategories(): Category[] {
    return getStore().data.categories;
  }

  @ipcHandler('category.getByName')
  getCategoryByName(name: string): Category | null {
    return this.getCategories().find((p) => p.name === name) ?? null;
  }

  @ipcHandler('category.save')
  saveCategory(config: Category) {
    return getStore().update(({ categories }) => {
      const matchingCategoryIndex = categories.findIndex(
        (p) => p.id === config.id
      );
      if (matchingCategoryIndex !== -1) {
        categories[matchingCategoryIndex] = config;
      } else {
        categories.unshift(config);
      }
    });
  }

  @ipcHandler('category.delete')
  deleteCategoryById(id: string) {
    return getStore().update(({ categories }) => {
      const categoryIndex = categories.findIndex((p) => p.id === id);
      if (categoryIndex !== -1) {
        categories.splice(categoryIndex, 1);
      }
    });
  }
}
