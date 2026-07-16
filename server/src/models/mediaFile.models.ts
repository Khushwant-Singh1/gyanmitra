import { Document, model, Schema } from 'mongoose';
import { MEDIA_FILE_TYPES, MODELS } from '../constants';

interface IMediaFile extends Document {
  publicId: string;
  fileUrl: string;
  fileType: MEDIA_FILE_TYPES;
  uploaderId: Schema.Types.ObjectId;
  fileSize: number;
  name: string;
  format: string;
  updatedAt?: Date;
  createdAt?: Date;
  thumbnail?: Schema.Types.ObjectId;
}

const mediaFileSchema = new Schema<IMediaFile>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    publicId: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      required: true,
      lowercase: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: Object.values(MEDIA_FILE_TYPES),
      required: true,
    },
    uploaderId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.User,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    thumbnail: {
      type: Schema.Types.ObjectId,
      ref: MODELS.MediaFile,
    },
  },
  { timestamps: true }
);

export const MediaFile = model<IMediaFile>(MODELS.MediaFile, mediaFileSchema);
