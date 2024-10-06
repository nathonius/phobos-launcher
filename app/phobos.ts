import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { app, BrowserWindow, screen } from 'electron';

import { ProfileService } from './services/profile.service';
import { PhobosApi } from './api';

export class Phobos {
  public readonly api = new PhobosApi();
  public readonly profileService = new ProfileService();
  private window: BrowserWindow | null = null;
  private initialized = false;

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
      this.api._attachHandlers();
      void this.profileService.init();
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
    // TODO: Store the size and restore to the last used size
    const size = screen.getPrimaryDisplay().workAreaSize;

    // Create the browser window.
    this.window = new BrowserWindow({
      x: 0,
      y: 0,
      width: size.width - 100,
      height: size.height - 100,
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

    return this.window;
  }
}
