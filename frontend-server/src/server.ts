import express from 'express';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.static('public'));

// The Docker image collapses `frontend-server/dist` and `client/dist` to
// `/app/dist` and `/app/client/dist` (one level up from __dirname), while
// running from source in dev nests them two levels up instead. Try the
// Docker layout first and fall back to the dev layout.
const dockerDistPath = path.join(__dirname, '../client/dist');
const distPath = fs.existsSync(dockerDistPath)
  ? dockerDistPath
  : path.join(__dirname, '../../client/dist');
const assetsPath = path.join(distPath, 'assets');
const indexHtmlPath = path.join(distPath, 'index.html');

app.use(express.static(distPath, { index: false }));

const rawApiUrl = process.env.API_URL || 'http://server:8000';
const apiBaseTarget = rawApiUrl.replace(/\/api\/?$/, '');

app.use(
  '/api',
  createProxyMiddleware({
    target: `${apiBaseTarget}/api`,
    changeOrigin: true,
  })
);

app.use(
  '/uploads',
  createProxyMiddleware({
    target: `${apiBaseTarget}/uploads`,
    changeOrigin: true,
  })
);


// Helper function to escape HTML special characters in meta tag attributes
const escapeHtml = (text: string | null | undefined): string => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

// Helper function to get file by extension in the assets folder
const getFileByExtension = (folderPath: string, extension: string): string => {
  if (!fs.existsSync(folderPath)) return '';
  try {
    const files = fs.readdirSync(folderPath);
    return files.find((file) => file.endsWith(extension)) || '';
  } catch {
    return '';
  }
};

interface IMetaData {
  title: string;
  description: string;
  image: string;
  canonical: string;
  type: string;
}

const fetchMetaData = async (slug: string): Promise<IMetaData> => {
  // Same guard as the server's CLIENT_URL handling: never treat an internal
  // Docker/localhost address as the public site URL, even if WEBSITE_URL is
  // misconfigured to one — social crawlers can't reach it.
  const configuredWebsiteUrl = (process.env.WEBSITE_URL || '').replace(/\/+$/, '');
  const baseURL = /localhost|127\.0\.0\.1|frontend:3000|server:8000/.test(configuredWebsiteUrl)
    ? 'https://gyanmitranews.com'
    : configuredWebsiteUrl || 'https://gyanmitranews.com';
  const apiUrl = (process.env.API_URL || 'http://server:8000').replace(/\/+$/, '');

  // Check if the slug corresponds to an article route
  if (slug.startsWith('/articles/')) {
    try {
      // Extract, sanitize, and decode the article slug
      const rawSlug = slug.replace(/^\/articles\//, '').split('?')[0].replace(/\/+$/, '');
      const articleSlug = decodeURIComponent(rawSlug);

      if (articleSlug) {
        // Try fetching metadata from backend API
        const metaUrl = apiUrl.endsWith('/api')
          ? `${apiUrl}/meta/articles/${encodeURIComponent(articleSlug)}`
          : `${apiUrl}/api/meta/articles/${encodeURIComponent(articleSlug)}`;

        const response = await axios.get(metaUrl, { timeout: 5000 });

        if (response.status === 200 && response.data?.data) {
          const article = response.data.data;
          let image = article.image || `${baseURL}/assets/gyanmitra.png`;

          // Ensure image URL is absolute and uses public HTTPS domain
          if (image.startsWith('/')) {
            image = `${baseURL}${image}`;
          } else if (
            image.includes('frontend:3000') ||
            image.includes('localhost:3000') ||
            image.includes('server:8000')
          ) {
            image = image.replace(
              /https?:\/\/(frontend:3000|localhost:3000|server:8000)/,
              baseURL
            );
          }

          return {
            title: article.title ? `${article.title}` : 'Gyanmitra',
            description:
              article.description ||
              'ज्ञानमित्र न्यूज़ - शिक्षा, नवाचार, और नैतिक मूल्यों पर आधारित समाचार।',
            image,
            canonical: `${baseURL}/articles/${encodeURIComponent(articleSlug)}`,
            type: 'article',
          };
        }
      }
    } catch (error) {
      console.error('Error fetching article metadata:', (error as any).message);
    }
  }

  // Predefined routes and default fallback
  const metaDataMap: Record<string, IMetaData> = {
    '/': {
      title: 'Gyanmitra - Hindi News & Knowledge Portal',
      description:
        'ज्ञानमित्र न्यूज़ - शिक्षा, नवाचार, और नैतिक मूल्यों पर आधारित समाचारों का आपका विश्वसनीय स्रोत। प्रेरक कहानियाँ, नवीनतम जानकारी, और सूचनाओं के माध्यम से सकारात्मक बदलाव को बढ़ावा देने वाला प्लेटफ़ॉर्म।',
      image: `${baseURL}/assets/gyanmitra.png`,
      canonical: `${baseURL}/`,
      type: 'website',
    },
    '/sign-in': {
      title: 'Sign In - Gyanmitra',
      description:
        'अपने ज्ञानमित्र खाते में साइन इन करें और शिक्षा, नवाचार, और प्रेरणादायक कहानियों तक पहुँच प्राप्त करें।',
      image: `${baseURL}/assets/gyanmitra.png`,
      canonical: `${baseURL}/sign-in`,
      type: 'website',
    },
    '/sign-up': {
      title: 'Sign Up - Gyanmitra',
      description:
        'ज्ञानमित्र में शामिल हों और शिक्षा, नवाचार, और प्रेरक सामग्री की हमारी विस्तृत श्रृंखला का हिस्सा बनें।',
      image: `${baseURL}/assets/gyanmitra.png`,
      canonical: `${baseURL}/sign-up`,
      type: 'website',
    },
  };

  const defaultMeta: IMetaData = {
    title: 'Gyanmitra',
    description:
      'ज्ञानमित्र न्यूज़ - शिक्षा, नवाचार, और नैतिक मूल्यों पर आधारित समाचारों का आपका विश्वसनीय स्रोत। प्रेरक कहानियाँ, नवीनतम जानकारी, और सूचनाओं के माध्यम से सकारात्मक बदलाव को बढ़ावा देने वाला प्लेटफ़ॉर्म।',
    image: `${baseURL}/assets/gyanmitra.png`,
    canonical: `${baseURL}${slug}`,
    type: 'website',
  };

  return metaDataMap[slug] || defaultMeta;
};

app.get('*', async (req, res) => {
  const requestedPath = path.join(distPath, req.path);

  // Serve static assets if they exist and are not directories
  if (
    fs.existsSync(requestedPath) &&
    !fs.lstatSync(requestedPath).isDirectory() &&
    req.path !== '/index.html'
  ) {
    res.sendFile(requestedPath);
    return;
  }

  const slug = req.path;
  const metaData = await fetchMetaData(slug);

  const metaTagsHtml = `
    <!-- Primary Meta Tags -->
    <meta name="description" content="${escapeHtml(metaData.description)}" />
    <meta name="keywords" content="gyanmitra, news, education, journalism, knowledge" />
    <meta name="author" content="Gyanmitra" />
    <link rel="canonical" href="${escapeHtml(metaData.canonical)}" />
    
    <!-- Open Graph / WhatsApp / Facebook Meta Tags -->
    <meta property="og:type" content="${escapeHtml(metaData.type)}" />
    <meta property="og:site_name" content="Gyanmitra" />
    <meta property="og:locale" content="hi_IN" />
    <meta property="og:title" content="${escapeHtml(metaData.title)}" />
    <meta property="og:description" content="${escapeHtml(metaData.description)}" />
    <meta property="og:url" content="${escapeHtml(metaData.canonical)}" />
    <meta property="og:image" content="${escapeHtml(metaData.image)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(metaData.image)}" />
    <meta property="og:image:alt" content="${escapeHtml(metaData.title)}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(metaData.title)}" />
    <meta name="twitter:description" content="${escapeHtml(metaData.description)}" />
    <meta name="twitter:image" content="${escapeHtml(metaData.image)}" />
    <meta name="twitter:url" content="${escapeHtml(metaData.canonical)}" />
  `;

  // If client/dist/index.html exists from Vite build, inject meta tags directly into it
  if (fs.existsSync(indexHtmlPath)) {
    try {
      let indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

      // Replace or update lang attribute
      indexHtml = indexHtml.replace(/<html[^>]*>/i, '<html lang="hi">');

      // Replace title tag
      if (indexHtml.includes('<title>')) {
        indexHtml = indexHtml.replace(
          /<title>.*?<\/title>/i,
          `<title>${escapeHtml(metaData.title)}</title>`
        );
      } else {
        indexHtml = indexHtml.replace(
          /<head>/i,
          `<head><title>${escapeHtml(metaData.title)}</title>`
        );
      }

      // Inject open graph and meta tags right before </head>
      indexHtml = indexHtml.replace('</head>', `${metaTagsHtml}\n</head>`);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(indexHtml);
      return;
    } catch (err) {
      console.error('Error reading index.html, using fallback template:', err);
    }
  }

  // Fallback HTML template if index.html is not yet built
  const jsFile = getFileByExtension(assetsPath, '.js');
  const cssFile = getFileByExtension(assetsPath, '.css');

  const html = `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <title>${escapeHtml(metaData.title)}</title>

      ${metaTagsHtml}

      <!-- Favicon & Fonts -->
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

      ${jsFile ? `<script type="module" crossorigin src="/assets/${jsFile}"></script>` : ''}
      ${cssFile ? `<link rel="stylesheet" crossorigin href="/assets/${cssFile}">` : ''}
    </head>
    <body>
      <div id="root"></div>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Frontend server is running on ${PORT}`);
});
