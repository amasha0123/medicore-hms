import { Request, Response, NextFunction } from 'express';
import { DoctorService } from '../services/doctorService';
import { ApiResponse } from '../utils/apiResponse';

export class DoctorController {
  public static async getDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const doctors = await DoctorService.getDoctors(req.query as any);
      return ApiResponse.success(res, 'Doctors retrieved successfully', doctors);
    } catch (err) {
      next(err);
    }
  }

  public static async getDoctorById(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorService.getDoctorById(req.params.id as string);
      return ApiResponse.success(res, 'Doctor details retrieved', doctor);
    } catch (err) {
      next(err);
    }
  }

  public static async createDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorService.createDoctor(req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Doctor created successfully', doctor, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async updateDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorService.updateDoctor(req.params.id as string, req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Doctor updated successfully', doctor);
    } catch (err) {
      next(err);
    }
  }

  public static async updateSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorService.updateSchedule(req.params.id as string, req.body.schedules, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Doctor schedule updated', doctor);
    } catch (err) {
      next(err);
    }
  }

  public static async softDeleteDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DoctorService.softDeleteDoctor(req.params.id as string, req.user?.id, req.user?.name);
      return ApiResponse.success(res, result.message, null);
    } catch (err) {
      next(err);
    }
  }
}
