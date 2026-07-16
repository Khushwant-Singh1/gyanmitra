import type {
  IApiArticleApprovalRequest,
  IApiCurrentUserSession,
  IApiResponse,
} from '@/api/client.api';
import { ErrorAlert } from '@/components/ErrorAlert.components';
import { Spinner } from '@/components/Spinner.components';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { DATE_OPTION, USER_ROLE } from '@/constants/index.constants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const RequestCard: React.FC<{
  data: IApiArticleApprovalRequest;
  userRole: USER_ROLE;
}> = ({ data, userRole }) => {
  const queryClient = useQueryClient();

  const rejectMutation = useMutation({
    mutationFn: async ({ rejectedMessage }: { rejectedMessage: string }) => {
      const response = await axios.put(
        `/api/article-requests/${data._id}/reject`,
        { rejectedMessage: rejectedMessage }
      );
      return { data: response.data };
    },
    onMutate: async () => {
      const toastId = toast.loading('Rejecting the request...');
      return { toastId };
    },
    onSuccess: (_data, _variables, context) => {
      if (context?.toastId) toast.dismiss(context.toastId);
      toast.success('Successfully rejected request.');
      queryClient.invalidateQueries({
        queryKey: ['article-requests', 'myRequests&Receives'],
      });
    },
    onError: (error, _variables, context) => {
      if (context?.toastId) toast.dismiss(context.toastId);
      const errorMessage =
        (error as any).response?.data?.message ||
        error.message ||
        'Unknown error occurred';
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.delete(`/api/article-requests/${data._id}`);
      return { data: response.data };
    },
    onMutate: async () => {
      const toastId = toast.loading('Deleting the request...');
      return { toastId };
    },
    onSuccess: (_data, _variables, context) => {
      if (context?.toastId) toast.dismiss(context.toastId);
      toast.success('Successfully deleted request.');
      queryClient.invalidateQueries({
        queryKey: ['article-requests', 'myRequests&Receives'],
      });
    },
    onError: (error, _variables, context) => {
      if (context?.toastId) toast.dismiss(context.toastId);
      const errorMessage =
        (error as any).response?.data?.message ||
        error.message ||
        'Unknown error occurred';
      toast.error(errorMessage);
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.put(
        `/api/articles/${data.articleId}/publish`,
        { articleApprovalRequestId: data._id }
      );
      return { data: response.data };
    },
    onMutate: async () => {
      const toastId = toast.loading('Approving the request...');
      return { toastId };
    },
    onSuccess: (_data, _variables, context) => {
      if (context?.toastId) toast.dismiss(context.toastId);
      toast.success('Successfully approved request.');
      queryClient.invalidateQueries({
        queryKey: ['article-requests', 'myRequests&Receives'],
      });
    },
    onError: (error, _variables, context) => {
      if (context?.toastId) toast.dismiss(context.toastId);
      const errorMessage =
        (error as any).response?.data?.message ||
        error.message ||
        'Unknown error occurred';
      toast.error(errorMessage);
    },
  });

  const initials = data.user
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="border-border rounded border p-3">
      <div className="flex items-center justify-between text-sm font-medium">
        <div className="flex items-center space-x-3 capitalize">
          <Avatar className="h-9 w-9 rounded-lg">
            <AvatarFallback className="rounded-lg uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span>{data.user}</span>
        </div>
        <div>
          <span>
            Requested on{' '}
            {new Date(data.createdAt).toLocaleDateString('en', DATE_OPTION)}
          </span>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-sm">
          <span className="text-secondary">Message:</span> {data.message}{' '}
          <Link
            to={`/edit/${data.articleId}/?mode=View`}
            className={buttonVariants({
              variant: 'link',
              size: 'sm',
              className: 'text-secondary font-semibold',
            })}
          >
            ...View Article
          </Link>
        </p>
      </div>
      {data.rejectedMessage && (
        <div>
          <p className="text-sm">
            <span className="text-secondary">Rejection Message:</span>{' '}
            {data.rejectedMessage}
          </p>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-primary text-sm font-bold">
          ● <span className="font-semibold">Reason</span>: {data.reason}
        </span>
        {userRole === USER_ROLE.Editor ? (
          <div>
            <span className="text-primary text-sm font-bold">
              ● <span className="font-semibold">Status</span>:{' '}
              <span className="text-secondary">{data.status}</span>
            </span>
            <Button
              variant={'outline'}
              className="text-destructive ml-2"
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Button onClick={() => approveMutation.mutate()} size={'sm'}>
              Approve
            </Button>
            <Button
              onClick={() => {
                const rejectedMessage = prompt('Enter rejection message:');
                if (rejectedMessage) {
                  rejectMutation.mutate({ rejectedMessage });
                }
              }}
              size={'sm'}
              variant="destructive"
            >
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const ArticleRequests: React.FC = () => {
  const queryClient = useQueryClient();

  const user = (
    (queryClient.getQueryData(['me']) as any).data as IApiCurrentUserSession
  ).user;

  const { data, isLoading, error } = useQuery<
    IApiResponse<IApiArticleApprovalRequest[]>
  >({
    queryKey: ['article-requests', 'myRequests&Receives'],
    queryFn: async () => {
      const endpoint =
        user.role === USER_ROLE.Editor
          ? '/api/article-requests/my'
          : '/api/article-requests/received';
      const response =
        await axios.get<IApiResponse<IApiArticleApprovalRequest[]>>(endpoint);
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
        <ErrorAlert message={errorMessage} />
      </div>
    );
  }

  return (
    <div>
      <title>Articles Requests - Gyanmitra</title>
      {data.data.length === 0 ? (
        <p className="text-muted-foreground w-full text-center text-base font-medium">
          No requests found
        </p>
      ) : (
        <div className="border-border flex flex-col gap-4 rounded-xl border p-4 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((request) => (
            <RequestCard
              key={request._id}
              userRole={user.role}
              data={request}
            />
          ))}
        </div>
      )}
    </div>
  );
};
