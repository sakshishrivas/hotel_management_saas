import { createServer } from 'node:http';

import { createApp } from './app';
import { env } from './config/env';
import { logger } from './logger/winston';
import { connectRedis, disconnectRedis } from './config/redis';
import { prisma } from './config/database';

async function bootstrap() {
  await prisma.$connect();
  await connectRedis();

  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down server');
    server.close(async () => {
      await Promise.allSettled([prisma.$disconnect(), disconnectRedis()]);
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

void bootstrap().catch((error) => {
  logger.error({ error }, 'Application startup failed');
  process.exitCode = 1;
});
