import { resolve as resolvePath } from 'node:path';
import { spawn } from 'node:child_process';
import { dirname } from '@angular/compiler-cli';
import { getPhobos } from '../../main';
import type { UniqueFileRecord } from '../../shared/config';

export async function deutexExtract(wadPath: string) {
  const deutexPath = getPhobos().settingsService.getSetting('deutexPath') as
    | string
    | null;
  if (!deutexPath) {
    console.error('DeuTex path not set.');
    return;
  }
  const bases = (getPhobos().settingsService.getSetting('bases') ??
    []) as UniqueFileRecord[];
  const doom2 = bases.find((b) => b.path.toLowerCase().endsWith('doom2.wad'));
  if (!doom2) {
    console.error('Could not find doom 2 wad for deutex extraction.');
    return;
  }

  const wadDataDir = resolvePath(
    await getPhobos().userDataService.makeWadDataDir(wadPath)
  );
  const args = [
    '-doom2',
    `${resolvePath(dirname(doom2.path))}`,
    '-dir',
    `${resolvePath(wadDataDir)}`,
    '-overwrite',
    '-graphics',
    '-extract',
    `${resolvePath(wadPath)}`,
  ];

  const { promise, resolve } = Promise.withResolvers();
  const _process = spawn(deutexPath, args);
  _process.on('close', (code) => {
    resolve(code);
  });
  _process.stdout.on('data', (data) => {
    console.debug(`stdout: ${data}`);
  });
  _process.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  await promise;
  return wadDataDir;
}
