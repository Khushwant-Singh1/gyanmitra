import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOut } from '@fortawesome/free-solid-svg-icons';
import { IApiResponse, type IApiCurrentUserSession } from '@/api/client.api';
import { toast } from 'sonner';
import axios, { isAxiosError } from 'axios';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { useQueryClient } from '@tanstack/react-query';

export const UserOptions: React.FC = () => {
  const clientQuery = useQueryClient();

  const user = (clientQuery.getQueryData(['me']) as any)
    .data as IApiCurrentUserSession;

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

  if (user.user)
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="capitalize">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg uppercase">
                {user.user.firstName.charAt(0) + user.user.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block">
              {user.user.firstName + ' ' + user.user.lastName}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-80 flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg uppercase">
                {user.user.firstName.charAt(0) + user.user.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs">
              <div className="font-semibold capitalize">
                {user.user.firstName + ' ' + user.user.lastName}
              </div>
              <div>{user.user.email}</div>
            </div>
          </div>
          <Separator />
          {/* <Button variant={'outline'}>
            <FontAwesomeIcon icon={faCog} /> Setting
          </Button> */}
          <Button variant={'outline'} onClick={handleSignOut}>
            <FontAwesomeIcon icon={faSignOut} />
            Sign Out
          </Button>
        </PopoverContent>
      </Popover>
    );
};
