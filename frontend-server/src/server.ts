import express from 'express';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.static('public'));

const distPath = path.join(__dirname, '../../client/dist');
const assetsPath = path.join(distPath, 'assets');
app.use(express.static(distPath, { index: false }));

if (process.env.NODE_ENV === 'development') {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.API_URL,
      changeOrigin: true,
    })
  );
}

// Helper function to get file by extension in the assets folder
const getFileByExtension = (folderPath: string, extension: string) => {
  const files = fs.readdirSync(folderPath);
  return files.find((file) => file.endsWith(extension));
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
      <meta name="description" content="${
        metaData.description || 'Default Description'
      }" />
      <meta name="keywords" content="gyanmitra, news, education, journalism, knowledge" />
      <meta name="author" content="Gyanmitra" />
      
      <!-- Open Graph Tags -->
      <meta property="og:type" content="website" />
      <meta property="og:title" content="${metaData.title || 'Gyanmitra'}" />
      <meta property="og:description" content="${
        metaData.description || 'Default Description'
      }" />
      <meta property="og:image" content="${
        metaData.image || 'https://gyanmitranews.com/assets/gyanmitra.png'
      }" />
      <meta property="og:url" content="${metaData.canonical}" />
      <meta property="og:site_name" content="Gyanmitra" />
      <meta property="og:locale" content="hi_IN" />


      <!-- Twitter Card Tags -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${metaData.title || 'Gyanmitra'}" />
      <meta name="twitter:description" content="${
        metaData.description || 'Default Description'
      }" />
      <meta name="twitter:image" content="${
        metaData.image || 'https://gyanmitranews.com/assets/gyanmitra.png'
      }" />
      <meta name="twitter:url" content="${metaData.canonical}" />

      <!-- Favicon -->
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />

      <link rel="canonical" href="${metaData.canonical}" />

      <title>${
        metaData.title ? metaData.title + ' - Gyanmitra' : 'Gyanmitra'
      }</title>

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

const fetchMetaData = async (
  slug: string
): Promise<{
  title: string;
  description: string;
  image: string;
  canonical: string;
}> => {
  const baseURL = process.env.WEBSITE_URL;

  // Check if the slug corresponds to an article route
  if (slug.startsWith('/articles/')) {
    try {
      // Extract the article ID from the slug
      const articleSlug = slug.split('/articles/')[1];

      // Fetch metadata from your backend API
      const response = await axios.get(
        `${process.env.API_URL}/meta/articles/${articleSlug}`
      );

      if (response.status === 200) {
        const article = response.data.data;

        // Return the dynamically fetched metadata
        return {
          title: article.title || 'Article',
          description: article.description || 'Read our latest article.',
          image: article.image || `${baseURL}/assets/default-article.png`,
          canonical: `${baseURL}${slug}`,
        };
      } else {
        console.error(`Failed to fetch article metadata: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching article metadata:', (error as any).message);
    }
  }

  // Default metadata for predefined routes
  const metaData: Record<string, any> = {
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

  return (
    metaData[slug] || {
      description: `ज्ञानमित्र न्यूज़ - शिक्षा, नवाचार, और नैतिक मूल्यों पर आधारित समाचारों का आपका विश्वसनीय स्रोत। 
                    प्रेरक कहानियाँ, नवीनतम जानकारी, और सूचनाओं के माध्यम से सकारात्मक बदलाव को बढ़ावा देने वाला प्लेटफ़ॉर्म।`,
      image: `${baseURL}/assets/gyanmitra.png`,
      canonical: `${baseURL}${slug}`,
    }
  );
};

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
