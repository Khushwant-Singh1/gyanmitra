import React, { useEffect } from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import { Helmet } from 'react-helmet-async';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { isAxiosError } from 'axios';
import {
  IApiResponse,
  IApiSignUp,
  type IApiCurrentUserSession,
} from '@/api/client.api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';

const FormSchema = z.object({
  pin: z.string().toUpperCase().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
});

export const EmailVerify: React.FC = () => {
  const clientQuery = useQueryClient();

  const user = (clientQuery.getQueryData(['me']) as any)
    .data as IApiCurrentUserSession;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: '',
    },
  });

  const navigate = useNavigate();

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await axios.post<IApiResponse<IApiSignUp>>(
        `/api/auth/viewer/verify-email/` + data.pin
      );
      toast.success('Email Verified successful!');
      clientQuery.invalidateQueries({ queryKey: ['me'] });
      navigate('/');
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
  }
  let toastId: string | number;
  const resendVerification = async () => {
    try {
      await axios.post<IApiResponse<IApiSignUp>>(
        `/api/auth/viewer/resend-verification`,
        {},
        { params: { userId: user?.user._id } }
      );
      toastId && toast.dismiss(toastId);
      toast.success('Email verification sended successful!');
      clientQuery.invalidateQueries({ queryKey: ['me'] });
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
  useEffect(() => {
    if (user.user && !user?.user.isEmailVerified) {
      toastId = toast.loading('Requesting for sending email verification.');
      resendVerification();
    }
  }, []);

  return (
    <div className="my-5">
      <Helmet>
        <title>Verify Email - Gyanmitra</title>
      </Helmet>
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-[500px]">
          <CardHeader>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              Enter your one-time password below to verify your email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-2/3 space-y-6"
              >
                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>One-Time Password</FormLabel>
                      <FormControl>
                        <InputOTP
                          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                          maxLength={6}
                          {...field}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription>
                        Please enter the one-time password sent to your email.
                        (Check your spam folder if you can't find it.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Submit</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
