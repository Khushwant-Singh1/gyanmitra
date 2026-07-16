"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = exports.CommentSchema = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../constants");
exports.CommentSchema = new mongoose_1.Schema({
    message: {
        type: String,
        maxlength: 300,
        required: true,
        minlength: 10,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.User,
        required: true,
        immutable: true,
    },
    articleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.Article,
        required: true,
        immutable: true,
    },
}, { timestamps: true });
exports.Comment = (0, mongoose_1.model)(constants_1.MODELS.Comment, exports.CommentSchema);
