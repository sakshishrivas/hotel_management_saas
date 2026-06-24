import { PrismaClient } from '@prisma/client';

import { env } from './env';
import { logger } from '../logger/winston';

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined;
}

const prisma =
  global.prismaClient ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ],
  });

if (env.NODE_ENV !== 'production') {
  global.prismaClient = prisma;
}

// Prisma v6 typing workaround
prisma.$on('query' as never, (event: any) => {
  logger.debug(
    {
      query: event.query,
      duration: event.duration,
      target: event.target,
    },
    'Prisma query executed',
  );
});

export { prisma };