"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleApprovalRequest = exports.ArticleApprovalRequestSchema = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../constants");
exports.ArticleApprovalRequestSchema = new mongoose_1.Schema({
    message: {
        type: String,
        trim: true,
        maxlength: 400,
    },
    reason: {
        type: String,
        enum: Object.values(constants_1.REQUEST_REASON),
        required: true,
    },
    articleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.Article,
        required: true,
    },
    receiverId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.User,
        required: true,
    },
    requesterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.User,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(constants_1.REQUEST_STATUS),
        default: constants_1.REQUEST_STATUS.Pending,
    },
    rejectedMessage: {
        type: String,
        trim: true,
        maxlength: 400,
    },
}, { timestamps: true });
exports.ArticleApprovalRequest = (0, mongoose_1.model)(constants_1.MODELS.ArticleRequest, exports.ArticleApprovalRequestSchema);
