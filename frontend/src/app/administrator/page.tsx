'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { USER_ROLE } from '@/constants/index.constants';
import { Dashboard } from '@/views/Dashboard.pages';
import { Navigate } from 'react-router-dom';
import { Spinner } from '@/components/Spinner.components';

export default function AdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await axios.get('/api/users/me');
      return response.data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const user = data?.data?.user;

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (user.role === USER_ROLE.Admin || user.role === USER_ROLE.Owner) {
    return <Dashboard />;
  }

  if (user.role === USER_ROLE.Editor || user.role === USER_ROLE.Reporter) {
    return <Navigate to="/administrator/articles-draft" replace />;
  }

  return <Navigate to="/forbidden" replace />;
}
