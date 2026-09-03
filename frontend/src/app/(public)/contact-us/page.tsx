import type { Metadata } from 'next';
import { ContactUs as ContactUsView } from '@/views/ContactUs.pages';

export const metadata: Metadata = {
  title: 'Contact Us - Gyanmitra',
  description: 'ज्ञानमित्र संपादकीय टीम से संपर्क करें और अपनी प्रतिक्रिया भेजें।',
};

export default function ContactUsPage() {
  return <ContactUsView />;
}
