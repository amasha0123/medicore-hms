import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/auditService';
import { ApiResponse } from '../utils/apiResponse';

export class AuditController {
  public static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuditService.getAuditLogs(req.query as any);
      return ApiResponse.success(res, 'Audit logs retrieved', result.logs, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  public static async createAuditLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, userName, userRole, action, module, recordIdentifier, description, status } = req.body;
      await AuditService.log({
        userId: userId || req.user?.id,
        userName: userName || req.user?.name,
        userRole: userRole || req.user?.role,
        action,
        module,
        recordIdentifier,
        description,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: status || 'SUCCESS'
      });
      return ApiResponse.success(res, 'Audit log created', null, 201);
    } catch (err) {
      next(err);
    }
  }
}
