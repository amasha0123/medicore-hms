
import { apiClient, IS_MOCK_MODE } from './apiClient';

export interface AuditLogParams {
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  module: string;
  recordIdentifier: string;
  details?: string;
  status?: 'SUCCESS' | 'WARNING' | 'FAILED';
}

// In-memory log for mock mode
const mockLogs: AuditLogParams[] = [];

export const auditService = {
  /**
   * Log an audit event.
   * - In MOCK MODE: stores in-memory only (no network call).
   * - In REAL API MODE: fires a best-effort POST to the backend.
   *   Never throws — audit logging should never break the UI.
   */
  log(params: AuditLogParams): void {
    if (IS_MOCK_MODE) {
      mockLogs.unshift(params);
      return;
    }
    // Fire-and-forget: don't await, don't block the caller
    apiClient
      .post('/api/v1/audit-logs', {
        userId: params.userId,
        userName: params.userName,
        userRole: params.userRole,
        action: params.action,
        module: params.module,
        recordIdentifier: params.recordIdentifier,
        description: params.details,
        status: params.status ?? 'SUCCESS'
      })
      .catch(() => {
        // Silently ignore — audit log failure must never crash the app
      });
  },

  /**
   * Fetch all audit logs from the backend (paginated).
   */
  async getAll(params?: Record<string, string>): Promise<any[]> {
    if (IS_MOCK_MODE) {
      return mockLogs as any[];
    }
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await apiClient.get<any>(`/api/v1/audit-logs${query}`);
    return Array.isArray(res) ? res : (res?.logs ?? res ?? []);
  }
};
