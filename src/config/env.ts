import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const booleanFromString = z.preprocess((value) => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return value;
}, z.boolean());

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    APP_NAME: z.string().default('Hotel Management Backend'),
    API_VERSION: z.string().default('v1'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug', 'silly']).default('info'),
    TRUST_PROXY: booleanFromString.default(false),
    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
      z.string().min(1).optional(),
    ),
    REDIS_KEY_PREFIX: z.string().default('hms'),
    REDIS_TLS_ENABLED: booleanFromString.default(false),
    JWT_ACCESS_SECRET: z.string().min(16),
    JWT_REFRESH_SECRET: z.string().min(16),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
    JWT_ISSUER: z.string().default('hotel-management-backend'),
    JWT_AUDIENCE: z.string().default('hotel-management-clients'),
    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
    AUTH_MAX_FAILED_LOGINS: z.coerce.number().int().positive().default(5),
    AUTH_ACCOUNT_LOCK_MINUTES: z.coerce.number().int().positive().default(15),
    PASSWORD_RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(30),
    EMAIL_VERIFICATION_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(60),
    APP_BASE_URL: z.string().url().default('http://localhost:4000'),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
    SWAGGER_ENABLED: booleanFromString.default(true),
    SWAGGER_PATH: z.string().default('/api/docs'),
    FILE_UPLOAD_MAX_MB: z.coerce.number().int().positive().default(20),
    FILE_UPLOAD_DIR: z.string().default('./uploads'),
  })
  .superRefine((values, context) => {
    if (values.NODE_ENV === 'production' && !values.REDIS_URL) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['REDIS_URL'],
        message: 'REDIS_URL is required in production',
      });
    }
  });

export const env = envSchema.parse(process.env);
