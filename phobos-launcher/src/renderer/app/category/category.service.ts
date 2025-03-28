import { Injectable, signal } from '@angular/core';
import type { Category } from '../../../shared/config';
import { Api } from '../api/api';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  public readonly selectedCategory = signal<Category | undefined>(undefined);
  public readonly allCategories = signal<Category[]>([]);

  constructor() {
    this.getAllCategories();
  }

  public async getAllCategories(): Promise<Category[]> {
    const categories = await Api['category.getCategories']();
    this.allCategories.set(categories);
    const selectedCategory = this.selectedCategory();
    if (selectedCategory) {
      const stillExists = categories.find((p) => p.id === selectedCategory.id);
      this.selectedCategory.set(stillExists);
    }
    return categories;
  }

  public async save(category?: Category) {
    const _category = category ?? this.selectedCategory();
    if (_category) {
      await Api['category.save'](_category);
    }
    await this.getAllCategories();
  }

  public async deleteCategory(category: Category) {
    await Api['category.delete'](category.id);
    await this.getAllCategories();
  }

  public async getCategoryIcon(category: Category | string) {
    // Special handling for 'all' profile
    if (typeof category !== 'string' && category.id === 'all') {
      return Promise.resolve('assets/phobos-full-transparent-200.png');
    }
    const path = typeof category === 'string' ? category : category.icon;
    if (path) {
      return await Api['fileSystem.getBase64Image'](path);
    }
    return Promise.resolve('');
  }
}
