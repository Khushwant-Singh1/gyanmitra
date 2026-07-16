import { NextFunction, Response } from 'express';
import { AsyncHandler } from '../utils/asyncHandler.utils';
import { ArticleApprovalRequest } from '../models/articleApprovalRequest.models';
import { ApiError } from '../utils/ApiError.utils';
import { notifyGoogleIndexing } from '../utils/googleIndexer'; // Google indexing import kiya
import {
  ADMINISTRATOR_ROLE,
  REQUEST_REASON,
  REQUEST_STATUS,
} from '../constants';
import type { IJwtRequest } from '../middlewares/auth.middlewares';
import { User } from '../models/user.models';
import { ApiResponse } from '../utils/ApiResponse.utils';
import { Article } from '../models/article.models';
import type { ObjectId } from 'mongoose';

// 1. Create Request: Editor dwara bheji gayi request
export const createRequest = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const { message, receiver_id } = req.body;
    const articleId = req.params._articleId;

    if (req.user.role !== ADMINISTRATOR_ROLE.Editor)
      throw new ApiError(403, 'Only editors can make article approval requests');

    // FIX: trim() ek function hai, brackets () zaruri hain
    if (message && message.trim().length > 400)
      throw new ApiError(400, 'Message must be less than 400 characters');

    const article = await Article.findById(articleId);
    if (!article) throw new ApiError(404, 'Article not found');

    const receiverExits = await User.exists(receiver_id);
    if (!receiverExits) throw new ApiError(400, 'Receiver does not exist');

    const reason = article.originalArticleId ? REQUEST_REASON.Update : REQUEST_REASON.Publish;

    const articleRequest = await ArticleApprovalRequest.create({
      message,
      reason,
      articleId,
      receiverId: receiver_id,
      requesterId: req.user.id,
      status: REQUEST_STATUS.Pending,
    });

    res.status(201).json(new ApiResponse(200, articleRequest));
  }
);

// 2. setApprove: Request approve karna aur Google ko notify karna
export const setApprove = AsyncHandler(
  async (req: IJwtRequest, res: Response) => {
    const articleRequestId = req.params._id;

    const articleRequest = await ArticleApprovalRequest.findById(articleRequestId);
    if (!articleRequest) throw new ApiError(404, 'Request not found');

    if (articleRequest.status !== REQUEST_STATUS.Pending)
        throw new ApiError(400, 'This request has already been processed');

    // Request status update
    articleRequest.status = REQUEST_STATUS.Approved;
    await articleRequest.save();

    // Article live karna
    const article = await Article.findByIdAndUpdate(
      articleRequest.articleId, 
      { isPublished: true, status: 'published' }, 
      { new: true }
    );

    if (article) {
      // Indexing API trigger
      const liveUrl = `https://gyanmitranews.com/articles/${article.slug}`;
      notifyGoogleIndexing(liveUrl).catch(err => console.error("Indexing Error:", err));
    }

    res.status(200).json(new ApiResponse(200, articleRequest, "Article approved and indexing requested!"));
  }
);

// 3. getReceivedRequests: Receiver ko milne wali requests
export const getReceivedRequests = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const requests = await ArticleApprovalRequest.aggregate([
      { $match: { receiverId: req.user._id, status: REQUEST_STATUS.Pending } },
      {
        $lookup: {
          from: 'users',
          localField: 'requesterId',
          foreignField: '_id',
          as: 'requester',
        },
      },
      { $unwind: { path: '$requester', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          message: 1,
          reason: 1,
          articleId: 1,
          status: 1,
          rejectedMessage: 1,
          createdAt: 1,
          user: { $concat: ['$requester.firstName', ' ', '$requester.lastName'] },
        },
      },
    ]);

    res.status(200).json(new ApiResponse(200, requests));
  }
);

// 4. getMyRequests: User dwara bheji gayi apni requests
export const getMyRequests = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const requests = await ArticleApprovalRequest.aggregate([
      { $match: { requesterId: req.user._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'receiverId',
          foreignField: '_id',
          as: 'receiverUser',
        },
      },
      { $unwind: { path: '$receiverUser', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          message: 1,
          reason: 1,
          articleId: 1,
          status: 1,
          rejectedMessage: 1,
          createdAt: 1,
          receiverName: { $concat: ['$receiverUser.firstName', ' ', '$receiverUser.lastName'] },
        },
      },
    ]);

    res.status(200).json(new ApiResponse(200, requests));
  }
);

// 5. setReject: Request ko reject karna
export const setReject = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const { rejectedMessage } = req.body;
    const articleRequestId = req.params._id;

    // FIX: trim() brackets fix
    if (rejectedMessage && rejectedMessage.trim().length > 400)
      throw new ApiError(400, 'Rejected message must be less than 400 characters');

    const articleRequest = await ArticleApprovalRequest.findById(articleRequestId);
    if (!articleRequest) throw new ApiError(404, 'Article request not found');

    if (articleRequest.status !== REQUEST_STATUS.Pending)
      throw new ApiError(400, 'Article request is not pending');

    articleRequest.status = REQUEST_STATUS.Rejected;
    articleRequest.rejectedMessage = rejectedMessage;
    await articleRequest.save();

    res.status(200).json(new ApiResponse(200, articleRequest));
  }
);

// 6. deleteRequest: Request delete karna
export const deleteRequest = AsyncHandler(
  async (req: IJwtRequest, res: Response, next: NextFunction) => {
    const articleRequestId = req.params._id;

    const articleRequest = await ArticleApprovalRequest.findById(articleRequestId);
    if (!articleRequest) throw new ApiError(404, 'Article request not found');

    if (articleRequest.requesterId.toString() !== (req.user.id as string)) {
      throw new ApiError(403, 'You are not authorized to delete this request');
    }

    await articleRequest.deleteOne();
    res.status(200).json(new ApiResponse(200, null, 'Article request deleted successfully'));
  }
);