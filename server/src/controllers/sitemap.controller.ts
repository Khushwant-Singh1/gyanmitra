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

export const getNewsSitemap = AsyncHandler(async (req: Request, res: Response) => {
  // 1. Aaj se theek 48 ghante pehle ka time calculate karein
  const twoDaysAgo = new Date();
  twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

  // 2. Sirf wahi articles uthayein jo pichle 2 din mein publish hue hain
  let articles = await Article.find({
    status: ARTICLE_STATUS.Published,
    $or: [
      { lastPublishedDate: { $gte: twoDaysAgo } },
      { createdAt: { $gte: twoDaysAgo } },
    ],
  })
    .select('headline slug lastPublishedDate createdAt')
    .sort({ lastPublishedDate: -1, createdAt: -1 })
    .limit(1000);

  // 3. Agar pichle 2 din mein koi post nahi hai, toh latest published articles uthayein
  if (articles.length === 0) {
    articles = await Article.find({
      status: ARTICLE_STATUS.Published,
    })
      .select('headline slug lastPublishedDate createdAt')
      .sort({ lastPublishedDate: -1, createdAt: -1 })
      .limit(50);
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

  if (articles.length === 0) {
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
    articles.forEach((article) => {
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
  })
    .select('headline slug featuredMediaId createdAt')
    .populate('featuredMediaId', 'fileUrl name')
    .sort({ createdAt: -1 })
    .limit(1000);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  if (articles.length === 0) {
    xml += `
  <url>
    <loc>https://gyanmitranews.com/</loc>
  </url>`;
  } else {
    articles.forEach((article: any) => {
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
