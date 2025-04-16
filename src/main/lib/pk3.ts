import { resolve, join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import type { CentralDirectory } from 'unzipper';
import { Open } from 'unzipper';
import { getPhobos } from '../../main';

const graphicsPaths = ['graphic/', 'graphics/'];

export async function pk3Extract(
  pk3Path: string,
  lumpNames: string[]
): Promise<string | null> {
  const wadDataDir = resolve(
    await getPhobos().userDataService.makeWadDataDir(pk3Path)
  );
  let pk3: CentralDirectory;
  try {
    pk3 = await Open.file(pk3Path);
  } catch (err) {
    console.error(err);
    return null;
  }

  console.debug(`Checking pk3 for ${lumpNames.length} lumps...`);
  for (const lumpName of lumpNames) {
    const lumpFile = `${lumpName.toLowerCase()}.png`;

    const file = pk3.files.find((f) => f.path.endsWith(lumpFile));
    if (file) {
      console.debug(`Writing ${lumpFile} to ${wadDataDir}`);
      const buffer = await file.buffer();
      await writeFile(resolve(join(wadDataDir, 'graphics', lumpFile)), buffer);
    } else {
      console.debug(`No file found in pk3 for ${lumpFile}`);
    }
  }

  return wadDataDir;
}
