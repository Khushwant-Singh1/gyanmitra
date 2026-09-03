import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EmailVerify as EmailVerifyView } from '@/views/EmailVerify.pages';
import { Spinner } from '@/components/Spinner.components';

export const metadata: Metadata = {
  title: 'Email Verification - Gyanmitra',
  robots: { index: false, follow: false },
};

export default function EmailVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <EmailVerifyView />
    </Suspense>
  );
}
