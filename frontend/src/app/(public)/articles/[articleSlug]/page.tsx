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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { articleSlug } = await params;
  const decodedSlug = decodeURIComponent(articleSlug);
  const baseURL = (process.env.WEBSITE_URL || 'https://gyanmitranews.com').replace(/\/+$/, '');
  const defaultImage = `${baseURL}/assets/s.png`;

  const article = await getArticleMeta(decodedSlug);

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
  let image = article.image || defaultImage;
  if (image.startsWith('/')) {
    image = `${baseURL}${image}`;
  }

  const canonical = article.canonicalUrl || `${baseURL}/articles/${encodeURIComponent(article.slug || decodedSlug)}`;

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
      images: [{ url: image }],
      type: 'article',
      publishedTime: article.lastPublishedDate || article.createdAt,
      modifiedTime: article.updatedAt,
      authors: article.authorName ? [article.authorName] : ['Gyanmitra News'],
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
  const baseURL = (process.env.WEBSITE_URL || 'https://gyanmitranews.com').replace(/\/+$/, '');
  const article = await getArticleMeta(decodedSlug);

  let schemaJson: any = null;
  if (article) {
    const canonical =
      article.canonicalUrl || `${baseURL}/articles/${encodeURIComponent(article.slug || decodedSlug)}`;
    const image = article.image?.startsWith('/')
      ? `${baseURL}${article.image}`
      : article.image || `${baseURL}/assets/s.png`;

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
      <ArticleView />
    </>
  );
}
