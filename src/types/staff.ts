
import { UserRole } from './auth';

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface StaffMember {
  id: string;
  employeeId: string; // e.g. "EMP-041"
  name: string;
  role: UserRole;
  department: string;
  email: string;
  phone: string;
  joinDate: string;
  qualification: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  shift: 'Morning' | 'Evening' | 'Night' | 'Rotating';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  role: UserRole;
  department: string;
  leaveType: 'Annual Leave' | 'Sick Leave' | 'Maternity/Paternity' | 'Casual Leave' | 'Emergency';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  appliedDate: string;
  status: LeaveStatus;
  approvedBy?: string;
}
