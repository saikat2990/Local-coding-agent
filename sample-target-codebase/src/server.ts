// Entry point: start the HTTP server and handle graceful shutdown.
import { createApp } from './app';
import config from './config';
import { logger } from './utils/logger';

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info('server started', { port: config.port, env: config.env });
});

function shutdown(signal: NodeJS.Signals): void {
  logger.info('shutting down', { signal });
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
