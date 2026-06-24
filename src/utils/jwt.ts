import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  sid: string;
  roles: string[];
  permissions: string[];
  hotelId?: string;
  type: 'access';
}

export interface RefreshTokenPayload extends JwtPayload {
  sub: string;
  sid: string;
  type: 'refresh';
}

function baseSignOptions(expiresIn: string): SignOptions {
  return {
    expiresIn: expiresIn as SignOptions['expiresIn'],
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  };
}

export function signAccessToken(
  payload: Omit<AccessTokenPayload, 'iat' | 'exp'>,
): string {
  return jwt.sign(
    payload,
    env.JWT_ACCESS_SECRET,
    baseSignOptions(env.JWT_ACCESS_EXPIRES_IN),
  );
}

export function signRefreshToken(
  payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>,
): string {
  return jwt.sign(
    payload,
    env.JWT_REFRESH_SECRET,
    baseSignOptions(env.JWT_REFRESH_EXPIRES_IN),
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  }) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  }) as RefreshTokenPayload;
}