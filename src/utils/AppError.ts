export enum AppErrorCode {
  NotFound = 'NOT_FOUND',
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  InternalServerError = 'INTERNAL_SERVER_ERROR',
  ValidationFailed = 'VALIDATION_FAILED',
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: AppErrorCode;

  constructor(
    message: string,
    code: AppErrorCode = AppErrorCode.InternalServerError,
    statusCode: number = 500
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static VerificationFailed(message: string = 'Verification failed') {
    return new AppError(message, AppErrorCode.ValidationFailed, 400);
  }

  static ValidationError(message: string = 'Validation failed') {
    return new AppError(message, AppErrorCode.ValidationFailed, 400);
  }

  static NotFound(message: string = 'Resource not found') {
    return new AppError(message, AppErrorCode.NotFound, 404);
  }

  static BadRequest(message: string = 'Bad request') {
    return new AppError(message, AppErrorCode.BadRequest, 400);
  }

  static Unauthorized(message: string = 'Unauthorized') {
    return new AppError(message, AppErrorCode.Unauthorized, 401);
  }

  static Forbidden(message: string = 'Forbidden') {
    return new AppError(message, AppErrorCode.Forbidden, 403);
  }

  static Internal(message: string = 'Internal server error') {
    return new AppError(message, AppErrorCode.InternalServerError, 500);
  }
}
