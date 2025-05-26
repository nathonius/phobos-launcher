/**
 * Returns a rotated copy of an array, rotated by delta;
 * For example, [1, 2, 3, 4] rotated 1 is [2, 3, 4, 1];
 * If reverse is provided, the array is rotated the opposite
 * way: [1, 2, 3, 4] rotated 1 reversed becomes [4, 1, 2, 3]
 */
export function rotate<T>(source: T[], delta: number, reverse = false): T[] {
  const d = delta % source.length;
  if (!reverse) {
    return source.slice(d, source.length).concat(source.slice(0, d));
  } else {
    return source
      .slice(source.length - d, source.length)
      .concat(source.slice(0, source.length - d));
  }
}

export function getNext<T>(source: T[], index = 0, delta = 1): T {
  return rotate(source, delta)[index];
}

export function getPrev<T>(source: T[], index = 0, delta = 1): T {
  return rotate(source, delta, true)[index];
}
