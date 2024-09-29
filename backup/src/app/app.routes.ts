import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'categories',
    loadComponent: () =>
      import('./categories/categories/categories.component').then(
        (m) => m.CategoriesComponent
      ),
    children: [
      {
        path: ':categoryId',
        loadComponent: () =>
          import('./categories/category/category.component').then(
            (m) => m.CategoryComponent
          ),
      },
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'categories',
  },
];
