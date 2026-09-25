// ============================================================
// Error Handling Middleware
// ============================================================

import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isDev = process.env.NODE_ENV === 'development';

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const fields = err.meta?.target?.join(', ') ?? 'fields';
    res.status(409).json({
      success: false,
      message: `A record with the same ${fields} already exists.`,
    });
    return;
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    res.status(404).json({ success: false, message: 'Record not found.' });
    return;
  }

  // Prisma foreign key constraint
  if (err.code === 'P2003') {
    res.status(400).json({
      success: false,
      message: 'Referenced record does not exist.',
    });
    return;
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';

  if (!err.isOperational) console.error('[UNHANDLED ERROR]', err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack }),
  });
};

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
};
