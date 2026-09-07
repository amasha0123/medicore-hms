
import { UserRole } from './auth';

export type AuditAction = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'DISPENSE' 
  | 'ADMIT' 
  | 'DISCHARGE' 
  | 'GENERATE_INVOICE' 
  | 'PROCESS_PAYMENT';

export type AuditModule = 
  | 'AUTH' 
  | 'PATIENT' 
  | 'DOCTOR' 
  | 'APPOINTMENT' 
  | 'EMR' 
  | 'LABORATORY' 
  | 'PHARMACY' 
  | 'BILLING' 
  | 'ADMISSIONS' 
  | 'STAFF' 
  | 'SETTINGS';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditAction;
  module: AuditModule;
  recordIdentifier: string;
  details: string;
  ipAddress: string;
  device: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}
