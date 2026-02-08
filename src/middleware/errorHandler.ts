import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppError, AppErrorCode } from '@/utils/AppError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  // Appliation Error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
      },
    });
  }

  // Zod Error
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Validation Error',
        code: AppErrorCode.ValidationFailed,
        details: err.issues,
      },
    });
  }

  // Handle generic errors
  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({
      error: {
        message: 'Internal Server Error',
        code: AppErrorCode.InternalServerError,
        content: err,
      },
    });
  } else {
    return res.status(500).json({
      error: {
        message: 'Internal Server Error',
        code: AppErrorCode.InternalServerError,
      },
    });
  }
};
