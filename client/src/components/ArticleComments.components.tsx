import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SubmitHandler, useForm } from 'react-hook-form';
import type {
  IApiArticle,
  IApiCurrentUserSession,
  IApiError,
  IApiResponse,
} from '@/api/client.api';
import axios, { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { CSeparator } from './ui/customSeparator';
import { Button } from './ui/button';
import TimeAgo from './TimeAgo.components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const ArticleCommentsSection: React.FC<{
  articleId: string;
  articleSlug: string;
  comments: IApiArticle['articleDetails']['comments'];
}> = ({ articleId, articleSlug, comments }) => {
  const clientQuery = useQueryClient();

  const user = (
    (clientQuery.getQueryData(['me']) as any).data as IApiCurrentUserSession
  ).user;

  const postMutation = useMutation({
    mutationFn: async ({
      articleId,
      message,
    }: {
      articleId: string;
      message: string;
      slug: string;
    }) => {
      const response = await axios.post<
        IApiResponse<{
          userName: string;
          message: string;
          _id: string;
          updatedAt: string;
        }>
      >(`/api/comments/${articleId}`, {
        message: message,
      });
      return response.data;
    },
    onSuccess: (_data, { slug }) => {
      toast.success('Comment posted successfully!');
      clientQuery.invalidateQueries({ queryKey: ['articles', 'page', slug] });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response) {
          const apiError = error.response.data as IApiError;
          const errorMessage = apiError?.message || 'An error occurred';
          toast.error(errorMessage);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Unknown error occurred');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ commentId }: { commentId: string }) => {
      await axios.delete(`/api/comments/${commentId}`);
    },
    onSuccess: () => {
      toast.success('Comment deleted successfully!');
      clientQuery.invalidateQueries({
        queryKey: ['articles', 'page', articleSlug],
      });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response) {
          const apiError = error.response.data as IApiError;
          const errorMessage = apiError?.message || 'An error occurred';
          toast.error(errorMessage);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Unknown error occurred');
      }
    },
  });

  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState } = useForm<{
    message: string;
  }>();

  const onSubmit: SubmitHandler<{ message: string }> = async (formData) => {
    if (!articleId) return;

    if (!user) {
      toast.warning('Unauthorize Request', {
        description:
          'User must first sign-in to post comment. Your message is saved in your clipboard.',
        action: {
          label: 'SignIn',
          onClick: () => {
            navigator.clipboard.writeText(formData.message);
            navigate('/sign-in');
          },
        },
      });
      return;
    }

    if (!user.isEmailVerified) {
      toast.warning('Unauthorize Request', {
        description:
          'User must first verify email to post comment. Your message is saved in your clipboard.',
        action: {
          label: 'Click To Verify',
          onClick: () => {
            navigator.clipboard.writeText(formData.message);
            navigate('/email-verify');
          },
        },
      });
      return;
    }

    postMutation.mutate({
      articleId: articleId,
      message: formData.message,
      slug: articleSlug,
    });
    reset();
  };

  return (
    <div>
      <span className="text-tertiary text-xl font-semibold">Comments</span>
      <CSeparator variant="full" className="relative mb-5" />
      <form onSubmit={handleSubmit(onSubmit)} className="mb-5 space-y-2">
        {formState.errors.message ? (
          <Label htmlFor="message" className="text-red-600">
            {formState.errors.message.message}
          </Label>
        ) : null}
        <Textarea
          id="message"
          className="resize-none"
          placeholder="Type your message here."
          {...register('message', {
            required: true,
            minLength: {
              value: 10,
              message: 'Message must be at least 10 characters long',
            },
            maxLength: {
              value: 300,
              message: 'Message cannot exceed 300 characters',
            },
          })}
        />
        <Button disabled={postMutation.isPending}>
          {postMutation.isPending ? (
            <span className="whitespace-nowrap">
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Posting
            </span>
          ) : (
            <span>Comment Post</span>
          )}
        </Button>
      </form>
      {comments.length === 0 ? (
        <span className="font-semibold">
          अभी तक कोई कमेंट नहीं है। सबसे पहले कमेंट करें।
        </span>
      ) : (
        <Card className="space-y-2 overflow-hidden p-2 lg:p-5">
          {comments.map(({ userName, message, updatedAt, _id }) => (
            <div className="rounded-lg border" key={_id}>
              <CardHeader className="px-3 pb-2 pt-3 lg:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="rounded-lg">
                      <AvatarFallback className="rounded-lg capitalize">
                        <p> {userName.split(' ')[0].charAt(0)}</p>
                        <p> {userName.split(' ')[1].charAt(0)}</p>
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-sm capitalize lg:text-base">
                      {userName}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TimeAgo timestamp={new Date(updatedAt)} icon={true} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant={'ghost'} size={'icon'}>
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              deleteMutation.mutate({ commentId: _id });
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 text-sm lg:px-7 lg:text-base">
                {message}
              </CardContent>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};
