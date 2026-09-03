'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { IApiResponse, IApiCurrentUserSession } from '@/api/client.api';

interface ProfileSettingsProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  children,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const queryClient = useQueryClient();
  const session = queryClient.getQueryData(['me']) as
    | IApiResponse<IApiCurrentUserSession>
    | undefined;

  const currentUser = session?.data?.user;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || '');
      setLastName(currentUser.lastName || '');
    }
  }, [currentUser, isOpen]);

  const updateMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string }) => {
      const res = await axios.patch<IApiResponse<{ user: any }>>(
        '/api/users/profile',
        data
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Profile name updated successfully!');
      // Update session query cache
      queryClient.setQueryData(
        ['me'],
        (old: IApiResponse<IApiCurrentUserSession> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              user: {
                ...old.data.user,
                firstName: data.data.user.firstName,
                lastName: data.data.user.lastName,
              },
            },
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'names'] });
      setOpen(false);
    },
    onError: (error) => {
      const msg = isAxiosError(error)
        ? error.response?.data?.message || 'Failed to update profile'
        : 'An error occurred';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.warning('First name and last name cannot be empty');
      return;
    }
    updateMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>
              Update your display name. Changes will automatically update your author name across all articles you wrote.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right text-xs">
                First Name
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="col-span-3 text-xs"
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right text-xs">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="col-span-3 text-xs"
                placeholder="Enter last name"
                required
              />
            </div>
            {currentUser?.email && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-xs text-zinc-400">Email</Label>
                <span className="col-span-3 text-xs text-zinc-500 font-mono">
                  {currentUser.email}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
