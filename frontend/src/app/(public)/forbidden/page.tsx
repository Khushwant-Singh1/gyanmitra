import type { Metadata } from 'next';
import { ForbiddenPage as ForbiddenView } from '@/views/Forbidden.pages';

export const metadata: Metadata = {
  title: 'Forbidden - Gyanmitra',
  robots: { index: false, follow: false },
};

export default function ForbiddenPage() {
  return <ForbiddenView />;
}
