import { NextFunction, Request, Response } from 'express';
import { AsyncHandler } from '../utils/asyncHandler.utils';
import { IJwtRequest } from '../middlewares/auth.middlewares';
import { Invitation } from '../models/invitation.models';
import { sendEmail } from '../services/mailer.services';
import { ADMINISTRATOR_ROLE, EMAIL_SUBJECTS } from '../constants';
import { invitationTemplate } from '../utils/emailTemplates.utils';
import { ApiError } from '../utils/ApiError.utils';
import { ApiResponse } from '../utils/ApiResponse.utils';
import crypto from 'crypto';
import { User } from '../models/user.models';

interface ICreateInvitationReqFields {
  email: string;
  message: string;
  receiverRole: ADMINISTRATOR_ROLE;
}

export const createInvitationReqFields = ['email', 'message', 'receiverRole'];

export const createInvitation = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const { email, message, receiverRole }: ICreateInvitationReqFields =
      req.body;

    const isEmailExists = await Invitation.exists({ receiverEmail: email });

    const isUserExits = await User.exists({ email });
    if (isUserExits)
      throw new ApiError(401, 'the user email is already exists');

    if (isEmailExists)
      throw new ApiError(401, 'the invited email is already exists');

    if (
      req.user.role === ADMINISTRATOR_ROLE.Owner &&
      receiverRole === ADMINISTRATOR_ROLE.Owner
    )
      throw new ApiError(401, 'owner cant invite owner');
    else if (
      req.user.role === ADMINISTRATOR_ROLE.Admin &&
      receiverRole !== ADMINISTRATOR_ROLE.Editor
    )
      throw new ApiError(401, 'admin can invite only editor');

    const invitation = await Invitation.create({
      inviterId: req.user._id,
      receiverEmail: email,
      receiverRole: receiverRole,
      message,
    });

    if (!invitation) throw new ApiError(500, 'could not create invitation');

    const token = await invitation.generateInvitationToken();

    const invitationUrl = `${process.env.CLIENT_URL}/administrator/sign-up/${token}`;

    const emailSended = await sendEmail({
      to: email,
      subject: EMAIL_SUBJECTS.Invitation,
      emailTemplate: await invitationTemplate(
        message,
        invitationUrl,
        req.user.firstName + ' ' + req.user.lastName,
        req.user.role as ADMINISTRATOR_ROLE,
        receiverRole
      ),
    });

    if (!emailSended) throw new ApiError(500, 'Error on sending email');

    const invitationUpdated = await Invitation.findByIdAndUpdate(
      invitation._id,
      { messageId: emailSended.messageId },
      { new: true }
    ).select('-token');

    if (!invitationUpdated)
      throw new ApiError(500, 'Could not update the email message id');

    return res
      .status(201)
      .send(
        new ApiResponse(
          201,
          invitationUpdated,
          'successfully created invitation'
        )
      );
  }
);

export const isValidInviteToken = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params._token;
    const hashedToken = crypto
      .createHmac('sha256', process.env.INVITATION_SECRET_KEY as string)
      .update(token)
      .digest('hex');

    const invitation = await Invitation.findOne({
      'token.data': hashedToken,
      'token.expiresAt': { $gt: Date.now() },
    }).select('-token');

    if (!invitation) throw new ApiError(400, 'Token is invalid or expired');

    res
      .status(200)
      .send(
        new ApiResponse(
          200,
          invitation,
          'Invitation token is valid and not expired'
        )
      );
  }
);
