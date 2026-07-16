import { Document, model, Schema } from 'mongoose';
import { MODELS } from '../constants';

export interface IComment extends Document {
  message: string;
  userId: Schema.Types.ObjectId;
  articleId: Schema.Types.ObjectId;
}

export const CommentSchema = new Schema<IComment>(
  {
    message: {
      type: String,
      maxlength: 300,
      required: true,
      minlength: 10,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.User,
      required: true,
      immutable: true,
    },
    articleId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.Article,
      required: true,
      immutable: true,
    },
  },
  { timestamps: true }
);

export const Comment = model(MODELS.Comment, CommentSchema);
