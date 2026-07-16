import type { IApiIsValidInviteToken, IApiResponse } from '@/api/client.api';
import { ErrorAlert } from '@/components/ErrorAlert.components';
import { Spinner } from '@/components/Spinner.components';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
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
import { USER_ROLE } from '@/constants/index.constants';
import { toast } from 'sonner';
import { ReloadIcon } from '@radix-ui/react-icons';

const formSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'Enter your first name')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Enter your first name')
    .max(50, 'Last name must be less than 50 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const AdministratorSignUp: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
    },
  });

  const navigate = useNavigate();

  const signUpMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await axios.post<IApiResponse<any>>(`/api/auth/admin/` + token, {
        ...data,
      });
    },
    onSuccess: (data) => {
      form.reset();
      toast.success('Account created successfully!');
      const address =
        data.data.data.user.role === USER_ROLE.Editor
          ? '/administrator/articles-draft'
          : '/administrator';
      navigate(address);
    },
    onError: (error) => {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || 'An error occurred'
        : 'Unknown error occurred';
      toast.error(errorMessage);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    signUpMutation.mutate(values);
  }

  const { data, isLoading, error } = useQuery<
    IApiResponse<IApiIsValidInviteToken>
  >({
    queryKey: ['invite', token],
    queryFn: async () => {
      const response = await axios.get<IApiResponse<IApiIsValidInviteToken>>(
        '/api/users/invite/validate/' + token
      );
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !data) {
    let errorMessage = 'An error occurred';

    if (isAxiosError(error)) {
      errorMessage =
        error.response?.data?.message || error.message || errorMessage;
    }

    return (
      <>
        <div className="relative flex h-screen items-center justify-center py-4">
          <div>
            <ErrorAlert message={errorMessage} />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="my-5">
      <Helmet>
        <title>Administrator Sign Up - Gyanmitra</title>
      </Helmet>
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-[500px]">
          <CardHeader>
            <CardTitle>Administrator Sign Up</CardTitle>
            <CardDescription>
              Enter your details below to create a new account.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Geetanjali"
                          id="firstName"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Please enter your first name.
                      </FormDescription>
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
                        <Input placeholder="Gupta" id="lastName" {...field} />
                      </FormControl>
                      <FormDescription>
                        Please enter your Last name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={undefined}
                  name=""
                  render={() => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input disabled value={data.data.receiverEmail} />
                      </FormControl>
                      <FormDescription>
                        Please enter your Email.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={undefined}
                  name=""
                  render={() => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select defaultValue={data.data.receiverRole} disabled>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={USER_ROLE.Admin}>
                            {USER_ROLE.Admin}
                          </SelectItem>
                          <SelectItem value={USER_ROLE.Editor}>
                            {USER_ROLE.Editor}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Please select your role.
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
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Please enter your password.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {signUpMutation.isPending ? (
                  <Button disabled>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> Please
                    Wait...
                  </Button>
                ) : (
                  <Button type="submit" variant={'secondary'}>
                    Submit
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
