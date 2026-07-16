import React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { Category } from './pages/Category.pages';
import Home from './pages/Home.pages';
import { ManageArticle } from './pages/ManageArticle.pages';
import { DraftArticle } from './pages/ManageDraftArticle.pages';
import { ManageCategory } from './pages/ManageCategory.pages';
import { EditArticle } from './pages/EditArticle.pages';
import { ManageComment } from './pages/ManageComment.pages';
import { ManageMembers } from './pages/ManageMembers.pages';
import { SignUp } from './pages/SignUp.pages';
import { EmailVerify } from './pages/EmailVerify.pages';
import CompetitionsPage from './pages/Competitions.page';

import PageNotFounded from './pages/PageNotFounded.pages';
import { PrivacyPolicy } from './pages/PrivacyPolicy.pages';
import { AboutUs } from './pages/AboutUs.pages';
import { ContactUs } from './pages/ContactUs.pages';
import { AdministratorSignUp } from './pages/AdministratorSignUp.pages';
import { USER_ROLE } from './constants/index.constants';
import { ForbiddenPage } from './pages/Forbidden.pages';

import Layout from '@/Layout';
import { Article } from './pages/Article.pages';
import { SignIn } from './pages/SignIn.pages';
import AdministratorLayout from './AdministratorLayout';
import { Dashboard } from './pages/Dashboard.pages';
import axios from 'axios';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import type { IApiCurrentUserSession, IApiResponse } from './api/client.api';
import { Spinner } from './components/Spinner.components';
import { ErrorAlert } from './components/ErrorAlert.components';
import { ArticleRequests } from './pages/ArticleRequests.pages';
import { Search } from './pages/Search.pages';
import CompetitionHub from './pages/CompetitionHub.page'; 
import CompetitionDetails from './pages/CompetitionDetails.page'; 

function ProtectedRoute({ allowedRole }: { allowedRole: USER_ROLE[] }) {
  const clientQuery = useQueryClient();
  
  // Safe access check
  const session = clientQuery.getQueryData(['me']) as any;
  const user = session?.data?.user; 

  // Agar user nahi hai ya role match nahi karta
  if (!user || !allowedRole.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}

// Create the router
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* 1. Sitemap Fix: Is route ko sabse upar add karein */}
      <Route 
        path="sitemap-news.xml" 
        loader={() => {
          // Ye force karega ki browser server se file mangwaye na ki React se
          window.location.replace("/sitemap-news.xml");
          return null;
        }} 
      />

      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="articles/:articleSlug" element={<Article />} />
        <Route path="categories/:categoryName" element={<Category />} />
        <Route path="sign-in" element={<SignIn />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route path="email-verify" element={<EmailVerify />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="about-us" element={<AboutUs />} />
        <Route path="competitions" element={<CompetitionHub />} /> 
        <Route path="competitions/:slug" element={<CompetitionDetails />} />
        <Route path="search" element={<Search />} />
        <Route path="contact-us" element={<ContactUs />} />
        <Route
          path="administrator/sign-up/:token"
          element={<AdministratorSignUp />}
        />
      </Route>

      {/* Admin Routes Logic Same Rahega */}
      <Route
        element={
          <ProtectedRoute
            allowedRole={[USER_ROLE.Admin, USER_ROLE.Owner, USER_ROLE.Editor]} 
          />
        }
      >
        <Route path="/administrator" element={<AdministratorLayout />}>
          <Route element={<ProtectedRoute allowedRole={[USER_ROLE.Admin, USER_ROLE.Owner]} />}>
            <Route index element={<Dashboard />} />
            <Route path="articles" element={<ManageArticle />} />
            <Route path="comments" element={<ManageComment />} />
          </Route>

          <Route path="article-requests" element={<ArticleRequests />} />
          <Route path="articles-draft" element={<DraftArticle />} />
          <Route path="competitions" element={<CompetitionsPage />} />
          
          <Route element={<ProtectedRoute allowedRole={[USER_ROLE.Owner]} />}>
            <Route path="categories" element={<ManageCategory />} />
            <Route path="members" element={<ManageMembers />} />
          </Route>
        </Route>
      </Route>

      <Route path="/edit/:articleId" element={<EditArticle />} />
      <Route path="*" element={<PageNotFounded />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
    </>
  )
);

export const AppRouter: React.FC = () => {
  const results = useQueries({
    queries: [
      {
        queryKey: ['me'],
        queryFn: async () => {
          const response =
            await axios.get<IApiResponse<IApiCurrentUserSession>>(
              '/api/users/me'
            );
          return response.data;
        },
        retry: false,
      },
      {
        queryKey: ['time'],
        queryFn: async () => {
          const response =
            await axios.get<IApiResponse<{ time: string }>>('/api/time');
          return response.data;
        },
      },
      {
        queryKey: ['categories', 'active'],
        queryFn: async () => {
          const response = await axios.get<IApiResponse<{ name: string }[]>>(
            `/api/categories/active`
          );
          return response.data;
        },
        staleTime: Infinity,
      },
      {
        queryKey: ['subCategories', '67e442af58df1db1ee298769', 'active'],
        queryFn: async () => {
          const response = await axios.get<IApiResponse<{ name: string }[]>>(
            `/api/categories/67e442af58df1db1ee298769/subcategories/active`
          );
          return response.data;
        },
        staleTime: Infinity,
      },
    ],
  });

  const [userQuery, notificationsQuery, activeCategories, activeSubCategories] =
    results;

  const isLoading =
    userQuery.isLoading ||
    notificationsQuery.isLoading ||
    activeCategories.isLoading ||
    activeSubCategories.isLoading;
const isError = 
  (userQuery.isError && (userQuery.error as any)?.response?.status !== 401) || // 401 को छोड़कर बाकी एरर
  notificationsQuery.isError || 
  activeCategories.isError || 
  activeSubCategories.isError;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    const errorMessage =
      userQuery.error?.message ||
      notificationsQuery.error?.message ||
      'An error occurred';

    return (
      <div className="relative flex h-screen items-center justify-center py-4">
        <ErrorAlert message={errorMessage} />
      </div>
    );
  }

  return <RouterProvider router={router} />;
};
