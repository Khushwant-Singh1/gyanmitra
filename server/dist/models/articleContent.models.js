"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleContent = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../constants");
const ArticleContentSchema = new mongoose_1.Schema({
    data: {
        type: String,
        trim: true,
    },
});
exports.ArticleContent = (0, mongoose_1.model)(constants_1.MODELS.ArticleContent, ArticleContentSchema);
