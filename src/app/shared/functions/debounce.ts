/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export function debounce(func: Function, delayMs: number) {
  let timeoutId: number | undefined;
  return function (...args: unknown[]) {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      // @ts-expect-error - This arg comes from parent scope
      func.apply(this, args);
    }, delayMs);
  };
}
