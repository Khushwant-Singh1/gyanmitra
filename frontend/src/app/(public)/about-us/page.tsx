import type { Metadata } from 'next';
import { AboutUs as AboutUsView } from '@/views/AboutUs.pages';

export const metadata: Metadata = {
  title: 'About Us – Gyanmitra News',
  description:
    'Gyanmitra News is an independent Hindi digital news platform committed to bringing readers accurate, credible and meaningful journalism.',
  alternates: {
    canonical: 'https://gyanmitranews.com/about-us',
  },
};

export default function AboutUsPage() {
  return <AboutUsView />;
}
