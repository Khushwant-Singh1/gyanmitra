import type { Metadata } from 'next';
import PageNotFounded from '@/views/PageNotFounded.pages';

export const metadata: Metadata = {
  title: '404 - पृष्ठ नहीं मिला | Gyanmitra',
  description: 'यह पृष्ठ उपलब्ध नहीं है। मुख्य पृष्ठ पर जाएं।',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <PageNotFounded />;
}
