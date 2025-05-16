export function toSorted<T>(
  array: T[],
  filterFunc: (a: T, b: T) => number
): T[] {
  const copied = [...array];
  copied.sort(filterFunc);
  return copied;
}

export function timestampSort<T>(
  a: T,
  b: T,
  key: keyof T | null = null,
  sortDirection = 1
): number {
  let timestampA: string;
  let timestampB: string;
  if (key !== null) {
    timestampA = a[key] as string;
    timestampB = b[key] as string;
  } else {
    timestampA = a as string;
    timestampB = b as string;
  }
  return (
    (new Date(timestampA ?? 0).valueOf() -
      new Date(timestampB ?? 0).valueOf()) *
    sortDirection
  );
}
