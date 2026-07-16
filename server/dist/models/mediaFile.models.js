"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaFile = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../constants");
const mediaFileSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 100,
    },
    publicId: {
        type: String,
        required: true,
    },
    format: {
        type: String,
        required: true,
        lowercase: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        enum: Object.values(constants_1.MEDIA_FILE_TYPES),
        required: true,
    },
    uploaderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.User,
        required: true,
    },
    fileSize: {
        type: Number,
        required: true,
    },
    thumbnail: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.MediaFile,
    },
}, { timestamps: true });
exports.MediaFile = (0, mongoose_1.model)(constants_1.MODELS.MediaFile, mediaFileSchema);
