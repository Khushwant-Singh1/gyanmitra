import { Response, Request } from 'express';
import { Article } from '../models/article.models';
import { AsyncHandler } from '../utils/asyncHandler.utils';
import { ARTICLE_STATUS } from '../constants';

const escapeXml = (str: string | null | undefined): string => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};

/**
 * Validates whether an article slug is of sufficient quality for SEO / Sitemaps.
 * Filters out numeric dummy slugs (e.g. '14', '67-2', '9-1876-32'),
 * keyword-stuffed spam slugs (e.g. 'viral-tags-english-...'), and thin/placeholder slugs.
 */
export const isValidSitemapSlug = (slug: string | null | undefined): boolean => {
  if (!slug || typeof slug !== 'string') return false;
  const trimmed = slug.trim().toLowerCase();

  // 1. Must be at least 3 characters
  if (trimmed.length < 3) return false;

  // 2. Reject pure numeric or digit-dash/underscore patterns (e.g., '14', '67-2', '9-1876-32')
  if (/^[\d_-]+$/.test(trimmed)) return false;

  // 3. Reject keyword-stuffed spam slugs (e.g., containing 'viral-tags' or 'viral-tag')
  if (/viral-tags?/i.test(trimmed)) return false;

  // 4. Reject abnormally long keyword-stuffed slugs (e.g., > 140 chars)
  if (trimmed.length > 140) return false;

  // 5. Reject generic dummy/placeholder slugs
  const dummySlugs = new Set(['test', 'demo', 'sample', 'untitled', 'dummy', 'article', 'articles']);
  if (dummySlugs.has(trimmed)) return false;

  return true;
};

export const getAllArticlesSitemap = AsyncHandler(async (req: Request, res: Response) => {
  const articles = await Article.find({
    status: ARTICLE_STATUS.Published,
    $or: [
      { robotsTag: { $exists: false } },
      { robotsTag: { $not: /noindex/i } },
    ],
  })
    .select('slug robotsTag updatedAt lastPublishedDate createdAt')
    .sort({ lastPublishedDate: -1, createdAt: -1 })
    .limit(50000);

  const staticPages = [
    { loc: 'https://gyanmitranews.com/', priority: '1.0', changefreq: 'hourly' },
    { loc: 'https://gyanmitranews.com/about-us', priority: '0.8', changefreq: 'monthly' },
    { loc: 'https://gyanmitranews.com/contact-us', priority: '0.8', changefreq: 'monthly' },
    { loc: 'https://gyanmitranews.com/privacy-policy', priority: '0.8', changefreq: 'monthly' },
    { loc: 'https://gyanmitranews.com/terms-and-conditions', priority: '0.8', changefreq: 'monthly' },
    { loc: 'https://gyanmitranews.com/disclaimer', priority: '0.8', changefreq: 'monthly' },
    { loc: 'https://gyanmitranews.com/competitions', priority: '0.8', changefreq: 'daily' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // 1. Static Pages
  staticPages.forEach((page) => {
    xml += `
  <url>
    <loc>${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  // 2. All Published Articles (filtered for SEO quality & noindex exclusion)
  articles.forEach((article) => {
    if (article.robotsTag && /noindex/i.test(article.robotsTag)) return;
    if (!isValidSitemapSlug(article.slug)) return;

    const slug = encodeURIComponent(article.slug || '');
    if (!slug) return;
    const articleDate = article.updatedAt || article.lastPublishedDate || article.createdAt || new Date();
    const date = articleDate.toISOString();

    xml += `
  <url>
    <loc>https://gyanmitranews.com/articles/${slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  });

  xml += `\n</urlset>`;

  res.set('Content-Type', 'text/xml; charset=utf-8');
  res.set('Content-Length', Buffer.byteLength(xml).toString());

  return res.status(200).send(xml);
});

export const getNewsSitemap = AsyncHandler(async (req: Request, res: Response) => {
  // 1. Aaj se theek 48 ghante pehle ka time calculate karein
  const twoDaysAgo = new Date();
  twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

  // 2. Sirf wahi articles uthayein jo pichle 2 din mein publish hue hain (excluding noindex)
  let articles = await Article.find({
    status: ARTICLE_STATUS.Published,
    $or: [
      { lastPublishedDate: { $gte: twoDaysAgo } },
      { createdAt: { $gte: twoDaysAgo } },
    ],
    robotsTag: { $not: /noindex/i },
  })
    .select('headline slug robotsTag lastPublishedDate createdAt')
    .sort({ lastPublishedDate: -1, createdAt: -1 })
    .limit(1000);

  // 3. Agar pichle 2 din mein koi post nahi hai, toh latest published articles uthayein
  if (articles.length === 0) {
    articles = await Article.find({
      status: ARTICLE_STATUS.Published,
      robotsTag: { $not: /noindex/i },
    })
      .select('headline slug robotsTag lastPublishedDate createdAt')
      .sort({ lastPublishedDate: -1, createdAt: -1 })
      .limit(50);
  }

  // Filter out any invalid / dummy slugs
  const validArticles = articles.filter(
    (a) => (!a.robotsTag || !/noindex/i.test(a.robotsTag)) && isValidSitemapSlug(a.slug)
  );

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

  if (validArticles.length === 0) {
    xml += `
  <url>
    <loc>https://gyanmitranews.com/</loc>
    <news:news>
      <news:publication>
        <news:name>Gyanmitra News</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${new Date().toISOString()}</news:publication_date>
      <news:title>Gyanmitra News</news:title>
    </news:news>
  </url>`;
  } else {
    validArticles.forEach((article) => {
      const title = escapeXml(article.headline || 'Gyanmitra News');
      const articleDate = article.lastPublishedDate || article.createdAt || new Date();
      const date = articleDate.toISOString();
      const slug = encodeURIComponent(article.slug || '');

      xml += `
  <url>
    <loc>https://gyanmitranews.com/articles/${slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Gyanmitra News</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${date}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
    });
  }

  xml += `\n</urlset>`;

  res.set('Content-Type', 'text/xml; charset=utf-8');
  res.set('Content-Length', Buffer.byteLength(xml).toString());
  
  return res.status(200).send(xml);
});

export const getImageSitemap = AsyncHandler(async (req: Request, res: Response) => {
  const articles = await Article.find({
    status: ARTICLE_STATUS.Published,
    robotsTag: { $not: /noindex/i },
  })
    .select('headline slug robotsTag featuredMediaId createdAt')
    .populate('featuredMediaId', 'fileUrl name')
    .sort({ createdAt: -1 })
    .limit(1000);

  const validArticles = articles.filter(
    (a) => (!a.robotsTag || !/noindex/i.test(a.robotsTag)) && isValidSitemapSlug(a.slug)
  );

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  if (validArticles.length === 0) {
    xml += `
  <url>
    <loc>https://gyanmitranews.com/</loc>
  </url>`;
  } else {
    validArticles.forEach((article: any) => {
      const slug = encodeURIComponent(article.slug || '');
      const urlLoc = `https://gyanmitranews.com/articles/${slug}`;
      const title = escapeXml(article.headline || 'Gyanmitra News Image');

      const media = article.featuredMediaId;
      if (media && media.fileUrl) {
        const imageUrl = escapeXml(media.fileUrl);
        xml += `
  <url>
    <loc>${urlLoc}</loc>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${title}</image:title>
    </image:image>
  </url>`;
      }
    });
  }

  xml += `\n</urlset>`;

  res.set('Content-Type', 'text/xml; charset=utf-8');
  res.set('Content-Length', Buffer.byteLength(xml).toString());
  
  return res.status(200).send(xml);
});
