import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { IApiArticleManage, IApiResponse } from '@/api/client.api';
import { Spinner } from '@/components/Spinner.components';
import { ErrorAlert } from '@/components/ErrorAlert.components';
import axios, { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArticleTable } from '../components/ArticleTable.components';
import { Helmet } from 'react-helmet-async';

export const ManageArticle: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<
    IApiResponse<IApiArticleManage[]>
  >({
    queryKey: ['articles', 'all'],
    queryFn: async () => {
      const response =
        await axios.get<IApiResponse<IApiArticleManage[]>>(`/api/articles/`);
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

  if (data.data.length === 0) {
    return (
      <div className="relative flex h-screen items-center justify-center py-4">
        <div className="text-muted-foreground text-lg">No articles found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Helmet>
        <title>Articles - Gyanmitra</title>
      </Helmet>
      <ArticleTable articles={data.data} navigate={navigate} />
    </div>
  );
};
