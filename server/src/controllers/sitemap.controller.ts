import { Response, Request } from 'express';
import { Article } from '../models/article.models';
import { AsyncHandler } from '../utils/asyncHandler.utils';

export const getNewsSitemap = AsyncHandler(async (req: Request, res: Response) => {
  // 1. Aaj se theek 48 ghante pehle ka time calculate karein
  const twoDaysAgo = new Date();
  twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

  // 2. Sirf wahi articles uthayein jo pichle 2 din mein publish hue hain
  const articles = await Article.find({
    status: 'published',
    createdAt: { $gte: twoDaysAgo }
  })
  .select('headline slug createdAt') 
  .sort({ createdAt: -1 })
  .limit(1000); // Google News sitemap ki max limit 1000 hoti hai

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

  // 3. Agar pichle 2 din mein koi post nahi hai, toh sitemap khali nahi chhodna chahiye
  // Ek latest article ya home page ka link dena safe rehta hai
  if (articles.length === 0) {
     xml += `
  <url>
    <loc>https://gyanmitranews.com/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`;
  } else {
    articles.forEach((article) => {
      const title = article.headline 
        ? article.headline.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        : 'Gyanmitra News';
      const date = article.createdAt ? article.createdAt.toISOString() : new Date().toISOString();

      xml += `
  <url>
    <loc>https://gyanmitranews.com/articles/${article.slug}</loc>
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
  // Content length browser ko bata deta hai ki data kitna bada hai (loader fix)
  res.set('Content-Length', Buffer.byteLength(xml).toString()); 
  
  return res.status(200).send(xml);
});

export const getImageSitemap = AsyncHandler(async (req: Request, res: Response) => {
  // Fetch recent articles that have featured media or images
  const articles = await Article.find({
    status: 'published',
  })
  .select('headline slug featuredMedia')
  .populate('featuredMedia', 'fileUrl name')
  .sort({ createdAt: -1 })
  .limit(1000); // Standard limit

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  if (articles.length === 0) {
    xml += `\n  <url>\n    <loc>https://gyanmitranews.com/</loc>\n  </url>`;
  } else {
    articles.forEach((article: any) => {
      const urlLoc = `https://gyanmitranews.com/articles/${article.slug}`;
      const title = article.headline 
        ? article.headline.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
        : 'Gyanmitra News Image';

      // If it has featured media and it's an image
      if (article.featuredMedia && article.featuredMedia.fileUrl) {
        const imageUrl = article.featuredMedia.fileUrl.replace(/&/g, '&amp;');
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
