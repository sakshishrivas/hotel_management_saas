import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../utils/app-error';
import { HTTP_STATUS } from '../constants/http-status';

export function notFoundMiddleware(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError('Route not found', HTTP_STATUS.NOT_FOUND, 'RESOURCE_NOT_FOUND'));
}
