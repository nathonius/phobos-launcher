import type { LogEntry } from 'winston';
import { Api } from '../api/api';

type LogMethod = (entry: LogEntry) => void;
type LeveledLogMethod = (message: any, ...meta: any[]) => void;

interface PhobosLogger {
  log: LogMethod;
  error: LeveledLogMethod;
  warn: LeveledLogMethod;
  debug: LeveledLogMethod;
  info: LeveledLogMethod;
}

export const logger: PhobosLogger = {
  log: (entry: LogEntry) => {
    void Api['logger.log'](entry);
  },
  error: (message: any, ...meta: any[]) => {
    void Api['logger.error'](message, ...meta);
  },
  warn: (message: any, ...meta: any[]) => {
    void Api['logger.warn'](message, ...meta);
  },
  debug: (message: any, ...meta: any[]) => {
    void Api['logger.debug'](message, ...meta);
  },
  info: (message: any, ...meta: any[]) => {
    void Api['logger.info'](message, ...meta);
  },
};
