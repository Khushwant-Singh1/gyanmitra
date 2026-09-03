import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Search as SearchView } from '@/views/Search.pages';
import { Spinner } from '@/components/Spinner.components';

export const metadata: Metadata = {
  title: 'Search News - Gyanmitra',
  description: 'ज्ञानमित्र पर ताज़ा समाचार, आलेख और सूचनाएं खोजें।',
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <SearchView />
    </Suspense>
  );
}
