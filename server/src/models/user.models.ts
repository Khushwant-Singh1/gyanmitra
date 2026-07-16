import { CallbackError, Document, model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { ADMINISTRATOR_ROLE, MODELS, USER_ROLE } from '../constants';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  isBlocked: boolean;
  emailVerification?: { token: string; expiry: Date };
  isEmailVerified: boolean;
  role: USER_ROLE | ADMINISTRATOR_ROLE;
  deactivatorId?: Schema.Types.ObjectId;
  inviterId?: Schema.Types.ObjectId;

  generateEmailToken(): Promise<string>;
  comparePassword(password: string): Promise<boolean>;
  generateAccessToken(): Promise<string>;
}

export const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    emailVerification: {
      type: {
        token: { type: String },
        expiry: { type: Date },
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      required: true,
    },
    deactivatorId: { type: Schema.Types.ObjectId, ref: MODELS.User },
    inviterId: { type: Schema.Types.ObjectId, ref: MODELS.User },
  },
  { timestamps: true }
);

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function (): Promise<string> {
  const user = this as IUser;
  const token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      user_role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET as Secret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY as SignOptions['expiresIn'],
    }
  );
  await user.save();
  return token;
};

userSchema.methods.generateEmailToken = async function (): Promise<string> {
  const user = this as IUser;

  const token = crypto
    .randomBytes(16)
    .toString('hex')
    .toUpperCase()
    .slice(0, 6);
  const hashedToken = crypto
    .createHmac('sha256', process.env.EMAIL_SECRET_KEY as string)
    .update(token)
    .digest('hex');

  const tokenExpiryTime = parseInt(process.env.EMAIL_TOKEN_EXPIRY as string);
  user.emailVerification = {
    token: hashedToken,
    expiry: new Date(Date.now() + tokenExpiryTime * 60 * 1000),
  };
  await user.save();
  return token;
};

export const User = model<IUser>(MODELS.User, userSchema);
