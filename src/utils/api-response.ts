import type { Response } from 'express';

export function sendSuccess(
  res: Response,
  data: unknown,
  message = 'OK',
  statusCode = 200,
  meta: Record<string, unknown> = {},
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
}
