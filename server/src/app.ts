import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import path from "path";
import { getNewsSitemap, getImageSitemap } from './controllers/sitemap.controller';

const app = express();
console.log("🟢 app.ts file loaded");

// 1. Trust proxy (Cloudflare, Nginx, Docker)
app.set('trust proxy', true);

// 2. Sitemap ko Limiter se PEHLE rakhein taaki ye kabhi block na ho
app.get('/sitemap-news.xml', getNewsSitemap);
app.get('/sitemap-images.xml', getImageSitemap);

// 3. Helper to get real visitor IP behind Cloudflare & Reverse Proxies
const getClientIp = (req: express.Request): string => {
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp) return Array.isArray(cfIp) ? cfIp[0] : cfIp;
  
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    const ips = (Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor).split(',');
    return ips[0].trim();
  }

  return req.ip || req.socket.remoteAddress || '127.0.0.1';
};

// 4. Rate Limiter Configuration (per client IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000, // Generous limit per real user IP
  keyGenerator: (req) => getClientIp(req),
  validate: { xForwardedForHeader: false, trustProxy: false },
  handler: (req, res) => {
    res.status(429).json({
      statusCode: 429,
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    });
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// 5. Baki Middleware aur Routes
app.use(limiter as any);
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use(
  express.static(
    path.join(process.cwd(), "public")
  )
);
app.use('/uploads', express.static('uploads'));
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  res.redirect(`https://gyanmitranews.com/uploads/${filename}`);
});
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ connection: 'success' });
});

import UserRouter from './routes/user.routers';
import AuthRouter from './routes/auth.routers';
import CategoryRouter from './routes/category.routes';
import ArticleRouter from './routes/article.routes';
import MediaFileRouter from './routes/mediaFile.routers';
import CommentRouter from './routes/comment.routers';
import MetaRouter from './routes/meta.routers';
import ArticleRequestRouter from './routes/articleRequest.routers';
import { ApiResponse } from './utils/ApiResponse.utils';
import CompetitionRouter from './routes/competition.routes'; //

import multer from 'multer';
import { ApiError } from './utils/ApiError.utils';

app.use('/api/competition', CompetitionRouter); //
app.use('/api/categories', CategoryRouter);
app.use('/api/comments', CommentRouter);
app.use('/api/users', UserRouter);
app.use('/api/auth', AuthRouter);
app.use('/api/articles', ArticleRouter);
app.use('/api/article-requests', ArticleRequestRouter);
app.use('/api/media', MediaFileRouter);
app.use('/api/meta', MetaRouter);
app.use('/meta', MetaRouter);
app.get('/api/time', (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, { time: new Date().toISOString() }));
});

// Global Error Handler Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      statusCode: err.statusCode,
    });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
      statusCode: 400,
    });
  }

  console.error('Unhandled Error:', err);
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500,
  });
});

console.log("🟢 app.ts fully executed");

export { app };
