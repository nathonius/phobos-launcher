import type { Route } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Route[] = [
  { path: 'home', component: HomeComponent },
  { path: 'settings', component: SettingsComponent },
];
