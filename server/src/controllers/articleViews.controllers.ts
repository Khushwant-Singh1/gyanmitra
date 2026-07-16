import { ArticleView } from '../models/articleView.models';
import { Types } from 'mongoose';

export const trackArticleView = async (
  articleId: Types.ObjectId,
  userId?: Types.ObjectId,
  ipAddress?: string
) => {
  try {
    const halfHour = 30 * 60 * 1000;

    const existingView = await ArticleView.findOne({
      articleId,
      $or: [{ userId }, { ipAddress }],
      createdAt: { $gte: new Date(Date.now() - halfHour) },
    });

    if (!existingView) {
      await ArticleView.create({
        articleId: articleId,
        userId: userId,
        ipAddress,
      });
    }
    return true;
  } catch (error) {
    return false;
  }
};
