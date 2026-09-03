'use client';

import React, { useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { Separator } from '@/components/ui/separator';
import { ADMINISTRATOR_SIDEBAR } from '@/constants/links.constants';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import type { IApiCurrentUserSession } from '@/api/client.api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Spinner } from '@/components/Spinner.components';

export default function AdministratorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: sessionData, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await axios.get('/api/users/me');
      return response.data;
    },
    retry: false,
  });

  const user = sessionData?.data?.user;

  useEffect(() => {
    if (!isLoading && !user) {
      toast.warning('To use dashboard please keep sign-in', {
        action: {
          label: 'Sign-in',
          onClick: () => navigate('/sign-in'),
        },
      });
      navigate('/sign-in');
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentPath = location.pathname.replace(/\/+$/, '');
  const currentPage =
    ADMINISTRATOR_SIDEBAR.find((item) => item.url === currentPath)?.title ||
    'Dashboard';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-zinc-50/50">
        <AppSidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-white px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>Admin</BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-secondary font-medium">
                      {currentPage}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <React.Suspense fallback={<Spinner />}>{children}</React.Suspense>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
