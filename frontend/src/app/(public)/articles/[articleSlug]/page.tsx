import type { Metadata } from 'next';
import { Article as ArticleView } from '@/views/Article.pages';

interface Props {
  params: Promise<{ articleSlug: string }>;
}

const cleanText = (text: string | null | undefined, maxLength = 200): string => {
  if (!text) return '';
  return String(text)
    .replace(/<[^>]*>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_`~]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
};

const getImageMimeType = (url: string): string => {
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.gif')) return 'image/gif';
  if (clean.endsWith('.svg')) return 'image/svg+xml';
  return 'image/jpeg';
};

const normalizePublicImageUrl = (
  rawUrl: string | null | undefined,
  baseURL: string
): string => {
  const publicDomain = baseURL.includes('localhost') || baseURL.includes('127.0.0.1')
    ? 'https://gyanmitranews.com'
    : baseURL;
  const defaultImage = `${publicDomain}/assets/s.png`;

  if (!rawUrl || typeof rawUrl !== 'string') return defaultImage;

  let url = rawUrl.replace(/\\/g, '/').trim();
  if (!url) return defaultImage;

  const internalHostPattern = /https?:\/\/(frontend:3000|localhost:3000|server:8000|localhost:8000|127\.0\.0\.1(:\d+)?)/;

  if (url.includes('minio:9000') || url.includes('localhost:9000')) {
    const minioPublic = (process.env.MINIO_PUBLIC_URL || '').replace(/\/+$/, '');
    const publicMinioBase =
      minioPublic && !minioPublic.includes('localhost') && !minioPublic.includes('minio')
        ? minioPublic
        : 'https://api.gyanmitranews.com/minio/gyanmitra';
    url = url.replace(/https?:\/\/(localhost|minio):9000\/gyanmitra/, publicMinioBase);
  } else if (internalHostPattern.test(url)) {
    url = url.replace(internalHostPattern, publicDomain);
  }

  if (url.startsWith('/')) {
    url = `${publicDomain}${url}`;
  } else if (url.startsWith('uploads/')) {
    url = `${publicDomain}/${url}`;
  } else if (!/^https?:\/\//i.test(url)) {
    url = `${publicDomain}/${url}`;
  }

  return url;
};

import { MDToHTMLConverter } from '@/utils/MDToHTML.utils';

async function getArticleMeta(articleSlug: string) {
  const rawApiUrl = (process.env.API_URL || 'http://localhost:8000').replace(/\/+$/, '');
  const apiBase = rawApiUrl.replace(/\/api\/?$/, '');

  try {
    const res = await fetch(
      `${apiBase}/api/meta/articles/${encodeURIComponent(articleSlug)}`,
      { next: { revalidate: 60 } }
    );
    if (res.ok) {
      const json = await res.json();
      return json?.data || null;
    }
  } catch (err) {
    console.error('Error fetching article metadata:', err);
  }
  return null;
}

async function getArticleFull(articleSlug: string) {
  const rawApiUrl = (process.env.API_URL || 'http://localhost:8000').replace(/\/+$/, '');
  const apiBase = rawApiUrl.replace(/\/api\/?$/, '');

  try {
    const res = await fetch(
      `${apiBase}/api/articles/page/${encodeURIComponent(articleSlug)}`,
      { next: { revalidate: 60 } }
    );
    if (res.ok) {
      const json = await res.json();
      return json?.data || null;
    }
  } catch (err) {
    console.error('Error fetching full article data:', err);
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { articleSlug } = await params;
  const decodedSlug = decodeURIComponent(articleSlug);
  const rawBaseURL = (process.env.WEBSITE_URL || 'https://gyanmitranews.com').replace(/\/+$/, '');
  const baseURL = rawBaseURL.includes('localhost') || rawBaseURL.includes('127.0.0.1')
    ? 'https://gyanmitranews.com'
    : rawBaseURL;

  // Try fetching meta endpoint first, fallback to full article endpoint if meta fails
  let article = await getArticleMeta(decodedSlug);
  if (!article) {
    const fullData = await getArticleFull(decodedSlug);
    if (fullData?.articleDetails) {
      const details = fullData.articleDetails;
      const media = details.featuredMediaInfo;
      const mediaUrl =
        media?.fileType === 'video'
          ? media?.thumbnail || media?.url
          : media?.url;

      article = {
        title: details.metaTitle || details.headline,
        description: details.description,
        slug: details.slug,
        authorName: details.authorName,
        canonicalUrl: details.canonicalUrl,
        robotsTag: details.robotsTag,
        createdAt: details.publishedDate,
        lastPublishedDate: details.publishedDate,
        updatedAt: details.publishedDate,
        image: mediaUrl,
      };
    }
  }

  if (!article) {
    return {
      title: '404 - समाचार नहीं मिला | Gyanmitra',
      description: 'यह समाचार या पृष्ठ उपलब्ध नहीं है। मुख्य पृष्ठ पर जाएं।',
      robots: { index: false, follow: false },
    };
  }

  const title = cleanText(article.title, 100) || 'Gyanmitra News';
  const description =
    cleanText(article.description, 200) ||
    'ज्ञानमित्र न्यूज़ - शिक्षा, नवाचार, और नैतिक मूल्यों पर आधारित समाचार।';

  const image = normalizePublicImageUrl(article.image, baseURL);
  const imageMimeType = getImageMimeType(image);

  const canonical =
    article.canonicalUrl && article.canonicalUrl.startsWith('http')
      ? article.canonicalUrl
      : `${baseURL}/articles/${encodeURIComponent(article.slug || decodedSlug)}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Gyanmitra News',
      locale: 'hi_IN',
      type: 'article',
      publishedTime: article.lastPublishedDate || article.createdAt,
      modifiedTime: article.updatedAt || article.lastPublishedDate || article.createdAt,
      authors: article.authorName ? [article.authorName] : ['Gyanmitra News'],
      images: [
        {
          url: image,
          secureUrl: image,
          width: 1200,
          height: 630,
          alt: title,
          type: imageMimeType,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: {
      index: !article.robotsTag?.includes('NOINDEX'),
      follow: !article.robotsTag?.includes('NOFOLLOW'),
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { articleSlug } = await params;
  const decodedSlug = decodeURIComponent(articleSlug);
  const rawBaseURL = (process.env.WEBSITE_URL || 'https://gyanmitranews.com').replace(/\/+$/, '');
  const baseURL = rawBaseURL.includes('localhost') || rawBaseURL.includes('127.0.0.1')
    ? 'https://gyanmitranews.com'
    : rawBaseURL;

  const [articleMetaRes, articleData] = await Promise.all([
    getArticleMeta(decodedSlug),
    getArticleFull(decodedSlug),
  ]);

  const article = articleMetaRes || (articleData?.articleDetails ? {
    title: articleData.articleDetails.metaTitle || articleData.articleDetails.headline,
    description: articleData.articleDetails.description,
    slug: articleData.articleDetails.slug,
    authorName: articleData.articleDetails.authorName,
    canonicalUrl: articleData.articleDetails.canonicalUrl,
    image: articleData.articleDetails.featuredMediaInfo?.fileType === 'video'
      ? articleData.articleDetails.featuredMediaInfo?.thumbnail || articleData.articleDetails.featuredMediaInfo?.url
      : articleData.articleDetails.featuredMediaInfo?.url,
    createdAt: articleData.articleDetails.publishedDate,
    lastPublishedDate: articleData.articleDetails.publishedDate,
    updatedAt: articleData.articleDetails.publishedDate,
  } : null);

  let contentHtml = '';
  if (articleData?.articleDetails?.contentData) {
    try {
      contentHtml = await MDToHTMLConverter(articleData.articleDetails.contentData);
    } catch (err) {
      console.error('Error converting markdown to HTML in SSR:', err);
    }
  }

  let schemaJson: any = null;
  if (article) {
    const canonical =
      article.canonicalUrl || `${baseURL}/articles/${encodeURIComponent(article.slug || decodedSlug)}`;
    const image = normalizePublicImageUrl(article.image, baseURL);

    schemaJson = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonical,
      },
      headline: cleanText(article.title, 110),
      description: cleanText(article.description, 200),
      image: [image],
      datePublished: article.lastPublishedDate || article.createdAt || new Date().toISOString(),
      dateModified: article.updatedAt || article.lastPublishedDate || new Date().toISOString(),
      author: {
        '@type': 'Person',
        name: article.authorName || 'Gyanmitra News',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Gyanmitra News',
        url: baseURL,
        logo: {
          '@type': 'ImageObject',
          url: `${baseURL}/assets/s.png`,
        },
      },
    };
  }

  return (
    <>
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
      )}
      <ArticleView
        initialArticle={articleData}
        initialContentHtml={contentHtml}
        slug={decodedSlug}
      />
    </>
  );
}
