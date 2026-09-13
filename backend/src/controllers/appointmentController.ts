import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointmentService';
import { ApiResponse } from '../utils/apiResponse';

export class AppointmentController {
  public static async getAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AppointmentService.getAppointments(req.query as any);
      return ApiResponse.success(res, 'Appointments retrieved successfully', result.appointments, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  public static async getCalendarEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await AppointmentService.getCalendarEvents(req.query as any);
      return ApiResponse.success(res, 'Calendar events retrieved', events);
    } catch (err) {
      next(err);
    }
  }

  public static async createAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await AppointmentService.createAppointment(req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Appointment booked successfully', appointment, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await AppointmentService.updateStatus(req.params.id as string, req.body.status, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Appointment status updated', appointment);
    } catch (err) {
      next(err);
    }
  }

  public static async reschedule(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await AppointmentService.reschedule(req.params.id as string, req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Appointment rescheduled successfully', appointment);
    } catch (err) {
      next(err);
    }
  }

  public static async cancelAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await AppointmentService.updateStatus(req.params.id as string, 'CANCELLED', req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Appointment cancelled', appointment);
    } catch (err) {
      next(err);
    }
  }
}
