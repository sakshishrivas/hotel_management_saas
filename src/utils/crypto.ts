import { createHash, randomBytes, randomUUID } from 'node:crypto';

export function generateOpaqueToken(size = 48) {
  return randomBytes(size).toString('hex');
}

export function generateSessionId() {
  return randomUUID();
}

export function hashToken(value: string) {
  return createHash('sha256').update(value).digest('hex');
}
