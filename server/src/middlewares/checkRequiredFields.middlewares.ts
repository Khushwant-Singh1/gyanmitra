import { NextFunction, Request, Response } from 'express';
import { AsyncHandler } from '../utils/asyncHandler.utils';
import { ApiError } from '../utils/ApiError.utils';

export enum FIELD_SOURCE {
  body = 'body',
  params = 'params',
  query = 'query',
}

export const checkRequiredFields = (
  requiredFields: string[],
  source: FIELD_SOURCE = FIELD_SOURCE.body
) =>
  AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const data = req[source];

    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0)
      throw new ApiError(
        400,
        `Missing required fields: ${missingFields}`,
        missingFields
      );

    next();
  });
