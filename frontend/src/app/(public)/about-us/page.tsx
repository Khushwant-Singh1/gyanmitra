import type { Metadata } from 'next';
import { AboutUs as AboutUsView } from '@/views/AboutUs.pages';

export const metadata: Metadata = {
  title: 'About Us - Gyanmitra',
  description: 'ज्ञानमित्र न्यूज़ के बारे में जानें - हमारी दृष्टि, मिशन और संपादकीय मूल्य।',
};

export default function AboutUsPage() {
  return <AboutUsView />;
}
