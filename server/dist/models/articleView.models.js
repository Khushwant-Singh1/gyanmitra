"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleView = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../constants");
const articleViewSchema = new mongoose_1.Schema({
    articleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.Article,
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.User,
    },
    ipAddress: {
        type: String,
    },
}, { timestamps: true });
exports.ArticleView = (0, mongoose_1.model)(constants_1.MODELS.ArticleView, articleViewSchema);
