import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';
import { ZodError } from 'zod';

interface StructuredError {
  error: {
    message: string;
    code: string;
    stack?: string;
  };
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response<StructuredError>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  console.error(err); // Log the full error for debugging purposes

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
      },
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code || 'HTTP_ERROR',
      },
    });
  }

  // Fallback for any other unexpected errors
  res.status(500).json({
    error: {
      message: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
    },
  });
}// src/backend/api/index.ts
import express from 'express';
import { errorHandler } from './middleware/errorHandler';
// ... import your routes

const app = express();

// ... other middleware and routes
// app.use('/api/feature', featureRoutes);

// Add this at the very end
app.use(errorHandler);
// src/backend/api/controllers/someController.ts
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { someServiceFunction } from '../../services/someService';

// An async handler wrapper to catch errors and pass them to next()
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const getData = asyncHandler(async (req, res, next) => {
  // Zod validation would typically be in a middleware before this handler
  
  // All logic is in services, as per your rules
  const data = await someServiceFunction(req.params.id);

  if (!data) {
    // Use http-errors to create a structured 404 error
    // This will be caught and formatted by your errorHandler middleware
    throw createError(404, 'Resource not found');
  }

  res.status(200).json(data);
});
