import { Article } from '../models/article.models';
import { ARTICLE_STATUS, ARTICLE_ACTIONS } from '../constants';
import { notifyGoogleIndexing } from '../utils/googleIndexer';
import { Types } from 'mongoose';

// Map of active timer timeouts keyed by articleId string
const activeTimers = new Map<string, NodeJS.Timeout>();

export const publishScheduledArticle = async (articleId: string) => {
  try {
    cancelArticleTimer(articleId);
    const now = new Date();
    const article = await Article.findById(articleId);

    if (!article || article.status !== ARTICLE_STATUS.Scheduled) {
      return;
    }

    article.status = ARTICLE_STATUS.Published;
    article.lastPublishedDate = article.scheduledPublishDate || now;
    article.scheduledPublishDate = undefined;
    article.actions.push({
      userId: article.authorId,
      type: ARTICLE_ACTIONS.Publish,
      timeStamp: now,
    });

    await article.save();
    console.log(`✅ [Event Scheduler] Published scheduled article: "${article.headline}" (Slug: ${article.slug})`);

    const articleUrl = `${process.env.CLIENT_URL || 'https://gyanmitranews.com'}/articles/${article.slug}`;
    notifyGoogleIndexing(articleUrl).catch((err) => {
      console.error(`❌ [Google Indexing] Failed for scheduled article "${article.slug}":`, err);
    });
  } catch (error) {
    console.error(`❌ [Event Scheduler] Error publishing article ${articleId}:`, error);
  }
};

export const scheduleArticleTimer = (articleId: string, scheduledPublishDate: Date) => {
  cancelArticleTimer(articleId);

  const delay = Math.max(0, new Date(scheduledPublishDate).getTime() - Date.now());

  if (delay <= 0) {
    // Publish immediately if date is in past/now
    publishScheduledArticle(articleId);
  } else {
    // Exact-millisecond target timer
    const timeout = setTimeout(() => {
      publishScheduledArticle(articleId);
    }, delay);

    activeTimers.set(articleId, timeout);
    console.log(`⏰ [Event Scheduler] Set timer for article ${articleId} in ${(delay / 1000).toFixed(1)}s (at ${new Date(scheduledPublishDate).toISOString()})`);
  }
};

export const cancelArticleTimer = (articleId: string) => {
  const existingTimer = activeTimers.get(articleId);
  if (existingTimer) {
    clearTimeout(existingTimer);
    activeTimers.delete(articleId);
    console.log(`🚫 [Event Scheduler] Cancelled timer for article ${articleId}`);
  }
};

export const initScheduler = async () => {
  try {
    // Clear all in-memory timers
    for (const [id, timeout] of activeTimers.entries()) {
      clearTimeout(timeout);
    }
    activeTimers.clear();

    const scheduledArticles = await Article.find({
      status: ARTICLE_STATUS.Scheduled,
    }).select('_id scheduledPublishDate headline');

    console.log(`⚡ [Event Scheduler] Initializing... Found ${scheduledArticles.length} scheduled articles.`);

    for (const article of scheduledArticles) {
      if (article.scheduledPublishDate) {
        scheduleArticleTimer(article._id.toString(), article.scheduledPublishDate);
      }
    }
  } catch (error) {
    console.error('❌ [Event Scheduler] Initialization error:', error);
  }
};
