import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { ApiResponse } from '../utils/apiResponse';

export class UserController {
  public static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getUsers(req.query as any);
      return ApiResponse.success(res, 'Users retrieved successfully', users);
    } catch (err) {
      next(err);
    }
  }

  public static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getUserById(req.params.id as string);
      return ApiResponse.success(res, 'User details retrieved', user);
    } catch (err) {
      next(err);
    }
  }

  public static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createUser(req.body, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'User account created successfully', user, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.toggleUserStatus(req.params.id as string, req.body.isActive, req.user?.id, req.user?.name);
      return ApiResponse.success(res, 'User status updated', user);
    } catch (err) {
      next(err);
    }
  }

  public static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.resetPassword(req.params.id as string, req.body.newPassword, req.user?.id, req.user?.name);
      return ApiResponse.success(res, result.message, null);
    } catch (err) {
      next(err);
    }
  }

  public static async approveUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.approveUser(
        req.params.id as string,
        req.body,
        req.user?.id,
        req.user?.name
      );
      return ApiResponse.success(res, 'User account approved and activated successfully', user);
    } catch (err) {
      next(err);
    }
  }

  public static async rejectUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.rejectUser(
        req.params.id as string,
        req.user?.id,
        req.user?.name
      );
      return ApiResponse.success(res, 'User registration rejected', user);
    } catch (err) {
      next(err);
    }
  }
}
