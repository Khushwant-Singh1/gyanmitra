import { NextFunction, Response } from 'express';
import { AsyncHandler } from '../../utils/asyncHandler.utils';
import { IJwtRequest } from '../../middlewares/auth.middlewares';
import { isValidObjectId, Types } from 'mongoose';
import { Article } from '../../models/article.models';
import { Category } from '../../models/category.models';
import { ApiError } from '../../utils/ApiError.utils';
import { MediaFile } from '../../models/mediaFile.models';
import { ApiResponse } from '../../utils/ApiResponse.utils';
import {
  ADMINISTRATOR_ROLE,
  ARTICLE_ACTIONS,
  ARTICLE_CONTENT_TYPES,
  ARTICLE_STATUS,
  REQUEST_STATUS,
  SLUGIFY_OPTIONS,
} from '../../constants';
import slugify from 'slugify';
import { ArticleContent } from '../../models/articleContent.models';
import { Report } from '../../models/report.models';
import { ArticleApprovalRequest } from '../../models/articleApprovalRequest.models';
import { ArticleView } from '../../models/articleView.models';
import { Comment } from '../../models/comment.models';

const validateCategoryAndMedia = async (
  categoryId: Types.ObjectId,
  mediaId: Types.ObjectId
) => {
  const categoryExists = await Category.exists({ _id: categoryId });
  if (!categoryExists) throw new ApiError(404, 'Category ID does not exist');

  const mediaExists = await MediaFile.exists({ _id: mediaId });
  if (!mediaExists) throw new ApiError(404, 'MediaFile ID does not exist');
};

// Updated Interface to include SEO fields
interface ICreateArticle {
  headline: string;
  slug?: string;
  categoryId: Types.ObjectId;
  featuredMediaId: Types.ObjectId;
  tags?: string[];
  content: string;
  description: string;
  contentType: ARTICLE_CONTENT_TYPES;
  // SEO Fields
  metaTitle?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  robotsTag?: string;
  scheduledPublishDate?: Date;
}

export const CREATE_ARTICLE_REQ_FIELDS = [
  'headline',
  'categoryId',
  'featuredMediaId',
  'contentType',
];

export const create = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const {
      headline,
      slug,
      categoryId,
      featuredMediaId,
      tags = [],
      content = '',
      contentType: content_type,
      description = '',
      // Destructure SEO fields from body
      metaTitle,
      focusKeyword,
      canonicalUrl,
      robotsTag,
      scheduledPublishDate,
    }: ICreateArticle = req.body;

    if (!Object.values(ARTICLE_CONTENT_TYPES).includes(content_type))
      throw new ApiError(
        400,
        `content type can only be possible, ${Object.values(ARTICLE_CONTENT_TYPES)}`
      );

    await validateCategoryAndMedia(categoryId, featuredMediaId);

    const articleContent = await ArticleContent.create({ data: content });

    const article = await Article.create({
      headline,
      slug: slug
        ? slugify(slug, SLUGIFY_OPTIONS)
        : slugify(headline, SLUGIFY_OPTIONS),
      categoryId,
      featuredMediaId,
      tags,
      description,
      contentId: articleContent._id,
      contentType: content_type,
      authorId: req.user._id,
      // Save SEO fields
      metaTitle: metaTitle || headline,
      focusKeyword,
      canonicalUrl,
      robotsTag,
      scheduledPublishDate: scheduledPublishDate ? new Date(scheduledPublishDate) : undefined,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { article, articleContent },
          'Article created successfully'
        )
      );
  }
);

interface IEditArticle {
  headline?: string;
  categoryId?: Types.ObjectId;
  featuredMediaId?: Types.ObjectId;
  tags?: string[];
  content?: string;
  description?: string;
  slug?: string;
  // SEO Fields
  metaTitle?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  robotsTag?: string;
  scheduledPublishDate?: Date;
}

export const edit = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const {
      headline,
      categoryId,
      featuredMediaId,
      tags,
      slug,
      content,
      description,
      // Destructure SEO fields
      metaTitle,
      focusKeyword,
      canonicalUrl,
      robotsTag,
      scheduledPublishDate,
    }: IEditArticle = req.body;
    const articleId = req.params._id;

    const article = await Article.findById(articleId);
    if (!article) throw new ApiError(404, 'Article ID does not exist');
    const userId = req.user._id as Types.ObjectId;

    if (article.status !== ARTICLE_STATUS.Draft)
      throw new ApiError(403, 'Only draft articles can be edited');

    if (article.authorId.toString() !== userId.toString()) {
      throw new ApiError(401, 'Unauthorized request');
    }

    if (tags && tags.length > 15) throw new ApiError(400, 'Too many tags');

    let slugifySlug: string | undefined = undefined;
    if (slug) {
      if (!(slug === article.slug)) {
        const slugExits = await Article.exists({ slug: slug });
        if (slugExits) throw new ApiError(200, 'slug already exits');
        slugifySlug = slugify(slug, SLUGIFY_OPTIONS);
      }
    }

    if (categoryId || featuredMediaId) {
      await validateCategoryAndMedia(
        categoryId || article.categoryId,
        featuredMediaId || article.featuredMediaId
      );
    }

    let articleContent = await ArticleContent.findById(article.contentId);
    if (content) {
      articleContent = await ArticleContent.findByIdAndUpdate(
        article.contentId,
        {
          data: content,
        },
        { new: true }
      );
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      article._id,
      {
        headline: headline || article.headline,
        slug: slugifySlug || article.slug,
        featuredMediaId: featuredMediaId || article.featuredMediaId,
        categoryId: categoryId || article.categoryId,
        tags: tags || article.tags,
        description: description || article.description,
        // Update SEO fields
        metaTitle: metaTitle !== undefined ? metaTitle : article.metaTitle,
        focusKeyword: focusKeyword !== undefined ? focusKeyword : article.focusKeyword,
        canonicalUrl: canonicalUrl !== undefined ? canonicalUrl : article.canonicalUrl,
        robotsTag: robotsTag !== undefined ? robotsTag : article.robotsTag,
        scheduledPublishDate: scheduledPublishDate !== undefined ? (scheduledPublishDate ? new Date(scheduledPublishDate) : null) : article.scheduledPublishDate,
      },
      { new: true, runValidators: false }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { article: updatedArticle, articleContent },
          'Article updated successfully'
        )
      );
  }
);

export const publish = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const articleId = req.params._id;
    const { articleApprovalRequestId, scheduledPublishDate: reqScheduledDate } = req.body;

    const article = await Article.findById(articleId);
    if (!article) throw new ApiError(404, 'Article ID does not exist');

    if (
      article.status === ARTICLE_STATUS.Published ||
      article.originalArticleId
    )
      throw new ApiError(
        403,
        'Only draft & private articles can be published.'
      );

    if (req.user.role === ADMINISTRATOR_ROLE.Editor) {
      throw new ApiError(
        400,
        'Editor cant publish a draft. Request for publishing.'
      );
    }

    if (articleApprovalRequestId) {
      if (!isValidObjectId(articleApprovalRequestId))
        throw new ApiError(400, 'Invalid article approval request ID');
      const articleApprovalRequest = await ArticleApprovalRequest.findById(
        articleApprovalRequestId
      );
      if (!articleApprovalRequest)
        throw new ApiError(404, 'Article approval request not found');
      articleApprovalRequest.status = REQUEST_STATUS.Approved;
      await articleApprovalRequest.save();
    }

    const scheduledDate = reqScheduledDate !== undefined ? reqScheduledDate : article.scheduledPublishDate;

    if (scheduledDate && new Date(scheduledDate) > new Date()) {
      article.status = ARTICLE_STATUS.Scheduled;
      article.scheduledPublishDate = new Date(scheduledDate);
      article.actions.push({
        userId: req.user._id as Types.ObjectId,
        type: ARTICLE_ACTIONS.Schedule,
        timeStamp: new Date(Date.now()),
      });
      await article.save();
      
      return res
        .status(200)
        .json(new ApiResponse(200, article, 'Article scheduled successfully'));
    } else {
      article.status = ARTICLE_STATUS.Published;
      article.lastPublishedDate = new Date(Date.now());
      article.scheduledPublishDate = undefined;
      article.actions.push({
        userId: req.user._id as Types.ObjectId,
        type: ARTICLE_ACTIONS.Publish,
        timeStamp: new Date(Date.now()),
      });

      await article.save();

      return res
        .status(200)
        .json(new ApiResponse(200, article, 'Article published successfully'));
    }
  }
);

export const update = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const { cloneArticleId }: { cloneArticleId: Types.ObjectId } = req.body;
    const article_id = req.params._id;

    const originalArticle = await Article.findById(article_id);
    if (!originalArticle)
      throw new ApiError(404, 'Original article ID does not exist');

    const clonedArticle = await Article.findById(cloneArticleId);
    if (!clonedArticle)
      throw new ApiError(404, 'Cloned article ID does not exist');

    if (clonedArticle.originalArticleId?.toString() !== article_id)
      throw new ApiError(400, 'Cloned and original article mismatch');

    const clonedContent = await ArticleContent.findById(
      clonedArticle.contentId
    );
    if (!clonedContent)
      throw new ApiError(404, 'Cloned article content ID does not exist');

    const updatedArticleContent = await ArticleContent.findByIdAndUpdate(
      originalArticle.contentId,
      { data: clonedContent.data },
      { new: true }
    );

    if (!updatedArticleContent)
      throw new ApiError(404, 'Original article content ID does not exist');

    const updatedArticle = await Article.findByIdAndUpdate(
      originalArticle._id,
      {
        headline: clonedArticle.headline,
        slug: clonedArticle.slug,
        description: clonedArticle.description,
        featuredMediaId: clonedArticle.featuredMediaId,
        tags: clonedArticle.tags,
        categoryId: clonedArticle.categoryId,
        // Merge SEO fields from clone to original
        metaTitle: clonedArticle.metaTitle,
        focusKeyword: clonedArticle.focusKeyword,
        canonicalUrl: clonedArticle.canonicalUrl,
        robotsTag: clonedArticle.robotsTag,
      },
      { new: true, runValidators: true }
    );
    updatedArticle?.actions.push({
      userId: req.user._id as Types.ObjectId,
      type: ARTICLE_ACTIONS.Update,
      timeStamp: new Date(Date.now()),
    });

    await updatedArticle?.save();

    await Article.findByIdAndDelete(clonedArticle._id);
    await ArticleContent.findByIdAndDelete(clonedArticle.contentId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { article: updatedArticle, articleContent: updatedArticleContent },
          'Article updated successfully'
        )
      );
  }
);

export const makeClone = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const articleId = req.params._id;

    const originalArticle = await Article.findById(articleId);
    if (!originalArticle) throw new ApiError(404, 'Article ID does not exist');

    if (originalArticle.status === ARTICLE_STATUS.Draft)
      throw new ApiError(403, 'Draft article could not be cloned');

    const isCloneExits = await Article.exists({
      originalArticleId: originalArticle._id,
    });
    if (isCloneExits) throw new ApiError(409, 'Article is already a clone');

    if (originalArticle.originalArticleId)
      throw new ApiError(403, 'Article is already a clone');

    const originalContent = await ArticleContent.findById(
      originalArticle.contentId
    );
    if (!originalContent)
      throw new ApiError(404, 'Original article content ID does not exist');

    const cloneArticleContent = await ArticleContent.create({
      data: originalContent.data,
    });
    if (!cloneArticleContent)
      throw new ApiError(404, 'Cloned article content could not been created');

    const clonedArticle = await Article.create({
      headline: originalArticle.headline,
      slug: originalArticle.slug,
      contentId: cloneArticleContent._id,
      description: originalArticle.description,
      featuredMediaId: originalArticle.featuredMediaId,
      tags: originalArticle.tags,
      categoryId: originalArticle.categoryId,
      originalArticleId: originalArticle._id,
      authorId: req.user._id,
      // Pass SEO fields to the clone
      metaTitle: originalArticle.metaTitle,
      focusKeyword: originalArticle.focusKeyword,
      canonicalUrl: originalArticle.canonicalUrl,
      robotsTag: originalArticle.robotsTag,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { article: clonedArticle },
          'Article cloned successfully'
        )
      );
  }
);

export const setPrivate = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const article_id = req.params._id;

    const article = await Article.findById(article_id);
    if (!article) throw new ApiError(404, 'Article ID does not exist');

    if (article.status !== ARTICLE_STATUS.Published)
      throw new ApiError(
        400,
        'Article without status published cant be private'
      );

    article.status = ARTICLE_STATUS.Private;
    article.actions.push({
      userId: req.user._id as Types.ObjectId,
      type: ARTICLE_ACTIONS.Private,
      timeStamp: new Date(Date.now()),
    });
    await article.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { article },
          'article status has been changed to private successfully'
        )
      );
  }
);

export const remove = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const article_id = req.params._id;

    const article = await Article.findById(article_id);

    if (!article) throw new ApiError(400, 'article do not exits');

    // Type casting to avoid 'unknown' type error for _id
    const userId = (req.user as any)?._id;

    if (
      article.status === ARTICLE_STATUS.Draft &&
      article.authorId.toString() === userId?.toString()
    ) {
      // allowing creators to delete their own drafts
    } else if (
      article.status !== ARTICLE_STATUS.Draft &&
      req.user.role === ADMINISTRATOR_ROLE.Editor
    ) {
      throw new ApiError(400, 'only admin and owner can delete there article');
    } else if (
      article.status === ARTICLE_STATUS.Draft &&
      article.authorId.toString() !== userId?.toString()
    ) {
      // If it's a draft but the user is NOT the author
      throw new ApiError(403, 'only creator can delete their draft');
    }

    const deletedArticle = await Article.findByIdAndDelete(article._id);

    // Clean up related data
    await ArticleContent.findByIdAndDelete(article.contentId);
    await ArticleView.deleteMany({
      articleId: article._id,
    });
    await Comment.deleteMany({
      articleId: article._id,
    });

    return res.status(200).send(new ApiResponse(200, deletedArticle, 'Article deleted successfully'));
  }
);

export const reportForArticle = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const comment = req.body.comment;
    const articleId = req.params._id;

    if (comment.length < 50 || comment.length > 250)
      throw new ApiError(
        400,
        'comment length could not be less 50 and more 250'
      );

    const articleExits = await Article.exists({ _id: articleId });
    if (!articleExits) throw new ApiError(400, 'Article ID do not exits');

    const reportExits = await Report.findOne({
      articleId: articleExits._id,
      userId: req.user._id,
    });
    if (reportExits)
      throw new ApiError(400, 'User with same article can be reported');

    const report = await Report.create({
      articleId: articleExits._id,
      userId: req.user._id,
      message: comment,
    });

    if (!report) throw new ApiError(500, 'Problem in creating report');

    return res.status(201).json(new ApiResponse(201, { report }));
  }
);