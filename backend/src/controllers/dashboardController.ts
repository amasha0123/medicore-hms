import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService';
import { ApiResponse } from '../utils/apiResponse';

export class DashboardController {
  public static async getAdminDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getAdminDashboard();
      return ApiResponse.success(res, 'Admin dashboard stats retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  public static async getDoctorDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getDoctorDashboard(req.user?.id);
      return ApiResponse.success(res, 'Doctor dashboard stats retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  public static async getNurseDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getNurseDashboard();
      return ApiResponse.success(res, 'Nurse dashboard stats retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  public static async getReceptionistDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getReceptionistDashboard();
      return ApiResponse.success(res, 'Receptionist dashboard stats retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  public static async getLabDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getLabDashboard();
      return ApiResponse.success(res, 'Laboratory dashboard stats retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  public static async getPharmacyDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getPharmacyDashboard();
      return ApiResponse.success(res, 'Pharmacy dashboard stats retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  public static async getAccountantDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getAccountantDashboard();
      return ApiResponse.success(res, 'Accountant dashboard stats retrieved', data);
    } catch (err) {
      next(err);
    }
  }
}
