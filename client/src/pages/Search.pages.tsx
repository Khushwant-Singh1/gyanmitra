import type { IApiResponse, IApiSearch } from '@/api/client.api';
import ArticleList from '@/components/ArticleList.components';
import { ErrorAlert } from '@/components/ErrorAlert.components';
import { Spinner } from '@/components/Spinner.components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(queryParam);

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  const { data, isLoading, error } = useQuery<IApiResponse<IApiSearch[]>>({
    queryKey: ['articles', 'search', queryParam],
    queryFn: async () => {
      if (!queryParam) return { data: [], success: true, statusCode: 200 };
      const response = await axios.get<IApiResponse<IApiSearch[]>>(
        '/api/articles/search',
        { params: { q: queryParam } }
      );
      return response.data;
    },
    enabled: !!queryParam,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  return (
    <div className="flex flex-col gap-5 py-5">
      <form className="flex justify-center gap-2" onSubmit={handleSearch}>
        <Input
          type="text"
          placeholder="Search..."
          className="w-96"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit">Search</Button>
      </form>
      {queryParam && (
        <>
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold">Search Results</h1>
          </div>
          {data && data.data.length === 0 ? (
            <div className="flex items-center justify-center">
              <p className="text-gray-500">No results found</p>
            </div>
          ) : null}
        </>
      )}

      {isLoading && queryParam ? (
        <div className="flex h-96 items-center justify-center">
          <Spinner />
        </div>
      ) : error && queryParam ? (
        <div className="relative flex items-center justify-center py-4">
          <ErrorAlert
            message={
              isAxiosError(error)
                ? error.response?.data?.message ||
                  error.message ||
                  'An error occurred'
                : 'An error occurred'
            }
          />
        </div>
      ) : (
        queryParam && (
          <ArticleList
            articles={
              data?.data.map((article) => ({
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
              })) ?? []
            }
          />
        )
      )}
    </div>
  );
};
