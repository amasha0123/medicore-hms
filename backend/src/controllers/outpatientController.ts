import { Request, Response, NextFunction } from 'express';
import { OutpatientService } from '../services/outpatientService';
import { ApiResponse } from '../utils/apiResponse';

export class OutpatientController {
  public static async getQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const queue = await OutpatientService.getQueue(req.query as any);
      return ApiResponse.success(res, 'Outpatient queue retrieved', queue);
    } catch (err) {
      next(err);
    }
  }

  public static async addToQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const queueItem = await OutpatientService.addToQueue(req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Queue ticket generated', queueItem, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await OutpatientService.updateStatus(req.params.id as string, req.body.status, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'Queue status updated', updated);
    } catch (err) {
      next(err);
    }
  }
}
