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

  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'Gyanmitra',
    url: 'https://gyanmitranews.com',
    logo: 'https://gyanmitranews.com/assets/s.png',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      <HomeView initialHomeData={homeData} />
    </>
  );
}
