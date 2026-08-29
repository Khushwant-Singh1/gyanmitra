import express from 'express';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.static('public'));

// 1. URL Normalization Middleware: Enforce HTTPS & remove trailing slashes (301 Permanent Redirects)
app.use((req, res, next) => {
  const host = req.headers.host;
  const proto = req.headers['x-forwarded-proto'];

  // Enforce HTTPS when running behind reverse proxy / Cloudflare
  if (proto === 'http' && host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    return res.redirect(301, `https://${host}${req.originalUrl}`);
  }

  // Remove trailing slashes (e.g. /articles/my-slug/ -> /articles/my-slug)
  if (req.path.length > 1 && req.path.endsWith('/')) {
    const query = req.url.slice(req.path.length);
    const safePath = req.path.slice(0, -1);
    return res.redirect(301, safePath + query);
  }

  next();
});

const dockerDistPath = path.join(__dirname, '../client/dist');
const distPath = fs.existsSync(dockerDistPath)
  ? dockerDistPath
  : path.join(__dirname, '../../client/dist');
const assetsPath = path.join(distPath, 'assets');
const indexHtmlPath = path.join(distPath, 'index.html');

app.use(express.static(distPath, { index: false }));

const rawApiUrl = (process.env.API_URL || 'http://server:8000').replace(/\/+$/, '');
const apiBaseTarget = rawApiUrl.replace(/\/api\/?$/, '');

// Proxy backend API
app.use(
  '/api',
  createProxyMiddleware({
    target: `${apiBaseTarget}/api`,
    changeOrigin: true,
  })
);

// Proxy uploads
app.use(
  '/uploads',
  createProxyMiddleware({
    target: `${apiBaseTarget}/uploads`,
    changeOrigin: true,
  })
);

// Proxy XML sitemaps directly to backend Express server
app.use(
  ['/sitemap.xml', '/sitemap-news.xml', '/sitemap-images.xml', '/robots.txt'],
  createProxyMiddleware({
    target: apiBaseTarget,
    changeOrigin: true,
  })
);

// Helper function to clean text for meta tags (strip html, markdown, linebreaks)
const cleanText = (text: string | null | undefined, maxLength = 200): string => {
  if (!text) return '';
  return String(text)
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove markdown links
    .replace(/[#*_`~]/g, '') // remove markdown formatting symbols
    .replace(/[\r\n\t]+/g, ' ') // convert all newlines/tabs to space
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim()
    .slice(0, maxLength);
};

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

// Helper function to determine image MIME type from URL
const getImageMimeType = (url: string): string => {
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.gif')) return 'image/gif';
  if (clean.endsWith('.svg')) return 'image/svg+xml';
  return 'image/jpeg';
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
  is404: boolean;
  robots: string;
  schemaJson?: object | null;
}

const KNOWN_CATEGORIES = [
  'top news', 'top-news', 'topnews', 'sambhal', 'moradabad', 'amroha',
  'rampur', 'pradesh', 'uttar pradesh', 'uttar-pradesh', 'desh',
  'national', 'duniya', 'videsh', 'international', 'khel', 'sports',
  'manoranjan', 'entertainment', 'education', 'shiksha', 'business',
  'vyapar', 'tech', 'technology', 'lifestyle', 'health', 'crime'
];

const CATEGORY_NAMES: Record<string, string> = {
  'top news': 'टॉप न्यूज़ (Top News)',
  'top-news': 'टॉप न्यूज़ (Top News)',
  'topnews': 'टॉप न्यूज़ (Top News)',
  'sambhal': 'संभल (Sambhal)',
  'moradabad': 'मुरादाबाद (Moradabad)',
  'amroha': 'अमरोहा (Amroha)',
  'rampur': 'रामपुर (Rampur)',
  'pradesh': 'उत्तर प्रदेश (Pradesh)',
  'uttar pradesh': 'उत्तर प्रदेश (Uttar Pradesh)',
  'uttar-pradesh': 'उत्तर प्रदेश (Uttar Pradesh)',
  'desh': 'देश (National News)',
  'national': 'देश (National News)',
  'duniya': 'दुनिया (International News)',
  'videsh': 'विदेश (International News)',
  'international': 'अंतर्राष्ट्रीय (International)',
  'khel': 'खेल (Sports)',
  'sports': 'खेल (Sports)',
  'manoranjan': 'मनोरंजन (Entertainment)',
  'entertainment': 'मनोरंजन (Entertainment)',
  'education': 'शिक्षा एवं करियर (Education)',
  'shiksha': 'शिक्षा एवं करियर (Education)',
  'business': 'व्यापार और बाज़ार (Business)',
  'vyapar': 'व्यापार (Business)',
  'tech': 'तकनीक एवं टेक (Technology)',
  'technology': 'तकनीक (Technology)',
  'lifestyle': 'जीवनशैली और स्वास्थ्य (Lifestyle)',
  'health': 'स्वास्थ्य (Health)',
  'crime': 'अपराध (Crime)'
};

const fetchMetaData = async (slug: string): Promise<IMetaData> => {
  const configuredWebsiteUrl = (process.env.WEBSITE_URL || '').replace(/\/+$/, '');
  const baseURL = /localhost|127\.0\.0\.1|frontend:3000|server:8000/.test(configuredWebsiteUrl)
    ? 'https://gyanmitranews.com'
    : configuredWebsiteUrl || 'https://gyanmitranews.com';

  const defaultFallbackImage = `${baseURL}/assets/s.png`;

  const apiRoot = (process.env.API_URL || 'http://server:8000').replace(/\/+$/, '');
  const apiBase = apiRoot.endsWith('/api') ? apiRoot.slice(0, -4) : apiRoot;

  // 1. Article Routes
  if (slug.startsWith('/articles/')) {
    try {
      const rawSlug = slug.replace(/^\/articles\//, '').split('?')[0].replace(/\/+$/, '');
      const articleSlug = decodeURIComponent(rawSlug);

      if (articleSlug) {
        const endpointsToTry = [
          `${apiBase}/api/meta/articles/${encodeURIComponent(articleSlug)}`,
          `${apiBase}/meta/articles/${encodeURIComponent(articleSlug)}`,
          `${apiBase}/api/meta/articles/${articleSlug}`,
        ];

        let articleData: any = null;
        for (const metaUrl of endpointsToTry) {
          try {
            const response = await axios.get(metaUrl, { timeout: 4000 });
            if (response.status === 200 && response.data?.data) {
              articleData = response.data.data;
              break;
            }
          } catch {
            // continue
          }
        }

        if (articleData) {
          let image = articleData.image || defaultFallbackImage;
          if (image.startsWith('/')) {
            image = `${baseURL}${image}`;
          } else if (
            image.includes('frontend:3000') ||
            image.includes('localhost:3000') ||
            image.includes('server:8000') ||
            image.includes('127.0.0.1')
          ) {
            image = image.replace(
              /https?:\/\/(frontend:3000|localhost:3000|server:8000|127\.0\.0\.1(:\d+)?)/,
              baseURL
            );
          }

          const rawTitle = articleData.title || 'Gyanmitra';
          const rawDescription =
            articleData.description ||
            'ज्ञानमित्र न्यूज़ - शिक्षा, नवाचार, और नैतिक मूल्यों पर आधारित समाचार।';

          const canonical =
            articleData.canonicalUrl && articleData.canonicalUrl.startsWith('http')
              ? articleData.canonicalUrl
              : `${baseURL}/articles/${encodeURIComponent(articleData.slug || articleSlug)}`;

          const publishedDate = articleData.lastPublishedDate || articleData.createdAt || new Date().toISOString();
          const modifiedDate = articleData.updatedAt || publishedDate;

          const schemaJson = {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            'mainEntityOfPage': {
              '@type': 'WebPage',
              '@id': canonical,
            },
            'headline': cleanText(rawTitle, 110),
            'description': cleanText(rawDescription, 200),
            'image': [image],
            'datePublished': publishedDate,
            'dateModified': modifiedDate,
            'author': {
              '@type': 'Person',
              'name': articleData.authorName || 'Gyanmitra News',
            },
            'publisher': {
              '@type': 'Organization',
              'name': 'Gyanmitra News',
              'url': baseURL,
              'logo': {
                '@type': 'ImageObject',
                'url': `${baseURL}/assets/s.png`,
              },
            },
          };

          return {
            title: cleanText(rawTitle, 100) || 'Gyanmitra News',
            description:
              cleanText(rawDescription, 200) ||
              'ज्ञानमित्र न्यूज़ - शिक्षा, नवाचार, और नैतिक मूल्यों पर आधारित समाचार।',
            image,
            canonical,
            type: 'article',
            is404: false,
            robots: articleData.robotsTag || 'INDEX, FOLLOW',
            schemaJson,
          };
        }
      }
    } catch (error) {
      console.error('Error fetching article metadata:', (error as any).message);
    }

    // Article slug not found in database -> Return True 404
    return {
      title: '404 - समाचार नहीं मिला | Gyanmitra',
      description: 'यह समाचार या पृष्ठ उपलब्ध नहीं है। मुख्य पृष्ठ पर जाएं।',
      image: defaultFallbackImage,
      canonical: `${baseURL}${slug}`,
      type: 'website',
      is404: true,
      robots: 'NOINDEX, NOFOLLOW',
    };
  }

  // 2. Category Routes
  if (slug.startsWith('/categories/')) {
    const rawCategory = slug.replace(/^\/categories\//, '').split('?')[0].replace(/\/+$/, '');
    const decodedCategory = decodeURIComponent(rawCategory).replace(/[-_]+/g, ' ').trim().toLowerCase();

    const isKnownCategory =
      KNOWN_CATEGORIES.includes(decodedCategory) ||
      KNOWN_CATEGORIES.includes(rawCategory.toLowerCase());

    const displayName =
      CATEGORY_NAMES[decodedCategory] ||
      CATEGORY_NAMES[rawCategory.toLowerCase()] ||
      (isKnownCategory ? decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1) : null);

    if (displayName) {
      return {
        title: `${displayName} - ताज़ा हिंदी समाचार | Gyanmitra`,
        description: `पढ़ें ${displayName} की ताज़ा और मुख्य खबरें, ब्रेकिंग न्यूज़ और विशेष कवरेज ज्ञानमित्र न्यूज़ पर।`,
        image: defaultFallbackImage,
        canonical: `${baseURL}/categories/${encodeURIComponent(rawCategory)}`,
        type: 'website',
        is404: false,
        robots: 'INDEX, FOLLOW',
      };
    }

    // Unrecognized Category -> 404
    return {
      title: '404 - श्रेणी नहीं मिली | Gyanmitra',
      description: 'यह समाचार श्रेणी उपलब्ध नहीं है। ज्ञानमित्र मुख्य पृष्ठ पर जाएं।',
      image: defaultFallbackImage,
      canonical: `${baseURL}${slug}`,
      type: 'website',
      is404: true,
      robots: 'NOINDEX, NOFOLLOW',
    };
  }

  // 3. Known Public Pages
  const staticPages: Record<string, Partial<IMetaData>> = {
    '/': {
      title: 'Gyanmitra - Hindi News & Knowledge Portal',
      description:
        'ज्ञानमित्र न्यूज़ - शिक्षा, नवाचार, और नैतिक मूल्यों पर आधारित समाचारों का आपका विश्वसनीय स्रोत।',
      type: 'website',
      robots: 'INDEX, FOLLOW',
      schemaJson: {
        '@context': 'https://schema.org',
        '@type': 'NewsMediaOrganization',
        'name': 'Gyanmitra',
        'url': baseURL,
        'logo': `${baseURL}/assets/s.png`,
      },
    },
    '/about-us': {
      title: 'About Us - Gyanmitra',
      description: 'ज्ञानमित्र न्यूज़ के बारे में जानें - हमारी दृष्टि, मिशन और संपादकीय मूल्य।',
      type: 'website',
      robots: 'INDEX, FOLLOW',
    },
    '/privacy-policy': {
      title: 'Privacy Policy - Gyanmitra',
      description: 'ज्ञानमित्र न्यूज़ की गोपनीयता नीति और डेटा सुरक्षा संबंधी जानकारी।',
      type: 'website',
      robots: 'INDEX, FOLLOW',
    },
    '/contact-us': {
      title: 'Contact Us - Gyanmitra',
      description: 'ज्ञानमित्र संपादकीय टीम से संपर्क करें और अपनी प्रतिक्रिया भेजें।',
      type: 'website',
      robots: 'INDEX, FOLLOW',
    },
    '/competitions': {
      title: 'Competitions & Quizzes - Gyanmitra',
      description:
        'ज्ञानमित्र प्रतियोगिता हब - निबंध, पेंटिंग, क्विज़ और विभिन्न प्रतियोगिताओं में भाग लें और पुरस्कार जीतें।',
      type: 'website',
      robots: 'INDEX, FOLLOW',
    },
    '/search': {
      title: 'Search News - Gyanmitra',
      description: 'ज्ञानमित्र पर ताज़ा समाचार, आलेख और सूचनाएं खोजें।',
      type: 'website',
      robots: 'NOINDEX, FOLLOW',
    },
    '/sign-in': {
      title: 'Sign In - Gyanmitra',
      description: 'ज्ञानमित्र खाते में साइन इन करें।',
      type: 'website',
      robots: 'NOINDEX, NOFOLLOW',
    },
    '/sign-up': {
      title: 'Sign Up - Gyanmitra',
      description: 'ज्ञानमित्र में शामिल हों।',
      type: 'website',
      robots: 'NOINDEX, NOFOLLOW',
    },
    '/email-verify': {
      title: 'Email Verification - Gyanmitra',
      description: 'ईमेल सत्यापन।',
      type: 'website',
      robots: 'NOINDEX, NOFOLLOW',
    },
  };

  if (staticPages[slug]) {
    const page = staticPages[slug];
    return {
      title: page.title || 'Gyanmitra',
      description: page.description || 'ज्ञानमित्र न्यूज़ - आपका विश्वसनीय समाचार स्रोत।',
      image: defaultFallbackImage,
      canonical: `${baseURL}${slug === '/' ? '' : slug}`,
      type: page.type || 'website',
      is404: false,
      robots: page.robots || 'INDEX, FOLLOW',
      schemaJson: page.schemaJson || null,
    };
  }

  // 4. Admin and Editorial Routes (Never Index)
  if (slug.startsWith('/administrator') || slug.startsWith('/edit/')) {
    return {
      title: 'Administrator Dashboard - Gyanmitra',
      description: 'ज्ञानमित्र एडमिन डैशबोर्ड',
      image: defaultFallbackImage,
      canonical: `${baseURL}${slug}`,
      type: 'website',
      is404: false,
      robots: 'NOINDEX, NOFOLLOW',
    };
  }

  // 5. Any Other Unknown Route -> True 404
  return {
    title: '404 - पृष्ठ नहीं मिला | Gyanmitra',
    description: 'यह पृष्ठ उपलब्ध नहीं है। मुख्य पृष्ठ पर जाएं।',
    image: defaultFallbackImage,
    canonical: `${baseURL}${slug}`,
    type: 'website',
    is404: true,
    robots: 'NOINDEX, NOFOLLOW',
  };
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
  const imageMimeType = getImageMimeType(metaData.image);

  // If page is a 404, respond with real HTTP 404 status code to fix Soft 404 errors in Googlebot
  if (metaData.is404) {
    res.status(404);
  } else {
    res.status(200);
  }

  const schemaTagHtml = metaData.schemaJson
    ? `\n    <script type="application/ld+json">\n      ${JSON.stringify(metaData.schemaJson)}\n    </script>`
    : '';

  const metaTagsHtml = `
    <!-- Primary Meta Tags -->
    <title>${escapeHtml(metaData.title)}</title>
    <meta name="title" content="${escapeHtml(metaData.title)}" />
    <meta name="description" content="${escapeHtml(metaData.description)}" />
    <link rel="canonical" href="${escapeHtml(metaData.canonical)}" />
    <meta name="robots" content="${escapeHtml(metaData.robots)}" />
    
    <!-- Open Graph / WhatsApp / Facebook Meta Tags -->
    <meta property="og:type" content="${escapeHtml(metaData.type)}" />
    <meta property="og:site_name" content="Gyanmitra" />
    <meta property="og:locale" content="hi_IN" />
    <meta property="og:url" content="${escapeHtml(metaData.canonical)}" />
    <meta property="og:title" content="${escapeHtml(metaData.title)}" />
    <meta property="og:description" content="${escapeHtml(metaData.description)}" />
    <meta property="og:image" content="${escapeHtml(metaData.image)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(metaData.image)}" />
    <meta property="og:image:alt" content="${escapeHtml(metaData.title)}" />
    <meta property="og:image:type" content="${imageMimeType}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${escapeHtml(metaData.canonical)}" />
    <meta name="twitter:title" content="${escapeHtml(metaData.title)}" />
    <meta name="twitter:description" content="${escapeHtml(metaData.description)}" />
    <meta name="twitter:image" content="${escapeHtml(metaData.image)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(metaData.title)}" />${schemaTagHtml}
  `;

  // If client/dist/index.html exists from Vite build, inject meta tags directly into it
  if (fs.existsSync(indexHtmlPath)) {
    try {
      let indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

      // Replace or update lang attribute
      indexHtml = indexHtml.replace(/<html[^>]*>/i, '<html lang="hi">');

      // Remove existing title tag & description meta to avoid duplicates
      indexHtml = indexHtml.replace(/<title>.*?<\/title>/gi, '');
      indexHtml = indexHtml.replace(/<meta\s+name=["']description["'][^>]*>/gi, '');

      // Inject open graph and meta tags right at the top of <head>
      if (indexHtml.includes('<head>')) {
        indexHtml = indexHtml.replace('<head>', `<head>\n${metaTagsHtml}`);
      } else {
        indexHtml = indexHtml.replace('</head>', `${metaTagsHtml}\n</head>`);
      }

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

  const html = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  ${metaTagsHtml}
  <!-- Favicon & Fonts -->
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1463940399847759" crossorigin="anonymous"></script>

  ${jsFile ? `<script type="module" crossorigin src="/assets/${jsFile}"></script>` : ''}
  ${cssFile ? `<link rel="stylesheet" crossorigin href="/assets/${cssFile}">` : ''}
</head>
<body>
  <div id="root"></div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Frontend server is running on ${PORT}`);
});
