import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppSidebar } from './components/AppSidebar';
import { Separator } from './components/ui/separator';
import { ADMINISTRATOR_SIDEBAR } from './constants/links.constants';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import type { IApiCurrentUserSession } from './api/client.api';
import { useQueryClient } from '@tanstack/react-query';

export default function AdministratorLayout() {
  const location = useLocation();
  const clientQuery = useQueryClient();

  const user = (clientQuery.getQueryData(['me']) as any)
    .data as IApiCurrentUserSession;

  const navigate = useNavigate();
  if (!user.user)
    toast.warning('To use dashboard please keep sign-in', {
      action: {
        label: 'Sign-in',
        onClick: () => navigate('/sign-in'),
      },
    });

  const currentPath = location.pathname.replace(/\/+$/, '');

  const currentPage =
    ADMINISTRATOR_SIDEBAR.find((item) => item.url === currentPath)?.title ||
    'Page Not Found';

  if (user.user)
    return (
      <SidebarProvider>
        <AppSidebar />
        <main className="flex w-full flex-col gap-2 p-2">
          <div className="sticky top-0 z-50 flex flex-row items-center justify-between bg-zinc-50 p-2 text-sm">
            <div className="flex flex-row items-center gap-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-[70%]" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>Admin</BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-secondary">
                      {currentPage}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
          <Separator />
          <div className="*:p-.5 md:*:p-3 lg:*:p-4 xl:*:p-5">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    );
}
