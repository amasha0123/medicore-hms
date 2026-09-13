import { HTTP_STATUS } from '../constants/httpStatus';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: any[];
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.BAD_REQUEST,
    errors: any[] = [],
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  public static badRequest(message: string, errors: any[] = []): ApiError {
    return new ApiError(message, HTTP_STATUS.BAD_REQUEST, errors);
  }

  public static unauthorized(message: string = 'Unauthorized access'): ApiError {
    return new ApiError(message, HTTP_STATUS.UNAUTHORIZED);
  }

  public static forbidden(message: string = 'Forbidden resource access'): ApiError {
    return new ApiError(message, HTTP_STATUS.FORBIDDEN);
  }

  public static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(message, HTTP_STATUS.NOT_FOUND);
  }

  public static conflict(message: string = 'Resource conflict'): ApiError {
    return new ApiError(message, HTTP_STATUS.CONFLICT);
  }

  public static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, [], false);
  }
}
