import {
  IApiDraftArticleManage,
  IApiResponse,
  type IApiCurrentUserSession,
} from '@/api/client.api';
import { CreateDraftArticle } from '@/components/CreateDraftArticle.components';
import { DateDisplay } from '@/components/DateDisplay.components';
import { ErrorAlert } from '@/components/ErrorAlert.components';
import { FeaturedMedia } from '@/components/FeaturedMedia.components';
import { Spinner } from '@/components/Spinner.components';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { USER_ROLE } from '@/constants/index.constants';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const RequestArticle: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string;
}> = ({ open, onOpenChange, articleId }) => {
  const [openCombobox, setOpenCombobox] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [receiverId, setReceiverId] = React.useState('');

  const queryClient = useQueryClient();

  const userNames = (
    queryClient.getQueryData(['users', 'all', 'name']) as IApiResponse<
      { _id: string; name: string }[]
    >
  ).data;

  const requestArticle = useMutation({
    mutationFn: async ({
      _message,
      _receiverId,
    }: {
      _message: string;
      _receiverId: string;
    }) => {
      const response = await axios.post(`/api/article-requests/` + articleId, {
        message: _message,
        receiverId: _receiverId,
      });
      return { data: response.data };
    },
    onMutate: async () => {
      const toastId = toast.loading('Request sending, for publish.');
      return { toastId };
    },
    onSuccess: (_data, {}, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      toast.success('Successfully Request sended.');
    },
    onError: (error, {}, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || error.message || 'An error occurred'
        : 'Unknown error occurred';
      toast.error(errorMessage);
    },
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request for Publish</DialogTitle>
          <DialogDescription>
            You can request to publish or update this draft article.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="message" className="resize-none">
              Select Receiver
            </Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between capitalize"
                >
                  {receiverId
                    ? userNames.find((user) => user._id === receiverId)?.name
                    : 'Select Receiver...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search receiver name..." />
                  <CommandList>
                    <CommandEmpty>No framework found.</CommandEmpty>
                    <CommandGroup>
                      {userNames.map((user) => (
                        <CommandItem
                          key={user._id}
                          value={user._id}
                          onSelect={(currentValue) => {
                            setReceiverId(
                              currentValue === receiverId ? '' : currentValue
                            );
                            setOpenCombobox(false);
                          }}
                          className="capitalize"
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              receiverId === user._id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {user.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="message">Add message for request</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message to the receiver..."
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              if (message.length === 0 || receiverId.length === 0)
                return toast.error('Please fill all fields');
              open = false;
              onOpenChange(open);
              requestArticle.mutate({
                _message: message,
                _receiverId: receiverId,
              });
            }}
          >
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const DraftArticle: React.FC = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [articleSelected, setArticleSelected] = useState('');

  const queryClient = useQueryClient();
  const userMe = (
    (queryClient.getQueryData(['me']) as any).data as IApiCurrentUserSession
  ).user;

  const results = useQueries({
    queries: [
      {
        queryKey: ['articles', 'drafts'],
        queryFn: async () => {
          const response =
            await axios.get<IApiResponse<IApiDraftArticleManage[]>>(
              `/api/articles/drafts`
            );
          return response.data;
        },
        staleTime: Infinity,
      },
      {
        queryKey: ['users', 'all', 'name'],
        queryFn: async () => {
          const response = await axios.get<
            IApiResponse<{ _id: string; name: string }[]>
          >(`/api/users/name?role=${USER_ROLE.Admin},${USER_ROLE.Owner}`);
          return response.data;
        },
        staleTime: Infinity,
      },
    ],
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ _id }: { _id: string }) => {
      const response = await axios.delete('/api/articles/' + _id);
      return { data: response.data };
    },
    onMutate: async ({ _id }) => {
      const toastId = toast.loading('Deleting Draft Article', { id: _id });
      return { toastId };
    },
    onSuccess: (_data, {}, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      toast.success('Successfully Deleted Draft Article');
      queryClient.invalidateQueries({ queryKey: ['articles', 'drafts'] });
    },
    onError: (error, {}, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || error.message || 'An error occurred'
        : 'Unknown error occurred';
      toast.error(errorMessage);
    },
  });

  const mergeArticle = useMutation({
    mutationFn: async ({
      _id,
      originalArticleId: originalArticleId,
    }: {
      _id: string;
      originalArticleId: string;
    }) => {
      const response = await axios.put(
        `/api/articles/${originalArticleId}/update`,
        { cloneArticleId: _id }
      );
      return { data: response.data };
    },
    onMutate: async ({ _id }) => {
      const toastId = toast.loading('Merging Draft Article With Original', {
        id: _id,
      });
      return { toastId };
    },
    onSuccess: (_data, {}, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      toast.success('Successfully Merged Draft Article With Original');
      queryClient.invalidateQueries({ queryKey: ['articles', 'drafts'] });
    },
    onError: (error, {}, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || error.message || 'An error occurred'
        : 'Unknown error occurred';
      toast.error(errorMessage);
    },
  });

  const publishArticle = useMutation({
    mutationFn: async ({ _id }: { _id: string }) => {
      const response = await axios.put(`/api/articles/${_id}/publish`);
      return { data: response.data };
    },
    onMutate: async ({ _id }) => {
      const toastId = toast.loading('Publishing Draft Article', { id: _id });
      return { toastId };
    },
    onSuccess: (_data, {}, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      toast.success('Successfully Published Draft Article');
      queryClient.invalidateQueries({ queryKey: ['articles', 'drafts'] });
    },
    onError: (error, {}, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || error.message || 'An error occurred'
        : 'Unknown error occurred';
      toast.error(errorMessage);
    },
  });

  const [articles, users] = results;

  const isLoading = articles.isLoading || users.isLoading;

  const isError = articles.isError || users.isError;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !articles.data || !users.data) {
    const errorMessage =
      articles.error?.message || users.error?.message || 'An error occurred';

    return (
      <div className="relative flex h-screen items-center justify-center py-4">
        <ErrorAlert message={errorMessage} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Helmet>
        <title>Draft Articles - Gyanmitra</title>
      </Helmet>
      <div className="flex w-full justify-end">
        <CreateDraftArticle />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Articles</CardTitle>
          <CardDescription>
            These articles are drafts and are visitable only by the creator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {articles.data.data.length ? (
            articles.data.data.map((article) => (
              <div
                className="flex h-auto flex-col gap-4 overflow-auto rounded-xl border p-4 transition-colors hover:bg-gray-50 sm:h-36 sm:flex-row md:h-32"
                key={article._id}
              >
                <FeaturedMedia
                  url={article.featuredMedia.fileUrl}
                  playable={false}
                  fileType={article.featuredMedia.fileType}
                  thumbnail={article.featuredMedia.thumbnail}
                  name={article.featuredMedia.name}
                  className="aspect-video h-full rounded-md object-cover sm:aspect-square"
                />
                <div className="flex w-full flex-col justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="line-clamp-1 text-lg font-semibold">
                          {article.headline}
                        </span>
                        <Badge variant={'secondary'} className="h-min">
                          {article.category}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <Link
                          to={'/edit/' + article._id}
                          className={buttonVariants({ variant: 'ghost' })}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant={'ghost'}>
                              <FontAwesomeIcon icon={faEllipsisVertical} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() =>
                                deleteMutation.mutate({ _id: article._id })
                              }
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {userMe.role === USER_ROLE.Editor ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setDialogOpen(true);
                                  setArticleSelected(article._id);
                                }}
                              >
                                Request
                              </DropdownMenuItem>
                            ) : article.originalArticleId ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  if (article.originalArticleId) {
                                    mergeArticle.mutate({
                                      _id: article._id,
                                      originalArticleId:
                                        article.originalArticleId,
                                    });
                                  }
                                }}
                              >
                                Merge
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  publishArticle.mutate({ _id: article._id })
                                }
                              >
                                Publish
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="text-customMediumGray line-clamp-2 text-sm leading-tight">
                      {article.description}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <div className="flex flex-wrap gap-1 space-x-1 font-semibold">
                      <span className="mr-1">Tags:</span>
                      {article.tags.length
                        ? article.tags.map((tag, index) => (
                            <Badge
                              variant={'outline'}
                              key={index}
                              className="whitespace-nowrap"
                            >
                              {tag}
                            </Badge>
                          ))
                        : 'No Tags'}
                    </div>
                    <DateDisplay
                      date={new Date(article.createdDate)}
                      className="whitespace-nowrap"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground text-center font-semibold">
              No articles found. Create New Draft
            </div>
          )}
        </CardContent>
      </Card>
      <RequestArticle
        open={isDialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
        }}
        articleId={articleSelected}
      />
    </div>
  );
};
