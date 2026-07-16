import { model, Schema, type Document, Types } from 'mongoose';
import { MODELS } from '../constants';

export interface IArticleView extends Document {
  articleId: Types.ObjectId;
  userId?: Types.ObjectId;
  ipAddress?: string;
}

const articleViewSchema = new Schema<IArticleView>(
  {
    articleId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.Article,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.User,
    },
    ipAddress: {
      type: String,
    },
  },
  { timestamps: true }
);

export const ArticleView = model<IArticleView>(
  MODELS.ArticleView,
  articleViewSchema
);
