import { Request, Response, NextFunction } from 'express';
import { DepartmentService } from '../services/departmentService';
import { ApiResponse } from '../utils/apiResponse';

export class DepartmentController {
  public static async getDepartments(_req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await DepartmentService.getDepartments();
      return ApiResponse.success(res, 'Departments retrieved successfully', departments);
    } catch (err) {
      next(err);
    }
  }

  public static async getDepartmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await DepartmentService.getDepartmentById(req.params.id as string);
      return ApiResponse.success(res, 'Department details retrieved', department);
    } catch (err) {
      next(err);
    }
  }

  public static async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await DepartmentService.createDepartment(req.body);
      return ApiResponse.success(res, 'Department created successfully', department, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await DepartmentService.updateDepartment(req.params.id as string, req.body);
      return ApiResponse.success(res, 'Department updated successfully', department);
    } catch (err) {
      next(err);
    }
  }
}
