import type { Metadata } from 'next';
import HomeView from '@/views/Home.pages';

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

export default function HomePage() {
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
      <HomeView />
    </>
  );
}
