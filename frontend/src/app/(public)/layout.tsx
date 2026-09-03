import { Suspense } from 'react';
import Footer from '@/components/Footer.components';
import Header from '@/components/Header.components';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="*:*:px-5 sm:*:*:px-7 md:*:*:px-8 lg:*:*:px-20 xl:*:*:px-32 2xl:*:*:px-48">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <Suspense fallback={null}>
        <main>{children}</main>
      </Suspense>
      <Footer />
    </div>
  );
}
