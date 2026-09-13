import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { hashPassword, validatePasswordStrength } from '../utils/password';
import { AuditService } from './auditService';

export class UserService {
  public static async getUsers(query: { role?: string; status?: string; accountStatus?: string; search?: string }) {
    const where: any = { deletedAt: null };
    if (query.status) where.isActive = query.status === 'Active';
    if (query.accountStatus) where.accountStatus = query.accountStatus;

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
        { username: { contains: query.search } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: { role: true, department: true },
      orderBy: { createdAt: 'desc' }
    });

    if (query.role) {
      return users.filter((u: any) => u.role?.code === query.role).map((u) => this.formatUser(u));
    }

    return users.map((u: any) => this.formatUser(u));
  }

  public static async getUserById(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { role: true, department: true }
    });

    if (!user) throw ApiError.notFound('User not found');
    return this.formatUser(user);
  }

  public static async createUser(input: any, currentUserId?: string, currentUserName?: string) {
    const existingEmail = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingEmail) throw ApiError.conflict('Email address is already registered');

    const existingUsername = await prisma.user.findUnique({ where: { username: input.username } });
    if (existingUsername) throw ApiError.conflict('Username is already taken');

    const pwdCheck = validatePasswordStrength(input.password);
    if (!pwdCheck.isValid) {
      throw ApiError.badRequest(pwdCheck.message || 'Password does not meet complexity requirements');
    }

    const roleObj = await prisma.role.findFirst({ where: { code: input.role } });
    if (!roleObj) throw ApiError.notFound(`Role '${input.role}' not found`);

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        name: `${input.firstName} ${input.lastName}`,
        email: input.email,
        username: input.username,
        passwordHash,
        phone: input.phone,
        roleId: roleObj.id,
        departmentId: input.departmentId,
        isActive: true
      },
      include: { role: true, department: true }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'CREATE',
      module: 'AUTH',
      recordIdentifier: user.email,
      description: `Created user account for ${user.name} (${user.role?.code || 'UNASSIGNED'})`
    });

    return this.formatUser(user);
  }

  public static async toggleUserStatus(id: string, isActive: boolean, currentUserId?: string, currentUserName?: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw ApiError.notFound('User not found');

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      include: { role: true, department: true }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'UPDATE',
      module: 'AUTH',
      recordIdentifier: user.email,
      description: `Set account status of ${user.name} to ${isActive ? 'Active' : 'Inactive'}`
    });

    return this.formatUser(updated);
  }

  public static async resetPassword(id: string, newPassword: string, currentUserId?: string, currentUserName?: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw ApiError.notFound('User not found');

    const pwdCheck = validatePasswordStrength(newPassword);
    if (!pwdCheck.isValid) {
      throw ApiError.badRequest(pwdCheck.message || 'Password does not meet complexity requirements');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id },
      data: { passwordHash }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'UPDATE',
      module: 'AUTH',
      recordIdentifier: user.email,
      description: `Reset password for user ${user.name}`
    });

    return { message: 'Password reset successfully' };
  }

  public static async approveUser(
    id: string,
    data: { role: string; departmentId?: string },
    currentUserId?: string,
    currentUserName?: string
  ) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.deletedAt) throw ApiError.notFound('User not found');

    const roleObj = await prisma.role.findFirst({ where: { code: data.role } });
    if (!roleObj) throw ApiError.notFound(`Role '${data.role}' not found`);

    if (data.departmentId) {
      const dept = await prisma.department.findUnique({ where: { id: data.departmentId } });
      if (!dept) throw ApiError.notFound(`Department '${data.departmentId}' not found`);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        roleId: roleObj.id,
        departmentId: data.departmentId !== undefined ? data.departmentId : user.departmentId,
        accountStatus: 'ACTIVE',
        isActive: true
      },
      include: { role: true, department: true }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'APPROVE',
      module: 'AUTH',
      recordIdentifier: user.email,
      description: `Approved user ${user.name} (${user.email}) and assigned role ${roleObj.code}`
    });

    return this.formatUser(updated);
  }

  public static async rejectUser(
    id: string,
    currentUserId?: string,
    currentUserName?: string
  ) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.deletedAt) throw ApiError.notFound('User not found');

    const updated = await prisma.user.update({
      where: { id },
      data: {
        accountStatus: 'REJECTED',
        isActive: false
      },
      include: { role: true, department: true }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'REJECT',
      module: 'AUTH',
      recordIdentifier: user.email,
      description: `Rejected user registration for ${user.name} (${user.email})`
    });

    return this.formatUser(updated);
  }

  private static formatUser(user: any) {
    return {
      id: user.id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      phone: user.phone || undefined,
      role: user.role?.code || 'UNASSIGNED',
      department: user.department?.name || 'General',
      avatar: user.profileImage || undefined,
      status: user.isActive ? 'Active' : 'Inactive',
      accountStatus: user.accountStatus,
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : undefined,
      createdAt: user.createdAt.toISOString()
    };
  }
}
