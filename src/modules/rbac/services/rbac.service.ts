import type { Prisma, PrismaClient } from '@prisma/client';

import { redisKey, runRedisOperation } from '../../../config/redis';
import { SYSTEM_ROLES } from '../../../constants/roles';
import { RbacRepository } from '../repositories/rbac.repository';

type DbClient = Prisma.TransactionClient | PrismaClient;

export interface AuthorizationBundle {
  roles: string[];
  permissions: string[];
}

export class RbacService {
  constructor(private readonly rbacRepository = new RbacRepository()) {}

  async getAuthorizationBundle(userId: string, options?: { bypassCache?: boolean }) {
    const cacheKey = redisKey('rbac', 'user', userId);

    if (!options?.bypassCache) {
      const cached = await runRedisOperation(
        'authorization cache',
        (client) => client.get(cacheKey),
        null,
      );
      if (cached) {
        return JSON.parse(cached) as AuthorizationBundle;
      }
    }

    const result = await this.rbacRepository.getUserRolesAndPermissions(userId);
    const roles = new Set<string>();
    const permissions = new Set<string>();

    for (const userRole of result?.userRoles ?? []) {
      roles.add(userRole.role.code);
      for (const rolePermission of userRole.role.rolePermissions) {
        permissions.add(rolePermission.permission.code);
      }
    }

    const bundle = {
      roles: Array.from(roles),
      permissions: Array.from(permissions),
    };

    await runRedisOperation(
      'authorization cache',
      (client) => client.set(cacheKey, JSON.stringify(bundle), { EX: 300 }),
      null,
    );

    return bundle;
  }

  async clearAuthorizationCache(userId: string) {
    await runRedisOperation(
      'authorization cache',
      (client) => client.del(redisKey('rbac', 'user', userId)),
      0,
    );
  }

  async ensureCustomerRole(db?: DbClient) {
    const existing = await this.rbacRepository.findRoleByCode(SYSTEM_ROLES.CUSTOMER, db);
    if (existing) {
      return existing;
    }

    return this.rbacRepository.createRole(
      {
        code: SYSTEM_ROLES.CUSTOMER,
        name: 'Customer',
        description: 'Self-service customer role',
        isSystem: true,
      },
      db,
    );
  }
}

export const rbacService = new RbacService();
