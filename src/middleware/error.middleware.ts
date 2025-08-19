import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../types/common.types';
import { logger } from '../utils/logger';

const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError
): ApiError => {
  switch (err.code) {
    case 'P2002':
      return new ApiError(400, 'Duplicate field value entered');
    case 'P2014':
      return new ApiError(400, 'Invalid ID provided');
    case 'P2003':
      return new ApiError(400, 'Invalid input data');
    default:
      return new ApiError(500, 'Something went wrong');
  }
};

const handleValidationError = (err: any): ApiError => {
  const errors = Object.values(err.errors).map((e: any) => e.message);
  return new ApiError(400, `Invalid input data: ${errors.join('. ')}`);
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  let error = err;

  if (!(error instanceof ApiError)) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      error = handlePrismaError(error);
    } else if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    } else {
      error = new ApiError(500, 'Something went wrong');
    }
  }

  // Log error
  logger.error(error);

  const statusCode = (error as ApiError).statusCode || 500;
  const message = error.message || 'Something went wrong';

  res.status(statusCode).json({
    success: false,
    message,
    // ...(config.env === 'development' && { stack: error.stack }),
  });
};

export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new ApiError(404, `Not found - ${req.originalUrl}`);
  next(error);
};
