import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'categories/:category',
    loadComponent: () =>
      import('./views/wad-list/wad-list.component').then(
        (m) => m.WadListComponent
      ),
  },
];
