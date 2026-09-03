'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { IApiResponse } from '@/api/client.api';
import { Spinner } from '@/components/Spinner.components';
import { ErrorAlert } from '@/components/ErrorAlert.components';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faClock, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import { ScheduleArticleModal } from '@/components/ScheduleArticleModal.components';
import TimeAgo from '@/components/TimeAgo.components';

export interface IScheduledArticle {
  _id: string;
  headline: string;
  slug: string;
  description: string;
  scheduledPublishDate: string;
  status: string;
  categoryName?: string;
  authorName?: string;
  lastUpdated: string;
}

export const ScheduledArticles: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedScheduleArticle, setSelectedScheduleArticle] = useState<{
    id: string;
    headline: string;
    date: string;
  } | null>(null);

  const { data, isLoading, error } = useQuery<IApiResponse<IScheduledArticle[]>>({
    queryKey: ['articles', 'scheduled'],
    queryFn: async () => {
      const response = await axios.get<IApiResponse<IScheduledArticle[]>>(
        '/api/articles/scheduled'
      );
      return response.data;
    },
  });

  const publishNowMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.put(`/api/articles/${id}/publish`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Article published immediately!');
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.message || 'Failed to publish'
        : 'An error occurred';
      toast.error(msg);
    },
  });

  const cancelScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.put(`/api/articles/${id}/cancel-schedule`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Article schedule cancelled. Reverted to draft.');
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.message || 'Failed to cancel schedule'
        : 'An error occurred';
      toast.error(msg);
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
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.message || 'An error occurred'
      : 'Unknown error occurred';
    return (
      <div className="flex h-screen items-center justify-center py-4">
        <ErrorAlert message={errorMessage} />
      </div>
    );
  }

  const articles = data.data || [];

  return (
    <div className="space-y-4 p-4">
      <Helmet>
        <title>Scheduled Articles - Gyanmitra</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Scheduled Articles
          </h2>
          <p className="text-xs text-muted-foreground">
            Articles set to automatically publish at a future date and time.
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border-amber-300 text-amber-800">
          <FontAwesomeIcon icon={faClock} className="text-xs" />
          <span>{articles.length} Scheduled</span>
        </Badge>
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-zinc-50/50">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-4xl text-zinc-300 mb-3" />
          <h3 className="text-base font-semibold text-zinc-700">No Articles Scheduled</h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1">
            When you schedule an article for future publication, it will appear here.
          </p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50">
                <TableHead className="w-[50px]">S.N.</TableHead>
                <TableHead>Headline</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Scheduled Publish Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article, index) => {
                const publishDate = new Date(article.scheduledPublishDate);
                const isPastDue = publishDate.getTime() <= Date.now();

                return (
                  <TableRow key={article._id}>
                    <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                    <TableCell className="font-medium text-xs max-w-[280px]">
                      <div className="line-clamp-2">{article.headline}</div>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-600">
                      {article.authorName || 'Anonymous'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                        {article.categoryName || 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900">
                          {publishDate.toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                        <span className="text-[10px] text-amber-700 font-medium">
                          {isPastDue ? 'Publishing soon...' : <TimeAgo timestamp={publishDate} />}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <FontAwesomeIcon icon={faEllipsis} className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Manage Schedule</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => publishNowMutation.mutate(article._id)}
                          >
                            Publish Now
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setSelectedScheduleArticle({
                                id: article._id,
                                headline: article.headline,
                                date: article.scheduledPublishDate,
                              })
                            }
                          >
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/administrator/articles-draft`)}
                          >
                            Edit Article
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => cancelScheduleMutation.mutate(article._id)}
                          >
                            Cancel Schedule
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedScheduleArticle && (
        <ScheduleArticleModal
          articleId={selectedScheduleArticle.id}
          headline={selectedScheduleArticle.headline}
          initialDate={selectedScheduleArticle.date}
          open={!!selectedScheduleArticle}
          onOpenChange={(open) => !open && setSelectedScheduleArticle(null)}
        />
      )}
    </div>
  );
};
