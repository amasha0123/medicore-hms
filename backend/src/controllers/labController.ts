import { Request, Response, NextFunction } from 'express';
import { LabService } from '../services/labService';
import { ApiResponse } from '../utils/apiResponse';

export class LabController {
  public static async getLabRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const requests = await LabService.getLabRequests(req.query as any);
      return ApiResponse.success(res, 'Laboratory requests retrieved', requests);
    } catch (err) {
      next(err);
    }
  }

  public static async createLabRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await LabService.createLabRequest(req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Laboratory request created successfully', request, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await LabService.updateStatus(req.params.id as string, req.body.status, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Laboratory test status updated', updated);
    } catch (err) {
      next(err);
    }
  }

  public static async enterResults(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await LabService.enterResults(req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Laboratory results entered successfully', result, 201);
    } catch (err) {
      next(err);
    }
  }
}
