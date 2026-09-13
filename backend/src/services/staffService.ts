import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { AuditService } from './auditService';

export class StaffService {
  private static async generateEmployeeId(): Promise<string> {
    const count = await prisma.employee.count();
    const nextNum = (count + 41).toString().padStart(3, '0');
    return `EMP-${nextNum}`;
  }

  public static async getEmployees(query: { role?: string; departmentId?: string; status?: string; search?: string }) {
    const where: any = { deletedAt: null };
    if (query.role) where.role = query.role;
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.status) where.status = query.status;

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { employeeId: { contains: query.search } },
        { email: { contains: query.search } }
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { department: true }
    });

    return employees.map((emp: any) => ({
      id: emp.id,
      employeeId: emp.employeeId,
      name: emp.name,
      role: emp.role,
      department: emp.department?.name || 'General',
      email: emp.email,
      phone: emp.phone,
      joinDate: emp.joinDate.toISOString().split('T')[0],
      qualification: emp.qualification,
      status: emp.status,
      shift: emp.shift
    }));
  }

  public static async createEmployee(input: any, currentUserId?: string, currentUserName?: string) {
    const employeeId = await this.generateEmployeeId();

    const emp = await prisma.employee.create({
      data: {
        employeeId,
        firstName: input.firstName,
        lastName: input.lastName,
        name: `${input.firstName} ${input.lastName}`,
        role: input.role,
        departmentId: input.departmentId,
        email: input.email,
        phone: input.phone,
        joinDate: new Date(input.joinDate),
        qualification: input.qualification,
        shift: input.shift || 'Morning',
        status: 'Active'
      }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'CREATE',
      module: 'STAFF',
      recordIdentifier: emp.employeeId,
      description: `Registered employee ${emp.name} (${emp.role})`
    });

    return emp;
  }

  public static async checkIn(employeeId: string, notes?: string, currentUserId?: string, currentUserName?: string) {
    const emp = await prisma.employee.findFirst({ where: { id: employeeId, deletedAt: null } });
    if (!emp) throw ApiError.notFound('Employee record not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today
        }
      }
    });

    if (existingAttendance) {
      throw ApiError.badRequest(`Employee ${emp.name} has already checked in for today.`);
    }

    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        date: today,
        checkInTime,
        status: 'Present',
        notes
      }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'UPDATE',
      module: 'STAFF',
      recordIdentifier: emp.employeeId,
      description: `Employee ${emp.name} checked in at ${checkInTime}`
    });

    return attendance;
  }

  public static async checkOut(employeeId: string, notes?: string, currentUserId?: string, currentUserName?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today
        }
      }
    });

    if (!attendance) {
      throw ApiError.badRequest('No check-in record found for today.');
    }

    const checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime,
        notes: notes ? `${attendance.notes || ''} | ${notes}` : attendance.notes
      }
    });

    return updated;
  }

  public static async getAttendance(query: { date?: string }) {
    const targetDate = query.date ? new Date(query.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const records = await prisma.attendance.findMany({
      where: { date: targetDate },
      include: { employee: { include: { department: true } } }
    });

    return records.map((r: any) => ({
      id: r.id,
      employeeId: r.employee.employeeId,
      employeeName: r.employee.name,
      department: r.employee.department?.name || 'General',
      date: r.date.toISOString().split('T')[0],
      checkInTime: r.checkInTime || undefined,
      checkOutTime: r.checkOutTime || undefined,
      status: r.status,
      notes: r.notes || undefined
    }));
  }

  public static async getLeaveRequests(query: { employeeId?: string; status?: string }) {
    const where: any = {};
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.status) where.status = query.status;

    const leaves = await prisma.leaveRequest.findMany({
      where,
      orderBy: { appliedDate: 'desc' },
      include: { employee: { include: { department: true } } }
    });

    return leaves.map((l: any) => ({
      id: l.id,
      employeeId: l.employee.employeeId,
      employeeName: l.employee.name,
      role: l.employee.role,
      department: l.employee.department?.name || 'General',
      leaveType: l.leaveType,
      startDate: l.startDate.toISOString().split('T')[0],
      endDate: l.endDate.toISOString().split('T')[0],
      daysCount: l.daysCount,
      reason: l.reason,
      appliedDate: l.appliedDate.toISOString().split('T')[0],
      status: l.status,
      approvedBy: l.approvedBy || undefined
    }));
  }

  public static async createLeaveRequest(input: any, currentUserId?: string, currentUserName?: string) {
    const emp = await prisma.employee.findFirst({ where: { id: input.employeeId, deletedAt: null } });
    if (!emp) throw ApiError.notFound('Employee not found');

    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    if (end < start) {
      throw ApiError.badRequest('End date cannot be prior to start date');
    }

    const daysCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await prisma.leaveRequest.create({
      data: {
        leaveId: `LV-${Date.now()}`,
        employeeId: input.employeeId,
        leaveType: input.leaveType,
        startDate: start,
        endDate: end,
        daysCount,
        reason: input.reason,
        status: 'Pending'
      }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'CREATE',
      module: 'STAFF',
      recordIdentifier: leave.leaveId,
      description: `Employee ${emp.name} submitted leave request for ${daysCount} days`
    });

    return leave;
  }

  public static async approveLeave(leaveId: string, currentUserId?: string, currentUserName?: string) {
    const leave = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });
    if (!leave) throw ApiError.notFound('Leave request not found');

    const updated = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status: 'Approved',
        approvedBy: currentUserName || 'Admin'
      }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'UPDATE',
      module: 'STAFF',
      recordIdentifier: leave.leaveId,
      description: `Approved leave request ${leave.leaveId}`
    });

    return updated;
  }
}
