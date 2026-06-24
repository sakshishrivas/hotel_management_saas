import type { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      context?: {
        requestId: string;
        hotelId?: string;
        userId?: string;
      };
      user?: JwtPayload & {
        sub?: string;
        sid?: string;
        type?: 'access' | 'refresh';
        roles?: string[];
        permissions?: string[];
        hotelId?: string;
      };
    }
  }
}

export {};
