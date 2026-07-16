import React, { useRef } from 'react';
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
import { Textarea } from './ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import type { IApiCurrentUserSession, IApiResponse } from '@/api/client.api';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().trim().min(1, 'Please enter the email.').email(),
  message: z
    .string()
    .trim()
    .min(10, 'Please enter a message. Min 10 characters.'),
  receiverRole: z.enum([USER_ROLE.Admin, USER_ROLE.Editor]),
});

export const CreateMember: React.FC = () => {
  const clientQuery = useQueryClient();

  const user = (clientQuery.getQueryData(['me']) as any)
    .data as IApiCurrentUserSession;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      message: '',
      receiverRole: undefined,
    },
  });

  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);
  const createInvitation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await axios.post<IApiResponse<any>>(`/api/users/invite`, {
        ...data,
      });
    },
    onSuccess: () => {
      form.reset();
      if (sheetCloseRef.current) {
        sheetCloseRef.current.click();
      }
      toast.success('Invitation created successfully!');
    },
    onError: (error) => {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || 'An error occurred'
        : 'Unknown error occurred';
      toast.error(errorMessage);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createInvitation.mutate(values);
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>New Member</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create Invitation</SheetTitle>
          <SheetDescription>
            Fill in the form below to create a new member invitation. Make sure
            to provide all the required information.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Please enter the email address of the new member.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="receiverRole"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role of member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {user?.user.role === USER_ROLE.Owner ? (
                        <SelectItem value="Admin">Admin</SelectItem>
                      ) : null}
                      <SelectItem value="Editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Please select the role of the new member.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write a message..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Please enter a message for the new member.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
              <Button type="submit" disabled={createInvitation.isPending}>
                {createInvitation.isPending
                  ? 'Creating...'
                  : 'Create Invitation'}
              </Button>
              <SheetClose ref={sheetCloseRef}></SheetClose>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
