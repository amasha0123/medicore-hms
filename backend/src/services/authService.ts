import { prisma } from '../config/prisma';
import { comparePassword, hashPassword, validatePasswordStrength } from '../utils/password';
import { generateAccessToken, generateRefreshToken, hashRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { AuditService } from './auditService';
import { AuthUser } from '../types/express';
import { ROLE_DEFAULT_PERMISSIONS, UserRoleCode } from '../constants/roles';
import crypto from 'crypto';

export class AuthService {
  public static async register(
    data: {
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      phone?: string;
      password: string;
    },
    ipAddress?: string,
    userAgent?: string
  ) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email.trim() }
    });
    if (existingEmail) {
      throw ApiError.conflict('An account with this email already exists.');
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username.trim() }
    });
    if (existingUsername) {
      throw ApiError.conflict('This username is already in use.');
    }

    const pwdCheck = validatePasswordStrength(data.password);
    if (!pwdCheck.isValid) {
      throw ApiError.badRequest(pwdCheck.message || 'Password does not meet complexity requirements');
    }

    const passwordHash = await hashPassword(data.password);
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        name: fullName,
        email: data.email.trim().toLowerCase(),
        username: data.username.trim(),
        phone: data.phone?.trim() || null,
        passwordHash,
        accountStatus: 'PENDING',
        isActive: false
      }
    });

    await AuditService.log({
      userId: user.id,
      userName: user.name,
      action: 'REGISTER',
      module: 'AUTH',
      recordIdentifier: user.email,
      description: `Public registration submitted for ${user.name} (${user.email}). Account status set to PENDING.`,
      ipAddress,
      userAgent,
      status: 'SUCCESS'
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        phone: user.phone || undefined,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt.toISOString()
      }
    };
  }

  public static async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email },
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
      await AuditService.log({
        action: 'LOGIN',
        module: 'AUTH',
        recordIdentifier: email,
        description: `Failed login attempt for email ${email} - User not found`,
        ipAddress,
        userAgent,
        status: 'FAILED'
      });
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.accountStatus === 'PENDING') {
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role?.code,
        action: 'LOGIN',
        module: 'AUTH',
        recordIdentifier: user.email,
        description: `Failed login attempt for pending account ${email}`,
        ipAddress,
        userAgent,
        status: 'FAILED'
      });
      throw ApiError.unauthorized('Your account is waiting for administrator approval. You will be able to log in after your account has been approved.');
    }

    if (user.accountStatus === 'REJECTED') {
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role?.code,
        action: 'LOGIN',
        module: 'AUTH',
        recordIdentifier: user.email,
        description: `Failed login attempt for rejected account ${email}`,
        ipAddress,
        userAgent,
        status: 'FAILED'
      });
      throw ApiError.unauthorized('Your account request has been rejected. Please contact an administrator.');
    }

    if (!user.role) {
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        action: 'LOGIN',
        module: 'AUTH',
        recordIdentifier: user.email,
        description: `Failed login attempt for account without role ${email}`,
        ipAddress,
        userAgent,
        status: 'FAILED'
      });
      throw ApiError.unauthorized('No role has been assigned to your account yet. Please contact an administrator.');
    }

    if (!user.isActive) {
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role.code,
        action: 'LOGIN',
        module: 'AUTH',
        recordIdentifier: user.email,
        description: `Failed login attempt for inactive account ${email}`,
        ipAddress,
        userAgent,
        status: 'FAILED'
      });
      throw ApiError.unauthorized('Your account has been deactivated. Please contact your administrator.');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role.code,
        action: 'LOGIN',
        module: 'AUTH',
        recordIdentifier: user.email,
        description: `Failed login attempt for ${email} - Invalid password`,
        ipAddress,
        userAgent,
        status: 'FAILED'
      });
      throw ApiError.unauthorized('Invalid email or password');
    }

    const dbPermissions = user.role!.permissions.map((rp: any) => rp.permission.name);
    const permissions = dbPermissions.length > 0 
      ? dbPermissions 
      : (ROLE_DEFAULT_PERMISSIONS[user.role!.code as UserRoleCode] || []);

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role!.code as any,
      roleId: user.roleId,
      departmentId: user.departmentId,
      permissions
    };

    const accessToken = generateAccessToken(authUser);
    const { refreshToken, tokenHash, expiresAt } = generateRefreshToken(user.id);

    // Save refresh token in DB
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    // Update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Audit log
    await AuditService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role.code,
      action: 'LOGIN',
      module: 'AUTH',
      recordIdentifier: user.email,
      description: `User ${user.name} logged in successfully`,
      ipAddress,
      userAgent,
      status: 'SUCCESS'
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role.code,
        department: user.departmentId || 'General',
        avatar: user.profileImage || undefined,
        status: user.isActive ? 'Active' : 'Inactive',
        accountStatus: user.accountStatus,
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : new Date().toISOString()
      },
      permissions
    };
  }

  public static async refreshToken(token: string) {
    let payload: { userId: string };
    try {
      payload = verifyRefreshToken(token);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const tokenHash = hashRefreshToken(token);

    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        userId: payload.userId,
        tokenHash,
        isRevoked: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!storedToken) {
      throw ApiError.unauthorized('Refresh token is invalid or revoked');
    }

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

    if (!user || !user.isActive || user.deletedAt || !user.role) {
      throw ApiError.unauthorized('User is no longer active or does not have an assigned role');
    }

    const dbPermissions = user.role.permissions.map((rp) => rp.permission.name);
    const permissions = dbPermissions.length > 0 
      ? dbPermissions 
      : (ROLE_DEFAULT_PERMISSIONS[user.role.code as UserRoleCode] || []);
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role.code as any,
      roleId: user.roleId,
      departmentId: user.departmentId,
      permissions
    };

    const newAccessToken = generateAccessToken(authUser);

    return {
      accessToken: newAccessToken,
      token: newAccessToken,
      refreshToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role.code,
        department: user.departmentId || 'General',
        avatar: user.profileImage || undefined,
        status: user.isActive ? 'Active' : 'Inactive',
        accountStatus: user.accountStatus,
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : new Date().toISOString()
      },
      permissions
    };
  }

  public static async logout(userId: string, refreshToken?: string, ipAddress?: string, userAgent?: string) {
    if (refreshToken) {
      const tokenHash = hashRefreshToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { userId, tokenHash },
        data: { isRevoked: true }
      });
    }

    await AuditService.log({
      userId,
      action: 'LOGOUT',
      module: 'AUTH',
      recordIdentifier: userId,
      description: 'User logged out',
      ipAddress,
      userAgent
    });

    return { message: 'Logged out successfully' };
  }

  public static async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        },
        department: true
      }
    });

    if (!user || user.deletedAt) {
      throw ApiError.notFound('User not found');
    }

    const dbPermissions = user.role?.permissions.map((rp) => rp.permission.name) ?? [];
    const permissions = dbPermissions.length > 0
      ? dbPermissions
      : (user.role?.code ? (ROLE_DEFAULT_PERMISSIONS[user.role.code as UserRoleCode] || []) : []);

    return {
      user: {
        id: user.id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        phone: user.phone,
        role: user.role?.code || 'UNASSIGNED',
        department: user.department?.name || 'General',
        avatar: user.profileImage,
        status: user.isActive ? 'Active' : 'Inactive',
        accountStatus: user.accountStatus,
        lastLogin: user.lastLogin
      },
      permissions
    };
  }
}
