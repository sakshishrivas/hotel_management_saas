import type { AppUser, Prisma } from '@prisma/client';

import { env } from '../../../config/env';
import { redisKey, runRedisOperation } from '../../../config/redis';
import { logger } from '../../../logger/winston';
import { HTTP_STATUS, SYSTEM_ROLES } from '../../../constants';
import {
  AppError,
  generateOpaqueToken,
  generateSessionId,
  hashPassword,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyPassword,
  verifyRefreshToken,
} from '../../../utils';
import type {
  AuthContextDto,
  AuthResponseDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../dto/auth.dto';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthEmailService } from './auth-email.service';
import { rbacService } from '../../rbac/services/rbac.service';

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function parseExpiryToDate(expiresIn: string) {
  const match = /^(\d+)([mhd])$/.exec(expiresIn);
  if (!match) {
    return addMinutes(new Date(), 60);
  }

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return new Date(Date.now() + value * multipliers[unit]);
}

export class AuthService {
  constructor(
    private readonly authRepository = new AuthRepository(),
    private readonly emailService = new AuthEmailService(),
  ) {}

  private sessionCacheKey(sessionId: string) {
    return redisKey('auth', 'session', sessionId);
  }

  private userSessionsKey(userId: string) {
    return redisKey('auth', 'user-sessions', userId);
  }

  private async cacheSession(session: {
    id: string;
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
  }) {
    const ttlMs = Math.max(session.expiresAt.getTime() - Date.now(), 1000);

    await runRedisOperation(
      'session cache',
      async (client) => {
        await client.set(
          this.sessionCacheKey(session.id),
          JSON.stringify({
            id: session.id,
            userId: session.userId,
            refreshTokenHash: session.refreshTokenHash,
            expiresAt: session.expiresAt.toISOString(),
            revokedAt: session.revokedAt ? session.revokedAt.toISOString() : null,
          }),
          { PX: ttlMs },
        );
        await client.sAdd(this.userSessionsKey(session.userId), session.id);
        await client.pExpire(this.userSessionsKey(session.userId), ttlMs);
      },
      undefined,
    );
  }

  private async deleteSessionCache(sessionId: string, userId?: string) {
    await runRedisOperation(
      'session cache',
      (client) => client.del(this.sessionCacheKey(sessionId)),
      0,
    );
    if (userId) {
      await runRedisOperation(
        'session blacklist',
        (client) => client.sRem(this.userSessionsKey(userId), sessionId),
        0,
      );
    }
  }

  private async deleteAllSessionCache(userId: string, sessionIds: string[]) {
    const keys = sessionIds.map((sessionId) => this.sessionCacheKey(sessionId));
    if (keys.length > 0) {
      await runRedisOperation('session cache', (client) => client.del(keys), 0);
    }
    await runRedisOperation(
      'session blacklist',
      (client) => client.del(this.userSessionsKey(userId)),
      0,
    );
  }

  private async buildAuthResponse(user: AppUser, sessionId: string): Promise<AuthResponseDto> {
    const authorization = await rbacService.getAuthorizationBundle(user.id, { bypassCache: true });

    const accessToken = signAccessToken({
      sub: user.id,
      sid: sessionId,
      roles: authorization.roles,
      permissions: authorization.permissions,
      type: 'access',
    });
    const refreshToken = signRefreshToken({
      sub: user.id,
      sid: sessionId,
      type: 'refresh',
    });
    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = parseExpiryToDate(env.JWT_REFRESH_EXPIRES_IN);

    await this.authRepository.rotateSession(sessionId, refreshTokenHash, expiresAt);
    await this.cacheSession({
      id: sessionId,
      userId: user.id,
      refreshTokenHash,
      expiresAt,
      revokedAt: null,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        status: user.status,
        emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
        roles: authorization.roles,
        permissions: authorization.permissions,
      },
      tokens: {
        accessToken,
        refreshToken,
        accessTokenExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
        refreshTokenExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
      },
    };
  }

  private async createSessionRecord(user: AppUser, context: AuthContextDto) {
    const sessionId = generateSessionId();
    const expiresAt = parseExpiryToDate(env.JWT_REFRESH_EXPIRES_IN);
    await this.authRepository.createSession({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: hashToken(`bootstrap:${sessionId}`),
      deviceInfo: context.userAgent,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      expiresAt,
    });

    return sessionId;
  }

  private async recordAudit(
    userId: string | undefined,
    action: string,
    entityId: string | undefined,
    context: AuthContextDto,
    metadata: Prisma.InputJsonValue = {},
  ) {
    await this.authRepository.createAuditLog({
      actorUserId: userId,
      action,
      entityId,
      requestId: context.requestId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata,
    });
  }

  private async issueEmailVerification(user: AppUser, context: AuthContextDto) {
    const rawToken = generateOpaqueToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = addMinutes(new Date(), env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES);

    await this.authRepository.createEmailVerificationToken(user.id, tokenHash, expiresAt);
    await this.authRepository.updateUser(user.id, {
      emailVerificationSentAt: new Date(),
    });
    await this.emailService.sendVerificationEmail(user.email, user.displayName, rawToken);
    await this.recordAudit(user.id, 'auth.verification_email_sent', user.id, context);
  }

  private async issuePasswordReset(user: AppUser, context: AuthContextDto) {
    const rawToken = generateOpaqueToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = addMinutes(new Date(), env.PASSWORD_RESET_TOKEN_TTL_MINUTES);

    await this.authRepository.createPasswordResetToken(user.id, tokenHash, expiresAt);
    await this.emailService.sendPasswordResetEmail(user.email, user.displayName, rawToken);
    await this.recordAudit(user.id, 'auth.password_reset_requested', user.id, context);
  }

  async register(input: RegisterDto, context: AuthContextDto) {
    const existing = await this.authRepository.findUserByEmail(input.email);
    if (existing) {
      throw new AppError('Email is already registered', HTTP_STATUS.CONFLICT, 'AUTH_EMAIL_EXISTS');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await this.authRepository.transaction(async (db) => {
      const customerRole = await rbacService.ensureCustomerRole(db);
      const createdUser = await this.authRepository.createUser(
        {
          email: input.email,
          passwordHash,
          displayName: input.displayName,
          phone: input.phone,
        },
        db,
      );

      await this.authRepository.assignRole(createdUser.id, customerRole.id, createdUser.id, db);
      return createdUser;
    });

    await rbacService.clearAuthorizationCache(user.id);
    await this.issueEmailVerification(user, context);

    const sessionId = await this.createSessionRecord(user, context);
    await this.recordAudit(user.id, 'auth.register', user.id, context, {
      role: SYSTEM_ROLES.CUSTOMER,
    });

    return this.buildAuthResponse(user, sessionId);
  }

  async login(input: LoginDto, context: AuthContextDto) {
    const user = await this.authRepository.findUserByEmail(input.email);
    if (!user || user.deletedAt) {
      throw new AppError(
        'Invalid credentials',
        HTTP_STATUS.UNAUTHORIZED,
        'AUTH_INVALID_CREDENTIALS',
      );
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError('Account is temporarily locked', 423, 'AUTH_ACCOUNT_LOCKED');
    }

    if (user.status !== 'active') {
      throw new AppError('Account is not active', HTTP_STATUS.FORBIDDEN, 'AUTH_ACCOUNT_INACTIVE');
    }

    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      const failedAttempts = user.failedLoginAttempts + 1;
      const shouldLock = failedAttempts >= env.AUTH_MAX_FAILED_LOGINS;

      await this.authRepository.updateUser(user.id, {
        failedLoginAttempts: failedAttempts,
        lockedUntil: shouldLock ? addMinutes(new Date(), env.AUTH_ACCOUNT_LOCK_MINUTES) : null,
      });
      await this.recordAudit(user.id, 'auth.login_failed', user.id, context, {
        failedAttempts,
      });

      throw new AppError(
        'Invalid credentials',
        HTTP_STATUS.UNAUTHORIZED,
        'AUTH_INVALID_CREDENTIALS',
      );
    }

    await this.authRepository.updateUser(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    });

    const sessionId = await this.createSessionRecord(user, context);
    await this.recordAudit(user.id, 'auth.login', user.id, context);

    return this.buildAuthResponse(user, sessionId);
  }

  async refreshToken(input: RefreshTokenDto, context: AuthContextDto) {
    const payload = verifyRefreshToken(input.refreshToken);
    const session = await this.authRepository.findActiveSessionById(payload.sid);

    if (!session || session.deletedAt || session.revokedAt || session.expiresAt <= new Date()) {
      throw new AppError(
        'Session is no longer valid',
        HTTP_STATUS.UNAUTHORIZED,
        'AUTH_SESSION_INVALID',
      );
    }

    if (session.userId !== payload.sub) {
      throw new AppError(
        'Session is no longer valid',
        HTTP_STATUS.UNAUTHORIZED,
        'AUTH_SESSION_INVALID',
      );
    }

    if (session.refreshTokenHash !== hashToken(input.refreshToken)) {
      const userSessions = await this.authRepository.findActiveSessionsByUserId(session.userId);
      await this.authRepository.revokeAllSessions(session.userId);
      await this.deleteAllSessionCache(
        session.userId,
        userSessions.map((item) => item.id),
      );
      throw new AppError(
        'Refresh token reuse detected',
        HTTP_STATUS.UNAUTHORIZED,
        'AUTH_REFRESH_REUSE_DETECTED',
      );
    }

    const user = await this.authRepository.findUserById(session.userId);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.UNAUTHORIZED, 'AUTH_USER_NOT_FOUND');
    }

    await this.recordAudit(user.id, 'auth.refresh', user.id, context, { sessionId: session.id });

    return this.buildAuthResponse(user, session.id);
  }

  async logout(userId: string, sessionId: string, context: AuthContextDto) {
    const session = await this.authRepository.findActiveSessionById(sessionId);
    if (session && session.userId === userId && !session.revokedAt) {
      await this.authRepository.revokeSession(sessionId);
      await this.deleteSessionCache(sessionId, userId);
    }

    await this.recordAudit(userId, 'auth.logout', userId, context, { sessionId });
  }

  async logoutAllDevices(userId: string, context: AuthContextDto) {
    const sessions = await this.authRepository.findActiveSessionsByUserId(userId);
    await this.authRepository.revokeAllSessions(userId);
    await this.deleteAllSessionCache(
      userId,
      sessions.map((session) => session.id),
    );
    await this.recordAudit(userId, 'auth.logout_all', userId, context, {
      sessionCount: sessions.length,
    });
  }

  async forgotPassword(input: ForgotPasswordDto, context: AuthContextDto) {
    const user = await this.authRepository.findUserByEmail(input.email);
    if (!user) {
      logger.info({ email: input.email }, 'Password reset requested for unknown account');
      return;
    }

    await this.issuePasswordReset(user, context);
  }

  async resetPassword(input: ResetPasswordDto, context: AuthContextDto) {
    const tokenHash = hashToken(input.token);
    const resetToken = await this.authRepository.findPasswordResetTokenByHash(tokenHash);

    if (!resetToken || resetToken.expiresAt <= new Date()) {
      throw new AppError(
        'Reset token is invalid or expired',
        HTTP_STATUS.UNAUTHORIZED,
        'AUTH_RESET_TOKEN_INVALID',
      );
    }

    const passwordHash = await hashPassword(input.newPassword);

    const existingSessions = await this.authRepository.findActiveSessionsByUserId(
      resetToken.userId,
    );

    await this.authRepository.transaction(async (db) => {
      await this.authRepository.updateUser(
        resetToken.userId,
        {
          passwordHash,
          passwordChangedAt: new Date(),
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
        db,
      );
      await this.authRepository.markPasswordResetTokenUsed(resetToken.id, db);
      await this.authRepository.revokeAllSessions(resetToken.userId, db);
    });

    await this.deleteAllSessionCache(
      resetToken.userId,
      existingSessions.map((session) => session.id),
    );
    await this.recordAudit(
      resetToken.userId,
      'auth.password_reset_completed',
      resetToken.userId,
      context,
    );
  }

  async changePassword(userId: string, input: ChangePasswordDto, context: AuthContextDto) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'AUTH_USER_NOT_FOUND');
    }

    const isCurrentPasswordValid = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new AppError(
        'Current password is incorrect',
        HTTP_STATUS.UNAUTHORIZED,
        'AUTH_INVALID_CREDENTIALS',
      );
    }

    const passwordHash = await hashPassword(input.newPassword);

    await this.authRepository.updateUser(userId, {
      passwordHash,
      passwordChangedAt: new Date(),
    });
    await this.logoutAllDevices(userId, context);
    await this.recordAudit(userId, 'auth.password_changed', userId, context);
  }

  async verifyEmail(input: VerifyEmailDto, context: AuthContextDto) {
    const tokenHash = hashToken(input.token);
    const verificationToken = await this.authRepository.findEmailVerificationTokenByHash(tokenHash);

    if (!verificationToken || verificationToken.expiresAt <= new Date()) {
      throw new AppError(
        'Verification token is invalid or expired',
        HTTP_STATUS.UNAUTHORIZED,
        'AUTH_VERIFICATION_TOKEN_INVALID',
      );
    }

    await this.authRepository.transaction(async (db) => {
      await this.authRepository.updateUser(
        verificationToken.userId,
        {
          emailVerifiedAt: new Date(),
        },
        db,
      );
      await this.authRepository.markEmailVerificationTokenUsed(verificationToken.id, db);
    });

    await this.recordAudit(
      verificationToken.userId,
      'auth.email_verified',
      verificationToken.userId,
      context,
    );
  }

  async resendVerificationEmail(userId: string, context: AuthContextDto) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'AUTH_USER_NOT_FOUND');
    }

    if (user.emailVerifiedAt) {
      return;
    }

    await this.issueEmailVerification(user, context);
  }

  async authenticateAccessToken(token: string) {
    const payload = verifyAccessToken(token);
    const cached = await runRedisOperation(
      'session cache',
      (client) => client.get(this.sessionCacheKey(payload.sid)),
      null,
    );

    if (cached) {
      const session = JSON.parse(cached) as {
        id: string;
        userId: string;
        expiresAt: string;
        revokedAt: string | null;
      };

      if (
        session.userId === payload.sub &&
        !session.revokedAt &&
        new Date(session.expiresAt) > new Date()
      ) {
        return payload;
      }
    }

    const session = await this.authRepository.findActiveSessionById(payload.sid);
    if (
      !session ||
      session.userId !== payload.sub ||
      session.revokedAt ||
      session.expiresAt <= new Date()
    ) {
      throw new AppError(
        'Session is no longer valid',
        HTTP_STATUS.UNAUTHORIZED,
        'AUTH_SESSION_INVALID',
      );
    }

    await this.cacheSession({
      id: session.id,
      userId: session.userId,
      refreshTokenHash: session.refreshTokenHash,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
    });

    return payload;
  }
}

export const authService = new AuthService();
