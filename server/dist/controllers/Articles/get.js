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
exports.getQuery = exports.getArticleMetaData = exports.getDraftArticle = exports.getDraftArticles = exports.getAllArticles = exports.getArticlePageContent = exports.getIsSlugExits = void 0;
const asyncHandler_utils_1 = require("../../utils/asyncHandler.utils");
const article_models_1 = require("../../models/article.models");
const ApiError_utils_1 = require("../../utils/ApiError.utils");
const ApiResponse_utils_1 = require("../../utils/ApiResponse.utils");
const constants_1 = require("../../constants");
const articleViews_controllers_1 = require("../articleViews.controllers");
exports.getIsSlugExits = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params._slug;
    const articleExists = yield article_models_1.Article.exists({
        slug: slug,
        originalArticleId: { $exists: false },
    });
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, {
        articleExists: !!articleExists,
        _id: (articleExists === null || articleExists === void 0 ? void 0 : articleExists._id) || null,
    }));
}));
exports.getArticlePageContent = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const slug = req.params._slug;
    const articleId = yield article_models_1.Article.findOne({ slug });
    if (!articleId)
        throw new ApiError_utils_1.ApiError(401, 'Article slug does not exist in articles, invalid slug');
    (0, articleViews_controllers_1.trackArticleView)(articleId._id, (_a = req.user) === null || _a === void 0 ? void 0 : _a._id, req.ip);
    const articlePageData = yield article_models_1.Article.aggregate([
        {
            $match: {
                status: constants_1.ARTICLE_STATUS.Published,
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
                    ...constants_1.getMediaLookupPipeline,
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
                    ...constants_1.getMediaLookupPipeline,
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
                    ...constants_1.getMediaLookupPipeline,
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
    return res.status(200).json(new ApiResponse_utils_1.ApiResponse(200, articlePageData[0]));
}));
exports.getAllArticles = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const articles = yield article_models_1.Article.aggregate([
        {
            $match: {
                status: { $in: [constants_1.ARTICLE_STATUS.Private, constants_1.ARTICLE_STATUS.Published] },
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
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, articles));
}));
exports.getDraftArticles = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const articles = yield article_models_1.Article.aggregate([
        {
            $match: {
                authorId: req.user._id,
                status: constants_1.ARTICLE_STATUS.Draft,
            },
        },
        { $sort: { updatedAt: -1 } },
        ...constants_1.getMediaLookupPipeline,
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
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, articles));
}));
exports.getDraftArticle = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const articleId = req.params._id;
    const article = yield article_models_1.Article.findOne({
        _id: articleId,
    });
    if (!article)
        throw new ApiError_utils_1.ApiError(400, 'Article does not exits.');
    const articleDetails = yield article_models_1.Article.aggregate([
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
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, articleDetails[0]));
}));
exports.getArticleMetaData = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const articleSlug = req.params._slug;
    const articleExits = yield article_models_1.Article.findOne({ slug: articleSlug });
    if (!articleExits)
        throw new ApiError_utils_1.ApiError(400, 'Article do not exits.');
    const articleMeta = yield article_models_1.Article.aggregate([
        {
            $match: { _id: articleExits._id },
        },
        ...constants_1.getMediaLookupPipeline,
        {
            $project: {
                title: { $ifNull: ['$metaTitle', '$headline'] },
                description: 1,
                image: {
                    $cond: {
                        if: { $eq: ['$featuredMedia.fileType', constants_1.MEDIA_FILE_TYPES.Video] },
                        then: '$thumbnailMedia.fileUrl',
                        else: '$featuredMedia.fileUrl',
                    },
                },
            },
        },
    ]);
    if ((_a = articleMeta[0]) === null || _a === void 0 ? void 0 : _a.image) {
        articleMeta[0].image = articleMeta[0].image.replace('/uploads', (process.env.CLIENT_URL || '') + '/uploads');
    }
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, articleMeta[0]));
}));
exports.getQuery = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query.q;
    if (!query) {
        throw new ApiError_utils_1.ApiError(400, 'Query parameter "q" is required.');
    }
    const articles = yield article_models_1.Article.aggregate([
        {
            $match: {
                $text: { $search: query },
            },
        },
        {
            $match: {
                status: constants_1.ARTICLE_STATUS.Published,
            },
        },
        ...constants_1.getMediaLookupPipeline,
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
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, articles));
}));
