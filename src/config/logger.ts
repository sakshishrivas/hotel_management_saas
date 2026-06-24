import winston from 'winston';

import { env } from './env';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

function serialize(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
      ...(value.cause === undefined ? {} : { cause: serialize(value.cause) }),
    };
  }

  if (Array.isArray(value)) {
    return value.map(serialize);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, serialize(entry)]));
  }

  return value;
}

const consoleFormat = printf(({ level, message, timestamp: ts, ...meta }) => {
  const serializedMeta = serialize(meta) as Record<string, unknown>;
  const suffix = Object.keys(serializedMeta).length > 0 ? ` ${JSON.stringify(serializedMeta)}` : '';
  return `${ts} ${level}: ${String(message)}${suffix}`;
});

const winstonLogger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(timestamp(), errors({ stack: true }), json()),
  defaultMeta: {
    service: env.APP_NAME,
    env: env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      format:
        env.NODE_ENV === 'production'
          ? combine(timestamp(), errors({ stack: true }), json())
          : combine(colorize(), timestamp(), errors({ stack: true }), consoleFormat),
    }),
  ],
});

type LogMeta = Record<string, unknown> | Error;

function write(level: string, messageOrMeta: string | LogMeta, message?: string) {
  if (typeof messageOrMeta === 'string') {
    winstonLogger.log(level, messageOrMeta);
    return;
  }

  const meta = serialize(messageOrMeta) as Record<string, unknown>;
  const fallbackMessage = messageOrMeta instanceof Error ? messageOrMeta.message : level;
  winstonLogger.log(level, message ?? fallbackMessage, meta);
}

// Supports both logger.info('message') and logger.info({ context }, 'message').
export const logger = {
  error: (messageOrMeta: string | LogMeta, message?: string) =>
    write('error', messageOrMeta, message),
  warn: (messageOrMeta: string | LogMeta, message?: string) =>
    write('warn', messageOrMeta, message),
  info: (messageOrMeta: string | LogMeta, message?: string) =>
    write('info', messageOrMeta, message),
  http: (messageOrMeta: string | LogMeta, message?: string) =>
    write('http', messageOrMeta, message),
  debug: (messageOrMeta: string | LogMeta, message?: string) =>
    write('debug', messageOrMeta, message),
  silly: (messageOrMeta: string | LogMeta, message?: string) =>
    write('silly', messageOrMeta, message),
};
