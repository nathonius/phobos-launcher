import { enableProdMode, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

// @ts-expect-error - This is just vscode resolving the wrong tsconfig
import { provideHttpClient, withFetch } from '@angular/common/http';
import { APP_CONFIG } from './renderer/environments/environment';
import { AppComponent } from './renderer/app/app.component';

import './index.css';

if (APP_CONFIG.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [provideZonelessChangeDetection(), provideHttpClient(withFetch())],
}).catch((err) => console.error(err));
