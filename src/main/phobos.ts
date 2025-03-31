import { join } from 'node:path';
import { setTimeout, clearTimeout } from 'node:timers';
import { app, BrowserWindow } from 'electron';
import Store from 'electron-store';

import { ALL_CHANNELS, type Channel } from '../shared/public-api'; // This import MUST be relative
import { DEFAULT_WINDOW_SETTINGS } from '../main';
import { ProfileService } from './services/profile.service';
import { UserDataService } from './services/user-data.service';
import { CategoryService } from './services/category.service';
import { SettingsService } from './services/settings.service';
import { SGDBService } from './services/sgdb.service';
import { ImportService } from './services/import.service';
import { EngineService } from './services/engine.service';

export class Phobos {
  public readonly store = new Store();
  public userDataService!: UserDataService;
  public profileService!: ProfileService;
  public categoryService!: CategoryService;
  public settingsService!: SettingsService;
  public steamGridService!: SGDBService;
  public engineService!: EngineService;
  public importService!: ImportService;
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
      this.engineService = new EngineService(this.store);
      this.steamGridService = new SGDBService();
      this.importService = new ImportService(this);
      this.userDataService = new UserDataService(
        app.getPath('userData'),
        this.store
      );

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

    const fileURL = MAIN_WINDOW_VITE_DEV_SERVER_URL
      ? MAIN_WINDOW_VITE_DEV_SERVER_URL
      : join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);
    console.log(`Loading: ${fileURL}`);
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      this.window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      this.window.loadFile(
        join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
      );
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
