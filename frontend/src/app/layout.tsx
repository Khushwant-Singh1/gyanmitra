import type { Metadata } from 'next';
import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import { Providers } from './providers';
import { ClientAnalyticsTracker } from '@/components/ClientAnalyticsTracker';
import { Suspense } from 'react';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import './globals.css';

config.autoAddCss = false;

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  display: 'swap',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.WEBSITE_URL || 'https://gyanmitranews.com'),
  title: {
    default: 'Gyanmitra - Hindi News & Knowledge Portal',
    template: '%s | Gyanmitra',
  },
  description:
    'ज्ञानमित्र न्यूज़ - शिक्षा, नवाचार, और नैतिक मूल्यों पर आधारित समाचारों का आपका विश्वसनीय स्रोत।',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  other: {
    'google-adsense-account': 'ca-pub-1463940399847759',
    '9634d5fd744c0998f26462f57e8f6da7cd26f5ef': '9634d5fd744c0998f26462f57e8f6da7cd26f5ef',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className={`${inter.variable} ${notoSansDevanagari.variable}`} suppressHydrationWarning>
      <head>
        <meta
          name="9634d5fd744c0998f26462f57e8f6da7cd26f5ef"
          content="9634d5fd744c0998f26462f57e8f6da7cd26f5ef"
        />
        <link rel="preconnect" href="https://api.gyanmitranews.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.gyanmitranews.com" />
        <link
          rel="ard"
          href="https://gyanmitranews.com/.well-known/ard.json"
          type="application/json"
        />
        <link
          rel="alternate"
          type="text/markdown"
          href="https://gyanmitranews.com/llms.txt"
          title="LLMs Text"
        />
        <link
          rel="alternate"
          type="text/markdown"
          href="https://gyanmitranews.com/llms.md"
          title="LLM Guide"
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1463940399847759"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          <Suspense fallback={null}>
            <ClientAnalyticsTracker />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
