import { Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponse {
  public static success<T>(
    res: Response,
    message: string,
    data: T,
    statusCode: number = HTTP_STATUS.OK,
    pagination?: PaginationMeta
  ): Response {
    const payload: any = {
      success: true,
      message,
      data
    };

    if (pagination) {
      payload.pagination = pagination;
    }

    return res.status(statusCode).json(payload);
  }

  public static error(
    res: Response,
    message: string,
    errors: any[] = [],
    statusCode: number = HTTP_STATUS.BAD_REQUEST
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors.length > 0 ? errors : undefined
    });
  }
}
