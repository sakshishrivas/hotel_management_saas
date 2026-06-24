import type { Prisma, PrismaClient } from '@prisma/client';

import { BaseRepository } from '../../../repositories/base.repository';

type DbClient = Prisma.TransactionClient | PrismaClient;

interface AuditLogInput {
  actorUserId?: string;
  action: string;
  entityId?: string;
  requestId?: string;
  beforeData?: Prisma.InputJsonValue;
  afterData?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

export class AuthRepository extends BaseRepository {
  private getClient(db?: DbClient) {
    return db ?? this.db;
  }

  async transaction<T>(callback: (db: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(callback);
  }

  async findUserByEmail(email: string, db?: DbClient) {
    return this.getClient(db).appUser.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  async findUserById(id: string, db?: DbClient) {
    return this.getClient(db).appUser.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async createUser(
    data: {
      email: string;
      passwordHash: string;
      displayName: string;
      phone?: string;
    },
    db?: DbClient,
  ) {
    return this.getClient(db).appUser.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        displayName: data.displayName,
        phone: data.phone,
      },
    });
  }

  async updateUser(id: string, data: Prisma.AppUserUpdateInput, db?: DbClient) {
    return this.getClient(db).appUser.update({
      where: { id },
      data,
    });
  }

  async assignRole(userId: string, roleId: string, assignedByUserId?: string, db?: DbClient) {
    return this.getClient(db).userRole.create({
      data: {
        userId,
        roleId,
        assignedByUserId,
      },
    });
  }

  async findActiveSessionById(id: string, db?: DbClient) {
    return this.getClient(db).userSession.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findActiveSessionsByUserId(userId: string, db?: DbClient) {
    return this.getClient(db).userSession.findMany({
      where: {
        userId,
        deletedAt: null,
        revokedAt: null,
      },
    });
  }

  async createSession(
    data: {
      id: string;
      userId: string;
      refreshTokenHash: string;
      deviceInfo?: string;
      ipAddress?: string;
      userAgent?: string;
      expiresAt: Date;
    },
    db?: DbClient,
  ) {
    return this.getClient(db).userSession.create({
      data,
    });
  }

  async rotateSession(id: string, refreshTokenHash: string, expiresAt: Date, db?: DbClient) {
    return this.getClient(db).userSession.update({
      where: { id },
      data: {
        refreshTokenHash,
        expiresAt,
        revokedAt: null,
      },
    });
  }

  async revokeSession(id: string, db?: DbClient) {
    return this.getClient(db).userSession.update({
      where: { id },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async revokeAllSessions(userId: string, db?: DbClient) {
    return this.getClient(db).userSession.updateMany({
      where: {
        userId,
        deletedAt: null,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date, db?: DbClient) {
    return this.getClient(db).passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findPasswordResetTokenByHash(tokenHash: string, db?: DbClient) {
    return this.getClient(db).passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        deletedAt: null,
      },
    });
  }

  async markPasswordResetTokenUsed(id: string, db?: DbClient) {
    return this.getClient(db).passwordResetToken.update({
      where: { id },
      data: {
        usedAt: new Date(),
      },
    });
  }

  async createEmailVerificationToken(userId: string, tokenHash: string, expiresAt: Date, db?: DbClient) {
    return this.getClient(db).emailVerificationToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findEmailVerificationTokenByHash(tokenHash: string, db?: DbClient) {
    return this.getClient(db).emailVerificationToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        deletedAt: null,
      },
    });
  }

  async markEmailVerificationTokenUsed(id: string, db?: DbClient) {
    return this.getClient(db).emailVerificationToken.update({
      where: { id },
      data: {
        usedAt: new Date(),
      },
    });
  }

  async createAuditLog(input: AuditLogInput, db?: DbClient) {
    return this.getClient(db).auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: input.action,
        entityTable: 'app_users',
        entityId: input.entityId,
        requestId: input.requestId,
        beforeData: input.beforeData,
        afterData: input.afterData,
        metadata: input.metadata ?? {},
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }
}
