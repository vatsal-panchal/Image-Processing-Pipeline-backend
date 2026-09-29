import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import mongoose from 'mongoose';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred';

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds the maximum limit of 5MB';
    } else {
      message = err.message;
    }
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = err.message;
  } else if (err.message && err.message.includes('Input buffer contains unsupported image format')) {
    statusCode = 400;
    message = 'Corrupt or invalid image file';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null
  });
};
