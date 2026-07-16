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
exports.getActiveCategories = exports.getActiveSubcategories = exports.getCategory = exports.getCategoriesWithSubcategories = exports.getCategoryPageContent = exports.getAllCategories = exports.deleteCategory = exports.editCategory = exports.EDIT_CATEGORY_REQ_FIELDS = exports.createCategory = exports.CREATE_CATEGORY_REQ_FIELDS = void 0;
const asyncHandler_utils_1 = require("../utils/asyncHandler.utils");
const category_models_1 = require("../models/category.models");
const ApiError_utils_1 = require("../utils/ApiError.utils");
const ApiResponse_utils_1 = require("../utils/ApiResponse.utils");
const mongoose_1 = require("mongoose");
const article_models_1 = require("../models/article.models");
const constants_1 = require("../constants");
exports.CREATE_CATEGORY_REQ_FIELDS = ['name'];
exports.createCategory = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, isActive, parentId, index } = req.body;
    const categoryExists = yield category_models_1.Category.exists({ name: name });
    if (categoryExists)
        throw new ApiError_utils_1.ApiError(409, 'Category name already exists, create with a unique name', ['CATEGORY_NAME_EXISTS']);
    if (parentId) {
        if (!(0, mongoose_1.isValidObjectId)(parentId))
            throw new ApiError_utils_1.ApiError(400, `Invalid parent_id format`, [
                `INVALID_PARENT_ID`,
            ]);
        const parentCategory = yield category_models_1.Category.findById(parentId);
        if (!parentCategory) {
            throw new ApiError_utils_1.ApiError(400, 'Parent ID not found, please provide a correct ID', ['PARENT_ID_NOT_FOUND']);
        }
        if (parentCategory.parentId)
            throw new ApiError_utils_1.ApiError(400, 'Parent is a already sub parent');
    }
    let defaultIndex;
    if (!index) {
        const categoryCount = yield category_models_1.Category.countDocuments();
        defaultIndex = categoryCount + 1;
    }
    else if (index && parentId) {
        defaultIndex = undefined;
    }
    else {
        const categoryIndexExists = yield category_models_1.Category.exists({ index: index });
        if (categoryIndexExists)
            throw new ApiError_utils_1.ApiError(409, 'Category index already exists, provide a unique index', ['CATEGORY_INDEX_EXISTS']);
    }
    const categoryCreated = yield category_models_1.Category.create({
        name: name,
        isActive,
        parentId,
        index: defaultIndex || index,
    });
    const category = yield category_models_1.Category.findById(categoryCreated._id);
    if (!category)
        throw new ApiError_utils_1.ApiError(500, 'Could not create category');
    return res
        .status(201)
        .json(new ApiResponse_utils_1.ApiResponse(201, { category }, 'Category has been successfully created'));
}));
exports.EDIT_CATEGORY_REQ_FIELDS = ['name'];
exports.editCategory = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, isActive, index, parentId } = req.body;
    const categoryId = req.params._id;
    const categoryExists = yield category_models_1.Category.findById(categoryId);
    if (!categoryExists)
        throw new ApiError_utils_1.ApiError(409, 'Category do not exists');
    if (categoryExists.name !== name) {
        const categoryNameExists = yield category_models_1.Category.exists({
            name: name,
        });
        if (categoryNameExists)
            throw new ApiError_utils_1.ApiError(409, 'Category name exists, set a unique name');
    }
    if (parentId) {
        if (!(0, mongoose_1.isValidObjectId)(parentId))
            throw new ApiError_utils_1.ApiError(400, `Invalid parent_id format`, [
                `INVALID_PARENT_ID`,
            ]);
        if (parentId === categoryExists._id.toString())
            throw new ApiError_utils_1.ApiError(402, 'A category cannot be its own parent', [
                'PARENT_ID_SAME_SELF_ID',
            ]);
        const parentCategory = yield category_models_1.Category.findById(parentId);
        if (!parentCategory) {
            throw new ApiError_utils_1.ApiError(404, 'Parent ID not found, please provide a correct ID', ['PARENT_ID_NOT_FOUND']);
        }
        if (parentCategory.parentId)
            throw new ApiError_utils_1.ApiError(400, 'Parent is a already sub parent');
    }
    let defaultIndex;
    if (index && categoryExists.index !== index) {
        const categoryIndexExists = yield category_models_1.Category.exists({ index });
        if (categoryIndexExists)
            throw new ApiError_utils_1.ApiError(409, 'Category index already exists, provide a unique index', ['CATEGORY_INDEX_EXISTS']);
        defaultIndex = index;
    }
    const category = yield category_models_1.Category.findByIdAndUpdate(categoryExists._id, {
        name,
        isActive,
        parentId,
        index: defaultIndex,
    }, { new: true, runValidators: true });
    if (!category)
        throw new ApiError_utils_1.ApiError(404, "Category not updated, ID is incorrect & can't update");
    return res
        .status(200)
        .json(new ApiResponse_utils_1.ApiResponse(200, { category }, 'Category is updated successfully'));
}));
exports.deleteCategory = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryId = req.params._id;
    const categoryIdExists = yield category_models_1.Category.findById(categoryId);
    if (!categoryIdExists)
        throw new ApiError_utils_1.ApiError(409, 'Category do not exists');
    const subcategoryCounts = yield category_models_1.Category.countDocuments({
        parentId: categoryIdExists._id,
    });
    if (subcategoryCounts > 0) {
        throw new ApiError_utils_1.ApiError(400, 'This category contains subcategories. Please delete or reassign the subcategories before proceeding. Alternatively, consider editing the category instead of deleting it.');
    }
    const articleCounts = yield article_models_1.Article.countDocuments({
        categoryId: categoryIdExists._id,
    });
    if (articleCounts > 0) {
        throw new ApiError_utils_1.ApiError(400, 'This category contains articles. Please delete or reassign all articles before attempting to delete the category. Alternatively, consider editing the category instead of deleting it.');
    }
    const category = yield category_models_1.Category.findByIdAndDelete(categoryIdExists._id);
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, category));
}));
exports.getAllCategories = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield category_models_1.Category.aggregate([
        {
            $lookup: {
                from: 'categories',
                localField: 'parentId',
                foreignField: '_id',
                as: 'parentCategory',
            },
        },
        {
            $addFields: {
                parentName: { $arrayElemAt: ['$parentCategory.name', 0] },
                fullName: {
                    $cond: {
                        if: { $gt: [{ $size: '$parentCategory' }, 0] },
                        then: {
                            $concat: [
                                '$name',
                                ' - ',
                                { $arrayElemAt: ['$parentCategory.name', 0] },
                            ],
                        },
                        else: '$name',
                    },
                },
            },
        },
        { $project: { name: '$fullName' } },
        { $sort: { index: 1 } },
    ]);
    if (categories.length < 1)
        throw new ApiError_utils_1.ApiError(400, 'no category founded');
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, categories));
}));
exports.getCategoryPageContent = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryName = req.params._name;
    // Check if the category exists
    const categoryExists = yield category_models_1.Category.exists({
        name: categoryName.replace(/-/g, ' '),
    });
    if (!categoryExists)
        throw new ApiError_utils_1.ApiError(400, 'Category name not found.');
    const categoryId = categoryExists._id;
    const trendingArticles = yield article_models_1.Article.aggregate([
        { $match: { categoryId: categoryId, status: constants_1.ARTICLE_STATUS.Published } },
        {
            $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category',
            },
        },
        { $unwind: '$category' },
        ...constants_1.getMediaLookupPipeline,
        {
            $project: {
                title: '$headline',
                slug: '$slug',
                published: '$lastPublishedDate',
                categoryName: '$category.name',
                featuredMedia: {
                    fileUrl: '$featuredMedia.fileUrl',
                    fileType: '$featuredMedia.fileType',
                    name: '$featuredMedia.name',
                    thumbnail: { $ifNull: ['$thumbnailMedia.fileUrl', null] },
                },
            },
        },
        { $sort: { views: -1 } },
        { $limit: 6 },
    ]);
    // Fetch recent posts sorted by published time, including media files
    const recentPosts = yield article_models_1.Article.aggregate([
        { $match: { categoryId: categoryId, status: constants_1.ARTICLE_STATUS.Published } },
        {
            $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category',
            },
        },
        { $unwind: '$category' },
        ...constants_1.getMediaLookupPipeline,
        {
            $project: {
                title: '$headline',
                slug: '$slug',
                published: '$lastPublishedDate',
                description: '$description',
                categoryName: '$category.name',
                featuredMedia: {
                    fileUrl: '$featuredMedia.fileUrl',
                    fileType: '$featuredMedia.fileType',
                    name: '$featuredMedia.name',
                    thumbnail: { $ifNull: ['$thumbnailMedia.fileUrl', null] },
                },
            },
        },
        { $sort: { lastPublishedDate: -1 } },
        { $limit: 20 },
    ]);
    return res.status(200).json({
        success: true,
        data: {
            trendingArticles,
            recentPosts,
        },
    });
}));
exports.getCategoriesWithSubcategories = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield category_models_1.Category.aggregate([
        {
            $match: { parentId: { $exists: false } },
        },
        { $sort: { index: 1 } },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: 'parentId',
                as: 'subcategories',
            },
        },
        {
            $project: {
                _id: 1,
                name: 1,
                subcategories: {
                    $map: {
                        input: '$subcategories',
                        as: 'subcategory',
                        in: {
                            _id: '$$subcategory._id',
                            name: '$$subcategory.name',
                        },
                    },
                },
            },
        },
    ]);
    return res.status(200).json(new ApiResponse_utils_1.ApiResponse(200, categories));
}));
exports.getCategory = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryId = req.params._id;
    const categoryExits = yield category_models_1.Category.exists({ _id: categoryId });
    if (!categoryExits)
        throw new ApiError_utils_1.ApiError(400, 'Article do not exist.');
    const category = yield category_models_1.Category.aggregate([
        { $match: { _id: categoryExits._id } },
        {
            $project: {
                name: 1,
                parentId: 1,
                isActive: 1,
                index: 1,
            },
        },
    ]);
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, category[0]));
}));
exports.getActiveSubcategories = (0, asyncHandler_utils_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params;
    const subcategories = yield category_models_1.Category.aggregate([
        {
            $match: {
                parentId: new mongoose_1.isValidObjectId(_id) ? req.params._id : _id,
                isActive: true,
            },
        },
        { $sort: { index: 1 } },
        { $project: { name: 1 } },
    ]);
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, subcategories));
}));
exports.getActiveCategories = (0, asyncHandler_utils_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_models_1.Category.aggregate([
        {
            $match: {
                isActive: true,
                parentId: { $in: [null, undefined] }
            }
        },
        { $sort: { index: 1 } },
        { $project: { name: 1 } }
    ]);
    return res.status(200).send(new ApiResponse_utils_1.ApiResponse(200, category));
}));
