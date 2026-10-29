import { Article } from '../models/article.models';
import { ARTICLE_STATUS } from '../constants';
import { isValidSitemapSlug } from '../controllers/sitemap.controller';

/**
 * Automatically inspects the database on server startup for test / low-quality / junk articles
 * such as numeric slugs ('14', '67-2', '9-1876-32'), keyword-stuffed strings ('viral-tags...'),
 * or thin content slugs, and updates them to Draft status with 'NOINDEX, NOFOLLOW'.
 * This prevents Google AdSense & search crawlers from penalizing the site.
 */
export const cleanupJunkArticles = async () => {
  try {
    // 1. Target articles matching known junk patterns
    const junkArticles = await Article.find({
      $or: [
        // Pure numeric or digit-dash slugs (e.g. '14', '67-2', '9-1876-32')
        { slug: { $regex: /^[\d_-]+$/ } },
        // Keyword stuffed slug
        { slug: { $regex: /viral-tags?/i } },
        // Specifically flagged URLs
        { slug: { $in: ['14', '67-2', '9-1876-32'] } },
      ],
    }).select('_id slug headline status robotsTag');

    if (junkArticles.length > 0) {
      console.log(`🧹 [Cleanup] Found ${junkArticles.length} junk/thin articles by slug pattern.`);
      for (const article of junkArticles) {
        console.log(`   👉 ID: ${article._id} | Slug: "${article.slug}" | Status: ${article.status}`);
      }

      const updateResult = await Article.updateMany(
        { _id: { $in: junkArticles.map((a) => a._id) } },
        {
          $set: {
            status: ARTICLE_STATUS.Draft,
            robotsTag: 'NOINDEX, NOFOLLOW',
          },
        }
      );
      console.log(`✅ [Cleanup] De-indexed and un-published ${updateResult.modifiedCount} junk articles.`);
    }

    // 2. Also check any currently Published articles against isValidSitemapSlug
    const publishedArticles = await Article.find({
      status: ARTICLE_STATUS.Published,
    }).select('_id slug headline robotsTag');

    const invalidPublished = publishedArticles.filter(
      (a) => !isValidSitemapSlug(a.slug)
    );

    if (invalidPublished.length > 0) {
      console.log(`🧹 [Cleanup] Found ${invalidPublished.length} additional published articles with invalid slugs:`, invalidPublished.map(a => a.slug));
      const res = await Article.updateMany(
        { _id: { $in: invalidPublished.map((a) => a._id) } },
        {
          $set: {
            status: ARTICLE_STATUS.Draft,
            robotsTag: 'NOINDEX, NOFOLLOW',
          },
        }
      );
      console.log(`✅ [Cleanup] Cleaned up ${res.modifiedCount} additional articles to Draft + NOINDEX.`);
    } else if (junkArticles.length === 0) {
      console.log('🧹 [Cleanup] No junk or numeric-slug articles found in database.');
    }
  } catch (error) {
    console.error('❌ [Cleanup] Error executing junk article cleanup:', error);
  }
};
