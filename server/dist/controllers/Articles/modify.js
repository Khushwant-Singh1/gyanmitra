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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportForArticle = exports.remove = exports.setPrivate = exports.makeClone = exports.update = exports.publish = exports.edit = exports.create = exports.CREATE_ARTICLE_REQ_FIELDS = void 0;
const asyncHandler_utils_1 = require("../../utils/asyncHandler.utils");
const mongoose_1 = require("mongoose");
const article_models_1 = require("../../models/article.models");
const category_models_1 = require("../../models/category.models");
const ApiError_utils_1 = require("../../utils/ApiError.utils");
const mediaFile_models_1 = require("../../models/mediaFile.models");
const ApiResponse_utils_1 = require("../../utils/ApiResponse.utils");
const constants_1 = require("../../constants");
const slugify_1 = __importDefault(require("slugify"));
const articleContent_models_1 = require("../../models/articleContent.models");
const report_models_1 = require("../../models/report.models");
const articleApprovalRequest_models_1 = require("../../models/articleApprovalRequest.models");
const articleView_models_1 = require("../../models/articleView.models");
const comment_models_1 = require("../../models/comment.models");
const validateCategoryAndMedia = (categoryId, mediaId) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryExists = yield category_models_1.Category.exists({ _id: categoryId });
    if (!categoryExists)
        throw new ApiError_utils_1.ApiError(404, 'Category ID does not exist');
    const mediaExists = yield mediaFile_models_1.MediaFile.exists({ _id: mediaId });
    if (!mediaExists)
        throw new ApiError_utils_1.ApiError(404, 'MediaFile ID does not exist');
});
exports.CREATE_ARTICLE_REQ_FIELDS = [
    'headline',
    'categoryId',
    'featuredMediaId',
    'contentType',
];
exports.create = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { headline, slug, categoryId, featuredMediaId, tags = [], content = '', contentType: content_type, description = '', 
    // Destructure SEO fields from body
    metaTitle, focusKeyword, canonicalUrl, robotsTag, } = req.body;
    if (!Object.values(constants_1.ARTICLE_CONTENT_TYPES).includes(content_type))
        throw new ApiError_utils_1.ApiError(400, `content type can only be possible, ${Object.values(constants_1.ARTICLE_CONTENT_TYPES)}`);
    yield validateCategoryAndMedia(categoryId, featuredMediaId);
    const articleContent = yield articleContent_models_1.ArticleContent.create({ data: content });
    const article = yield article_models_1.Article.create({
        headline,
        slug: slug
            ? (0, slugify_1.default)(slug, constants_1.SLUGIFY_OPTIONS)
            : (0, slugify_1.default)(headline, constants_1.SLUGIFY_OPTIONS),
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
    });
    return res
        .status(201)
        .json(new ApiResponse_utils_1.ApiResponse(201, { article, articleContent }, 'Article created successfully'));
}));
exports.edit = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { headline, categoryId, featuredMediaId, tags, slug, content, description, 
    // Destructure SEO fields
    metaTitle, focusKeyword, canonicalUrl, robotsTag, } = req.body;
    const articleId = req.params._id;
    const article = yield article_models_1.Article.findById(articleId);
    if (!article)
        throw new ApiError_utils_1.ApiError(404, 'Article ID does not exist');
    const userId = req.user._id;
    if (article.status !== constants_1.ARTICLE_STATUS.Draft)
        throw new ApiError_utils_1.ApiError(403, 'Only draft articles can be edited');
    if (article.authorId.toString() !== userId.toString()) {
        throw new ApiError_utils_1.ApiError(401, 'Unauthorized request');
    }
    if (tags && tags.length > 15)
        throw new ApiError_utils_1.ApiError(400, 'Too many tags');
    let slugifySlug = undefined;
    if (slug) {
        if (!(slug === article.slug)) {
            const slugExits = yield article_models_1.Article.exists({ slug: slug });
            if (slugExits)
                throw new ApiError_utils_1.ApiError(200, 'slug already exits');
            slugifySlug = (0, slugify_1.default)(slug, constants_1.SLUGIFY_OPTIONS);
        }
    }
    if (categoryId || featuredMediaId) {
        yield validateCategoryAndMedia(categoryId || article.categoryId, featuredMediaId || article.featuredMediaId);
    }
    let articleContent = yield articleContent_models_1.ArticleContent.findById(article.contentId);
    if (content) {
        articleContent = yield articleContent_models_1.ArticleContent.findByIdAndUpdate(article.contentId, {
            data: content,
        }, { new: true });
    }
    const updatedArticle = yield article_models_1.Article.findByIdAndUpdate(article._id, {
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
    }, { new: true, runValidators: false });
    return res
        .status(200)
        .json(new ApiResponse_utils_1.ApiResponse(200, { article: updatedArticle, articleContent }, 'Article updated successfully'));
}));
exports.publish = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const articleId = req.params._id;
    const { articleApprovalRequestId } = req.body;
    const article = yield article_models_1.Article.findById(articleId);
    if (!article)
        throw new ApiError_utils_1.ApiError(404, 'Article ID does not exist');
    if (article.status === constants_1.ARTICLE_STATUS.Published ||
        article.originalArticleId)
        throw new ApiError_utils_1.ApiError(403, 'Only draft & private articles can be published.');
    if (req.user.role === constants_1.ADMINISTRATOR_ROLE.Editor) {
        throw new ApiError_utils_1.ApiError(400, 'Editor cant publish a draft. Request for publishing.');
    }
    if (articleApprovalRequestId) {
        if (!(0, mongoose_1.isValidObjectId)(articleApprovalRequestId))
            throw new ApiError_utils_1.ApiError(400, 'Invalid article approval request ID');
        const articleApprovalRequest = yield articleApprovalRequest_models_1.ArticleApprovalRequest.findById(articleApprovalRequestId);
        if (!articleApprovalRequest)
            throw new ApiError_utils_1.ApiError(404, 'Article approval request not found');
        articleApprovalRequest.status = constants_1.REQUEST_STATUS.Approved;
        yield articleApprovalRequest.save();
    }
    article.status = constants_1.ARTICLE_STATUS.Published;
    article.lastPublishedDate = new Date(Date.now());
    article.actions.push({
        userId: req.user._id,
        type: constants_1.ARTICLE_ACTIONS.Publish,
        timeStamp: new Date(Date.now()),
    });
    yield article.save();
    return res
        .status(200)
        .json(new ApiResponse_utils_1.ApiResponse(200, article, 'Article published successfully'));
}));
exports.update = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { cloneArticleId } = req.body;
    const article_id = req.params._id;
    const originalArticle = yield article_models_1.Article.findById(article_id);
    if (!originalArticle)
        throw new ApiError_utils_1.ApiError(404, 'Original article ID does not exist');
    const clonedArticle = yield article_models_1.Article.findById(cloneArticleId);
    if (!clonedArticle)
        throw new ApiError_utils_1.ApiError(404, 'Cloned article ID does not exist');
    if (((_a = clonedArticle.originalArticleId) === null || _a === void 0 ? void 0 : _a.toString()) !== article_id)
        throw new ApiError_utils_1.ApiError(400, 'Cloned and original article mismatch');
    const clonedContent = yield articleContent_models_1.ArticleContent.findById(clonedArticle.contentId);
    if (!clonedContent)
        throw new ApiError_utils_1.ApiError(404, 'Cloned article content ID does not exist');
    const updatedArticleContent = yield articleContent_models_1.ArticleContent.findByIdAndUpdate(originalArticle.contentId, { data: clonedContent.data }, { new: true });
    if (!updatedArticleContent)
        throw new ApiError_utils_1.ApiError(404, 'Original article content ID does not exist');
    const updatedArticle = yield article_models_1.Article.findByIdAndUpdate(originalArticle._id, {
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
    }, { new: true, runValidators: true });
    updatedArticle === null || updatedArticle === void 0 ? void 0 : updatedArticle.actions.push({
        userId: req.user._id,
        type: constants_1.ARTICLE_ACTIONS.Update,
        timeStamp: new Date(Date.now()),
    });
    yield (updatedArticle === null || updatedArticle === void 0 ? void 0 : updatedArticle.save());
    yield article_models_1.Article.findByIdAndDelete(clonedArticle._id);
    yield articleContent_models_1.ArticleContent.findByIdAndDelete(clonedArticle.contentId);
    return res
        .status(200)
        .json(new ApiResponse_utils_1.ApiResponse(200, { article: updatedArticle, articleContent: updatedArticleContent }, 'Article updated successfully'));
}));
exports.makeClone = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const articleId = req.params._id;
    const originalArticle = yield article_models_1.Article.findById(articleId);
    if (!originalArticle)
        throw new ApiError_utils_1.ApiError(404, 'Article ID does not exist');
    if (originalArticle.status === constants_1.ARTICLE_STATUS.Draft)
        throw new ApiError_utils_1.ApiError(403, 'Draft article could not be cloned');
    const isCloneExits = yield article_models_1.Article.exists({
        originalArticleId: originalArticle._id,
    });
    if (isCloneExits)
        throw new ApiError_utils_1.ApiError(409, 'Article is already a clone');
    if (originalArticle.originalArticleId)
        throw new ApiError_utils_1.ApiError(403, 'Article is already a clone');
    const originalContent = yield articleContent_models_1.ArticleContent.findById(originalArticle.contentId);
    if (!originalContent)
        throw new ApiError_utils_1.ApiError(404, 'Original article content ID does not exist');
    const cloneArticleContent = yield articleContent_models_1.ArticleContent.create({
        data: originalContent.data,
    });
    if (!cloneArticleContent)
        throw new ApiError_utils_1.ApiError(404, 'Cloned article content could not been created');
    const clonedArticle = yield article_models_1.Article.create({
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
        .json(new ApiResponse_utils_1.ApiResponse(201, { article: clonedArticle }, 'Article cloned successfully'));
}));
exports.setPrivate = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const article_id = req.params._id;
    const article = yield article_models_1.Article.findById(article_id);
    if (!article)
        throw new ApiError_utils_1.ApiError(404, 'Article ID does not exist');
    if (article.status !== constants_1.ARTICLE_STATUS.Published)
        throw new ApiError_utils_1.ApiError(400, 'Article without status published cant be private');
    article.status = constants_1.ARTICLE_STATUS.Private;
    article.actions.push({
        userId: req.user._id,
        type: constants_1.ARTICLE_ACTIONS.Private,
        timeStamp: new Date(Date.now()),
    });
    yield article.save();
    return res
        .status(200)
        .json(new ApiResponse_utils_1.ApiResponse(200, { article }, 'article status has been changed to private successfully'));
}));
exports.remove = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const article_id = req.params._id;
    const article = yield article_models_1.Article.findById(article_id);
    if (!article)
        throw new ApiError_utils_1.ApiError(400, 'article do not exits');
    // Type casting to avoid 'unknown' type error for _id
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (article.status === constants_1.ARTICLE_STATUS.Draft &&
        article.authorId.toString() === (userId === null || userId === void 0 ? void 0 : userId.toString())) {
        // allowing creators to delete their own drafts
    }
    else if (article.status !== constants_1.ARTICLE_STATUS.Draft &&
        req.user.role === constants_1.ADMINISTRATOR_ROLE.Editor) {
        throw new ApiError_utils_1.ApiError(400, 'only admin and owner can delete there article');
    }
    else if (article.status === constants_1.ARTICLE_STATUS.Draft &&
        article.authorId.toString() !== (userId === null || userId === void 0 ? void 0 : userId.toString())) {
        // If it's a draft but the user is NOT the author
        throw new ApiError_utils_1.ApiError(403, 'only creator can delete their draft');
    }
    const deletedArticle = yield article_models_1.Article.findByIdAndDelete(article._id);
    // Clean up related data
    yield articleContent_models_1.ArticleContent.findByIdAndDelete(article.contentId);
    yield articleView_models_1.ArticleView.deleteMany({
        articleId: article._id,
    });
    yield comment_models_1.Comment.deleteMany({
        articleId: article._id,
    });
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, deletedArticle, 'Article deleted successfully'));
}));
exports.reportForArticle = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const comment = req.body.comment;
    const articleId = req.params._id;
    if (comment.length < 50 || comment.length > 250)
        throw new ApiError_utils_1.ApiError(400, 'comment length could not be less 50 and more 250');
    const articleExits = yield article_models_1.Article.exists({ _id: articleId });
    if (!articleExits)
        throw new ApiError_utils_1.ApiError(400, 'Article ID do not exits');
    const reportExits = yield report_models_1.Report.findOne({
        articleId: articleExits._id,
        userId: req.user._id,
    });
    if (reportExits)
        throw new ApiError_utils_1.ApiError(400, 'User with same article can be reported');
    const report = yield report_models_1.Report.create({
        articleId: articleExits._id,
        userId: req.user._id,
        message: comment,
    });
    if (!report)
        throw new ApiError_utils_1.ApiError(500, 'Problem in creating report');
    return res.status(201).json(new ApiResponse_utils_1.ApiResponse(201, { report }));
}));
