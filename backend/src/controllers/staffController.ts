import { Request, Response, NextFunction } from 'express';
import { StaffService } from '../services/staffService';
import { ApiResponse } from '../utils/apiResponse';

export class StaffController {
  public static async getEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const employees = await StaffService.getEmployees(req.query as any);
      return ApiResponse.success(res, 'Staff directory retrieved', employees);
    } catch (err) {
      next(err);
    }
  }

  public static async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const emp = await StaffService.createEmployee(req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Employee registered successfully', emp, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId, notes } = req.body;
      const attendance = await StaffService.checkIn(employeeId, notes, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Check-in recorded successfully', attendance, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId, notes } = req.body;
      const attendance = await StaffService.checkOut(employeeId, notes, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Check-out recorded successfully', attendance);
    } catch (err) {
      next(err);
    }
  }

  public static async getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await StaffService.getAttendance(req.query as any);
      return ApiResponse.success(res, 'Attendance records retrieved', records);
    } catch (err) {
      next(err);
    }
  }

  public static async getLeaveRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const leaves = await StaffService.getLeaveRequests(req.query as any);
      return ApiResponse.success(res, 'Leave requests retrieved', leaves);
    } catch (err) {
      next(err);
    }
  }

  public static async createLeaveRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const leave = await StaffService.createLeaveRequest(req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Leave request submitted', leave, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async approveLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const leave = await StaffService.approveLeave(req.params.id as string, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Leave request approved', leave);
    } catch (err) {
      next(err);
    }
  }
}
