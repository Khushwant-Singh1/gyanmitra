import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.utils';
import { FIELD_SOURCE } from './checkRequiredFields.middlewares';
import { AsyncHandler } from '../utils/asyncHandler.utils';
import { isValidObjectId } from 'mongoose';

export const validateObjectId = (
  fieldNames: string[],
  source: FIELD_SOURCE = FIELD_SOURCE.body
) =>
  AsyncHandler((req: Request, res: Response, next: NextFunction) => {
    for (const field of fieldNames) {
      const id = req[source][field];

      if (id === undefined) {
        console.error(
          `error: validateObjectId: Field '${field}' is not found in ${source}`
        );
      }

      if (!isValidObjectId(id)) {
        throw new ApiError(400, `Invalid ${field} format`, [
          `INVALID_${field.toUpperCase()}`,
        ]);
      }
    }
    next();
  });
