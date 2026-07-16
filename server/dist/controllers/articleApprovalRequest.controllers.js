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
exports.deleteRequest = exports.setReject = exports.getMyRequests = exports.getReceivedRequests = exports.setApprove = exports.createRequest = void 0;
const asyncHandler_utils_1 = require("../utils/asyncHandler.utils");
const articleApprovalRequest_models_1 = require("../models/articleApprovalRequest.models");
const ApiError_utils_1 = require("../utils/ApiError.utils");
const googleIndexer_1 = require("../utils/googleIndexer"); // Google indexing import kiya
const constants_1 = require("../constants");
const user_models_1 = require("../models/user.models");
const ApiResponse_utils_1 = require("../utils/ApiResponse.utils");
const article_models_1 = require("../models/article.models");
// 1. Create Request: Editor dwara bheji gayi request
exports.createRequest = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { message, receiver_id } = req.body;
    const articleId = req.params._articleId;
    if (req.user.role !== constants_1.ADMINISTRATOR_ROLE.Editor)
        throw new ApiError_utils_1.ApiError(403, 'Only editors can make article approval requests');
    // FIX: trim() ek function hai, brackets () zaruri hain
    if (message && message.trim().length > 400)
        throw new ApiError_utils_1.ApiError(400, 'Message must be less than 400 characters');
    const article = yield article_models_1.Article.findById(articleId);
    if (!article)
        throw new ApiError_utils_1.ApiError(404, 'Article not found');
    const receiverExits = yield user_models_1.User.exists(receiver_id);
    if (!receiverExits)
        throw new ApiError_utils_1.ApiError(400, 'Receiver does not exist');
    const reason = article.originalArticleId ? constants_1.REQUEST_REASON.Update : constants_1.REQUEST_REASON.Publish;
    const articleRequest = yield articleApprovalRequest_models_1.ArticleApprovalRequest.create({
        message,
        reason,
        articleId,
        receiverId: receiver_id,
        requesterId: req.user.id,
        status: constants_1.REQUEST_STATUS.Pending,
    });
    res.status(201).json(new ApiResponse_utils_1.ApiResponse(200, articleRequest));
}));
// 2. setApprove: Request approve karna aur Google ko notify karna
exports.setApprove = (0, asyncHandler_utils_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const articleRequestId = req.params._id;
    const articleRequest = yield articleApprovalRequest_models_1.ArticleApprovalRequest.findById(articleRequestId);
    if (!articleRequest)
        throw new ApiError_utils_1.ApiError(404, 'Request not found');
    if (articleRequest.status !== constants_1.REQUEST_STATUS.Pending)
        throw new ApiError_utils_1.ApiError(400, 'This request has already been processed');
    // Request status update
    articleRequest.status = constants_1.REQUEST_STATUS.Approved;
    yield articleRequest.save();
    // Article live karna
    const article = yield article_models_1.Article.findByIdAndUpdate(articleRequest.articleId, { isPublished: true, status: 'published' }, { new: true });
    if (article) {
        // Indexing API trigger
        const liveUrl = `https://gyanmitranews.com/articles/${article.slug}`;
        (0, googleIndexer_1.notifyGoogleIndexing)(liveUrl).catch(err => console.error("Indexing Error:", err));
    }
    res.status(200).json(new ApiResponse_utils_1.ApiResponse(200, articleRequest, "Article approved and indexing requested!"));
}));
// 3. getReceivedRequests: Receiver ko milne wali requests
exports.getReceivedRequests = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const requests = yield articleApprovalRequest_models_1.ArticleApprovalRequest.aggregate([
        { $match: { receiverId: req.user._id, status: constants_1.REQUEST_STATUS.Pending } },
        {
            $lookup: {
                from: 'users',
                localField: 'requesterId',
                foreignField: '_id',
                as: 'requester',
            },
        },
        { $unwind: { path: '$requester', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                message: 1,
                reason: 1,
                articleId: 1,
                status: 1,
                rejectedMessage: 1,
                createdAt: 1,
                user: { $concat: ['$requester.firstName', ' ', '$requester.lastName'] },
            },
        },
    ]);
    res.status(200).json(new ApiResponse_utils_1.ApiResponse(200, requests));
}));
// 4. getMyRequests: User dwara bheji gayi apni requests
exports.getMyRequests = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const requests = yield articleApprovalRequest_models_1.ArticleApprovalRequest.aggregate([
        { $match: { requesterId: req.user._id } },
        {
            $lookup: {
                from: 'users',
                localField: 'receiverId',
                foreignField: '_id',
                as: 'receiverUser',
            },
        },
        { $unwind: { path: '$receiverUser', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                message: 1,
                reason: 1,
                articleId: 1,
                status: 1,
                rejectedMessage: 1,
                createdAt: 1,
                receiverName: { $concat: ['$receiverUser.firstName', ' ', '$receiverUser.lastName'] },
            },
        },
    ]);
    res.status(200).json(new ApiResponse_utils_1.ApiResponse(200, requests));
}));
// 5. setReject: Request ko reject karna
exports.setReject = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { rejectedMessage } = req.body;
    const articleRequestId = req.params._id;
    // FIX: trim() brackets fix
    if (rejectedMessage && rejectedMessage.trim().length > 400)
        throw new ApiError_utils_1.ApiError(400, 'Rejected message must be less than 400 characters');
    const articleRequest = yield articleApprovalRequest_models_1.ArticleApprovalRequest.findById(articleRequestId);
    if (!articleRequest)
        throw new ApiError_utils_1.ApiError(404, 'Article request not found');
    if (articleRequest.status !== constants_1.REQUEST_STATUS.Pending)
        throw new ApiError_utils_1.ApiError(400, 'Article request is not pending');
    articleRequest.status = constants_1.REQUEST_STATUS.Rejected;
    articleRequest.rejectedMessage = rejectedMessage;
    yield articleRequest.save();
    res.status(200).json(new ApiResponse_utils_1.ApiResponse(200, articleRequest));
}));
// 6. deleteRequest: Request delete karna
exports.deleteRequest = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const articleRequestId = req.params._id;
    const articleRequest = yield articleApprovalRequest_models_1.ArticleApprovalRequest.findById(articleRequestId);
    if (!articleRequest)
        throw new ApiError_utils_1.ApiError(404, 'Article request not found');
    if (articleRequest.requesterId.toString() !== req.user.id) {
        throw new ApiError_utils_1.ApiError(403, 'You are not authorized to delete this request');
    }
    yield articleRequest.deleteOne();
    res.status(200).json(new ApiResponse_utils_1.ApiResponse(200, null, 'Article request deleted successfully'));
}));
