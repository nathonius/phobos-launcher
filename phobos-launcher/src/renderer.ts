import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { APP_CONFIG } from './renderer/environments/environment';
import { AppComponent } from './renderer/app/app.component';

import './index.css';

if (APP_CONFIG.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [],
}).catch((err) => console.error(err));
