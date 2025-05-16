export function asBase64Image(
  data: Buffer<ArrayBufferLike> | string,
  extension = 'png'
): string {
  return `data:image/${extension};base64,${
    typeof data === 'string' ? data : data.toString('base64')
  }`;
}

export function correctObjectShape<T extends object>(
  source: T,
  defaultValue: T
): T {
  const result: T = { ...defaultValue };
  for (const [k, v] of Object.entries(defaultValue)) {
    if (source[k as keyof T] !== undefined) {
      result[k as keyof T] = v;
    }
  }
  return result;
}

// Magic number.
const DJB_IV = 5381;
export function simpleHash(str: string) {
  let hash = DJB_IV;

  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i); // hash * 33 + c
  }
  return hash >>> 0;
}

export function normalizePathSep(value: string, targetSep = '/'): string {
  const otherSep = targetSep === '/' ? '\\' : '/';
  return value.replaceAll(otherSep, targetSep);
}
