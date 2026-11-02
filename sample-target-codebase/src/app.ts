// Builds the Express app without starting a server, so tests can import it.
import express, { Express } from 'express';
import routes from './routes';
import { requestLogger } from './middlewares/requestLogger';
import { notFound } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
