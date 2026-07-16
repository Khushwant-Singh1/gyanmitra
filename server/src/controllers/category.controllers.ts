import { NextFunction, Request, Response } from 'express';
import { AsyncHandler } from '../utils/asyncHandler.utils';
import { IJwtRequest } from '../middlewares/auth.middlewares';
import { Category } from '../models/category.models';
import { ApiError } from '../utils/ApiError.utils';
import { ApiResponse } from '../utils/ApiResponse.utils';
import { isValidObjectId } from 'mongoose';
import { Article } from '../models/article.models';
import { ARTICLE_STATUS, getMediaLookupPipeline } from '../constants';

interface ICreateCategoryReqFields {
  name: string;
  isActive?: boolean;
  parentId?: string;
  index?: number;
}
export const CREATE_CATEGORY_REQ_FIELDS = ['name'];

export const createCategory = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const { name, isActive, parentId, index }: ICreateCategoryReqFields =
      req.body;

    const categoryExists = await Category.exists({ name: name });

    if (categoryExists)
      throw new ApiError(
        409,
        'Category name already exists, create with a unique name',
        ['CATEGORY_NAME_EXISTS']
      );

    if (parentId) {
      if (!isValidObjectId(parentId))
        throw new ApiError(400, `Invalid parent_id format`, [
          `INVALID_PARENT_ID`,
        ]);

      const parentCategory = await Category.findById(parentId);

      if (!parentCategory) {
        throw new ApiError(
          400,
          'Parent ID not found, please provide a correct ID',
          ['PARENT_ID_NOT_FOUND']
        );
      }
      if (parentCategory.parentId)
        throw new ApiError(400, 'Parent is a already sub parent');
    }

    let defaultIndex;
    if (!index) {
      const categoryCount = await Category.countDocuments();
      defaultIndex = categoryCount + 1;
    } else if (index && parentId) {
      defaultIndex = undefined;
    } else {
      const categoryIndexExists = await Category.exists({ index: index });
      if (categoryIndexExists)
        throw new ApiError(
          409,
          'Category index already exists, provide a unique index',
          ['CATEGORY_INDEX_EXISTS']
        );
    }

    const categoryCreated = await Category.create({
      name: name,
      isActive,
      parentId,
      index: defaultIndex || index,
    });

    const category = await Category.findById(categoryCreated._id);
    if (!category) throw new ApiError(500, 'Could not create category');

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { category },
          'Category has been successfully created'
        )
      );
  }
);

export interface IEditCategoryReqFields {
  name: string;
  isActive?: boolean;
  index?: number;
  parentId?: string;
}

export const EDIT_CATEGORY_REQ_FIELDS = ['name'];

export const editCategory = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const { name, isActive, index, parentId }: IEditCategoryReqFields =
      req.body;
    const categoryId = req.params._id;

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) throw new ApiError(409, 'Category do not exists');

    if (categoryExists.name !== name) {
      const categoryNameExists = await Category.exists({
        name: name,
      });
      if (categoryNameExists)
        throw new ApiError(409, 'Category name exists, set a unique name');
    }

    if (parentId) {
      if (!isValidObjectId(parentId))
        throw new ApiError(400, `Invalid parent_id format`, [
          `INVALID_PARENT_ID`,
        ]);
      if (parentId === categoryExists._id.toString())
        throw new ApiError(402, 'A category cannot be its own parent', [
          'PARENT_ID_SAME_SELF_ID',
        ]);

      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        throw new ApiError(
          404,
          'Parent ID not found, please provide a correct ID',
          ['PARENT_ID_NOT_FOUND']
        );
      }
      if (parentCategory.parentId)
        throw new ApiError(400, 'Parent is a already sub parent');
    }

    let defaultIndex;
    if (index && categoryExists.index !== index) {
      const categoryIndexExists = await Category.exists({ index });
      if (categoryIndexExists)
        throw new ApiError(
          409,
          'Category index already exists, provide a unique index',
          ['CATEGORY_INDEX_EXISTS']
        );
      defaultIndex = index;
    }

    const category = await Category.findByIdAndUpdate(
      categoryExists._id,
      {
        name,
        isActive,
        parentId,
        index: defaultIndex,
      },
      { new: true, runValidators: true }
    );

    if (!category)
      throw new ApiError(
        404,
        "Category not updated, ID is incorrect & can't update"
      );

    return res
      .status(200)
      .json(
        new ApiResponse(200, { category }, 'Category is updated successfully')
      );
  }
);

export const deleteCategory = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params._id;

    const categoryIdExists = await Category.findById(categoryId);
    if (!categoryIdExists) throw new ApiError(409, 'Category do not exists');

    const subcategoryCounts = await Category.countDocuments({
      parentId: categoryIdExists._id,
    });

    if (subcategoryCounts > 0) {
      throw new ApiError(
        400,
        'This category contains subcategories. Please delete or reassign the subcategories before proceeding. Alternatively, consider editing the category instead of deleting it.'
      );
    }

    const articleCounts = await Article.countDocuments({
      categoryId: categoryIdExists._id,
    });

    if (articleCounts > 0) {
      throw new ApiError(
        400,
        'This category contains articles. Please delete or reassign all articles before attempting to delete the category. Alternatively, consider editing the category instead of deleting it.'
      );
    }

    const category = await Category.findByIdAndDelete(categoryIdExists._id);

    return res.status(200).send(new ApiResponse(200, category));
  }
);

export const getAllCategories = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const categories = await Category.aggregate([
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
    if (categories.length < 1) throw new ApiError(400, 'no category founded');
    return res.status(200).send(new ApiResponse(200, categories));
  }
);

export const getCategoryPageContent = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryName = req.params._name;

    // Check if the category exists
    const categoryExists = await Category.exists({
      name: categoryName.replace(/-/g, ' '),
    });
    if (!categoryExists) throw new ApiError(400, 'Category name not found.');

    const categoryId = categoryExists._id;

    const trendingArticles = await Article.aggregate([
      { $match: { categoryId: categoryId, status: ARTICLE_STATUS.Published } },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },

      ...getMediaLookupPipeline,

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
    const recentPosts = await Article.aggregate([
      { $match: { categoryId: categoryId, status: ARTICLE_STATUS.Published } },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },

      ...getMediaLookupPipeline,

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
  }
);

export const getCategoriesWithSubcategories = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await Category.aggregate([
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

    return res.status(200).json(new ApiResponse(200, categories));
  }
);

export const getCategory = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params._id;

    const categoryExits = await Category.exists({ _id: categoryId });

    if (!categoryExits) throw new ApiError(400, 'Article do not exist.');

    const category = await Category.aggregate([
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

    return res.status(200).send(new ApiResponse(200, category[0]));
  }
);

export const getActiveSubcategories = AsyncHandler(
  async (req: Request, res: Response) => {
    const { _id } = req.params;

    const subcategories = await Category.aggregate([
      {
        $match: {
          parentId: new (isValidObjectId as any)(_id) ? (req.params._id as any) : _id,
          isActive: true,
        },
      },
      { $sort: { index: 1 } },
      { $project: { name: 1 } },
    ]);

    return res.status(200).send(new ApiResponse(200, subcategories));
  }
);

export const getActiveCategories = AsyncHandler(
  async (req: Request, res: Response) => {
    const category = await Category.aggregate([
      {
        $match: {
          isActive: true,
          parentId: { $in: [null, undefined] }
        }
      },
      { $sort: { index: 1 } },
      { $project: { name: 1 } }
    ]);

    return res.status(200).send(new ApiResponse(200, category));
  }
);

