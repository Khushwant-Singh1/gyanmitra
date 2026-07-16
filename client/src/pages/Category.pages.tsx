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
    <div className="flex flex-col gap-10 py-5">
      <Helmet>
        <title>
          {categoryName?.charAt(0).toUpperCase() + categoryName?.slice(1)} -
          Gyanmitra
        </title>
      </Helmet>

      <section>
        <h3 className="text-lg font-semibold">नवीनतम पोस्ट</h3>
        <CSeparator variant="full" className="" />
        {data.data.recentPosts?.length > 0 ? (
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
          <div>कोई संबंधित लेख उपलब्ध नहीं हैं।</div>
        )}
      </section>
      <section>
        <div className="mt-5 w-full py-3">
          <span className="text-tertiary text-xl font-semibold">ट्रेंडिंग</span>
          <CSeparator variant="full" className="relative mb-3 mt-1" />
          <div className="scrollbar-hide flex gap-3 overflow-x-auto">
            {(data.data.trendingArticles?.length > 0 &&
              data.data.trendingArticles?.map((article) => (
                <Link
                  to={'/articles/' + article.slug}
                  className="relative aspect-[1/1.4] max-w-96 flex-none basis-60 overflow-hidden rounded-xl p-6"
                  key={article._id}
                >
                  <FeaturedMedia
                    fileType={article.featuredMedia.fileType}
                    url={article.featuredMedia.fileUrl}
                    className="!absolute left-0 top-0 aspect-video h-full w-full object-cover"
                    thumbnail={article.featuredMedia.thumbnail}
                    name={article.featuredMedia.name}
                    playable={false}
                  />
                  <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-b from-black/0 to-black/80" />
                  <div className="relative top-full -translate-y-full space-y-3">
                    <Badge variant={'secondary'}>{article.categoryName}</Badge>
                    <span className="text-primary-foreground line-clamp-4 text-lg font-semibold">
                      {article.title}
                    </span>
                    <div className="text-customLightGray flex flex-row flex-wrap gap-2 text-xs">
                      <DateDisplay date={new Date(article.published)} />
                      <TimeAgo timestamp={new Date(article.published)} />
                    </div>
                  </div>
                </Link>
              ))) || <div>कोई संबंधित लेख उपलब्ध नहीं हैं।</div>}
          </div>
        </div>
      </section>
    </div>
  );
};
