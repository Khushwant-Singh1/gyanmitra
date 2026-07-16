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
exports.getAllComments = exports.deleteComment = exports.editComment = exports.postComment = void 0;
const asyncHandler_utils_1 = require("../utils/asyncHandler.utils");
const comment_models_1 = require("../models/comment.models");
const ApiError_utils_1 = require("../utils/ApiError.utils");
const ApiResponse_utils_1 = require("../utils/ApiResponse.utils");
const article_models_1 = require("../models/article.models");
exports.postComment = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const message = (_a = req.body) === null || _a === void 0 ? void 0 : _a.message;
    const articleId = req.params._id;
    const articleExits = yield article_models_1.Article.findById(articleId);
    if (!articleExits)
        throw new ApiError_utils_1.ApiError(400, 'article do not exits');
    const numbersOfPost = (yield comment_models_1.Comment.find({
        userId: req.user._id,
        articleId: articleExits._id,
    })).length;
    if (numbersOfPost > 3)
        throw new ApiError_utils_1.ApiError(400, 'user already made many comment in a single article.');
    if (message.length > 300 && message.length < 10)
        throw new ApiError_utils_1.ApiError(400, 'message cant be lengthier than 300 and smaller 10.');
    const comment = yield comment_models_1.Comment.create({
        message,
        userId: req.user._id,
        articleId: articleExits._id,
    });
    const commentExits = yield comment_models_1.Comment.findById(comment._id);
    if (!commentExits)
        throw new ApiError_utils_1.ApiError(500, 'could not able to post comment');
    res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, commentExits));
}));
exports.editComment = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const message = (_a = req.body) === null || _a === void 0 ? void 0 : _a.message;
    const commentId = req.params._id;
    const comment = yield comment_models_1.Comment.findOneAndUpdate({
        _id: commentId,
        userId: req.user._id,
    }, { message: message });
    if (message.length > 300 && message.length < 10)
        throw new ApiError_utils_1.ApiError(400, 'message cant be lengthier than 300 and smaller 10.');
    if (!comment)
        new ApiError_utils_1.ApiError(400, 'could not able to update comment, may be article invalid');
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, comment));
}));
exports.deleteComment = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const commentId = req.params._id;
    const comment = yield comment_models_1.Comment.findByIdAndDelete(commentId);
    if (!comment)
        new ApiError_utils_1.ApiError(400, 'could not able to delete comment');
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, comment));
}));
exports.getAllComments = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const comments = yield comment_models_1.Comment.aggregate([
        { $sort: { updatedAt: -1 } },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
            },
        },
        { $unwind: { path: '$user' } },
        {
            $project: {
                message: 1,
                userName: {
                    firstName: '$user.firstName',
                    lastName: '$user.lastName',
                },
                email: '$user.email',
                updatedAt: 1,
            },
        },
    ]);
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, comments));
}));
