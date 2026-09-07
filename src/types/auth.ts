
export type UserRole = 
  | 'ADMIN' 
  | 'DOCTOR' 
  | 'NURSE' 
  | 'RECEPTIONIST' 
  | 'LAB_STAFF' 
  | 'PHARMACIST' 
  | 'ACCOUNTANT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
  createdAt: string;
}

export interface DemoAccount {
  roleName: string;
  role: UserRole;
  email: string;
  badge: string;
  name: string;
  department: string;
  description: string;
}

export type Permission = 
  | 'patients:view' | 'patients:create' | 'patients:edit' | 'patients:delete'
  | 'doctors:view' | 'doctors:create' | 'doctors:edit'
  | 'appointments:view' | 'appointments:book' | 'appointments:cancel' | 'appointments:manage'
  | 'emr:view' | 'emr:create' | 'emr:edit'
  | 'lab:view' | 'lab:request' | 'lab:enter_result'
  | 'pharmacy:view' | 'pharmacy:manage_stock' | 'pharmacy:dispense'
  | 'billing:view' | 'billing:create_invoice' | 'billing:record_payment'
  | 'admissions:view' | 'admissions:manage'
  | 'outpatients:view' | 'outpatients:manage'
  | 'staff:view' | 'staff:manage'
  | 'reports:view'
  | 'users:manage'
  | 'audit:view'
  | 'settings:manage';
