import {
  enableProdMode,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { provideRouter } from '@angular/router';
import { APP_CONFIG } from './environments/environment';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

if (APP_CONFIG.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes),
  ],
}).catch((err) => console.error(err));
