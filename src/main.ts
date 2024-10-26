import {
  enableProdMode,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { APP_CONFIG } from './environments/environment';
import { AppComponent } from './app/app.component';

if (APP_CONFIG.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [provideExperimentalZonelessChangeDetection()],
}).catch((err) => console.error(err));
