import { Request, Response, NextFunction } from 'express';
import { SettingService } from '../services/settingService';
import { ApiResponse } from '../utils/apiResponse';

export class SettingController {
  public static async getSettings(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SettingService.getSettings();
      return ApiResponse.success(res, 'System settings retrieved', settings);
    } catch (err) {
      next(err);
    }
  }

  public static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SettingService.updateSettings(req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'System settings updated successfully', settings);
    } catch (err) {
      next(err);
    }
  }
}
