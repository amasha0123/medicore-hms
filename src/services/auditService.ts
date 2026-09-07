
import { AuditLog, AuditAction, AuditModule } from '../types/audit';
import { UserRole } from '../types/auth';
import { INITIAL_AUDIT_LOGS } from '../data/mockData';
import { getStoredItem, setStoredItem } from './storage';

const AUDIT_KEY = 'medicore_audit_logs';

export const auditService = {
  getAll(): AuditLog[] {
    return getStoredItem<AuditLog[]>(AUDIT_KEY, INITIAL_AUDIT_LOGS);
  },

  log(params: {
    userId: string;
    userName: string;
    userRole: UserRole;
    action: AuditAction;
    module: AuditModule;
    recordIdentifier: string;
    details: string;
    status?: 'SUCCESS' | 'WARNING' | 'FAILED';
  }): void {
    const logs = this.getAll();
    const newLog: AuditLog = {
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      module: params.module,
      recordIdentifier: params.recordIdentifier,
      details: params.details,
      ipAddress: '192.168.1.104',
      device: 'Hospital Workstation WS-01',
      status: params.status || 'SUCCESS'
    };
    setStoredItem(AUDIT_KEY, [newLog, ...logs]);
  }
};
