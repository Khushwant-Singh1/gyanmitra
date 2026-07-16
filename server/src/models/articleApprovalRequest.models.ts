import { Document, model, Schema } from 'mongoose';
import { MODELS, REQUEST_REASON, REQUEST_STATUS } from '../constants';

export interface IArticleApprovalRequest extends Document {
  message?: string;
  reason: REQUEST_REASON;
  articleId: Schema.Types.ObjectId;
  receiverId: Schema.Types.ObjectId;
  requesterId: Schema.Types.ObjectId;
  status: REQUEST_STATUS;
  rejectedMessage?: string;
}

export const ArticleApprovalRequestSchema = new Schema<IArticleApprovalRequest>(
  {
    message: {
      type: String,
      trim: true,
      maxlength: 400,
    },
    reason: {
      type: String,
      enum: Object.values(REQUEST_REASON),
      required: true,
    },
    articleId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.Article,
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.User,
      required: true,
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.User,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.Pending,
    },
    rejectedMessage: {
      type: String,
      trim: true,
      maxlength: 400,
    },
  },
  { timestamps: true }
);

export const ArticleApprovalRequest = model<IArticleApprovalRequest>(
  MODELS.ArticleRequest,
  ArticleApprovalRequestSchema
);
