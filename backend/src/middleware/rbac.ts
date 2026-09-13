import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { UserRoleCode } from '../constants/roles';

export function authorize(...allowedRoles: UserRoleCode[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Role '${req.user.role}' is not authorized to perform this action`));
    }

    next();
  };
}

export function requirePermission(...requiredPermissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    // ADMIN role bypasses permission check
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const hasPermission = requiredPermissions.every((perm) => req.user?.permissions.includes(perm));

    if (!hasPermission) {
      return next(ApiError.forbidden(`Required permission '${requiredPermissions.join(', ')}' missing`));
    }

    next();
  };
}
