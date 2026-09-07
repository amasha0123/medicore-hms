import { UserRole, Permission } from '../types/auth';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'patients:view', 'patients:create', 'patients:edit', 'patients:delete',
    'doctors:view', 'doctors:create', 'doctors:edit',
    'appointments:view', 'appointments:book', 'appointments:cancel', 'appointments:manage',
    'emr:view', 'emr:create', 'emr:edit',
    'lab:view', 'lab:request', 'lab:enter_result',
    'pharmacy:view', 'pharmacy:manage_stock', 'pharmacy:dispense',
    'billing:view', 'billing:create_invoice', 'billing:record_payment',
    'admissions:view', 'admissions:manage',
    'outpatients:view', 'outpatients:manage',
    'staff:view', 'staff:manage',
    'reports:view',
    'users:manage',
    'audit:view',
    'settings:manage'
  ],
  DOCTOR: [
    'patients:view',
    'doctors:view',
    'appointments:view', 'appointments:book', 'appointments:cancel', 'appointments:manage',
    'emr:view', 'emr:create', 'emr:edit',
    'lab:view', 'lab:request',
    'pharmacy:view',
    'outpatients:view', 'outpatients:manage',
    'admissions:view'
  ],
  NURSE: [
    'patients:view',
    'appointments:view',
    'emr:view',
    'admissions:view', 'admissions:manage',
    'outpatients:view', 'outpatients:manage'
  ],
  RECEPTIONIST: [
    'patients:view', 'patients:create', 'patients:edit',
    'appointments:view', 'appointments:book', 'appointments:cancel', 'appointments:manage',
    'billing:view',
    'outpatients:view', 'outpatients:manage',
    'doctors:view'
  ],
  LAB_STAFF: [
    'patients:view',
    'lab:view', 'lab:enter_result'
  ],
  PHARMACIST: [
    'patients:view',
    'pharmacy:view', 'pharmacy:manage_stock', 'pharmacy:dispense'
  ],
  ACCOUNTANT: [
    'patients:view',
    'billing:view', 'billing:create_invoice', 'billing:record_payment',
    'reports:view'
  ]
};

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'ADMIN': return 'Administrator';
    case 'DOCTOR': return 'Doctor';
    case 'NURSE': return 'Nurse';
    case 'RECEPTIONIST': return 'Receptionist';
    case 'LAB_STAFF': return 'Laboratory Staff';
    case 'PHARMACIST': return 'Pharmacist';
    case 'ACCOUNTANT': return 'Accountant';
    default: return role;
  }
}
