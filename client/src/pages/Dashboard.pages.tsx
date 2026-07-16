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
import { IApiDashboard, IApiResponse } from '@/api/client.api';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/Spinner.components';
import axios, { isAxiosError } from 'axios';
import { ErrorAlert } from '@/components/ErrorAlert.components';
import { Helmet } from 'react-helmet-async';

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
    <>
      <div className="flex flex-wrap gap-4 *:basis-[450px]">
        <Helmet>
          <title>Dashboard - Gyanmitra</title>
        </Helmet>
        {/* Views Card */}
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle>Views</CardTitle>
            <CardDescription className="text-3xl font-bold uppercase text-black">
              +{numeral(data?.data.totalViews).format('0.[0]a')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y">
              {data?.data.topArticles.length ? (
                data?.data.topArticles.map((article) => (
                  <div
                    className="flex h-20 flex-row items-center gap-2 py-2"
                    key={article._id}
                  >
                    <FeaturedMedia
                      className="aspect-video h-full shrink-0 overflow-hidden rounded-lg object-cover"
                      fileType={article.featuredMedia.fileType}
                      playable={false}
                      url={article.featuredMedia.fileUrl}
                      thumbnail={article.featuredMedia.thumbnail}
                      name={article.featuredMedia.name}
                    />
                    <div className="my-auto space-y-0.5">
                      <h3 className="line-clamp-1 text-base font-semibold">
                        {article.headline}
                      </h3>
                      <div className="text-customMediumGray flex space-x-5 text-xs md:text-sm">
                        <TimeAgo timestamp={new Date(article.published)} />
                        <span>
                          views •
                          <span className="text-tertiary font-semibold">
                            {numeral(article.views).format('0.[0]a')}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-5 text-center">No top articles found</div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link
              to="/administrator/articles?topViewed=1"
              className={buttonVariants({ variant: 'link' })}
            >
              Get More Details
            </Link>
          </CardFooter>
        </Card>

        {/* Comments Card */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Comments</CardTitle>
            <CardDescription>New Comments On Article</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.data.recentComments.length ? (
              <div className="flex flex-col divide-y">
                {data?.data.recentComments.map((comment) => (
                  <div
                    className="flex flex-row items-center gap-2 py-2"
                    key={comment._id}
                  >
                    <Avatar className="aspect-square h-full rounded-lg">
                      <AvatarFallback className="rounded-lg uppercase">
                        {comment.firstName.charAt(0) +
                          comment.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="my-auto space-y-0.5">
                      <h3 className="line-clamp-2 text-base font-semibold">
                        {comment.message}
                      </h3>
                      <div className="text-customMediumGray flex space-x-5 text-xs md:text-sm">
                        <TimeAgo timestamp={new Date(comment.createdAt)} />
                        <span>
                          By •{' '}
                          <span className="text-customGray font-semibold capitalize">
                            {comment.firstName + ' ' + comment.lastName}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-5 text-center">No new comments found</div>
            )}
          </CardContent>
          <CardFooter>
            <Link
              to="/administrator/comments"
              className={buttonVariants({ variant: 'link' })}
            >
              Get More Details
            </Link>
          </CardFooter>
        </Card>

        {/* Users Card */}
        <Card className="w-full min-w-[280px] flex-1">
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>New Users have joined</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.data.recentUsers.length ? (
              <div className="flex flex-col divide-y">
                {data?.data.recentUsers.map((user) => (
                  <div
                    className="flex flex-row items-center gap-2 py-2"
                    key={user._id}
                  >
                    <Avatar className="h-10 w-10 shrink-0 rounded-lg">
                      <AvatarFallback className="rounded-lg uppercase">
                        {user.firstName.charAt(0) + user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h3 className="truncate text-base font-semibold">
                        {user.email}
                      </h3>
                      <div className="text-customMediumGray flex flex-wrap gap-2 text-xs md:text-sm">
                        <TimeAgo timestamp={new Date(user.createdAt)} />
                        <span className="whitespace-nowrap">
                          Name •{' '}
                          <span className="text-tertiary font-semibold capitalize">
                            {user.firstName + ' ' + user.lastName}
                          </span>
                        </span>
                        <span className="whitespace-nowrap">
                          Role • {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-5 text-center">No new users found</div>
            )}
          </CardContent>
          <CardFooter>
            <Link
              to="/administrator/members"
              className={buttonVariants({ variant: 'link' })}
            >
              Get More Details
            </Link>
          </CardFooter>
        </Card>

        {/* Articles Card */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Articles</CardTitle>
            <CardDescription>
              Recent articles that have been published recently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y">
              {data?.data.recentArticles.length ? (
                data?.data.recentArticles.map((article) => (
                  <div
                    className="flex h-20 flex-row items-center gap-2 py-2"
                    key={article._id}
                  >
                    <FeaturedMedia
                      className="aspect-video h-full shrink-0 overflow-hidden rounded-lg object-cover"
                      fileType={article.featuredMedia.fileType}
                      playable={false}
                      thumbnail={article.featuredMedia.thumbnail}
                      url={article.featuredMedia.fileUrl}
                      name={article.featuredMedia.name}
                    />
                    <div className="my-auto space-y-0.5">
                      <h3 className="line-clamp-2 text-base font-semibold leading-tight">
                        {article.headline}
                      </h3>
                      <div className="text-customMediumGray flex space-x-5 text-xs md:text-sm">
                        <TimeAgo timestamp={new Date(article.published)} />
                        <span>
                          Name •{' '}
                          <span className="text-customGray font-semibold capitalize">
                            {article.firstName + ' ' + article.lastName}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-5 text-center">No recent articles found</div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link
              to="/administrator/articles?newest=1"
              className={buttonVariants({ variant: 'link' })}
            >
              Get More Details
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};
