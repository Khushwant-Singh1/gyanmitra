'use client';

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
import { Helmet } from 'react-helmet-async';
import { Search as SearchIcon } from 'lucide-react';

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
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  return (
    <div className="max-w-[1350px] mx-auto w-full px-4 sm:px-6 flex flex-col gap-6 py-6 pb-24 md:pb-12">
      <Helmet>
        <title>{queryParam ? `"${queryParam}" Search Results - Gyanmitra` : 'Search News - Gyanmitra'}</title>
      </Helmet>

      <form className="flex w-full max-w-lg mx-auto items-center gap-2" onSubmit={handleSearch}>
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            type="search"
            placeholder="समाचार खोजें / Search articles..."
            className="w-full pl-10 h-11 text-sm bg-white border-zinc-200 focus-visible:ring-[#e98571]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" className="h-11 px-5 shrink-0 bg-[#e98571] hover:bg-[#d87460] text-white font-bold">
          Search
        </Button>
      </form>

      {queryParam ? (
        <div className="border-b border-zinc-200 pb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            Search Results for <span className="text-[#e98571]">"{queryParam}"</span>
          </h1>
          {data && (
            <p className="text-xs text-zinc-500 mt-1">
              {data.data.length} {data.data.length === 1 ? 'article' : 'articles'} found
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-400 space-y-2">
          <SearchIcon className="h-12 w-12 mx-auto stroke-1 text-zinc-300" />
          <p className="text-sm font-medium text-zinc-500">ताज़ा समाचार, मुख्य विषय या श्रेणी खोजें।</p>
          <p className="text-xs text-zinc-400">Type keywords like "संभल", "शिक्षा", or "टॉप न्यूज़"</p>
        </div>
      )}

      {queryParam && data && data.data.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-2 border border-dashed border-zinc-200 rounded-md bg-zinc-50/50">
          <p className="text-sm font-bold text-zinc-600">"{queryParam}" के लिए कोई परिणाम नहीं मिला।</p>
          <p className="text-xs text-zinc-400">कृपया वर्तनी जांचें या कोई अन्य कीवर्ड आज़माएं।</p>
        </div>
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
