import { NextFunction, Request, Response } from 'express';
import { AsyncHandler } from '../../utils/asyncHandler.utils';
import { ApiError } from '../../utils/ApiError.utils';
import {
  EMAIL_SUBJECTS,
  USER_FIELDS_TO_HIDE,
  USER_ROLE,
} from '../../constants';
import { ApiResponse } from '../../utils/ApiResponse.utils';
import crypto from 'crypto';
import { Invitation } from '../../models/invitation.models';
import { User } from '../../models/user.models';
import { COOKIE_OPTION } from '../../constants';
import { sendEmail } from '../../services/mailer.services';
import { verificationTemplate } from '../../utils/emailTemplates.utils';

export const USER_SIGN_IN_REQ_FIELDS = ['email', 'password'];

export const signIn = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await User.findOne({
      email,
    });

    if (!user)
      throw new ApiError(401, 'either password or email wrong', [
        'unauthorized request',
      ]);

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect)
      throw new ApiError(401, 'either password or email wrong', [
        'unauthorized request',
      ]);

    const accessToken = await user.generateAccessToken();

    const cleanUser = await User.findById(user._id).select(USER_FIELDS_TO_HIDE);

    return res
      .status(201)
      .cookie('access_token', accessToken, COOKIE_OPTION)
      .send(
        new ApiResponse(
          201,
          { user: cleanUser, accessToken },
          'User signIn success'
        )
      );
  }
);

export const ADMINISTRATOR_SIGN_UP_REQ_FIELDS = [
  'password',
  'firstName',
  'lastName',
];

export const signOut = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    return res
      .clearCookie('access_token', COOKIE_OPTION)
      .status(200)
      .json(new ApiResponse(200, {}, 'User sign out success'));
  }
);

export const administratorSignUp = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password, firstName, lastName } = req.body;

    const token = req.params._token;

    const hashedToken = crypto
      .createHmac('sha256', process.env.INVITATION_SECRET_KEY as string)
      .update(token as string)
      .digest('hex');

    const invitation = await Invitation.findOne({
      'token.data': hashedToken,
      'token.expiresAt': { $gt: Date.now() },
    }).select('-token');

    if (!invitation) throw new ApiError(400, 'Token is invalid or expired');

    const userExits = await User.findOne({
      email: invitation.receiverEmail,
    });

    if (userExits) throw new ApiError(401, 'user email already exits');

    const userCreate = await User.create({
      password,
      firstName: firstName,
      lastName: lastName,
      email: invitation.receiverEmail,
      inviterId: invitation.inviterId,
      isEmailVerified: true,
      role: invitation.receiverRole,
    });

    const accessToken = await userCreate.generateAccessToken();

    const user = await User.findById(userCreate._id).select(
      USER_FIELDS_TO_HIDE
    );

    if (!user) throw new ApiError(500, 'Could not find user created');

    invitation.registeredAdministratorId = user._id;
    invitation.save();

    res
      .status(201)
      .cookie('access_token', accessToken, COOKIE_OPTION)
      .json(
        new ApiResponse(
          201,
          { user: user, accessToken },
          'Successfully created user'
        )
      );
  }
);

interface IViewerSignup {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const VIEWER_SIGN_UP_REQ_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'password',
];

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const viewerSignup = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password }: IViewerSignup = req.body;

    if (!firstName || typeof firstName !== 'string') {
      return next(
        new ApiError(400, 'First name is required and must be a string')
      );
    }

    if (!lastName || typeof lastName !== 'string') {
      return next(
        new ApiError(400, 'Last name is required and must be a string')
      );
    }

    if (!email || !isValidEmail(email)) {
      return next(new ApiError(400, 'A valid email address is required'));
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return next(new ApiError(400, 'Password must be at least 6 characters'));
    }

    const isEmailExits = await User.exists({ email });
    if (isEmailExits)
      throw new ApiError(400, 'The user already exits with email');

    const viewer = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: USER_ROLE.Viewer,
    });

    const accessToken = await viewer.generateAccessToken();

    const cleanViewer = await User.findById(viewer._id).select(
      USER_FIELDS_TO_HIDE
    );

    if (!cleanViewer) throw new ApiError(500, 'Problem on creating user');

    return res
      .status(200)
      .cookie('access_token', accessToken, COOKIE_OPTION)
      .json(
        new ApiResponse(200, { user: cleanViewer }, 'successfully created user')
      );
  }
);

export const verifyEmailWithToken = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params._token;
    const hashedToken = crypto
      .createHmac('sha256', process.env.EMAIL_SECRET_KEY as string)
      .update(token)
      .digest('hex');

    const viewer = await User.findOne({
      'emailVerification.token': hashedToken,
      'emailVerification.expiry': { $gt: new Date(Date.now()) },
    });

    if (!viewer)
      throw new ApiError(
        401,
        'Unauthorized request, time out or invalid token'
      );

    const accessToken = await viewer.generateAccessToken();

    const cleanViewer = await User.findByIdAndUpdate(
      viewer._id,
      {
        $unset: { emailVerification: '' },
        isEmailVerified: true,
        last_email_verified: Date.now(),
      },
      { new: true }
    ).select(USER_FIELDS_TO_HIDE);

    if (!cleanViewer) throw new ApiError(500, 'Problem in updating user');

    return res
      .status(200)
      .cookie('access_token', accessToken, COOKIE_OPTION)
      .json(
        new ApiResponse(
          200,
          { user: cleanViewer },
          'successfully user email verified'
        )
      );
  }
);

export const reSendEmailVerification = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.query.userId as string;

    const user = await User.findById(userId);
    if (!user) throw new ApiError(400, 'User ID do not exits');

    if (user.isEmailVerified && !user.emailVerification)
      throw new ApiError(
        400,
        'User email already verified, and there is older email verification'
      );

    const token = await user.generateEmailToken();

    const cleanUser = await User.findById(userId).select(USER_FIELDS_TO_HIDE);

    const sendmail = await sendEmail({
      to: user.email,
      subject: EMAIL_SUBJECTS.Verification,
      emailTemplate: await verificationTemplate(token),
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user: cleanUser, email: sendmail },
          'successfully sended email verification'
        )
      );
  }
);
