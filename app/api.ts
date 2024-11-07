/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { Channel } from '@shared/public-api';
import { ipcMain } from 'electron';
import { getPhobos } from './main';

export function ipcHandler(channel: Channel): MethodDecorator {
  return function (target, key, descriptor) {
    // Store channel on the method itself for later reference
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (target as any)[key].channel = channel;
    return descriptor;
  };
}

export abstract class PhobosApi {
  public constructor() {
    this.registerIpcHandlers();
  }

  public registerIpcHandlers() {
    const prototype = Object.getPrototypeOf(this);
    const methods = Object.getOwnPropertyNames(prototype);

    methods.forEach((methodName) => {
      const method = this[
        methodName as keyof PhobosApi
      ] as unknown as Function & { channel?: Channel };
      if (method.channel) {
        // Register with ipcMain using the channel and the method as handler
        ipcMain.handle(method.channel, (event, ...args) =>
          method.apply(this, args)
        );
        getPhobos().attachedHandlers.push(method.channel);
      }
    });
  }
}
