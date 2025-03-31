import path from 'node:path';
import { app, screen } from 'electron';
import squirrel from 'electron-squirrel-startup';
import { Phobos } from './main/phobos';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrel) {
  app.quit();
}

export function DEFAULT_WINDOW_SETTINGS(): Electron.Rectangle {
  const size = screen.getPrimaryDisplay().workAreaSize;
  const config = {
    x: 0,
    y: 0,
    width: Math.min(800, size.width),
    height: Math.min(600, size.height),
  };
  return config;
}

export const APP_DIR = __dirname;
export const CONFIG_DIR = path.join(APP_DIR, 'config');
export const PROFILE_DIR = path.join(CONFIG_DIR, 'profiles');
const phobos = new Phobos(APP_DIR);
phobos.init();

export function getPhobos() {
  return phobos;
}
