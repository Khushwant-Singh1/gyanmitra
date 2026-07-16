import { Document, model, Schema } from 'mongoose';
import { MODELS } from '../constants';

export interface ICategory extends Document {
  name: string;
  parentId?: Schema.Types.ObjectId;
  isActive: boolean;
  index: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
      unique: true,
      lowercase: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.Category,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Category = model<ICategory>(MODELS.Category, CategorySchema);
