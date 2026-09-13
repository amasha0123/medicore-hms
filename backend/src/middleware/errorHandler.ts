import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { Prisma } from '@prisma/client';
import multer from 'multer';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  // Operational ApiErrors (4xx client errors like 401 Unauthorized, 400 Bad Request, 404 Not Found)
  if (err instanceof ApiError) {
    if (err.statusCode < 500) {
      logger.warn({
        statusCode: err.statusCode,
        message: err.message,
        path: req.originalUrl || req.url,
        method: req.method
      }, `Client error [${err.statusCode}]: ${err.message}`);
    } else {
      logger.error(err, `Server error [${err.statusCode}]: ${err.message}`);
    }
    return ApiResponse.error(res, err.message, err.errors, err.statusCode);
  }

  // Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || [];
      const field = Array.isArray(target) ? target.join(', ') : 'field';
      return ApiResponse.error(res, `Duplicate entry for ${field}`, [{ field, message: 'A record with this value already exists' }], 409);
    }
    if (err.code === 'P2025') {
      return ApiResponse.error(res, 'Record not found or already deleted', [], 404);
    }
    if (err.code === 'P2003') {
      return ApiResponse.error(res, 'Foreign key constraint failed', [], 400);
    }
  }

  // Multer Errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ApiResponse.error(res, 'File size limit exceeded (Max: 5MB)', [], 400);
    }
    return ApiResponse.error(res, `File upload error: ${err.message}`, [], 400);
  }

  // Generic/Unexpected Errors
  const message = process.env.NODE_ENV === 'production' ? 'An unexpected internal error occurred' : err.message || 'Internal server error';
  return ApiResponse.error(res, message, [], 500);
}
