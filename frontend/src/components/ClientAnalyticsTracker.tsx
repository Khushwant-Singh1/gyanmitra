'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function ClientAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
      (window as any).gtag('config', 'G-L99Z0DH2LB', {
        page_path: pathname + search,
      });
    }
  }, [pathname, searchParams]);

  return null;
}
