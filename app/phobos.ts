import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { setTimeout, clearTimeout } from 'node:timers';
import { app, BrowserWindow } from 'electron';
import Store from 'electron-store';

import { ALL_CHANNELS, type Channel } from '../shared/public-api'; // This import MUST be relative
import { ProfileService } from './services/profile.service';
import { UserDataService } from './services/user-data.service';
import { DEFAULT_WINDOW_SETTINGS } from './main';
import { CategoryService } from './services/category.service';
import { SettingsService } from './services/settings.service';
import { SGDBService } from './services/sgdb.service';

export class Phobos {
  public readonly store = new Store();
  public userDataService!: UserDataService;
  public profileService!: ProfileService;
  public categoryService!: CategoryService;
  public settingsService!: SettingsService;
  public steamGridService!: SGDBService;
  public readonly attachedHandlers: Channel[] = [];
  private window: BrowserWindow | null = null;
  private initialized = false;
  private windowSettingsTimeout: NodeJS.Timeout | undefined;

  constructor(
    private readonly basePath: string,
    private readonly serve = false
  ) {}

  /**
   * Set up handlers, listeners
   */
  public init() {
    if (this.initialized) {
      return;
    }

    // Attach API/IPC handlers, create window
    app.on('ready', () => {
      // Init services
      this.profileService = new ProfileService(this.store);
      this.categoryService = new CategoryService(this.store);
      this.settingsService = new SettingsService(this.store);
      this.steamGridService = new SGDBService();
      this.userDataService = new UserDataService(app.getPath('userData'));

      // Log in case some channels were missed
      for (const c of ALL_CHANNELS) {
        if (!this.attachedHandlers.includes(c)) {
          console.warn(`Missing handler for channel ${c}`);
        }
      }
      this.createWindow();
    });

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (this.window === null) {
        this.createWindow();
      }
    });
    this.initialized = true;
  }

  public createWindow(): BrowserWindow {
    // Create the browser window.
    this.window = new BrowserWindow({
      ...this.getWindowSettings(),
      title: 'Phobos Launcher',
      webPreferences: {
        preload: join(this.basePath, 'preload.js'),
      },
    });

    if (this.serve) {
      /* eslint-disable -- this require is needed for development */
      const debug = require('electron-debug');
      debug();

      require('electron-reloader')(module);
      /* eslint-enable */
      void this.window.loadURL('http://localhost:4200');
    } else {
      // Path when running electron executable
      let pathIndex = './index.html';

      if (existsSync(join(this.basePath, '../dist/index.html'))) {
        // Path when running electron in local folder
        pathIndex = '../dist/index.html';
      }

      const url = new URL(join('file:', this.basePath, pathIndex));
      void this.window.loadURL(url.href);
    }

    // Emitted when the window is closed.
    this.window.on('closed', () => {
      // Dereference the window object, usually you would store window
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      this.window = null;
    });

    this.window.on('resized', () => {
      clearTimeout(this.windowSettingsTimeout);
      this.windowSettingsTimeout = setTimeout(() => {
        this.store.set('window', this.window?.getBounds());
      }, 500);
    });

    return this.window;
  }

  private getWindowSettings(): Electron.Rectangle {
    return this.store.get(
      'window',
      DEFAULT_WINDOW_SETTINGS()
    ) as Electron.Rectangle;
  }
}
