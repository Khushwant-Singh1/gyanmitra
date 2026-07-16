import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormMessage,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { IApiResponse, IApiSignIn } from '@/api/client.api';
import { ReloadIcon } from '@radix-ui/react-icons';
import axios, { isAxiosError } from 'axios';
import { USER_ROLE } from '@/constants/index.constants';
import { Helmet } from 'react-helmet-async';

// Define validation schema with Zod
const FormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof FormSchema>;

export const SignIn: React.FC = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await axios.post<IApiResponse<IApiSignIn>>(
        `/api/auth/sign-in`,
        data
      );
      toast.success('Sign-in successful!');

      const location =
        response.data.data.user.role === USER_ROLE.Viewer
          ? '/'
          : response.data.data.user.role === USER_ROLE.Editor
            ? '/administrator/articles-draft'
            : '/administrator';
      window.location.href = location;
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
        <title>Sign In - Gyanmitra</title>
      </Helmet>
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-[500px]">
          <CardHeader>
            <CardTitle>Login To Your Account</CardTitle>
            <CardDescription>
              Enter your email and password below to log in to your account.
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
              to={'/sign-up'}
              className={`${buttonVariants({ variant: 'link' })} !p-0`}
            >
              Don’t have an account?
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
