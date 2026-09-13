import { Request, Response, NextFunction } from 'express';
import { AdmissionService } from '../services/admissionService';
import { ApiResponse } from '../utils/apiResponse';

export class AdmissionController {
  public static async getWards(_req: Request, res: Response, next: NextFunction) {
    try {
      const wards = await AdmissionService.getWards();
      return ApiResponse.success(res, 'Wards overview retrieved', wards);
    } catch (err) {
      next(err);
    }
  }

  public static async getBeds(req: Request, res: Response, next: NextFunction) {
    try {
      const beds = await AdmissionService.getBeds(req.query as any);
      return ApiResponse.success(res, 'Beds status retrieved', beds);
    } catch (err) {
      next(err);
    }
  }

  public static async updateBedStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const bed = await AdmissionService.updateBedStatus(req.params.id as string, req.body.status, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Bed status updated', bed);
    } catch (err) {
      next(err);
    }
  }

  public static async getAdmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const admissions = await AdmissionService.getAdmissions(req.query as any);
      return ApiResponse.success(res, 'Admissions retrieved successfully', admissions);
    } catch (err) {
      next(err);
    }
  }

  public static async createAdmission(req: Request, res: Response, next: NextFunction) {
    try {
      const admission = await AdmissionService.createAdmission(req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Patient admitted successfully', admission, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async discharge(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdmissionService.discharge(req.params.id as string, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Patient discharged successfully', result);
    } catch (err) {
      next(err);
    }
  }
}
