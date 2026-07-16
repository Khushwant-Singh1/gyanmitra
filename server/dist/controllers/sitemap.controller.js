"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageSitemap = exports.getNewsSitemap = void 0;
const article_models_1 = require("../models/article.models");
const asyncHandler_utils_1 = require("../utils/asyncHandler.utils");
exports.getNewsSitemap = (0, asyncHandler_utils_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Aaj se theek 48 ghante pehle ka time calculate karein
    const twoDaysAgo = new Date();
    twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);
    // 2. Sirf wahi articles uthayein jo pichle 2 din mein publish hue hain
    const articles = yield article_models_1.Article.find({
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
    }
    else {
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
}));
exports.getImageSitemap = (0, asyncHandler_utils_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch recent articles that have featured media or images
    const articles = yield article_models_1.Article.find({
        status: 'published',
    })
        .select('headline slug featuredMedia')
        .populate('featuredMedia', 'fileUrl name')
        .sort({ createdAt: -1 })
        .limit(1000); // Standard limit
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;
    if (articles.length === 0) {
        xml += `\n  <url>\n    <loc>https://gyanmitranews.com/</loc>\n  </url>`;
    }
    else {
        articles.forEach((article) => {
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
}));
