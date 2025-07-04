import type { LogEntry } from 'winston';
import { createLogger, transports, format } from 'winston';
import { ipcHandler, PhobosApi } from './api';

const baseLogger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({ filename: 'out.log' }),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.Console({ format: format.simple() }),
  ],
});

export const logger = baseLogger.child({ context: 'main' });
const uiLogger = baseLogger.child({ context: 'renderer' });

export class IpcLogger extends PhobosApi {
  @ipcHandler('logger.log')
  log(entry: LogEntry) {
    uiLogger.log(entry);
  }
  @ipcHandler('logger.info')
  info(message: any, ...meta: any[]) {
    uiLogger.info(message, ...meta);
  }
  @ipcHandler('logger.debug')
  debug(message: any, ...meta: any[]) {
    uiLogger.debug(message, ...meta);
  }
  @ipcHandler('logger.warn')
  warn(message: any, ...meta: any[]) {
    uiLogger.warn(message, ...meta);
  }
  @ipcHandler('logger.error')
  error(message: any, ...meta: any[]) {
    uiLogger.error(message, ...meta);
  }
}
