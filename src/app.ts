import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { swaggerSpec } from './swagger/openapi';
import { requestContextMiddleware } from './middleware/request-context.middleware';
import { globalRateLimitMiddleware } from './middleware/rate-limit.middleware';
import { apiRouter } from './routes';
import { notFoundMiddleware } from './middleware/not-found.middleware';
import { errorMiddleware } from './middleware/error.middleware';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', env.TRUST_PROXY);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN.split(',').map((item) => item.trim()) }));
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestContextMiddleware);
  app.use(globalRateLimitMiddleware);

  if (env.SWAGGER_ENABLED) {
    app.use(env.SWAGGER_PATH, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'OK',
      data: { status: 'healthy' },
    });
  });

  app.use('/api/v1', apiRouter);
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
