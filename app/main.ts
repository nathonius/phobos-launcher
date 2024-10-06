import * as path from 'node:path';
import { Phobos } from './phobos';

export const APP_DIR = __dirname;
export const CONFIG_DIR = path.join(APP_DIR, 'config');
export const PROFILE_DIR = path.join(CONFIG_DIR, 'profiles');

const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve');

const phobos = new Phobos(APP_DIR, serve);
phobos.init();

export function getPhobos() {
  return phobos;
}
