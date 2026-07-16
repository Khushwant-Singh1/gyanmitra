"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Article = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../constants");
const slugify_1 = __importDefault(require("slugify"));
const ArticleSchema = new mongoose_1.Schema({
    headline: {
        type: String,
        required: true,
        index: true,
    },
    slug: {
        type: String,
        trim: true,
        required: true,
        unique: true, // SEO ke liye slug hamesha unique hona chahiye
        index: true,
    },
    description: {
        type: String,
    },
    // --- New SEO Schema Fields ---
    metaTitle: {
        type: String,
        trim: true,
    },
    focusKeyword: {
        type: String,
        lowercase: true,
        trim: true,
    },
    canonicalUrl: {
        type: String,
        trim: true,
    },
    robotsTag: {
        type: String,
        default: 'INDEX, FOLLOW',
    },
    authorName: {
        type: String,
        default: 'Invitations',
    },
    contentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.ArticleContent,
        required: true,
        immutable: true,
    },
    featuredMediaId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.MediaFile,
        required: true,
    },
    contentType: {
        type: String,
        enum: Object.values(constants_1.ARTICLE_CONTENT_TYPES),
        default: constants_1.ARTICLE_CONTENT_TYPES.News,
    },
    status: {
        type: String,
        enum: Object.values(constants_1.ARTICLE_STATUS),
        default: constants_1.ARTICLE_STATUS.Draft,
    },
    tags: {
        type: [String],
        lowercase: true,
        trim: true,
        index: true,
    },
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.Category,
        required: true,
        index: true,
    },
    originalArticleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.Article,
    },
    authorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.User,
        required: true,
    },
    lastPublishedDate: {
        type: Date,
    },
    actions: [
        {
            userId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: constants_1.MODELS.User,
                required: true,
            },
            type: {
                type: String,
                enum: Object.values(constants_1.ARTICLE_ACTIONS),
                required: true,
            },
            timeStamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
}, {
    timestamps: true
});
// Text Index updated to include SEO fields for better internal search
ArticleSchema.index({
    headline: 'text',
    tags: 'text',
    description: 'text',
    metaTitle: 'text',
    focusKeyword: 'text'
});
ArticleSchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = (0, slugify_1.default)(this.headline, constants_1.SLUGIFY_OPTIONS);
    }
    next();
});
exports.Article = (0, mongoose_1.model)(constants_1.MODELS.Article, ArticleSchema);
