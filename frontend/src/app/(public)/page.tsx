import type { Metadata } from 'next';
import HomeView from '@/views/Home.pages';
import type { IApiHome } from '@/api/client.api';

export const metadata: Metadata = {
  title: 'Gyanmitra - Hindi News & Knowledge Portal',
  description:
    'ज्ञानमित्र न्यूज़ - शिक्षा, नवाचार, और नैतिक मूल्यों पर आधारित समाचारों का आपका विश्वसनीय स्रोत।',
  alternates: {
    canonical: 'https://gyanmitranews.com',
  },
  openGraph: {
    title: 'Gyanmitra - Hindi News & Knowledge Portal',
    description:
      'ज्ञानमित्र न्यूज़ - शिक्षा, नवाचार, और नैतिक मूल्यों पर आधारित समाचारों का आपका विश्वसनीय स्रोत।',
    url: 'https://gyanmitranews.com',
    type: 'website',
    images: [{ url: 'https://gyanmitranews.com/assets/s.png' }],
  },
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

async function getHomeData(): Promise<IApiHome | null> {
  const rawApiUrl = (process.env.API_URL || 'http://localhost:8000').replace(/\/+$/, '');
  const apiBase = rawApiUrl.replace(/\/api\/?$/, '');

  try {
    const res = await fetch(`${apiBase}/api/users/home`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      return json?.data || null;
    }
  } catch (err) {
    console.error('Error fetching home feed on server:', err);
  }
  return null;
}

export default async function HomePage() {
  const homeData = await getHomeData();
  const rawBaseURL = (process.env.WEBSITE_URL || 'https://gyanmitranews.com').replace(/\/+$/, '');
  const baseURL = rawBaseURL.includes('localhost') || rawBaseURL.includes('127.0.0.1')
    ? 'https://gyanmitranews.com'
    : rawBaseURL;

  const heroImageRaw =
    homeData?.recentPublished?.featuredMedia?.fileType === 'video'
      ? homeData?.recentPublished?.featuredMedia?.thumbnail || homeData?.recentPublished?.featuredMedia?.url
      : homeData?.recentPublished?.featuredMedia?.url;

  const heroImageUrl = heroImageRaw ? normalizePublicImageUrl(heroImageRaw, baseURL) : null;

  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'Gyanmitra',
    url: 'https://gyanmitranews.com',
    logo: `${baseURL}/assets/s.png`,
  };

  return (
    <>
      {heroImageUrl && (
        <link rel="preload" as="image" href={heroImageUrl} fetchPriority="high" />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      <HomeView initialHomeData={homeData} />
    </>
  );
}
