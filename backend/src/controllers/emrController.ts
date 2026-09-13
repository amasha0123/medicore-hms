import { Request, Response, NextFunction } from 'express';
import { EMRService } from '../services/emrService';
import { ApiResponse } from '../utils/apiResponse';

export class EMRController {
  public static async getMedicalRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await EMRService.getMedicalRecords(req.query as any);
      return ApiResponse.success(res, 'Medical records retrieved', records);
    } catch (err) {
      next(err);
    }
  }

  public static async getMedicalRecordById(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await EMRService.getMedicalRecordById(req.params.id as string);
      return ApiResponse.success(res, 'Medical record details retrieved', record);
    } catch (err) {
      next(err);
    }
  }

  public static async createMedicalRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await EMRService.createMedicalRecord(req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Medical record created successfully', record, 201);
    } catch (err) {
      next(err);
    }
  }
}
