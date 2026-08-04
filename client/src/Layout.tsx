import Footer from '@/components/Footer.components';
import Header from '@/components/Header.components';
import { Outlet } from 'react-router-dom';
import { GoogleAnalyticsTracker } from '@/components/GoogleAnalyticsTracker';

export default function Layout() {
  return (
    <div className="*:*:px-5 sm:*:*:px-7 md:*:*:px-8 lg:*:*:px-20 xl:*:*:px-32 2xl:*:*:px-48">
      <GoogleAnalyticsTracker />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
