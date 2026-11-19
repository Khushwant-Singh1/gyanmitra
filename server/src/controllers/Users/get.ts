import { NextFunction, Request, Response } from 'express';
import { AsyncHandler } from '../../utils/asyncHandler.utils';
import { ApiError } from '../../utils/ApiError.utils';
import {
  ARTICLE_CONTENT_TYPES,
  ARTICLE_STATUS,
  getMediaLookupPipeline,
  USER_ROLE,
} from '../../constants';
import { ApiResponse } from '../../utils/ApiResponse.utils';
import { User } from '../../models/user.models';
import { Article } from '../../models/article.models';
import {
  IJwtRequest,
  ITryJwtRequest,
} from '../../middlewares/auth.middlewares';
import { Comment } from '../../models/comment.models';
import { ArticleView } from '../../models/articleView.models';

export const getHomePageContent = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const todayStart = new Date();
    todayStart.setDate(todayStart.getDate() - 1);

    const articles = await Article.aggregate([
      {
        $match: {
          status: ARTICLE_STATUS.Published,
        },
      },
      {
        $facet: {
          recentPublished: [
            { $match: { contentType: ARTICLE_CONTENT_TYPES.News } },
            { $sort: { lastPublishedDate: -1 } },
            { $limit: 1 },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category',
              },
            },
            {
              $unwind: { path: '$category', preserveNullAndEmptyArrays: true },
            },
            ...getMediaLookupPipeline,
            {
              $project: {
                headline: true,
                slug: true,
                category: '$category.name',
                uploaded: '$lastPublishedDate',
                description: true,
                featuredMedia: {
                  url: '$featuredMedia.fileUrl',
                  fileType: '$featuredMedia.fileType',
                  name: '$featuredMedia.name',
                  thumbnail: {
                    $ifNull: ['$thumbnailMedia.fileUrl', null],
                  },
                },
              },
            },
          ],
          todayPublished: [
            {
              $match: {
                contentType: ARTICLE_CONTENT_TYPES.News,
                lastPublishedDate: {
                  $gte: todayStart,
                },
              },
            },
            { $sort: { lastPublishedDate: -1 } },
            { $limit: 3 },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category',
              },
            },
            {
              $unwind: { path: '$category', preserveNullAndEmptyArrays: true },
            },
            ...getMediaLookupPipeline,
            {
              $project: {
                headline: true,
                slug: true,
                category: '$category.name',
                uploaded: '$lastPublishedDate',
                featuredMedia: {
                  name: '$featuredMedia.name',
                  url: '$featuredMedia.fileUrl',
                  fileType: '$featuredMedia.fileType',
                  thumbnail: {
                    $ifNull: ['$thumbnailMedia.fileUrl', null],
                  },
                },
              },
            },
          ],
          articlePublished: [
            { $match: { contentType: ARTICLE_CONTENT_TYPES.Article } },
            { $sort: { lastPublishedDate: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category',
              },
            },
            {
              $unwind: { path: '$category', preserveNullAndEmptyArrays: true },
            },
            {
              $lookup: {
                from: 'mediafiles',
                localField: 'featuredMediaId',
                foreignField: '_id',
                as: 'featuredMedia',
              },
            },
            {
              $unwind: {
                path: '$featuredMedia',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'mediafiles',
                foreignField: '_id',
                localField: 'featuredMedia.thumbnail',
                as: 'thumbnailMedia',
              },
            },
            {
              $unwind: {
                path: '$thumbnailMedia',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                headline: true,
                slug: true,
                category: '$category.name',
                uploaded: '$lastPublishedDate',
                featuredMedia: {
                  url: '$featuredMedia.fileUrl',
                  name: '$featuredMedia.name',
                  fileType: '$featuredMedia.fileType',
                  thumbnail: {
                    $ifNull: ['$thumbnailMedia.fileUrl', null],
                  },
                },
              },
            },
          ],
          mixedArticles: [
            { $sort: { lastPublishedDate: -1 } },
            { $limit: 48 },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category',
              },
            },
            {
              $unwind: { path: '$category', preserveNullAndEmptyArrays: true },
            },
            ...getMediaLookupPipeline,
            {
              $project: {
                headline: true,
                slug: true,
                description: true,
                category: '$category.name',
                uploaded: '$lastPublishedDate',
                featuredMedia: {
                  url: '$featuredMedia.fileUrl',
                  fileType: '$featuredMedia.fileType',
                  name: '$featuredMedia.name',
                  thumbnail: {
                    $ifNull: ['$thumbnailMedia.fileUrl', null],
                  },
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          recentPublished: { $arrayElemAt: ['$recentPublished', 0] }, // Get the first element
          todayPublished: '$todayPublished',
          articlePublished: '$articlePublished',
          mixedArticles: '$mixedArticles',
        },
      },
    ]);

    if (!Array.isArray(articles) || articles.length === 0)
      throw new ApiError(500, 'no article founded');

    const recentPublishedSlugs = articles[0].recentPublished
      ? [articles[0].recentPublished.slug]
      : [];

    const todayPublishedSlugs = articles[0].todayPublished.map(
      (article: any) => article.slug
    );

    const articlePublishedSlugs = articles[0].articlePublished.map(
      (article: any) => article.slug
    );

    const excludeSlugs = new Set([
      ...recentPublishedSlugs,
      ...todayPublishedSlugs,
      ...articlePublishedSlugs,
    ]);

    const filteredMixedArticles = articles[0].mixedArticles.filter(
      (article: any) => !excludeSlugs.has(article.slug)
    );

    const filteredTodayPublished = articles[0].todayPublished.filter(
      (article: any) => !recentPublishedSlugs.includes(article.slug)
    );

    return res.status(200).send(
      new ApiResponse(200, {
        recentPublished: articles[0].recentPublished,
        todayPublished: filteredTodayPublished,
        articlePublished: articles[0].articlePublished,
        mixedArticles: filteredMixedArticles,
      })
    );
  }
);

export const getCurrentUserSession = AsyncHandler(
  async (req: ITryJwtRequest, res: Response, next: NextFunction) => {
    res.status(200).send(new ApiResponse(200, { user: req.user }));
  }
);

export const getDashboardContent = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const [topArticles, recentArticles, recentComments, recentUsers, totalViews] =
      await Promise.all([
        // Top 5 published articles ranked by view count (grouped by articleId from ArticleView)
        ArticleView.aggregate([
          {
            $group: {
              _id: '$articleId',
              views: { $sum: 1 },
            },
          },
          { $sort: { views: -1 } },
          { $limit: 20 },
          {
            $lookup: {
              from: 'articles',
              localField: '_id',
              foreignField: '_id',
              as: 'article',
            },
          },
          { $unwind: '$article' },
          { $match: { 'article.status': ARTICLE_STATUS.Published } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'mediafiles',
              localField: 'article.featuredMediaId',
              foreignField: '_id',
              as: 'featuredMedia',
            },
          },
          {
            $unwind: {
              path: '$featuredMedia',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'mediafiles',
              localField: 'featuredMedia.thumbnail',
              foreignField: '_id',
              as: 'thumbnailMedia',
            },
          },
          {
            $unwind: {
              path: '$thumbnailMedia',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: '$article._id',
              headline: '$article.headline',
              views: 1,
              published: '$article.lastPublishedDate',
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
        ]),

        // 5 most recently published articles
        Article.aggregate([
          { $match: { status: ARTICLE_STATUS.Published } },
          { $sort: { lastPublishedDate: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'users',
              localField: 'authorId',
              foreignField: '_id',
              as: 'authorDetails',
            },
          },
          ...getMediaLookupPipeline,
          { $unwind: '$authorDetails' },
          {
            $project: {
              _id: 1,
              headline: 1,
              firstName: '$authorDetails.firstName',
              lastName: '$authorDetails.lastName',
              published: '$lastPublishedDate',
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
        ]),

        // Recent comments
        Comment.aggregate([
          { $sort: { createdAt: -1 } },
          { $limit: 6 },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'userDetails',
            },
          },
          { $unwind: '$userDetails' },
          {
            $project: {
              _id: 1,
              message: 1,
              createdAt: 1,
              firstName: '$userDetails.firstName',
              lastName: '$userDetails.lastName',
            },
          },
        ]),

        // Recent users
        User.aggregate([
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $project: {
              _id: 1,
              firstName: '$firstName',
              lastName: '$lastName',
              createdAt: 1,
              role: 1,
              email: 1,
            },
          },
        ]),

        // Total views count
        ArticleView.countDocuments(),
      ]);

    return res.status(200).json(
      new ApiResponse(200, {
        totalViews,
        topArticles,
        recentArticles,
        recentComments,
        recentUsers,
      })
    );
  }
);

export const getAllUsers = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'inviterId',
          foreignField: '_id',
          as: 'inviter',
        },
      },
      {
        $project: {
          userName: { firstName: '$firstName', lastName: '$lastName' },
          createdAt: 1,
          email: 1,
          emailVerified: '$isEmailVerified',
          role: 1,
          inviter: '$inviter.email',
        },
      },
    ]);
    return res.status(200).send(new ApiResponse(200, users));
  }
);

export const getUsersName = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const roleQuery = req.query.role as string | undefined;

    let usersRolesFilter: USER_ROLE[] = [
      USER_ROLE.Admin,
      USER_ROLE.Editor,
      USER_ROLE.Owner,
      USER_ROLE.Reporter,
    ];

    if (roleQuery) {
      usersRolesFilter = roleQuery.split(',') as USER_ROLE[];

      const isValid = usersRolesFilter.every((role) =>
        Object.values(USER_ROLE).includes(role)
      );

      if (!isValid) {
        throw new ApiError(400, 'Invalid role(s) provided');
      }
    }
    const users = await User.aggregate([
      { $match: { role: { $in: usersRolesFilter } } },
      { $project: { name: { $concat: ['$firstName', ' ', '$lastName'] } } },
    ]);
    return res.status(200).send(new ApiResponse(200, users));
  }
);
