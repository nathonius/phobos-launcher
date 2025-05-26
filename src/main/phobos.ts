import { join } from 'node:path';
import { setTimeout, clearTimeout } from 'node:timers';
import { app, BrowserWindow, protocol } from 'electron';

import { ALL_CHANNELS, type Channel } from '../shared/public-api'; // This import MUST be relative
import { DEFAULT_WINDOW_SETTINGS } from '../main';
import { ProfileService } from './services/profile.service';
import { UserDataService } from './services/user-data.service';
import { CategoryService } from './services/category.service';
import { SettingsService } from './services/settings.service';
import { SGDBService } from './services/sgdb.service';
import { ImportService } from './services/import.service';
import { EngineService } from './services/engine.service';
import { WadService } from './services/wad.service';
import { getStore, initStore } from './store';

export class Phobos {
  public userDataService!: UserDataService;
  public profileService!: ProfileService;
  public categoryService!: CategoryService;
  public settingsService!: SettingsService;
  public steamGridService!: SGDBService;
  public engineService!: EngineService;
  public importService!: ImportService;
  public wadService!: WadService;
  public readonly attachedHandlers: Channel[] = [];
  private window: BrowserWindow | null = null;
  private initialized = false;
  private windowSettingsTimeout: NodeJS.Timeout | undefined;

  constructor(
    private readonly basePath: string,
    private readonly serve = false
  ) {
    initStore();
  }

  /**
   * Set up handlers, listeners
   */
  public init() {
    if (this.initialized) {
      return;
    }

    // Enable fetch for custom url schemes
    protocol.registerSchemesAsPrivileged([
      { scheme: UserDataService.scheme, privileges: { supportFetchAPI: true } },
    ]);

    // Attach API/IPC handlers, create window
    app.on('ready', async () => {
      // Set up store; nothing that reads from it should be called before this
      await initStore();

      // Init services
      this.profileService = new ProfileService();
      this.categoryService = new CategoryService();
      this.settingsService = new SettingsService();
      this.engineService = new EngineService();
      this.steamGridService = new SGDBService();
      this.importService = new ImportService(this);
      this.userDataService = new UserDataService(app.getPath('userData'));
      this.wadService = new WadService();

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
    const windowSettings = this.getWindowSettings();
    // Create the browser window.
    this.window = new BrowserWindow({
      ...windowSettings,
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
        getStore().update((data) => {
          data.window = this.window?.getBounds() ?? null;
        });
      }, 500);
    });

    return this.window;
  }

  private getWindowSettings(): Electron.Rectangle {
    return getStore().data.window ?? DEFAULT_WINDOW_SETTINGS();
  }
}
