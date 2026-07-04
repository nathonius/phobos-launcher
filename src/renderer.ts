import { enableProdMode, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { APP_CONFIG } from './renderer/environments/environment';
import { AppComponent } from './renderer/app/app.component';
import { routes } from './renderer/app/app.routes';

import './index.css';

if (APP_CONFIG.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(routes),
  ],
}).catch((err) => console.error(err));
