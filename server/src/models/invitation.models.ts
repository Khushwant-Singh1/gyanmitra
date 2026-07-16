import { Document, model, Schema, Types } from 'mongoose';
import crypto from 'crypto';
import { MODELS, ADMINISTRATOR_ROLE } from '../constants';

export interface IInvitation extends Document {
  inviterId: Types.ObjectId;
  receiverEmail: string;
  receiverRole: ADMINISTRATOR_ROLE;
  registeredAdministratorId?: Types.ObjectId;
  message?: string;
  messageId?: string;
  token: { data: string; expiresAt?: Date };
  generateInvitationToken(): Promise<string>;
}

export const InvitationSchema = new Schema<IInvitation>(
  {
    inviterId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.User,
      required: true,
    },
    receiverEmail: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    messageId: {
      type: String,
    },
    receiverRole: {
      type: String,
      enum: [ADMINISTRATOR_ROLE.Admin, ADMINISTRATOR_ROLE.Editor],
      required: true,
    },
    registeredAdministratorId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.User,
    },
    message: {
      type: String,
      required: true,
    },
    token: {
      data: {
        type: String,
      },
      expiresAt: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

InvitationSchema.methods.generateInvitationToken =
  async function (): Promise<string> {
    const invitation = this as IInvitation;

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHmac('sha256', process.env.INVITATION_SECRET_KEY as string)
      .update(token)
      .digest('hex');

    const tokenExpiryTime = parseInt(
      process.env.INVITATION_TOKEN_EXPIRY as string
    );

    if (isNaN(tokenExpiryTime)) {
      throw new Error('Invalid token expiry value in environment variables.');
    }

    invitation.token.expiresAt = new Date(
      Date.now() + tokenExpiryTime * 60 * 1000
    );
    invitation.token.data = hashedToken;

    await invitation.save();
    return token;
  };

export const Invitation = model<IInvitation>(
  MODELS.Invitation,
  InvitationSchema
);
