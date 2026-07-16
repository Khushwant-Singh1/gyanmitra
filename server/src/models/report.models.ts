import { Document, model, Schema } from 'mongoose';
import { MODELS } from '../constants';

interface IReport extends Document {
  articleId: Schema.Types.ObjectId;
  comment: string;
  userId: Schema.Types.ObjectId;
}

const ReportSchema = new Schema<IReport>(
  {
    articleId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.Article,
      required: true,
    },
    comment: {
      type: String,
      required: true,
      minlength: 50,
      maxlength: 250,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.User,
      required: true,
    },
  },
  { timestamps: true }
);

export const Report = model<IReport>(MODELS.Report, ReportSchema);
