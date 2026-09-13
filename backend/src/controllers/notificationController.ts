import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService';
import { ApiResponse } from '../utils/apiResponse';

export class NotificationController {
  public static async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await NotificationService.getUserNotifications(req.user?.id);
      return ApiResponse.success(res, 'Notifications retrieved', notifications);
    } catch (err) {
      next(err);
    }
  }

  public static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id as string);
      return ApiResponse.success(res, 'Notification marked as read', notification);
    } catch (err) {
      next(err);
    }
  }

  public static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAllAsRead(req.user?.id);
      return ApiResponse.success(res, 'All notifications marked as read', null);
    } catch (err) {
      next(err);
    }
  }

  public static async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationService.delete(req.params.id as string);
      return ApiResponse.success(res, 'Notification deleted', null);
    } catch (err) {
      next(err);
    }
  }
}
