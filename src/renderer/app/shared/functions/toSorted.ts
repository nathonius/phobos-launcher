export function toSorted<T>(
  array: T[],
  filterFunc: (a: T, b: T) => number
): T[] {
  const copied = [...array];
  copied.sort(filterFunc);
  return copied;
}
