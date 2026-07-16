"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = require("express-rate-limit");
const path_1 = __importDefault(require("path"));
const sitemap_controller_1 = require("./controllers/sitemap.controller");
const app = (0, express_1.default)();
exports.app = app;
console.log("🟢 app.ts file loaded");
// 1. Nginx proxy se aane wali real IP ko trust karne ke liye (ZAROORI)
app.set('trust proxy', 1);
// 2. Sitemap ko Limiter se PEHLE rakhein taaki ye kabhi block na ho
app.get('/sitemap-news.xml', sitemap_controller_1.getNewsSitemap);
app.get('/sitemap-images.xml', sitemap_controller_1.getImageSitemap);
// 3. Rate Limiter Configuration
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 500, // Limit thodi badha di hai testing ke liye
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
// 4. Baki Middleware aur Routes
app.use(limiter);
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express_1.default.json({ limit: '5mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '5mb' }));
app.use(express_1.default.static(path_1.default.join(process.cwd(), "public")));
app.use('/uploads', express_1.default.static('uploads'));
app.use((0, cookie_parser_1.default)());
app.get('/', (req, res) => {
    res.json({ connection: 'success' });
});
const user_routers_1 = __importDefault(require("./routes/user.routers"));
const auth_routers_1 = __importDefault(require("./routes/auth.routers"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const article_routes_1 = __importDefault(require("./routes/article.routes"));
const mediaFile_routers_1 = __importDefault(require("./routes/mediaFile.routers"));
const comment_routers_1 = __importDefault(require("./routes/comment.routers"));
const meta_routers_1 = __importDefault(require("./routes/meta.routers"));
const articleRequest_routers_1 = __importDefault(require("./routes/articleRequest.routers"));
const ApiResponse_utils_1 = require("./utils/ApiResponse.utils");
const competition_routes_1 = __importDefault(require("./routes/competition.routes")); //
app.use('/api/competition', competition_routes_1.default); //
app.use('/api/categories', category_routes_1.default);
app.use('/api/comments', comment_routers_1.default);
app.use('/api/users', user_routers_1.default);
app.use('/api/auth', auth_routers_1.default);
app.use('/api/articles', article_routes_1.default);
app.use('/api/article-requests', articleRequest_routers_1.default);
app.use('/api/media', mediaFile_routers_1.default);
app.use('/api/meta', meta_routers_1.default);
app.get('/api/time', (req, res) => {
    res
        .status(200)
        .json(new ApiResponse_utils_1.ApiResponse(200, { time: new Date().toISOString() }));
});
console.log("🟢 app.ts fully executed");
