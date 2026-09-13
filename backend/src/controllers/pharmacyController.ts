import { Request, Response, NextFunction } from 'express';
import { PharmacyService } from '../services/pharmacyService';
import { ApiResponse } from '../utils/apiResponse';

export class PharmacyController {
  public static async getMedicines(req: Request, res: Response, next: NextFunction) {
    try {
      const medicines = await PharmacyService.getMedicines(req.query as any);
      return ApiResponse.success(res, 'Medicine inventory retrieved', medicines);
    } catch (err) {
      next(err);
    }
  }

  public static async createMedicine(req: Request, res: Response, next: NextFunction) {
    try {
      const med = await PharmacyService.createMedicine(req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Medicine added to inventory', med, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async stockIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { medicineId, quantity, notes } = req.body;
      const result = await PharmacyService.stockIn(medicineId, quantity, notes, req.user?.id, req.user?.name);
      return ApiResponse.success(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  public static async getPrescriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const prescriptions = await PharmacyService.getPrescriptions(req.query as any);
      return ApiResponse.success(res, 'Prescription orders retrieved', prescriptions);
    } catch (err) {
      next(err);
    }
  }

  public static async dispensePrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PharmacyService.dispensePrescription(req.params.id as string, req.body.items, req.user?.id, req.user?.name);
      return ApiResponse.success(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }
}
