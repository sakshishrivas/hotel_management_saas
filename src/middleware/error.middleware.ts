import type { NextFunction, Request, Response } from 'express';

import { logger } from '../logger/winston';
import { AppError } from '../utils/app-error';
import { HTTP_STATUS } from '../constants/http-status';

export function errorMiddleware(error: unknown, req: Request, res: Response, _next: NextFunction) {
  const appError =
    error instanceof AppError
      ? error
      : new AppError('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);

  logger.error(
    {
      err: error,
      requestId: req.requestId,
      path: req.originalUrl,
      method: req.method,
    },
    appError.message,
  );

  res.status(appError.statusCode).json({
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      details: appError.details ?? null,
    },
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
}
