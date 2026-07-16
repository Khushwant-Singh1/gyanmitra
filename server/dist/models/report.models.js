"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../constants");
const ReportSchema = new mongoose_1.Schema({
    articleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.Article,
        required: true,
    },
    comment: {
        type: String,
        required: true,
        minlength: 50,
        maxlength: 250,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.User,
        required: true,
    },
}, { timestamps: true });
exports.Report = (0, mongoose_1.model)(constants_1.MODELS.Report, ReportSchema);
