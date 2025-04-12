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

/**
 * https://github.com/angular/angular/issues/59528#issuecomment-2593974981
 */
export function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => resolve(), ms);

    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout);
        reject(new Error('Operation aborted'));
      },
      { once: true }
    );
  });
}
