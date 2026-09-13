import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { prisma } from '../config/prisma';
import { UserRoleCode, ROLE_DEFAULT_PERMISSIONS } from '../constants/roles';

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    if (!user || user.deletedAt) {
      throw ApiError.unauthorized('User account not found');
    }

    if (!user.isActive || (user.accountStatus !== 'ACTIVE' && user.accountStatus !== 'APPROVED')) {
      throw ApiError.unauthorized('User account is not active or pending approval');
    }

    if (!user.role || !user.roleId) {
      throw ApiError.unauthorized('User account does not have an assigned role');
    }

    const dbPermissions = user.role!.permissions.map((rp: any) => rp.permission.name);
    const permissions = dbPermissions.length > 0
      ? dbPermissions
      : (ROLE_DEFAULT_PERMISSIONS[user.role!.code as UserRoleCode] || []);

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role!.code as UserRoleCode,
      roleId: user.roleId,
      departmentId: user.departmentId,
      permissions
    };

    req.token = token;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(ApiError.unauthorized('Access token has expired'));
    } else if (error.name === 'JsonWebTokenError') {
      next(ApiError.unauthorized('Invalid access token'));
    } else {
      next(error);
    }
  }
}
