import { createClient, type RedisClientType } from 'redis';

import { env } from './env';
import { logger } from './logger';

export const isRedisRequired = env.NODE_ENV === 'production';
let redisWarningLogged = false;

export const redisClient: RedisClientType | null = env.REDIS_URL
  ? createClient({
      url: env.REDIS_URL,
      socket: {
        tls: env.REDIS_TLS_ENABLED,
        reconnectStrategy(retries) {
          if (!isRedisRequired || retries >= 5) {
            return false;
          }
          return Math.min(retries * 100, 3000);
        },
      },
    })
  : null;

function reportUnavailable(error: unknown, feature = 'Redis') {
  if (isRedisRequired) {
    logger.error({ error, feature }, 'Redis operation failed');
    return;
  }

  if (!redisWarningLogged) {
    logger.warn({ error, feature }, 'Redis unavailable; Redis-dependent features are disabled');
    redisWarningLogged = true;
  }
}

redisClient?.on('ready', () => {
  redisWarningLogged = false;
  logger.info('Redis connected');
});

redisClient?.on('error', (error) => reportUnavailable(error));

export async function connectRedis(): Promise<boolean> {
  if (!redisClient) {
    const error = new Error('REDIS_URL is not configured');
    reportUnavailable(error, 'startup');
    if (isRedisRequired) {
      throw error;
    }
    return false;
  }

  if (redisClient.isReady) {
    return true;
  }

  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    return redisClient.isReady;
  } catch (error) {
    reportUnavailable(error, 'startup');
    if (isRedisRequired) {
      throw error;
    }
    return false;
  }
}

export async function disconnectRedis() {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }
}

export function isRedisAvailable() {
  return redisClient?.isReady === true;
}

export async function runRedisOperation<T>(
  feature: string,
  operation: (client: RedisClientType) => Promise<T>,
  fallback: T,
): Promise<T> {
  if (!redisClient?.isReady) {
    if (isRedisRequired) {
      throw new Error(`Redis is required for ${feature} but is not connected`);
    }
    return fallback;
  }

  try {
    return await operation(redisClient);
  } catch (error) {
    reportUnavailable(error, feature);
    if (isRedisRequired) {
      throw error;
    }
    return fallback;
  }
}

export function redisKey(...parts: Array<string | number>) {
  return [env.REDIS_KEY_PREFIX, ...parts].join(':');
}
