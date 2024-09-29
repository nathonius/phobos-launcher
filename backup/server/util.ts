import { resolve } from 'node:path';
import { readFile as nodeReadFile } from 'node:fs/promises';
import type { JSONObject } from '@shared/json';

export const PHOBOS_DIR = __dirname;
export const CONFIG_DIR = resolve(PHOBOS_DIR, 'config');

export function safeJSONParse<T>(source: string): T | null {
  try {
    return JSON.parse(source) as T;
  } catch {
    return null;
  }
}

export async function readFile<T extends JSONObject>(
  path: string
): Promise<T | null> {
  const fileContent = await nodeReadFile(path, { encoding: 'utf-8' });
  return safeJSONParse<T>(fileContent);
}
