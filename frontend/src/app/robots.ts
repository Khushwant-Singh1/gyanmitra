import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseURL = (process.env.WEBSITE_URL || 'https://gyanmitranews.com').replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/administrator/', '/edit/', '/api/'],
      },
      {
        userAgent: 'Mediapartners-Google',
        allow: '/',
      },
    ],
    sitemap: [
      `${baseURL}/sitemap.xml`,
      `${baseURL}/sitemap-news.xml`,
      `${baseURL}/sitemap-images.xml`,
    ],
  };
}
