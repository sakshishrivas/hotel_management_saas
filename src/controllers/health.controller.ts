import type { Request, Response, NextFunction } from 'express';

import { getHealthStatus } from '../services/health.service';
import { sendSuccess } from '../utils/api-response';

export async function healthController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const health = await getHealthStatus();

    sendSuccess(res, health, 'OK', 200, {
      requestId: _req.requestId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}
