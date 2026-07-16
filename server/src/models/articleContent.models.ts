import { Document, model, Schema } from 'mongoose';
import { MODELS } from '../constants';

interface IArticleContent extends Document {
  data: string;
}

const ArticleContentSchema = new Schema<IArticleContent>({
  data: {
    type: String,
    trim: true,
  },
});
export const ArticleContent = model(
  MODELS.ArticleContent,
  ArticleContentSchema
);
