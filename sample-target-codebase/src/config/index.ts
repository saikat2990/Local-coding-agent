// Central place for configuration. Read env vars here and nowhere else.
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface AppConfig {
  env: string;
  port: number;
  logLevel: LogLevel;
}

const config: AppConfig = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  logLevel: (process.env.LOG_LEVEL as LogLevel) || 'info',
};

export default config;
