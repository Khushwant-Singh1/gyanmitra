'use client';

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOut, faUser, faGauge } from '@fortawesome/free-solid-svg-icons';
import { IApiResponse, type IApiCurrentUserSession } from '@/api/client.api';
import { toast } from 'sonner';
import axios, { isAxiosError } from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { useQueryClient } from '@tanstack/react-query';
import { USER_ROLE } from '@/constants/index.constants';

export const UserOptions: React.FC = () => {
  const clientQuery = useQueryClient();

  const user = (clientQuery.getQueryData(['me']) as any)
    ?.data as IApiCurrentUserSession | undefined;

  const handleSignOut = async () => {
    try {
      await axios.post<IApiResponse<any>>(`/api/auth/sign-out`);
      clientQuery.invalidateQueries({ queryKey: ['me'] });
      window.location.reload();
      toast.success('Sign-out successfully');
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response) {
          const errorMessage =
            error.response.data?.message ||
            error.message ||
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

  const currentUser = user?.user;

  if (currentUser)
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="capitalize flex items-center gap-2">
            <Avatar className="h-8 w-8 rounded-lg overflow-hidden border border-zinc-200 shadow-xs">
              {currentUser.avatar && (
                <AvatarImage src={currentUser.avatar} alt={currentUser.firstName} className="object-cover" />
              )}
              <AvatarFallback className="rounded-lg uppercase bg-sky-50 text-sky-800 font-bold text-xs">
                {currentUser.firstName.charAt(0) + currentUser.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block font-medium text-sm">
              {currentUser.firstName + ' ' + currentUser.lastName}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-80 flex-col gap-2 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
              {currentUser.avatar && (
                <AvatarImage src={currentUser.avatar} alt={currentUser.firstName} className="object-cover" />
              )}
              <AvatarFallback className="rounded-lg uppercase bg-sky-50 text-sky-800 font-bold text-sm">
                {currentUser.firstName.charAt(0) + currentUser.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs min-w-0">
              <div className="font-semibold capitalize truncate text-sm text-zinc-900">
                {currentUser.firstName + ' ' + currentUser.lastName}
              </div>
              <div className="text-zinc-500 truncate">{currentUser.email}</div>
              <div className="mt-0.5 inline-block text-[10px] font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-1.5 py-0.5 rounded">
                {currentUser.role}
              </div>
            </div>
          </div>
          <Separator />
          {currentUser.role !== USER_ROLE.Viewer && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs gap-2"
                onClick={() => {
                  window.location.href = '/administrator/profile';
                }}
              >
                <FontAwesomeIcon icon={faUser} />
                My Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs gap-2"
                onClick={() => {
                  window.location.href = '/administrator';
                }}
              >
                <FontAwesomeIcon icon={faGauge} />
                Dashboard
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <FontAwesomeIcon icon={faSignOut} />
            Sign Out
          </Button>
        </PopoverContent>
      </Popover>
    );
};
