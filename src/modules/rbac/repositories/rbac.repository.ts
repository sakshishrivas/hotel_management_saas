import type { Prisma, PrismaClient } from '@prisma/client';

import { BaseRepository } from '../../../repositories/base.repository';

type DbClient = Prisma.TransactionClient | PrismaClient;

export class RbacRepository extends BaseRepository {
  private getClient(db?: DbClient) {
    return db ?? this.db;
  }

  async getUserRolesAndPermissions(userId: string, db?: DbClient) {
    return this.getClient(db).appUser.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        userRoles: {
          where: {
            deletedAt: null,
            role: {
              deletedAt: null,
            },
          },
          select: {
            role: {
              select: {
                id: true,
                code: true,
                name: true,
                rolePermissions: {
                  where: {
                    deletedAt: null,
                    permission: {
                      deletedAt: null,
                    },
                  },
                  select: {
                    permission: {
                      select: {
                        code: true,
                        moduleName: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findRoleByCode(code: string, db?: DbClient) {
    return this.getClient(db).role.findFirst({
      where: {
        code,
        deletedAt: null,
      },
    });
  }

  async createRole(
    data: {
      code: string;
      name: string;
      description: string;
      isSystem?: boolean;
    },
    db?: DbClient,
  ) {
    return this.getClient(db).role.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        isSystem: data.isSystem ?? true,
      },
    });
  }
}
