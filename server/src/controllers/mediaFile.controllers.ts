import { NextFunction, Response } from 'express';
import { promises as fs } from 'fs';
import { IJwtRequest } from '../middlewares/auth.middlewares';
import { AsyncHandler } from '../utils/asyncHandler.utils';
import { ApiError } from '../utils/ApiError.utils';
import { MediaFile } from '../models/mediaFile.models';
import { ApiResponse } from '../utils/ApiResponse.utils';
import { MEDIA_FILE_TYPES } from '../constants';
import { isValidObjectId, type ObjectId } from 'mongoose';
import path from 'path';
import { Article } from '../models/article.models';

export const uploadFile = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    let name = req.body.name;
    let thumbnail: any = req.body.thumbnail;
    console.log('thumbnail1', thumbnail);

    const file = req.file;
    if (!file) throw new ApiError(400, 'No file uploaded');

    if (name && name.length > 100)
      throw new ApiError(
        400,
        'name length is more then 100, it should be less than or equal 100'
      );

    if (file.mimetype.startsWith('video')) {
      if (!thumbnail || !isValidObjectId(thumbnail))
        throw new ApiError(400, 'with video thumbnail is required.');

      const thumbnailData = await MediaFile.findById(thumbnail);
      if (!thumbnailData) throw new ApiError(400, 'media file do not exits');
      thumbnail = thumbnailData._id ? thumbnailData._id : undefined;
    }

    console.log('thumbnail2', thumbnail);

    name = name ? name : file.originalname;

    const storedFileName = path.basename(file.path.replace(/\\/g, '/'));
    const fileUrl = `/uploads/${storedFileName}`;

    const mediaFile = await MediaFile.create({
      fileSize: file.size,
      fileUrl,
      fileType: file.mimetype.split('/')[0] as MEDIA_FILE_TYPES,
      format: file.mimetype.split('/')[1],
      uploaderId: req.user._id,
      publicId: storedFileName,
      thumbnail: thumbnail,
      name,
    });

    const mediaFileExits = await MediaFile.findById(mediaFile._id);

    if (!mediaFileExits) throw new ApiError(500, 'could not upload media file');

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
      .json(
        new ApiResponse(
          200,
          uploadedFileData,
          'successfully uploaded media file'
        )
      );
  }
);

export const deleteFile = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const mediaFileId = req.params._id;

    const mediaFile = await MediaFile.findById(mediaFileId);
    if (!mediaFile) throw new ApiError(400, 'Media File ID does not exist');

    const articleExits = await Article.exists({
      featuredMediaId: mediaFile._id,
    });

    if (articleExits)
      throw new ApiError(
        400,
        'This media file is being used in an article. Please remove it from the article before deleting.'
      );

    const mainFilePath = path.join(
      __dirname,
      '../../uploads',
      path.basename(mediaFile.publicId)
    );

    try {
      await fs.unlink(mainFilePath);
    } catch (err) {
      console.error('Main file deletion error:', err);
      throw new ApiError(500, 'Failed to delete main file');
    }

    // Delete thumbnail if it's a video and has a thumbnail
    if (mediaFile.fileType === MEDIA_FILE_TYPES.Video) {
      const thumbnail = await MediaFile.findById(mediaFile.thumbnail);
      if (!thumbnail) throw new ApiError(400, 'Thumbnail ID does not exist');

      const thumbPath = path.join(
        __dirname,
        '../../uploads',
        path.basename(thumbnail.publicId)
      );

      try {
        await fs.unlink(thumbPath);
      } catch (err) {
        console.error('Thumbnail deletion error:', err);
        throw new ApiError(500, 'Failed to delete thumbnail file');
      }

      await MediaFile.findByIdAndDelete(thumbnail._id);
    }

    // Delete main media file record
    await MediaFile.findByIdAndDelete(mediaFile._id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Deleted media file successfully'));
  }
);

export const getFiles = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const fileTypesAllowed = (req.query.file_types as MEDIA_FILE_TYPES[]) || [];
    const limit = parseInt(req.query.limit?.toString() || '10', 10);
    const page = parseInt(req.query.page?.toString() || '1', 10);

    if (limit > 10)
      throw new ApiError(400, 'article limit is more than maxLimit');
    if (fileTypesAllowed.length === 0)
      throw new ApiError(400, 'select at least one file options');

    const skip = (page - 1) * limit;

    const files = await MediaFile.aggregate([
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

    const totalFiles = await MediaFile.countDocuments({
      fileType: { $in: fileTypesAllowed },
    });

    const serialNumberedFiles = files.map((file, index) => ({
      ...file,
      serialNumber: skip + index + 1,
    }));

    return res.status(200).send(
      new ApiResponse(200, {
        currentPage: page,
        totalPages: Math.ceil(totalFiles / limit),
        files: serialNumberedFiles,
      })
    );
  }
);

export const getFileDetail = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const mediaFileId = req.params._id;

    if (!isValidObjectId(mediaFileId)) {
      throw new ApiError(400, 'Invalid media file ID.');
    }
    const mediaExists = await MediaFile.exists({ _id: mediaFileId });
    if (!mediaExists) throw new ApiError(400, 'Media file does not exist.');

    const mediaFile = await MediaFile.aggregate([
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

    if (!mediaFile[0]) throw new ApiError(400, 'Media file does not exist.');

    return res.status(200).send(new ApiResponse(200, mediaFile[0]));
  }
);
