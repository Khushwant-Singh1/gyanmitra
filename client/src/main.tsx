// @lexical/code (used by the article editor) runs `(function (Prism) {...}(Prism))`
// at module-load time, expecting a global Prism — since the app isn't route-split,
// that module evaluates on every page (including public article views) and throws
// "Prism is not defined" before React ever renders. Must be set before anything
// else below is imported.
import Prism from 'prismjs';
(globalThis as { Prism?: typeof Prism }).Prism = Prism;

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';

import { Toaster } from '@/components/ui/sonner';
import { AppRouter } from './AppRouter';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster />
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);
