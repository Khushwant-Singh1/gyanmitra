import { IApiResponse, IApiSignUp } from '@/api/client.api';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReloadIcon } from '@radix-ui/react-icons';
import axios, { isAxiosError } from 'axios';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

const FormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof FormSchema>;

export const SignUp: React.FC = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await axios.post<IApiResponse<IApiSignUp>>(`/api/auth/viewer`, data);
      toast.success('Sign-Up successful!');
      window.location.href = '/email-verify';
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

  return (
    <div className="my-5">
      <Helmet>
        <title>Sign Up - Gyanmitra</title>
      </Helmet>
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-[500px]">
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>
              Enter your details below to create a new account.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
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
                          type="text"
                          {...field}
                        />
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
                        <Input placeholder="Gupta" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          placeholder="••••••••"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.formState.isSubmitting ? (
                  <Button disabled>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> Please
                    Wait
                  </Button>
                ) : (
                  <Button type="submit" variant={'secondary'}>
                    Submit
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <Link
              to={'/sign-in'}
              className={`${buttonVariants({ variant: 'link' })} !p-0`}
            >
              Already having an account?
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
