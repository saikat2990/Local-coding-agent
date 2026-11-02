import config, { LogLevel } from '../config';

const LEVELS: Record<LogLevel, number> = { error: 0, warn: 1, info: 2, debug: 3 };

type Meta = Record<string, unknown>;

function shouldLog(level: LogLevel): boolean {
  const current = LEVELS[config.logLevel] ?? LEVELS.info;
  return LEVELS[level] <= current;
}

function log(level: LogLevel, message: string, meta?: Meta): void {
  if (config.env === 'test' || !shouldLog(level)) return;
  const line = { time: new Date().toISOString(), level, message, ...meta };
  const out = level === 'error' ? console.error : console.log;
  out(JSON.stringify(line));
}

export const logger = {
  error: (message: string, meta?: Meta) => log('error', message, meta),
  warn: (message: string, meta?: Meta) => log('warn', message, meta),
  info: (message: string, meta?: Meta) => log('info', message, meta),
  debug: (message: string, meta?: Meta) => log('debug', message, meta),
};
