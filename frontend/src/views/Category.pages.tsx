'use client';

import { IApiResponse, type IApiCategory } from '@/api/client.api';
import ArticleList from '@/components/ArticleList.components';
import { DateDisplay } from '@/components/DateDisplay.components';
import { ErrorAlert } from '@/components/ErrorAlert.components';
import { FeaturedMedia } from '@/components/FeaturedMedia.components';
import { Spinner } from '@/components/Spinner.components';
import TimeAgo from '@/components/TimeAgo.components';
import { Badge } from '@/components/ui/badge';
import { CSeparator } from '@/components/ui/customSeparator';
import { useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';

export const Category: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  if (!categoryName)
    return (
      <div className="relative flex h-screen items-center justify-center py-4">
        <div>
          <ErrorAlert message={'Category name do not got.'} />
        </div>
      </div>
    );
  const { data, isLoading, error } = useQuery<IApiResponse<IApiCategory>>({
    queryKey: ['categories', 'page', categoryName],
    queryFn: async () => {
      const response = await axios.get<IApiResponse<IApiCategory>>(
        `/api/categories/page/` + categoryName
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Helmet>
          <title>Category - Gyanmitra</title>
        </Helmet>
        <Spinner />
      </div>
    );
  }

  if (error || !data || !data.data) {
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

  const displayName =
    (data.data as any).categoryName ||
    data.data.categoryCoverArticle?.categoryName ||
    decodeURIComponent(categoryName || '').replace(/[-_]+/g, ' ');

  const formattedTitle =
    displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <div className="max-w-[1350px] mx-auto px-4 sm:px-6 py-6 space-y-8">
      <Helmet>
        <title>{formattedTitle} News - Gyanmitra</title>
        <meta
          name="description"
          content={`पढ़ें ${formattedTitle} की ताज़ा और मुख्य खबरें ज्ञानमित्र न्यूज़ पर।`}
        />
        <link
          rel="canonical"
          href={`https://gyanmitranews.com/categories/${encodeURIComponent(categoryName || '')}`}
        />
        <meta name="robots" content="INDEX, FOLLOW" />
      </Helmet>

      {/* Category Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white rounded-md p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold uppercase tracking-wider">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span>Categories</span>
            <span>/</span>
            <span className="text-[#e98571]">{formattedTitle}</span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="bg-[#e98571] p-2 rounded-sm text-white">
              <span className="font-black text-xl">#</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">
              {displayName} <span className="text-[#e98571]">News</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 font-medium max-w-2xl pt-1">
            {displayName} से जुड़ी ताज़ा खबरें, ब्रेकिंग न्यूज़, और प्रमुख अपडेट्स।
          </p>
        </div>
      </div>

      {/* Trending Section in this Category */}
      {data.data.trendingArticles && data.data.trendingArticles.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b-2 border-zinc-900 pb-2">
            <Badge className="bg-[#e98571] text-white text-[9px] font-black uppercase tracking-wider rounded-none px-2.5 py-0.5">
              Trending
            </Badge>
            <h2 className="text-base font-bold uppercase tracking-wide text-zinc-800">
              इस श्रेणी में ट्रेंडिंग
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.trendingArticles.map((article) => (
              <Link
                to={'/articles/' + article.slug}
                className="group relative aspect-[16/10] overflow-hidden rounded-md bg-zinc-800 shadow-sm"
                key={article._id}
              >
                <FeaturedMedia
                  fileType={article.featuredMedia.fileType}
                  url={article.featuredMedia.fileUrl}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  thumbnail={article.featuredMedia.thumbnail}
                  name={article.featuredMedia.name}
                  playable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-0 p-4 space-y-1.5">
                  <Badge className="bg-[#e98571] text-[8px] font-black uppercase tracking-widest border-none rounded-none">
                    {article.categoryName}
                  </Badge>
                  <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 group-hover:text-[#e98571] transition-colors">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[9px]">
                    <DateDisplay date={new Date(article.published)} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Articles in Category */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
          <h2 className="text-lg font-bold uppercase tracking-wide text-zinc-900">
            नवीनतम समाचार ({displayName})
          </h2>
        </div>

        {data.data.recentPosts && data.data.recentPosts.length > 0 ? (
          <ArticleList
            articles={data.data.recentPosts.map((article) => ({
              _id: article._id,
              featuredMedia: {
                url: article.featuredMedia.fileUrl,
                fileType: article.featuredMedia.fileType,
                thumbnail: article.featuredMedia.thumbnail,
                name: article.featuredMedia.name,
              },
              headline: article.title,
              slug: article.slug,
              uploaded: new Date(article.published),
              description: article.description || '',
              category: article.categoryName,
            }))}
          />
        ) : (
          <div className="py-12 px-4 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-md">
            <p className="text-sm font-bold text-zinc-400">
              {displayName} में अभी कोई लेख उपलब्ध नहीं हैं।
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
