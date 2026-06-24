import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../../../utils/app-error';
import { HTTP_STATUS } from '../../../constants/http-status';
import { rbacService } from '../services/rbac.service';

interface AuthorizeOptions {
  roles?: string[];
  permissions?: string[];
}

export function authorize(options: AuthorizeOptions = {}) {
  const requiredRoles = options.roles ?? [];
  const requiredPermissions = options.permissions ?? [];

  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user?.sub) {
        return next(new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED, 'AUTH_REQUIRED'));
      }

      if ((!req.user.roles || !req.user.permissions) && req.user.sub) {
        const bundle = await rbacService.getAuthorizationBundle(req.user.sub);
        req.user.roles = bundle.roles;
        req.user.permissions = bundle.permissions;
      }

      const userRoles = req.user.roles ?? [];
      const userPermissions = req.user.permissions ?? [];

      const hasRole = requiredRoles.length === 0 || requiredRoles.some((role) => userRoles.includes(role));
      const hasPermission =
        requiredPermissions.length === 0 ||
        requiredPermissions.some((permission) => userPermissions.includes(permission));

      if (!hasRole || !hasPermission) {
        return next(new AppError('Forbidden', HTTP_STATUS.FORBIDDEN, 'RBAC_FORBIDDEN'));
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
