import { buttonVariants } from '@/components/ui/button';
import React from 'react';
import { Link } from 'react-router-dom';

const PageNotFounded: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-tertiary text-9xl font-extrabold">404</h1>
        <p className="mt-4 text-2xl font-semibold text-gray-700">
          Oops! Page Not Found
        </p>
        <p className="mt-2 text-gray-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 space-x-6">
          <Link to="/" className={buttonVariants({ variant: 'secondary' })}>
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PageNotFounded;
