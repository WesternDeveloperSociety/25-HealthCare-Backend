import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';

import { AppError } from '@/utils/AppError';

// Configure storage
const storage = multer.memoryStorage();

// ? Too complex ATM, since we might have to handle weird file formats
// const fileFilter = (
//   req: Request,
//   file: Express.Multer.File,
//   cb: multer.FileFilterCallback
// ) => {
//   const allowedTypes = [
//     'image/jpeg',
//     'image/png',
//     'image/webp',
//     'application/pdf',
//   ];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(
//       AppError.BadRequest(
//         'Invalid file type. Only JPEG, PNG, WEBP, and PDF are allowed.'
//       ) as unknown as Error
//     );
//   }
// };

// Initialize multer
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  // fileFilter
});

// Middleware to handle multer errors
export const handleMulterError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(AppError.BadRequest('File too large. Maximum size is 10MB.'));
    }
    return next(AppError.BadRequest(err.message));
  } else if (err) {
    return next(err);
  }
  next();
};
