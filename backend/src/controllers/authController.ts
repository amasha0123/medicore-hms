import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ApiResponse } from '../utils/apiResponse';

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, username, email, phone, password } = req.body;
      const result = await AuthService.register(
        { firstName, lastName, username, email, phone, password },
        req.ip,
        req.headers['user-agent']
      );
      return ApiResponse.success(
        res,
        'Registration submitted successfully. Your account is waiting for administrator approval. You will be able to log in after your account has been approved.',
        result,
        201
      );
    } catch (err) {
      next(err);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password, req.ip, req.headers['user-agent']);
      return ApiResponse.success(res, 'Login successful', result);
    } catch (err) {
      next(err);
    }
  }

  public static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);
      return ApiResponse.success(res, 'Token refreshed successfully', result);
    } catch (err) {
      next(err);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user!.id;
      const result = await AuthService.logout(userId, refreshToken, req.ip, req.headers['user-agent']);
      return ApiResponse.success(res, 'Logged out successfully', result);
    } catch (err) {
      next(err);
    }
  }

  public static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await AuthService.me(userId);
      return ApiResponse.success(res, 'User profile retrieved', result);
    } catch (err) {
      next(err);
    }
  }
}
