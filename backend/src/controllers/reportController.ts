import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/reportService';
import { ApiResponse } from '../utils/apiResponse';

export class ReportController {
  public static async getRevenueReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const data = await ReportService.getRevenueReport(startDate as string, endDate as string);
      return ApiResponse.success(res, 'Revenue report generated', data);
    } catch (err) {
      next(err);
    }
  }

  public static async getPatientReport(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getPatientReport();
      return ApiResponse.success(res, 'Patient analytics report generated', data);
    } catch (err) {
      next(err);
    }
  }

  public static async getAppointmentReport(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getAppointmentReport();
      return ApiResponse.success(res, 'Appointment analytics report generated', data);
    } catch (err) {
      next(err);
    }
  }
}
