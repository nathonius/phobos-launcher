import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'categories',
    loadComponent: () =>
      import('./categories/categories/categories.component').then(
        (m) => m.CategoriesComponent
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'categories',
  },
];
