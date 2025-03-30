/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export function debounce(func: Function, delayMs: number) {
  let timeoutId: number | undefined;
  return function (...args: unknown[]) {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      func.apply(this, args);
    }, delayMs);
  };
}
