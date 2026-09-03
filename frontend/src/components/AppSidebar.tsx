'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { ADMINISTRATOR_SIDEBAR } from '@/constants/links.constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ChevronsUpDown } from 'lucide-react';
import { IApiResponse, type IApiCurrentUserSession } from '@/api/client.api';
import { toast } from 'sonner';
import { faCog, faHome, faSignOut } from '@fortawesome/free-solid-svg-icons';
import axios, { isAxiosError } from 'axios';
import type { USER_ROLE } from '@/constants/index.constants';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

import { useState } from 'react';
import { ProfileSettings } from './ProfileSettings.components';

export function AppSidebar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const clientQuery = useQueryClient();

  const user = (
    (clientQuery.getQueryData(['me']) as any)?.data as IApiCurrentUserSession | undefined
  )?.user;
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await axios.post<IApiResponse<any>>(`/api/auth/sign-out`);
      const existingMe = (clientQuery.getQueryData(['me']) as any) || {};
      clientQuery.setQueryData(['me'], {
        ...existingMe,
        data: { user: null },
      });
      navigate('/', { state: true });
      toast.success('Sign-out successfully');
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response) {
          const errorMessage =
            error.request.data?.message ||
            error.response ||
            'An error occurred';
          toast.error(errorMessage);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Unknown error occurred');
      }
    }
  };

  if (user)
    return (
      <>
        <ProfileSettings
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
        />
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Application</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {ADMINISTRATOR_SIDEBAR.filter(({ access }) => {
                    return access.includes(user.role as USER_ROLE);
                  }).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink
                          to={item.url}
                          key={item.title}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2.5 w-full py-2 px-2.5 rounded-md text-sm transition-colors',
                              isActive
                                ? 'text-secondary font-semibold bg-secondary/10'
                                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                            )
                          }
                        >
                          <FontAwesomeIcon
                            icon={item.icon}
                            className="h-4 w-4 shrink-0 text-current"
                          />
                          <span className="truncate group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg uppercase">
                          {user.firstName.charAt(0) +
                            user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold capitalize">
                          {user.firstName + ' ' + user.lastName}
                        </span>
                        <span className="truncate text-xs">
                          {user.email}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarFallback className="rounded-lg uppercase">
                            {user.firstName.charAt(0) +
                              user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold capitalize">
                            {user.firstName + ' ' + user.lastName}
                          </span>
                          <span className="truncate text-xs">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/')}>
                      <FontAwesomeIcon icon={faHome} />
                      Home
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                        <FontAwesomeIcon icon={faCog} />
                        Profile Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <FontAwesomeIcon icon={faSignOut} />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </>
    );
}
