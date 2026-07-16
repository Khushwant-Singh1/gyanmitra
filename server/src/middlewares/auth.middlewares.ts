import { NextFunction, Request, Response } from 'express';
import {
  ADMINISTRATOR_ROLE,
  USER_FIELDS_TO_HIDE,
  USER_ROLE,
} from '../constants';
import { AsyncHandler } from '../utils/asyncHandler.utils';
import { ApiError } from '../utils/ApiError.utils';
import jwt from 'jsonwebtoken';
import { IUser, User } from '../models/user.models';

export interface IJwtPayload {
  _id: string;
  email: string;
  user_role: USER_ROLE;
}

export interface IJwtRequest extends Request {
  user: IUser;
}

export const VerifyJWT = (allowedRoles: (USER_ROLE | ADMINISTRATOR_ROLE)[]) =>
  AsyncHandler(async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const token =
      req.cookies['access_token'] ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) throw new ApiError(401, 'Unauthorized request');

    let decodedToken: IJwtPayload;

    try {
      decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as IJwtPayload;
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired token');
    }

    if (!allowedRoles.includes(decodedToken.user_role))
      throw new ApiError(401, `provide user role is not allowed`, [
        'INVALID USER ROLE',
      ]);
    const user = await User.findOne({
      _id: decodedToken._id,
      role: decodedToken.user_role,
    }).select(USER_FIELDS_TO_HIDE);
    if (!user) throw new ApiError(401, 'Unauthorized request');

    if (user.isBlocked)
      throw new ApiError(401, 'user is blocked', ['USER_BLOCKED']);
    if (!user.isEmailVerified)
      throw new ApiError(401, 'user email is not verified', [
        'USER_EMAIL_NOT_VERIFIED',
      ]);

    req.user = user;
    return next();
  });

export interface ITryJwtRequest extends Request {
  user: IUser | null;
}

export const TryVerifyJWT = (
  allowedRoles: (USER_ROLE | ADMINISTRATOR_ROLE)[]
) =>
  AsyncHandler(
    async (req: ITryJwtRequest, res: Response, next: NextFunction) => {
      const token =
        req.cookies['access_token'] ||
        req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        req.user = null;
        return next();
      }

      let decodedToken: IJwtPayload;

      try {
        decodedToken = jwt.verify(
          token,
          process.env.ACCESS_TOKEN_SECRET as string
        ) as IJwtPayload;
      } catch (error) {
        req.user = null;
        return next();
      }

      if (!allowedRoles.includes(decodedToken.user_role)) {
        req.user = null;
        return next();
      }

      const user = await User.findOne({
        _id: decodedToken._id,
        role: decodedToken.user_role,
      }).select(USER_FIELDS_TO_HIDE);

      if (!user) {
        req.user = null;
        return next();
      }

      if (user.isBlocked) {
        req.user = null;
        return next();
      }

      req.user = user;
      return next();
    }
  );
