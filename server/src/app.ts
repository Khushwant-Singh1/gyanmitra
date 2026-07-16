import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import path from "path";
import { getNewsSitemap, getImageSitemap } from './controllers/sitemap.controller';

const app = express();
console.log("🟢 app.ts file loaded");

// 1. Nginx proxy se aane wali real IP ko trust karne ke liye (ZAROORI)
app.set('trust proxy', 1);

// 2. Sitemap ko Limiter se PEHLE rakhein taaki ye kabhi block na ho
app.get('/sitemap-news.xml', getNewsSitemap);
app.get('/sitemap-images.xml', getImageSitemap);

// 3. Rate Limiter Configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Limit thodi badha di hai testing ke liye
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// 4. Baki Middleware aur Routes
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

app.use('/api/competition', CompetitionRouter); //
app.use('/api/categories', CategoryRouter);
app.use('/api/comments', CommentRouter);
app.use('/api/users', UserRouter);
app.use('/api/auth', AuthRouter);
app.use('/api/articles', ArticleRouter);
app.use('/api/article-requests', ArticleRequestRouter);
app.use('/api/media', MediaFileRouter);
app.use('/api/meta', MetaRouter);
app.get('/api/time', (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, { time: new Date().toISOString() }));
});

console.log("🟢 app.ts fully executed");

export { app };
