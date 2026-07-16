import { Document, model, Schema, Types } from 'mongoose';
import {
  ARTICLE_ACTIONS,
  ARTICLE_STATUS,
  ARTICLE_CONTENT_TYPES,
  MODELS,
  SLUGIFY_OPTIONS,
} from '../constants';
import slugify from 'slugify';

export interface IArticle extends Document {
  headline: string;
  slug: string;
  contentType: ARTICLE_CONTENT_TYPES;
  contentId: Types.ObjectId;
  description: string;
  featuredMediaId: Types.ObjectId;
  status: ARTICLE_STATUS;
  tags: string[];
  categoryId: Types.ObjectId;
  originalArticleId?: Types.ObjectId;
  authorId: Types.ObjectId;
  lastPublishedDate?: Date;
  scheduledPublishDate?: Date;
  
  // --- New SEO Interface Fields ---
  metaTitle?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  robotsTag?: string;
  authorName?: string; // Metadata author ke liye

  actions: {
    userId: Types.ObjectId;
    type: ARTICLE_ACTIONS;
    timeStamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    headline: {
      type: String,
      required: true,
      index: true,
    },
    slug: {
      type: String,
      trim: true,
      required: true,
      unique: true, // SEO ke liye slug hamesha unique hona chahiye
      index: true,
    },
    description: {
      type: String,
    },
    
    // --- New SEO Schema Fields ---
    metaTitle: {
      type: String,
      trim: true,
    },
    focusKeyword: {
      type: String,
      lowercase: true,
      trim: true,
    },
    canonicalUrl: {
      type: String,
      trim: true,
    },
    robotsTag: {
      type: String,
      default: 'INDEX, FOLLOW',
    },
    authorName: {
      type: String,
      default: 'Invitations',
    },

    contentId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.ArticleContent,
      required: true,
      immutable: true,
    },
    featuredMediaId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.MediaFile,
      required: true,
    },
    contentType: {
      type: String,
      enum: Object.values(ARTICLE_CONTENT_TYPES),
      default: ARTICLE_CONTENT_TYPES.News,
    },
    status: {
      type: String,
      enum: Object.values(ARTICLE_STATUS),
      default: ARTICLE_STATUS.Draft,
    },
    tags: {
      type: [String],
      lowercase: true,
      trim: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.Category,
      required: true,
      index: true,
    },
    originalArticleId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.Article,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.User,
      required: true,
    },
    lastPublishedDate: {
      type: Date,
    },
    scheduledPublishDate: {
      type: Date,
    },
    actions: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: MODELS.User,
          required: true,
        },
        type: {
          type: String,
          enum: Object.values(ARTICLE_ACTIONS),
          required: true,
        },
        timeStamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { 
    timestamps: true 
  }
);

// Text Index updated to include SEO fields for better internal search
ArticleSchema.index({ 
  headline: 'text', 
  tags: 'text', 
  description: 'text',
  metaTitle: 'text',
  focusKeyword: 'text' 
});

ArticleSchema.pre<IArticle>('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.headline, SLUGIFY_OPTIONS);
  }
  next();
});

export const Article = model<IArticle>(MODELS.Article, ArticleSchema);