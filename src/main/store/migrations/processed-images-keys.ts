import type { CompressedImage } from '../../../shared/config';
import type { Migration } from './migration';

type BadCompressedImage = { [key: string]: MaybeBadCompressedImage };
type MaybeBadCompressedImage = CompressedImage | BadCompressedImage;

const maxDepth = 5;

/**
 * These were stored with paths as a key, but the code that set and read the values
 * originally was using a lodash style get/set function, so sometimes the object would
 * have multiple sub-objects, one for each `.` in the file path.
 *
 * This normalizes them to a single layer.
 */
export const fixProcessedImagesKeys: Migration = {
  key: 'processed-images-keys',
  fn: ({ internal }) => {
    for (const key of Object.keys(internal['processed-image'])) {
      const maybeBad = internal['processed-image'][
        key
      ] as MaybeBadCompressedImage;
      if (isCompressedImage(maybeBad)) {
        continue;
      }
      const image = getImage(maybeBad);
      if (!image) {
        // Unrecoverable
        delete internal['processed-image'][key];
        continue;
      } else {
        // Fixable
        internal['processed-image'][image.originalPath] = image;
        delete internal['processed-image'][key];
      }
    }
  },
};

function getImage(bad: BadCompressedImage, depth = 0) {
  if (depth >= maxDepth) {
    return null;
  }
  // it should only have one key
  const subvalue = Object.values(bad)[0];
  if (!subvalue) {
    return null;
  }
  if (isCompressedImage(subvalue)) {
    return subvalue;
  }
  return getImage(subvalue, depth + 1);
}

function isCompressedImage(
  maybeCompressed: MaybeBadCompressedImage
): maybeCompressed is CompressedImage {
  return (
    Object.hasOwn(maybeCompressed, 'originalPath') &&
    Object.hasOwn(maybeCompressed, 'compressedPath') &&
    Object.hasOwn(maybeCompressed, 'modifiedMs')
  );
}
