'use client';

import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FeaturedMedia } from '@/components/FeaturedMedia.components';
import TimeAgo from '@/components/TimeAgo.components';
import numeral from 'numeral';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IApiDashboard, IApiResponse } from '@/api/client.api';
import { USER_ROLE } from '@/constants/index.constants';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/Spinner.components';
import axios, { isAxiosError } from 'axios';
import { ErrorAlert } from '@/components/ErrorAlert.components';
import { Helmet } from 'react-helmet-async';
import { cn } from '@/lib/utils';
import {
  Eye,
  Flame,
  MessageSquare,
  Users,
  FileText,
  Clock,
  ArrowRight,
  PenSquare,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery<IApiResponse<IApiDashboard>>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response =
        await axios.get<IApiResponse<IApiDashboard>>(`/api/users/dashboard`);
      return response.data;
    },
    staleTime: 1000 * 60,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-7 w-48 rounded-md bg-zinc-200" />
            <div className="h-4 w-72 rounded-md bg-zinc-100" />
          </div>
          <div className="h-9 w-28 rounded-md bg-zinc-200" />
        </div>

        {/* 4 KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-zinc-200/80 bg-white p-5 flex items-center justify-between shadow-xs"
            >
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-zinc-200" />
                <div className="h-7 w-24 rounded bg-zinc-300" />
                <div className="h-3 w-28 rounded bg-zinc-100" />
              </div>
              <div className="h-12 w-12 rounded-xl bg-zinc-100" />
            </div>
          ))}
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((card) => (
            <div
              key={card}
              className="rounded-xl border border-zinc-200/80 bg-white p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-zinc-200" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-36 rounded bg-zinc-200" />
                    <div className="h-3 w-48 rounded bg-zinc-100" />
                  </div>
                </div>
                <div className="h-5 w-12 rounded bg-zinc-100" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((row) => (
                  <div key={row} className="flex items-center gap-3 py-2">
                    <div className="h-6 w-6 rounded-full bg-zinc-200 shrink-0" />
                    <div className="h-16 w-28 rounded-md bg-zinc-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full rounded bg-zinc-200" />
                      <div className="h-3 w-32 rounded bg-zinc-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
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
    <>
      <Helmet>
        <title>Dashboard - Gyanmitra</title>
      </Helmet>

      <div className="space-y-6">
        {/* Welcome & Actions Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Dashboard Overview
            </h1>
            <p className="text-sm text-zinc-500">
              Monitor key metrics, top performing stories, and editorial activity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/administrator/articles-draft"
              className={cn(
                buttonVariants({ variant: 'default', size: 'sm' }),
                'bg-secondary hover:bg-secondary/90 text-white font-medium shadow-xs'
              )}
            >
              <PenSquare className="mr-1.5 h-4 w-4" />
              Write Article
            </Link>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1: Total Views */}
          <Card className="border border-zinc-200/80 shadow-xs bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Total Views
                </p>
                <p className="text-2xl font-bold tracking-tight text-zinc-900">
                  +{numeral(data?.data.totalViews || 0).format('0.[0]a')}
                </p>
                <p className="text-xs text-zinc-400">Total reader viewership</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
                <Eye className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Stat 2: Top Articles Count */}
          <Card className="border border-zinc-200/80 shadow-xs bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Top Stories
                </p>
                <p className="text-2xl font-bold tracking-tight text-zinc-900">
                  {data?.data.topArticles?.length || 0}
                </p>
                <p className="text-xs text-zinc-400">High engagement articles</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60">
                <Flame className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Stat 3: Recent Comments */}
          <Card className="border border-zinc-200/80 shadow-xs bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Comments
                </p>
                <p className="text-2xl font-bold tracking-tight text-zinc-900">
                  {data?.data.recentComments?.length || 0}
                </p>
                <p className="text-xs text-zinc-400">Recent reader feedback</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
                <MessageSquare className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Stat 4: Recent Users */}
          <Card className="border border-zinc-200/80 shadow-xs bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Members
                </p>
                <p className="text-2xl font-bold tracking-tight text-zinc-900">
                  {data?.data.recentUsers?.length || 0}
                </p>
                <p className="text-xs text-zinc-400">Recent registrations</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid: 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Top Performing Articles */}
          <Card className="flex flex-col border border-zinc-200/80 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-zinc-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-zinc-900">
                      Top Performing Articles
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                      Articles with highest reader views
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-semibold bg-zinc-50 text-zinc-600">
                  Top 5
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-3 sm:p-4">
              <div className="flex flex-col divide-y divide-zinc-100">
                {data?.data.topArticles.length ? (
                  data?.data.topArticles.map((article, index) => (
                    <div
                      className="group flex items-center gap-3 py-3 first:pt-1 last:pb-1"
                      key={article._id}
                    >
                      {/* Rank Indicator */}
                      <span
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                          index === 0
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : index === 1
                            ? 'bg-slate-100 text-slate-700 border border-slate-300'
                            : index === 2
                            ? 'bg-orange-100 text-orange-800 border border-orange-300'
                            : 'bg-zinc-100 text-zinc-500'
                        )}
                      >
                        {index + 1}
                      </span>

                      {/* Thumbnail Container: STRICTLY CONSTRAINED */}
                      <div className="relative aspect-video h-14 w-24 sm:h-16 sm:w-28 shrink-0 overflow-hidden rounded-md bg-zinc-100 border border-zinc-200/70 shadow-2xs">
                        <FeaturedMedia
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          fileType={article.featuredMedia.fileType}
                          playable={false}
                          url={article.featuredMedia.fileUrl}
                          thumbnail={article.featuredMedia.thumbnail}
                          name={article.featuredMedia.name}
                          width={240}
                          height={135}
                        />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-secondary transition-colors leading-snug">
                          {article.headline}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-zinc-400" />
                            <TimeAgo timestamp={new Date(article.published)} />
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                            <Eye className="h-3 w-3" />
                            {numeral(article.views).format('0,0')} views
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-zinc-400">
                    No top articles found
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-zinc-100">
              <Link
                to="/administrator/articles?topViewed=1"
                className="inline-flex items-center text-xs font-semibold text-secondary hover:text-secondary/80 gap-1.5 transition-colors"
              >
                <span>View all top articles</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardFooter>
          </Card>

          {/* Card 2: Recently Published Articles */}
          <Card className="flex flex-col border border-zinc-200/80 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-zinc-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-zinc-900">
                      Recently Published
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                      Latest articles published on the platform
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-semibold bg-zinc-50 text-zinc-600">
                  Recent 5
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-3 sm:p-4">
              <div className="flex flex-col divide-y divide-zinc-100">
                {data?.data.recentArticles.length ? (
                  data?.data.recentArticles.map((article) => (
                    <div
                      className="group flex items-center gap-3 py-3 first:pt-1 last:pb-1"
                      key={article._id}
                    >
                      {/* Thumbnail Container: STRICTLY CONSTRAINED */}
                      <div className="relative aspect-video h-14 w-24 sm:h-16 sm:w-28 shrink-0 overflow-hidden rounded-md bg-zinc-100 border border-zinc-200/70 shadow-2xs">
                        <FeaturedMedia
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          fileType={article.featuredMedia.fileType}
                          playable={false}
                          thumbnail={article.featuredMedia.thumbnail}
                          url={article.featuredMedia.fileUrl}
                          name={article.featuredMedia.name}
                          width={240}
                          height={135}
                        />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-secondary transition-colors leading-snug">
                          {article.headline}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-zinc-400" />
                            <TimeAgo timestamp={new Date(article.published)} />
                          </span>
                          <span>•</span>
                          <span>
                            By{' '}
                            <span className="font-semibold text-zinc-700 capitalize">
                              {article.firstName} {article.lastName}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-zinc-400">
                    No recent articles found
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-zinc-100">
              <Link
                to="/administrator/articles?newest=1"
                className="inline-flex items-center text-xs font-semibold text-secondary hover:text-secondary/80 gap-1.5 transition-colors"
              >
                <span>Manage all articles</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardFooter>
          </Card>

          {/* Card 3: Recent Comments */}
          <Card className="flex flex-col border border-zinc-200/80 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-zinc-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-zinc-900">
                      Recent Comments
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                      New comments and feedback from readers
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-semibold bg-zinc-50 text-zinc-600">
                  Latest
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-3 sm:p-4">
              <div className="flex flex-col divide-y divide-zinc-100">
                {data?.data.recentComments.length ? (
                  data?.data.recentComments.map((comment) => (
                    <div
                      className="flex items-start gap-3 py-3 first:pt-1 last:pb-1"
                      key={comment._id}
                    >
                      <Avatar className="h-9 w-9 shrink-0 rounded-full border border-purple-200/70 bg-purple-50">
                        <AvatarFallback className="rounded-full text-xs font-bold text-purple-700 uppercase">
                          {comment.firstName.charAt(0) +
                            comment.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-zinc-900 capitalize">
                            {comment.firstName} {comment.lastName}
                          </span>
                          <span className="text-xs text-zinc-400 whitespace-nowrap">
                            <TimeAgo timestamp={new Date(comment.createdAt)} />
                          </span>
                        </div>
                        <p className="rounded-md bg-zinc-50 border border-zinc-200/60 p-2.5 text-xs text-zinc-700 italic line-clamp-2 leading-relaxed">
                          "{comment.message}"
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-zinc-400">
                    No new comments found
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-zinc-100">
              <Link
                to="/administrator/comments"
                className="inline-flex items-center text-xs font-semibold text-secondary hover:text-secondary/80 gap-1.5 transition-colors"
              >
                <span>View all comments</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardFooter>
          </Card>

          {/* Card 4: Registered Users & Members */}
          <Card className="flex flex-col border border-zinc-200/80 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-zinc-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-zinc-900">
                      Recent Members
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                      Newly registered users and team members
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-semibold bg-zinc-50 text-zinc-600">
                  Newest
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-3 sm:p-4">
              <div className="flex flex-col divide-y divide-zinc-100">
                {data?.data.recentUsers.length ? (
                  data?.data.recentUsers.map((user) => (
                    <div
                      className="flex items-center gap-3 py-3 first:pt-1 last:pb-1"
                      key={user._id}
                    >
                      <Avatar className="h-9 w-9 shrink-0 rounded-full border border-zinc-200 bg-zinc-100">
                        <AvatarFallback className="rounded-full text-xs font-bold text-zinc-700 uppercase">
                          {user.firstName.charAt(0) + user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-zinc-900 capitalize">
                            {user.firstName} {user.lastName}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] font-semibold uppercase px-1.5 py-0 h-4 rounded-xs',
                              user.role === USER_ROLE.Admin ||
                                user.role === USER_ROLE.Owner
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : user.role === USER_ROLE.Editor
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : user.role === USER_ROLE.Reporter
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                            )}
                          >
                            {user.role}
                          </Badge>
                        </div>
                        <p className="truncate text-xs text-zinc-500">
                          {user.email}
                        </p>
                      </div>
                      <span className="text-xs text-zinc-400 whitespace-nowrap shrink-0">
                        <TimeAgo timestamp={new Date(user.createdAt)} />
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-zinc-400">
                    No new users found
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-zinc-100">
              <Link
                to="/administrator/members"
                className="inline-flex items-center text-xs font-semibold text-secondary hover:text-secondary/80 gap-1.5 transition-colors"
              >
                <span>Manage all members</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};
