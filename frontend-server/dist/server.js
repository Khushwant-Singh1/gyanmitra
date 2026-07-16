"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.static('public'));
const distPath = path_1.default.join(__dirname, '../../client/dist');
const assetsPath = path_1.default.join(distPath, 'assets');
app.use(express_1.default.static(distPath, { index: false }));
if (process.env.NODE_ENV === 'development') {
    app.use('/api', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: process.env.API_URL,
        changeOrigin: true,
    }));
}
// Helper function to get file by extension in the assets folder
const getFileByExtension = (folderPath, extension) => {
    const files = fs_1.default.readdirSync(folderPath);
    return files.find((file) => file.endsWith(extension));
};
app.get('*', async (req, res) => {
    const requestedPath = path_1.default.join(distPath, req.path);
    // Serve static assets if they exist and are not directories
    if (fs_1.default.existsSync(requestedPath) &&
        !fs_1.default.lstatSync(requestedPath).isDirectory() &&
        req.path !== '/index.html') {
        res.sendFile(requestedPath);
        return;
    }
    const slug = req.path;
    const metaData = await fetchMetaData(slug);
    // Get dynamic JS and CSS filenames from the assets folder
    const jsFile = getFileByExtension(assetsPath, '.js');
    const cssFile = getFileByExtension(assetsPath, '.css');
    const html = `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="description" content="${metaData.description || 'Default Description'}" />
      <meta name="keywords" content="gyanmitra, news, education, journalism, knowledge" />
      <meta name="author" content="Gyanmitra" />
      
      <!-- Open Graph Tags -->
      <meta property="og:type" content="website" />
      <meta property="og:title" content="${metaData.title || 'Gyanmitra'}" />
      <meta property="og:description" content="${metaData.description || 'Default Description'}" />
      <meta property="og:image" content="${metaData.image || 'https://gyanmitranews.com/assets/gyanmitra.png'}" />
      <meta property="og:url" content="${metaData.canonical}" />
      <meta property="og:site_name" content="Gyanmitra" />
      <meta property="og:locale" content="hi_IN" />


      <!-- Twitter Card Tags -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${metaData.title || 'Gyanmitra'}" />
      <meta name="twitter:description" content="${metaData.description || 'Default Description'}" />
      <meta name="twitter:image" content="${metaData.image || 'https://gyanmitranews.com/assets/gyanmitra.png'}" />
      <meta name="twitter:url" content="${metaData.canonical}" />

      <!-- Favicon -->
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />

      <link rel="canonical" href="${metaData.canonical}" />

      <title>${metaData.title ? metaData.title + ' - Gyanmitra' : 'Gyanmitra'}</title>

      <script type="module" crossorigin src="/assets/${jsFile}"></script>
      <link rel="stylesheet" crossorigin href="/assets/${cssFile}">
    </head>
    <body>
      <div id="root"></div>
    </body>
    </html>
  `;
    res.send(html);
});
const fetchMetaData = async (slug) => {
    const baseURL = process.env.WEBSITE_URL;
    // Check if the slug corresponds to an article route
    if (slug.startsWith('/articles/')) {
        try {
            // Extract the article ID from the slug
            const articleSlug = slug.split('/articles/')[1];
            // Fetch metadata from your backend API
            const response = await axios_1.default.get(`${process.env.API_URL}/meta/articles/${articleSlug}`);
            if (response.status === 200) {
                const article = response.data.data;
                // Return the dynamically fetched metadata
                return {
                    title: article.title || 'Article',
                    description: article.description || 'Read our latest article.',
                    image: article.image || `${baseURL}/assets/default-article.png`,
                    canonical: `${baseURL}${slug}`,
                };
            }
            else {
                console.error(`Failed to fetch article metadata: ${response.status}`);
            }
        }
        catch (error) {
            console.error('Error fetching article metadata:', error.message);
        }
    }
    // Default metadata for predefined routes
    const metaData = {
        '/': {
            title: 'Home',
            description: `ज्ञानमित्र न्यूज़ - शिक्षा, नवाचार, और नैतिक मूल्यों पर आधारित समाचारों का आपका विश्वसनीय स्रोत। 
                    प्रेरक कहानियाँ, नवीनतम जानकारी, और सूचनाओं के माध्यम से सकारात्मक बदलाव को बढ़ावा देने वाला प्लेटफ़ॉर्म।`,
            image: `${baseURL}/assets/gyanmitra.png`,
            canonical: `${baseURL}/`,
        },
        '/sign-in': {
            title: 'Sign In',
            description: `अपने ज्ञानमित्र खाते में साइन इन करें और शिक्षा, नवाचार, और प्रेरणादायक कहानियों तक पहुँच प्राप्त करें।`,
            image: `${baseURL}/assets/gyanmitra.png`,
            canonical: `${baseURL}/sign-in`,
        },
        '/sign-up': {
            title: 'Sign Up',
            description: `ज्ञानमित्र में शामिल हों और शिक्षा, नवाचार, और प्रेरक सामग्री की हमारी विस्तृत श्रृंखला का हिस्सा बनें।`,
            image: `${baseURL}/assets/gyanmitra.png`,
            canonical: `${baseURL}/sign-up`,
        },
    };
    return (metaData[slug] || {
        description: `ज्ञानमित्र न्यूज़ - शिक्षा, नवाचार, और नैतिक मूल्यों पर आधारित समाचारों का आपका विश्वसनीय स्रोत। 
                    प्रेरक कहानियाँ, नवीनतम जानकारी, और सूचनाओं के माध्यम से सकारात्मक बदलाव को बढ़ावा देने वाला प्लेटफ़ॉर्म।`,
        image: `${baseURL}/assets/gyanmitra.png`,
        canonical: `${baseURL}${slug}`,
    });
};
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
