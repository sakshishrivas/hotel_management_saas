import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const incomingRequestId = req.header('x-request-id');
  const requestId =
    incomingRequestId && uuidPattern.test(incomingRequestId) ? incomingRequestId : randomUUID();

  req.requestId = requestId;
  req.context = {
    requestId,
    userId: req.user?.sub,
    hotelId: req.user?.hotelId,
  };
  res.setHeader('x-request-id', requestId);
  next();
}
