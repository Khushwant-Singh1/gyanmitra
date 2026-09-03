'use client';

import React, { useRef, useState } from 'react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { Button } from './ui/button';
import { z } from 'zod';
import { USER_ROLE } from '@/constants/index.constants';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import type { IApiCurrentUserSession, IApiResponse } from '@/api/client.api';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const formSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters.')
    .max(50, 'First name must be less than 50 characters.'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters.')
    .max(50, 'Last name must be less than 50 characters.'),
  email: z
    .string()
    .trim()
    .min(1, 'Please enter an email.')
    .email('Please enter a valid email address.'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters.'),
  role: z.enum([USER_ROLE.Admin, USER_ROLE.Editor, USER_ROLE.Reporter], {
    required_error: 'Please select a role.',
  }),
});

export const CreateMember: React.FC = () => {
  const clientQuery = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const session = clientQuery.getQueryData(['me']) as any;
  const user = session?.data as IApiCurrentUserSession | undefined;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: USER_ROLE.Reporter,
    },
  });

  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);

  const createMemberMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await axios.post<IApiResponse<any>>(`/api/users/create`, {
        ...data,
      });
    },
    onSuccess: () => {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: USER_ROLE.Reporter,
      });
      clientQuery.invalidateQueries({ queryKey: ['users', 'all'] });
      if (sheetCloseRef.current) {
        sheetCloseRef.current.click();
      }
      toast.success('Member created successfully! You can share their login credentials.');
    },
    onError: (error) => {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || 'An error occurred'
        : 'Unknown error occurred';
      toast.error(errorMessage);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createMemberMutation.mutate(values);
  }

  const isOwner = user?.user.role === USER_ROLE.Owner;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>New Member</Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New Member</SheetTitle>
          <SheetDescription>
            Create a member account directly by setting their email ID and password.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Login ID)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="member@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be used as their login email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Set a password (min 6 characters) to share with them.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role of member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isOwner && (
                        <SelectItem value={USER_ROLE.Admin}>Admin</SelectItem>
                      )}
                      <SelectItem value={USER_ROLE.Editor}>Editor</SelectItem>
                      <SelectItem value={USER_ROLE.Reporter}>Reporter</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Permissions granted to this member.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={createMemberMutation.isPending}
              >
                {createMemberMutation.isPending
                  ? 'Creating Member...'
                  : 'Create Member'}
              </Button>
              <SheetClose ref={sheetCloseRef} className="hidden" />
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
