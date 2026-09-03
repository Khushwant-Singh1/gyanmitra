'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQueries } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import axios from 'axios';
import type { IApiCurrentUserSession, IApiResponse } from '@/api/client.api';
import Prism from 'prismjs';

if (typeof globalThis !== 'undefined') {
  (globalThis as { Prism?: typeof Prism }).Prism = Prism;
}

function GlobalDataPrefetcher() {
  useQueries({
    queries: [
      {
        queryKey: ['me'],
        queryFn: async () => {
          const response =
            await axios.get<IApiResponse<IApiCurrentUserSession>>('/api/users/me');
          return response.data;
        },
        retry: false,
      },
      {
        queryKey: ['time'],
        queryFn: async () => {
          const response =
            await axios.get<IApiResponse<{ time: string }>>('/api/time');
          return response.data;
        },
        retry: 1,
      },
      {
        queryKey: ['categories', 'active'],
        queryFn: async () => {
          const response = await axios.get<IApiResponse<{ name: string }[]>>(
            `/api/categories/active`
          );
          return response.data;
        },
        staleTime: Infinity,
        retry: 1,
      },
      {
        queryKey: ['subCategories', '67e442af58df1db1ee298769', 'active'],
        queryFn: async () => {
          const response = await axios.get<IApiResponse<{ name: string }[]>>(
            `/api/categories/67e442af58df1db1ee298769/subcategories/active`
          );
          return response.data;
        },
        staleTime: Infinity,
        retry: 1,
      },
    ],
  });

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalDataPrefetcher />
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
