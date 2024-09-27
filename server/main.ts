import { join } from 'node:path';
import { app, BrowserWindow } from 'electron';
import { attachHandlers, handlers } from './api/api';

class Main {
  private mainWindow: BrowserWindow | undefined;

  public init() {
    app.on('ready', () => {
      attachHandlers(handlers);
      this.createWindow();
    });
    app.on('window-all-closed', this.onWindowAllClosed);
    app.on('activate', this.onActivate);
  }

  private onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  private onActivate() {
    if (!this.mainWindow) {
      this.createWindow();
    }
  }

  private createWindow() {
    this.mainWindow = new BrowserWindow({
      height: 600,
      width: 800,
      title: `Yet another Electron Application`,
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
      },
    });

    this.mainWindow.webContents.openDevTools();
    void this.mainWindow.loadFile('./browser/index.html');
  }
}

new Main().init();
