
import { StaffMember, AttendanceRecord, LeaveRequest, LeaveStatus } from '../types/staff';
import { INITIAL_STAFF, INITIAL_ATTENDANCE, INITIAL_LEAVE_REQUESTS } from '../data/mockData';
import { getStoredItem, setStoredItem } from './storage';
import { auditService } from './auditService';

const STAFF_KEY = 'medicore_staff';
const ATTENDANCE_KEY = 'medicore_attendance';
const LEAVE_KEY = 'medicore_leave_requests';

export const staffService = {
  getAllStaff(): StaffMember[] {
    return getStoredItem<StaffMember[]>(STAFF_KEY, INITIAL_STAFF);
  },

  getAttendance(): AttendanceRecord[] {
    return getStoredItem<AttendanceRecord[]>(ATTENDANCE_KEY, INITIAL_ATTENDANCE);
  },

  getLeaveRequests(): LeaveRequest[] {
    return getStoredItem<LeaveRequest[]>(LEAVE_KEY, INITIAL_LEAVE_REQUESTS);
  },

  updateLeaveStatus(leaveId: string, status: LeaveStatus, approverName: string): LeaveRequest {
    const requests = this.getLeaveRequests();
    let updated: LeaveRequest | null = null;
    const next = requests.map(r => {
      if (r.id === leaveId) {
        updated = { ...r, status, approvedBy: approverName };
        return updated;
      }
      return r;
    });
    setStoredItem(LEAVE_KEY, next);

    if (updated) {
      auditService.log({
        userId: 'admin-01',
        userName: approverName,
        userRole: 'ADMIN',
        action: 'UPDATE',
        module: 'STAFF',
        recordIdentifier: leaveId,
        details: `Leave request for ${(updated as LeaveRequest).employeeName} was ${status}`
      });
    }

    return updated!;
  }
};
