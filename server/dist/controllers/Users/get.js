"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersName = exports.getAllUsers = exports.getDashboardContent = exports.getCurrentUserSession = exports.getHomePageContent = void 0;
const asyncHandler_utils_1 = require("../../utils/asyncHandler.utils");
const ApiError_utils_1 = require("../../utils/ApiError.utils");
const constants_1 = require("../../constants");
const ApiResponse_utils_1 = require("../../utils/ApiResponse.utils");
const user_models_1 = require("../../models/user.models");
const article_models_1 = require("../../models/article.models");
const comment_models_1 = require("../../models/comment.models");
const articleView_models_1 = require("../../models/articleView.models");
exports.getHomePageContent = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const todayStart = new Date();
    todayStart.setDate(todayStart.getDate() - 1);
    const articles = yield article_models_1.Article.aggregate([
        {
            $match: {
                status: constants_1.ARTICLE_STATUS.Published,
            },
        },
        {
            $facet: {
                recentPublished: [
                    { $match: { contentType: constants_1.ARTICLE_CONTENT_TYPES.News } },
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
                    ...constants_1.getMediaLookupPipeline,
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
                            contentType: constants_1.ARTICLE_CONTENT_TYPES.News,
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
                    ...constants_1.getMediaLookupPipeline,
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
                    { $match: { contentType: constants_1.ARTICLE_CONTENT_TYPES.Article } },
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
                    { $limit: 14 },
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
                    ...constants_1.getMediaLookupPipeline,
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
        throw new ApiError_utils_1.ApiError(500, 'no article founded');
    const recentPublishedSlugs = articles[0].recentPublished
        ? [articles[0].recentPublished.slug]
        : [];
    const todayPublishedSlugs = articles[0].todayPublished.map((article) => article.slug);
    const articlePublishedSlugs = articles[0].articlePublished.map((article) => article.slug);
    const excludeSlugs = new Set([
        ...recentPublishedSlugs,
        ...todayPublishedSlugs,
        ...articlePublishedSlugs,
    ]);
    const filteredMixedArticles = articles[0].mixedArticles.filter((article) => !excludeSlugs.has(article.slug));
    const filteredTodayPublished = articles[0].todayPublished.filter((article) => !recentPublishedSlugs.includes(article.slug));
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, {
        recentPublished: articles[0].recentPublished,
        todayPublished: filteredTodayPublished,
        articlePublished: articles[0].articlePublished,
        mixedArticles: filteredMixedArticles,
    }));
}));
exports.getCurrentUserSession = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, { user: req.user }));
}));
exports.getDashboardContent = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const aggregationResult = yield article_models_1.Article.aggregate([
        {
            $facet: {
                topArticles: [
                    { $match: { status: constants_1.ARTICLE_STATUS.Published } },
                    {
                        $lookup: {
                            from: 'article_views',
                            localField: '_id',
                            foreignField: 'articleId',
                            as: 'views',
                        },
                    },
                    { $addFields: { views: { $size: '$views' } } },
                    { $sort: { views: -1 } },
                    { $limit: 5 },
                    ...constants_1.getMediaLookupPipeline,
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
                            _id: 1,
                            headline: 1,
                            views: { $size: '$views' },
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
                ],
                recentArticles: [
                    { $match: { status: constants_1.ARTICLE_STATUS.Published } },
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
                    ...constants_1.getMediaLookupPipeline,
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
                ],
            },
        },
    ]);
    // Aggregate recent comments (adjust the limit here)
    const recentComments = yield comment_models_1.Comment.aggregate([
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
        {
            $unwind: '$userDetails',
        },
        {
            $project: {
                _id: 1,
                message: 1,
                createdAt: 1,
                firstName: '$userDetails.firstName', // Access firstName directly
                lastName: '$userDetails.lastName', // Access lastName directly
            },
        },
    ]);
    const recentUsers = yield user_models_1.User.aggregate([
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
    ]);
    const totalViews = yield articleView_models_1.ArticleView.countDocuments();
    const topArticles = aggregationResult[0].topArticles;
    const recentArticles = aggregationResult[0].recentArticles;
    return res.status(200).json(new ApiResponse_utils_1.ApiResponse(200, {
        totalViews,
        topArticles,
        recentArticles,
        recentComments,
        recentUsers,
    }));
}));
exports.getAllUsers = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_models_1.User.aggregate([
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
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, users));
}));
exports.getUsersName = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const roleQuery = req.query.role;
    let usersRolesFilter = [
        constants_1.USER_ROLE.Admin,
        constants_1.USER_ROLE.Editor,
        constants_1.USER_ROLE.Owner,
    ];
    if (roleQuery) {
        usersRolesFilter = roleQuery.split(',');
        const isValid = usersRolesFilter.every((role) => Object.values(constants_1.USER_ROLE).includes(role));
        if (!isValid) {
            throw new ApiError_utils_1.ApiError(400, 'Invalid role(s) provided');
        }
    }
    const users = yield user_models_1.User.aggregate([
        { $match: { role: { $in: usersRolesFilter } } },
        { $project: { name: { $concat: ['$firstName', ' ', '$lastName'] } } },
    ]);
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, users));
}));
