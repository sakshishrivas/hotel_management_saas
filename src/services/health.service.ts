import { prisma } from '../config/database';
import { isRedisAvailable, isRedisRequired, runRedisOperation } from '../config/redis';

export interface HealthStatus {
  status: 'healthy' | 'degraded';
  database: 'up' | 'down';
  redis: 'up' | 'down' | 'disabled';
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const databaseResult = await prisma
    .$queryRawUnsafe('SELECT 1')
    .then(() => 'up' as const)
    .catch(() => 'down' as const);

  const redisResult = isRedisAvailable()
    ? await runRedisOperation(
        'health check',
        (client) => client.ping().then(() => 'up' as const),
        'down' as const,
      )
    : isRedisRequired
      ? ('down' as const)
      : ('disabled' as const);

  return {
    status:
      databaseResult === 'up' && (redisResult === 'up' || redisResult === 'disabled')
        ? 'healthy'
        : 'degraded',
    database: databaseResult,
    redis: redisResult,
  };
}
