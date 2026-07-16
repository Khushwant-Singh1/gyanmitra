import { NextFunction, Response } from 'express';
import { IJwtRequest } from '../middlewares/auth.middlewares';
import { AsyncHandler } from '../utils/asyncHandler.utils';
import { Comment } from '../models/comment.models';
import { ApiError } from '../utils/ApiError.utils';
import { ApiResponse } from '../utils/ApiResponse.utils';
import { Article } from '../models/article.models';

export const postComment = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const message = req.body?.message;
    const articleId = req.params._id;

    const articleExits = await Article.findById(articleId);

    if (!articleExits) throw new ApiError(400, 'article do not exits');

    const numbersOfPost = (
      await Comment.find({
        userId: req.user._id,
        articleId: articleExits._id,
      })
    ).length;
    if (numbersOfPost > 3)
      throw new ApiError(
        400,
        'user already made many comment in a single article.'
      );

    if (message.length > 300 && message.length < 10)
      throw new ApiError(
        400,
        'message cant be lengthier than 300 and smaller 10.'
      );

    const comment = await Comment.create({
      message,
      userId: req.user._id,
      articleId: articleExits._id,
    });

    const commentExits = await Comment.findById(comment._id);
    if (!commentExits)
      throw new ApiError(500, 'could not able to post comment');

    res.status(200).send(new ApiResponse(200, commentExits));
  }
);

export const editComment = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const message = req.body?.message;
    const commentId = req.params._id;

    const comment = await Comment.findOneAndUpdate(
      {
        _id: commentId,
        userId: req.user._id,
      },
      { message: message }
    );

    if (message.length > 300 && message.length < 10)
      throw new ApiError(
        400,
        'message cant be lengthier than 300 and smaller 10.'
      );

    if (!comment)
      new ApiError(
        400,
        'could not able to update comment, may be article invalid'
      );

    return res.status(200).send(new ApiResponse(200, comment));
  }
);

export const deleteComment = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const commentId = req.params._id;

    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) new ApiError(400, 'could not able to delete comment');
    return res.status(200).send(new ApiResponse(200, comment));
  }
);

export const getAllComments = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const comments = await Comment.aggregate([
      { $sort: { updatedAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user' } },
      {
        $project: {
          message: 1,
          userName: {
            firstName: '$user.firstName',
            lastName: '$user.lastName',
          },
          email: '$user.email',
          updatedAt: 1,
        },
      },
    ]);

    return res.status(200).send(new ApiResponse(200, comments));
  }
);
