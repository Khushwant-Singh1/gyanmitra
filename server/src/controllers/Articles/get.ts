import { NextFunction, Request, Response } from 'express';
import { AsyncHandler } from '../../utils/asyncHandler.utils';
import {
  IJwtRequest,
  type ITryJwtRequest,
} from '../../middlewares/auth.middlewares';
import { Types } from 'mongoose';
import { Article } from '../../models/article.models';
import { ApiError } from '../../utils/ApiError.utils';
import { ApiResponse } from '../../utils/ApiResponse.utils';
import {
  ARTICLE_STATUS,
  getMediaLookupPipeline,
  MEDIA_FILE_TYPES,
} from '../../constants';
import { trackArticleView } from '../articleViews.controllers';

export const getIsSlugExits = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const slug = req.params._slug;
    const articleExists = await Article.exists({
      slug: slug,
      originalArticleId: { $exists: false },
    });

    return res.status(200).send(
      new ApiResponse(200, {
        articleExists: !!articleExists,
        _id: articleExists?._id || null,
      })
    );
  }
);

export const getArticlePageContent = AsyncHandler(
  async (req: ITryJwtRequest, res: Response, next: NextFunction) => {
    const slug = req.params._slug;

    const articleId = await Article.findOne({ slug });

    if (!articleId)
      throw new ApiError(
        401,
        'Article slug does not exist in articles, invalid slug'
      );

    trackArticleView(
      articleId._id as Types.ObjectId,
      req.user?._id as Types.ObjectId | undefined,
      req.ip
    );

    const articlePageData = await Article.aggregate([
      {
        $match: {
          status: ARTICLE_STATUS.Published,
        },
      },
      {
        $facet: {
          articleDetails: [
            {
              $match: {
                slug: slug,
              },
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category',
              },
            },
            {
              $unwind: {
                path: '$category',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'article_contents',
                localField: 'contentId',
                foreignField: '_id',
                as: 'content',
              },
            },
            {
              $unwind: {
                path: '$content',
                preserveNullAndEmptyArrays: true,
              },
            },
            ...getMediaLookupPipeline,
            {
              $lookup: {
                from: 'users',
                localField: 'authorId',
                foreignField: '_id',
                as: 'author',
              },
            },
            {
              $unwind: {
                path: '$author',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'comments',
                let: { articleId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$articleId', '$$articleId'],
                      },
                    },
                  },
                  {
                    $lookup: {
                      from: 'users',
                      localField: 'userId',
                      foreignField: '_id',
                      as: 'user',
                    },
                  },
                  {
                    $unwind: {
                      path: '$user',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                  {
                    $project: {
                      message: 1,
                      updatedAt: 1,
                      userName: {
                        $concat: ['$user.firstName', ' ', '$user.lastName'],
                      },
                    },
                  },
                ],
                as: 'comments',
              },
            },
            {
              $addFields: {
                publishedDate: '$lastPublishedDate',
                categoryName: '$category.name',
                contentData: '$content.data',
                // Explicit mapping for SEO fields
                metaTitle: { $ifNull: ["$metaTitle", "$headline"] },
                focusKeyword: { $ifNull: ["$focusKeyword", ""] },
                canonicalUrl: { $ifNull: ["$canonicalUrl", ""] },
                robotsTag: { $ifNull: ["$robotsTag", "INDEX, FOLLOW"] },
                featuredMediaInfo: {
                  fileType: '$featuredMedia.fileType',
                  url: '$featuredMedia.fileUrl',
                  name: '$featuredMedia.name',
                  thumbnail: {
                    $ifNull: ['$thumbnailMedia.fileUrl', null],
                  },
                },
                authorName: {
                  $concat: ['$author.firstName', ' ', '$author.lastName'],
                },
              },
            },
            {
              $project: {
                // Inclusion only (Inclusion and Exclusion cannot be mixed in MongoDB)
                metaTitle: 1,
                focusKeyword: 1,
                canonicalUrl: 1,
                robotsTag: 1,
                headline: 1,
                slug: 1,
                description: 1,
                tags: 1,
                comments: 1,
                publishedDate: 1,
                categoryName: 1,
                contentData: 1,
                featuredMediaInfo: 1,
                authorName: 1,
                _id: 1
              },
            },
          ],
          trendingArticles: [
            {
              $sort: {
                views: -1,
              },
            },
            {
              $limit: 5,
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category',
              },
            },
            {
              $unwind: {
                path: '$category',
                preserveNullAndEmptyArrays: true,
              },
            },
            ...getMediaLookupPipeline,
            {
              $project: {
                slug: true,
                headline: true,
                featuredMediaInfo: {
                  fileType: '$featuredMedia.fileType',
                  url: '$featuredMedia.fileUrl',
                  name: '$featuredMedia.name',
                  thumbnail: {
                    $ifNull: ['$thumbnailMedia.fileUrl', null],
                  },
                },
                categoryName: '$category.name',
                publishedDate: '$lastPublishedDate',
              },
            },
          ],
          recentArticles: [
            {
              $match: {
                slug: { $ne: slug },
              },
            },
            {
              $sort: {
                lastPublishedDate: -1,
              },
            },
            {
              $limit: 3,
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category',
              },
            },
            {
              $unwind: {
                path: '$category',
                preserveNullAndEmptyArrays: true,
              },
            },

            ...getMediaLookupPipeline,

            {
              $project: {
                slug: 1,
                headline: 1,
                featuredMediaInfo: {
                  fileType: '$featuredMedia.fileType',
                  url: '$featuredMedia.fileUrl',
                  name: '$featuredMedia.name',
                  thumbnail: {
                    $ifNull: ['$thumbnailMedia.fileUrl', null],
                  },
                },
                categoryName: '$category.name',
                publishedDate: '$lastPublishedDate',
              },
            },
          ],
        },
      },
      {
        $project: {
          articleDetails: { $arrayElemAt: ['$articleDetails', 0] },
          trendingArticles: 1,
          recentArticles: 1,
        },
      },
    ]);

    return res.status(200).json(new ApiResponse(200, articlePageData[0]));
  }
);

export const getAllArticles = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const articles = await Article.aggregate([
      {
        $match: {
          status: { $in: [ARTICLE_STATUS.Private, ARTICLE_STATUS.Published] },
        },
      },
      {
        $addFields: {
          lastUpdated: {
            $getField: {
              field: 'timeStamp',
              input: { $arrayElemAt: ['$actions', -1] },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author',
        },
      },
      {
        $unwind: {
          path: '$author',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'article_views',
          localField: '_id',
          foreignField: 'articleId',
          as: 'views',
        },
      },
      {
        $project: {
          status: 1,
          headline: 1,
          views: { $size: '$views' },
          slug: 1,
          contentType: 1,
          description: 1,
          author: {
            firstName: '$author.firstName',
            lastName: '$author.lastName',
          },
          category: '$category.name',
          lastUpdated: 1,
        },
      },
    ]);

    return res.status(200).send(new ApiResponse(200, articles));
  }
);

export const getDraftArticles = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const articles = await Article.aggregate([
      {
        $match: {
          authorId: req.user._id,
          status: ARTICLE_STATUS.Draft,
        },
      },

      { $sort: { updatedAt: -1 } },

      ...getMediaLookupPipeline,

      {
        $lookup: {
          from: 'categories',
          foreignField: '_id',
          localField: 'categoryId',
          as: 'category',
        },
      },

      {
        $unwind: {
          path: '$category',
        },
      },

      {
        $project: {
          headline: 1,
          description: 1,
          tags: 1,
          category: '$category.name',
          createdDate: '$createdAt',
          originalArticleId: 1,
          featuredMedia: {
            fileUrl: '$featuredMedia.fileUrl',
            fileType: '$featuredMedia.fileType',
            name: '$featuredMedia.name',
            thumbnail: {
              $ifNull: ['$thumbnailMedia.fileUrl', null],
            },
          },
        },
      },
    ]);

    return res.status(200).send(new ApiResponse(200, articles));
  }
);

export const getDraftArticle = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const articleId = req.params._id;

    const article = await Article.findOne({
      _id: articleId,
    });

    if (!article) throw new ApiError(400, 'Article does not exits.');

    const articleDetails = await Article.aggregate([
      {
        $match: {
          _id: article._id,
        },
      },
      {
        $lookup: {
          from: 'article_contents',
          foreignField: '_id',
          localField: 'contentId',
          as: 'content',
        },
      },
      {
        $unwind: {
          path: '$content',
        },
      },
      {
        $project: {
          content: '$content.data',
          headline: 1,
          tags: 1,
          slug: 1,
          description: 1,
          categoryId: 1,
          featuredMediaId: 1,
          metaTitle: 1,
          focusKeyword: 1,
          canonicalUrl: 1,
          robotsTag: 1,
        },
      },
    ]);

    return res.status(200).send(new ApiResponse(200, articleDetails[0]));
  }
);

export const getArticleMetaData = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const articleSlug = req.params._slug;

    const articleExits = await Article.findOne({ slug: articleSlug });
    if (!articleExits) throw new ApiError(400, 'Article do not exits.');

    const articleMeta = await Article.aggregate([
      {
        $match: { _id: articleExits._id },
      },
      ...getMediaLookupPipeline,
      {
        $project: {
          title: { $ifNull: ['$metaTitle', '$headline'] },
          description: 1,
          image: {
            $cond: {
              if: { $eq: ['$featuredMedia.fileType', MEDIA_FILE_TYPES.Video] },
              then: '$thumbnailMedia.fileUrl',
              else: '$featuredMedia.fileUrl',
            },
          },
        },
      },
    ]);

    if (articleMeta[0]?.image) {
      articleMeta[0].image = articleMeta[0].image.replace(
        '/uploads',
        (process.env.CLIENT_URL || '') + '/uploads'
      );
    }

    return res.status(200).send(new ApiResponse(200, articleMeta[0]));
  }
);

export const getQuery = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query.q as string;

    if (!query) {
      throw new ApiError(400, 'Query parameter "q" is required.');
    }

    const articles = await Article.aggregate([
      {
        $match: {
          $text: { $search: query },
        },
      },
      {
        $match: {
          status: ARTICLE_STATUS.Published,
        },
      },
      ...getMediaLookupPipeline,
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          title: '$headline',
          description: 1,
          slug: 1,
          categoryName: '$category.name',
          published: '$lastPublishedDate',
          featuredMedia: {
            fileType: '$featuredMedia.fileType',
            fileUrl: '$featuredMedia.fileUrl',
            name: '$featuredMedia.name',
            thumbnail: {
              $ifNull: ['$thumbnailMedia.fileUrl', null],
            },
          },
        },
      },
    ]);

    return res.status(200).send(new ApiResponse(200, articles));
  }
);