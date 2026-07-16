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
exports.getFileDetail = exports.getFiles = exports.deleteFile = exports.uploadFile = void 0;
const fs_1 = require("fs");
const asyncHandler_utils_1 = require("../utils/asyncHandler.utils");
const ApiError_utils_1 = require("../utils/ApiError.utils");
const mediaFile_models_1 = require("../models/mediaFile.models");
const ApiResponse_utils_1 = require("../utils/ApiResponse.utils");
const constants_1 = require("../constants");
const mongoose_1 = require("mongoose");
const path_1 = __importDefault(require("path"));
const article_models_1 = require("../models/article.models");
exports.uploadFile = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let name = req.body.name;
    let thumbnail = req.body.thumbnail;
    console.log('thumbnail1', thumbnail);
    const file = req.file;
    if (!file)
        throw new ApiError_utils_1.ApiError(400, 'No file uploaded');
    if (name && name.length > 100)
        throw new ApiError_utils_1.ApiError(400, 'name length is more then 100, it should be less than or equal 100');
    if (file.mimetype.startsWith('video')) {
        if (!thumbnail || !(0, mongoose_1.isValidObjectId)(thumbnail))
            throw new ApiError_utils_1.ApiError(400, 'with video thumbnail is required.');
        const thumbnailData = yield mediaFile_models_1.MediaFile.findById(thumbnail);
        if (!thumbnailData)
            throw new ApiError_utils_1.ApiError(400, 'media file do not exits');
        thumbnail = thumbnailData._id ? thumbnailData._id : undefined;
    }
    console.log('thumbnail2', thumbnail);
    name = name ? name : file.originalname;
    const mediaFile = yield mediaFile_models_1.MediaFile.create({
        fileSize: file.size,
        fileUrl: '/' + file.path,
        fileType: file.mimetype.split('/')[0],
        format: file.mimetype.split('/')[1],
        uploaderId: req.user._id,
        publicId: file.path.replace('uploads/', ''),
        thumbnail: thumbnail,
        name,
    });
    const mediaFileExits = yield mediaFile_models_1.MediaFile.findById(mediaFile._id);
    if (!mediaFileExits)
        throw new ApiError_utils_1.ApiError(500, 'could not upload media file');
    const uploadedFileData = {
        name: mediaFileExits.name,
        format: mediaFileExits.format,
        fileUrl: mediaFileExits.fileUrl,
        resourceType: mediaFileExits.fileType,
        fileSize: mediaFileExits.fileSize,
        lastModified: mediaFileExits.updatedAt,
        _id: mediaFile._id,
    };
    return res
        .status(201)
        .json(new ApiResponse_utils_1.ApiResponse(200, uploadedFileData, 'successfully uploaded media file'));
}));
exports.deleteFile = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const mediaFileId = req.params._id;
    const mediaFile = yield mediaFile_models_1.MediaFile.findById(mediaFileId);
    if (!mediaFile)
        throw new ApiError_utils_1.ApiError(400, 'Media File ID does not exist');
    const articleExits = yield article_models_1.Article.exists({
        featuredMediaId: mediaFile._id,
    });
    if (articleExits)
        throw new ApiError_utils_1.ApiError(400, 'This media file is being used in an article. Please remove it from the article before deleting.');
    const mainFilePath = path_1.default.join(__dirname, '../../uploads', mediaFile.publicId);
    try {
        yield fs_1.promises.unlink(mainFilePath);
    }
    catch (err) {
        console.error('Main file deletion error:', err);
        throw new ApiError_utils_1.ApiError(500, 'Failed to delete main file');
    }
    // Delete thumbnail if it's a video and has a thumbnail
    if (mediaFile.fileType === constants_1.MEDIA_FILE_TYPES.Video) {
        const thumbnail = yield mediaFile_models_1.MediaFile.findById(mediaFile.thumbnail);
        if (!thumbnail)
            throw new ApiError_utils_1.ApiError(400, 'Thumbnail ID does not exist');
        const thumbPath = path_1.default.join(__dirname, '../../uploads', thumbnail.publicId);
        try {
            yield fs_1.promises.unlink(thumbPath);
        }
        catch (err) {
            console.error('Thumbnail deletion error:', err);
            throw new ApiError_utils_1.ApiError(500, 'Failed to delete thumbnail file');
        }
        yield mediaFile_models_1.MediaFile.findByIdAndDelete(thumbnail._id);
    }
    // Delete main media file record
    yield mediaFile_models_1.MediaFile.findByIdAndDelete(mediaFile._id);
    return res
        .status(200)
        .json(new ApiResponse_utils_1.ApiResponse(200, null, 'Deleted media file successfully'));
}));
exports.getFiles = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const fileTypesAllowed = req.query.file_types || [];
    const limit = parseInt(((_a = req.query.limit) === null || _a === void 0 ? void 0 : _a.toString()) || '10', 10);
    const page = parseInt(((_b = req.query.page) === null || _b === void 0 ? void 0 : _b.toString()) || '1', 10);
    if (limit > 10)
        throw new ApiError_utils_1.ApiError(400, 'article limit is more than maxLimit');
    if (fileTypesAllowed.length === 0)
        throw new ApiError_utils_1.ApiError(400, 'select at least one file options');
    const skip = (page - 1) * limit;
    const files = yield mediaFile_models_1.MediaFile.aggregate([
        { $match: { fileType: { $in: fileTypesAllowed } } },
        {
            $lookup: {
                from: 'mediafiles',
                localField: '_id',
                foreignField: 'thumbnail',
                as: 'thumbnailMatch',
            },
        },
        { $match: { thumbnailMatch: { $size: 0 } } },
        { $sort: { updatedAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
            $project: {
                name: 1,
                format: 1,
                fileUrl: 1,
                resourceType: '$fileType',
                fileSize: 1,
                lastModified: '$updatedAt',
            },
        },
    ]);
    const totalFiles = yield mediaFile_models_1.MediaFile.countDocuments({
        fileType: { $in: fileTypesAllowed },
    });
    const serialNumberedFiles = files.map((file, index) => (Object.assign(Object.assign({}, file), { serialNumber: skip + index + 1 })));
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, {
        currentPage: page,
        totalPages: Math.ceil(totalFiles / limit),
        files: serialNumberedFiles,
    }));
}));
exports.getFileDetail = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const mediaFileId = req.params._id;
    if (!(0, mongoose_1.isValidObjectId)(mediaFileId)) {
        throw new ApiError_utils_1.ApiError(400, 'Invalid media file ID.');
    }
    const mediaExists = yield mediaFile_models_1.MediaFile.exists({ _id: mediaFileId });
    if (!mediaExists)
        throw new ApiError_utils_1.ApiError(400, 'Media file does not exist.');
    const mediaFile = yield mediaFile_models_1.MediaFile.aggregate([
        { $match: { _id: mediaExists._id } },
        {
            $lookup: {
                from: 'mediafiles',
                foreignField: '_id',
                localField: 'thumbnail',
                as: 'thumbnailMedia',
            },
        },
        {
            $unwind: {
                path: '$thumbnailMedia',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                fileUrl: '$fileUrl',
                fileType: '$fileType',
                name: '$name',
                thumbnail: {
                    $ifNull: ['$thumbnailMedia.fileUrl', null],
                },
            },
        },
    ]);
    if (!mediaFile[0])
        throw new ApiError_utils_1.ApiError(400, 'Media file does not exist.');
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, mediaFile[0]));
}));
