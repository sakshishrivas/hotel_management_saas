import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../utils/app-error';
import { HTTP_STATUS } from '../constants/http-status';
import { authService } from '../modules/auth/services/auth.service';

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED, 'AUTH_REQUIRED'));
  }

  const token = header.slice(7);
  try {
    req.user = await authService.authenticateAccessToken(token);
    return next();
  } catch {
    return next(new AppError('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED, 'AUTH_INVALID_TOKEN'));
  }
}

export async function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return next();
  }

  const token = header.slice(7);
  try {
    req.user = await authService.authenticateAccessToken(token);
  } catch {
    // Ignore optional auth failures.
  }

  return next();
}
