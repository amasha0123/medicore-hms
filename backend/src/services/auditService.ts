import { prisma } from '../config/prisma';

export interface AuditParams {
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  module: string;
  recordIdentifier: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  status?: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export class AuditService {
  public static async log(params: AuditParams): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: params.userId,
          userName: params.userName || 'System',
          userRole: params.userRole || 'SYSTEM',
          action: params.action,
          module: params.module,
          recordIdentifier: params.recordIdentifier,
          description: params.description,
          ipAddress: params.ipAddress || '127.0.0.1',
          userAgent: params.userAgent || 'Internal Service',
          status: params.status || 'SUCCESS'
        }
      });
    } catch (err) {
      console.error('Failed to create audit log:', err);
    }
  }

  public static async getAuditLogs(query: {
    page?: number;
    limit?: number;
    search?: string;
    module?: string;
    action?: string;
    userRole?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.module) where.module = query.module;
    if (query.action) where.action = query.action;
    if (query.userRole) where.userRole = query.userRole;
    if (query.status) where.status = query.status;

    if (query.search) {
      where.OR = [
        { userName: { contains: query.search } },
        { recordIdentifier: { contains: query.search } },
        { description: { contains: query.search } }
      ];
    }

    if (query.startDate || query.endDate) {
      where.timestamp = {};
      if (query.startDate) where.timestamp.gte = new Date(query.startDate);
      if (query.endDate) where.timestamp.lte = new Date(query.endDate);
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit
      })
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
