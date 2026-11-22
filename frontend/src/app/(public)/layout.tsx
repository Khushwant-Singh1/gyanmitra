import Footer from '@/components/Footer.components';
import Header from '@/components/Header.components';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fcfcfc]">
      <Header />
      <div className="w-full flex-1">{children}</div>
      <Footer />
    </div>
  );
}
