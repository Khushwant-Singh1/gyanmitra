import { IApiManageComment, IApiResponse } from '@/api/client.api';
import { ErrorAlert } from '@/components/ErrorAlert.components';
import { Spinner } from '@/components/Spinner.components';
import TimeAgo from '@/components/TimeAgo.components';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

export const ManageComment: React.FC = () => {
  const clientQuery = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await axios.delete('/api/comments/' + id);
      return response.data;
    },
    onMutate: () => {
      const toastID = toast.loading('Deleting Comment');
      return { toastID };
    },
    onSuccess: (_, { id }, context) => {
      toast.dismiss(context.toastID);
      clientQuery.setQueryData(
        ['comments', 'all'],
        (oldComments: IApiResponse<IApiManageComment[]>) => {
          return {
            ...oldComments,
            data: oldComments.data.filter((comment) => {
              return comment._id !== id;
            }),
          };
        }
      );
      toast.success('Successfully deleted comment');
    },
    onError: (error, {}, context) => {
      if (context?.toastID) {
        toast.dismiss(context.toastID);
      }
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || error.message || 'An error occurred'
        : 'Unknown error occurred';
      toast.error(errorMessage);
    },
  });

  const { data, isLoading, error } = useQuery<
    IApiResponse<IApiManageComment[]>
  >({
    queryKey: ['comments', 'all'],
    queryFn: async () => {
      const response =
        await axios.get<IApiResponse<IApiManageComment[]>>(`/api/comments/`);
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
      <div className="relative flex h-screen items-center justify-center py-4">
        <div>
          <ErrorAlert message={errorMessage} />
        </div>
      </div>
    );
  }
  return (
    <div>
      <Helmet>
        <title>Comments - Gyanmitra</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
          <CardDescription>
            View comments posted by the viewers on your articles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-5">
            {data.data.length ? (
              data.data.map((comment) => (
                <div
                  key={comment._id}
                  className="min-w-[350px] flex-1 space-y-2 overflow-hidden rounded-xl border p-2 py-3"
                >
                  <div className="flex items-center justify-between overflow-auto">
                    <div className="flex gap-1.5">
                      <Avatar>
                        <AvatarFallback className="uppercase">
                          {comment.userName.firstName[0] +
                            comment.userName.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold capitalize">
                          {comment.userName.firstName +
                            ' ' +
                            comment.userName.lastName}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {comment.email}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            deleteMutation.mutate({ id: comment._id })
                          }
                        >
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Article</DropdownMenuItem>
                        <DropdownMenuItem>View User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="px-2 text-justify text-sm">{comment.message}</p>
                  <div className="flex justify-end">
                    <TimeAgo
                      timestamp={new Date(comment.updatedAt)}
                      className="text-muted-foreground mr-1 whitespace-nowrap text-sm"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div>No comments yet.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
