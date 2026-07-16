import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiError } from './ApiError.utils';

const asyncHandler =
  (fn: Function) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (err: any) {
      if (process.env.IS_DEVELOPMENT)
        console.error('from async handler: ', err.message);

      // Handle Mongoose Validation Errors
      if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: 'Validation Error',
          errors: err.errors,
        });
      }

      // Handle Mongoose Cast Errors (e.g., invalid ObjectId)
      if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: `Invalid ${err.path}: ${err.value}`,
        });
      }

      // Handle Mongoose Duplicate Key Errors (e.g., duplicate)
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        return res.status(409).json({
          statusCode: 409,
          success: false,
          message: `Duplicate value for field ${field}: "${value}". Please use a different value.`,
        });
      }

      // Handle custom errors with statusCode
      if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
          success: err.success,
          message: err.message,
          errors: err.errors,
          statusCode: err.statusCode,
        });
      }

      // Handle other errors (500 Internal Server Error)
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        statusCode: 500,
      });
    }
  };

export { asyncHandler as AsyncHandler };
