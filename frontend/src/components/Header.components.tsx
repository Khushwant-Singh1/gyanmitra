'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-regular-svg-icons';
import { faBars, faSearch, faServer, faHome, faShapes } from '@fortawesome/free-solid-svg-icons';
import { FOLLOW_US_LINKS } from '@/constants/socialLinks.constants';
import { Button, buttonVariants } from '@/components/ui/button';
import { Link, NavLink } from 'react-router-dom';
import { DateDisplay } from './DateDisplay.components';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { USER_ROLE } from '@/constants/index.constants';

import { UserOptions } from '@/components/UserOptions.components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { IApiCurrentUserSession, IApiResponse } from '@/api/client.api';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { TranslateToggle } from './TranslateToggle.components';

interface SocialLinksProps {
  className?: string;
  itemClassName?: string;
}

interface NavigationProps {
  className?: string;
  linkClassName?: string;
  data: { name: string; url: string }[];
  onLinkClick?: () => void;
}

const SocialLinks: React.FC<SocialLinksProps> = ({
  className = '',
  itemClassName = '',
}) => (
  <ul className={`flex items-center gap-1 ${className}`}>
    {FOLLOW_US_LINKS.map((val, i) => (
      <li key={i} className={`hover:text-tertiary ${itemClassName}`}>
        <a
          href={val.url}
          target="_blank"
          aria-label="Follow us on more platforms"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'h-11 w-11 min-h-[44px] min-w-[44px] md:h-9 md:w-9 md:min-h-[36px] md:min-w-[36px] p-0 flex items-center justify-center text-slate-600 hover:text-tertiary transition-colors'
          )}
        >
          <FontAwesomeIcon icon={val.icon} className="text-base md:text-sm" />
        </a>
      </li>
    ))}
  </ul>
);

const Navigation: React.FC<NavigationProps> = ({
  className = '',
  linkClassName,
  data,
  onLinkClick,
}) => {
  return (
    <nav className={cn("scrollbar-hide", className)}>
      {data.length !== 0
        ? data.map((val, i) => (
            <NavLink
              key={i}
              to={val.url}
              onClick={onLinkClick} 
              className={({ isActive }) =>
                `capitalize whitespace-nowrap ${
                  isActive ? 'text-secondary font-bold' : ''
                } ${linkClassName}`
              }
            >
              {val.name}
            </NavLink>
          ))
        : 'No categories found'}
    </nav>
  );
};

const SearchButton: React.FC = () => (
  <div className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
    <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
  </div>
);

const Header: React.FC = () => {
  const [open, setOpen] = useState(false); 
  const clientQuery = useQueryClient();

  const { data: userSession } = useQuery<IApiResponse<IApiCurrentUserSession>>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await axios.get<IApiResponse<IApiCurrentUserSession>>('/api/users/me');
      return res.data;
    },
    retry: false,
    staleTime: 60 * 1000,
  });

  const user = userSession?.data?.user;

  const { data: categoriesResponse } = useQuery<
    IApiResponse<Array<{ name: string; _id: any }>>
  >({
    queryKey: ['categories', 'active'],
    queryFn: async () => {
      const res = await axios.get<
        IApiResponse<Array<{ name: string; _id: any }>>
      >('/api/categories/active');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const EMPTY_CATEGORY_NAMES = new Set([
    'राजस्थान',
    'हरियाणा',
    'पंजाब',
    'मध्य प्रदेश',
    'बिहार',
    'झारखंड',
    'छत्तीसगढ़',
    'हेल्थ',
  ]);

  const activeCategories = (categoriesResponse?.data || []).filter(
    (c) => !EMPTY_CATEGORY_NAMES.has(c.name?.trim())
  );

  const NAV_LINKS: { name: string; url: string }[] = [
    { name: 'Home', url: '/' },
    ...activeCategories.map((val) => ({
      name: val.name,
      url: `/categories/${encodeURIComponent(val.name.toLowerCase().replace(/\s+/g, '-'))}`,
    })),
  ];

  const ACTIVE_SUBCATEGORIES_LINKS =
    activeCategories.length > 0
      ? activeCategories.map((val) => ({
          name: val.name,
          url: `/categories/${encodeURIComponent(val.name.toLowerCase().replace(/\s+/g, '-'))}`,
        }))
      : NAV_LINKS;

  return (
    <header className="bg-primary-foreground text-tertiary-foreground text-sm font-normal w-full overflow-x-hidden">
      {/* Top Section */}
      <div className="border-b-customLightGray flex items-center justify-between border-b-2 px-4 py-1 w-full overflow-hidden">
        <div className="flex items-center gap-4 overflow-hidden">
          <DateDisplay
            date={new Date((clientQuery.getQueryData(['time']) as any)?.data?.time || Date.now())}
            className="hidden md:flex items-center"
          />

          <Link to="/" className="flex items-center shrink-0">
            <img
              src="/assets/gyanmitra.webp"
              alt="GyanMitra Logo"
              title="GyanMitra News - ताज़ा हिंदी समाचार" 
              className="h-9 md:h-11 w-auto object-contain"
              width={150}
              height={44}
              loading="eager"
            />
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <TranslateToggle />
          {user ? (
            user.role === USER_ROLE.Viewer ? (
              <div className="md:flex items-center">
                <UserOptions />
              </div>
            ) : (
              <Link
                to={
                  user.role === USER_ROLE.Editor ||
                  user.role === USER_ROLE.Reporter
                    ? '/administrator/articles-draft'
                    : '/administrator'
                }
                className={cn("hidden md:flex items-center gap-2", buttonVariants({ variant: 'ghost' }))}
              >
                <FontAwesomeIcon icon={faServer} />
                Dashboard
              </Link>
            )
          ) : (
            <Link
              to="/sign-in"
              className={cn("hidden md:flex items-center gap-2", buttonVariants({ variant: 'ghost' }))}
            >
              <FontAwesomeIcon icon={faCircleUser} />
              Sign In
            </Link>
          )}
          
          <div className="md:hidden">
            <Link to="/search" aria-label="Search articles" title="Search articles">
              <SearchButton />
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Navigation - FIXED OVERFLOW & ADDED SMOOTH SCROLLER */}
      <div className="hidden shadow-sm shadow-black/10 md:flex px-4 bg-white w-full overflow-hidden justify-between">
        <div className="flex items-center overflow-hidden flex-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="border-x rounded-none h-12 shrink-0">
                <FontAwesomeIcon icon={faBars} className="text-xl mr-2" />
                <span>Categories</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Article Categories</SheetTitle>
                <SheetDescription>Browse categories and news updates.</SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <Navigation
                  className="flex flex-col gap-1"
                  linkClassName={buttonVariants({ variant: 'outline' })}
                  data={ACTIVE_SUBCATEGORIES_LINKS}
                />
              </div>
            </SheetContent>
          </Sheet>



          {/* Smooth Horizontal Scroller for Desktop Categories */}
          <Navigation
            className="flex items-center h-12 overflow-x-auto scroll-smooth flex-1 no-scrollbar"
            linkClassName={cn("px-4 h-full flex items-center transition-colors duration-200", buttonVariants({ variant: 'navLink' }))}
            data={NAV_LINKS}
          />
        </div>

        <Link to="/search" aria-label="Search articles" className={cn(buttonVariants({ variant: 'ghost' }), 'border-secondary rounded-none border-b flex items-center gap-2 h-12 shrink-0 ml-4')}>
          <span>Search</span>
          <SearchButton />
        </Link>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] w-full items-center justify-around border-t bg-white/95 backdrop-blur-md md:hidden shadow-[0_-2px_15px_rgba(0,0,0,0.08)]">
        <NavLink to="/" className={({ isActive }) => cn("flex flex-col items-center justify-center min-h-[48px] py-1 gap-1 min-w-[60px]", isActive ? "text-secondary font-bold" : "text-muted-foreground")}>
          <FontAwesomeIcon icon={faHome} className="text-xl" />
          <span className="text-[10px]">Home</span>
        </NavLink>

        <NavLink to="/search" className={({ isActive }) => cn("flex flex-col items-center justify-center min-h-[48px] py-1 gap-1 min-w-[60px]", isActive ? "text-secondary font-bold" : "text-muted-foreground")}>
          <FontAwesomeIcon icon={faSearch} className="text-xl" />
          <span className="text-[10px]">Search</span>
        </NavLink>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="flex flex-col items-center justify-center min-h-[48px] py-1 gap-1 min-w-[60px] text-muted-foreground">
            <FontAwesomeIcon icon={faBars} className="text-xl" />
            <span className="text-[10px]">Menu</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl p-6 flex flex-col pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <SheetHeader className="text-left border-b pb-4 flex-shrink-0">
              <SheetTitle className="text-2xl font-bold">Categories</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto mt-4 pr-2">
              <Navigation
                className="flex flex-col gap-2"
                onLinkClick={() => setOpen(false)} 
                linkClassName={cn(buttonVariants({ variant: 'outline' }), "justify-start text-base py-6 w-full")}
                data={NAV_LINKS}
              />
              <div className="border-t mt-6 pt-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] flex justify-center">
                <SocialLinks className="flex gap-6" />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {user ? (
          user.role === USER_ROLE.Viewer ? (
            <div className="flex flex-col items-center gap-1 min-w-[60px]">
              <UserOptions />
              <span className="text-[10px] text-muted-foreground">Profile</span>
            </div>
          ) : (
            <Link
              to={
                user.role === USER_ROLE.Editor ||
                user.role === USER_ROLE.Reporter
                  ? '/administrator/articles-draft'
                  : '/administrator'
              }
              className="flex flex-col items-center gap-1 min-w-[60px] text-muted-foreground"
            >
              <FontAwesomeIcon icon={faServer} className="text-xl" />
              <span className="text-[10px]">Profile</span>
            </Link>
          )
        ) : (
          <Link
            to="/sign-in"
            className="flex flex-col items-center gap-1 min-w-[60px] text-muted-foreground"
          >
            <FontAwesomeIcon icon={faCircleUser} className="text-xl" />
            <span className="text-[10px]">Login</span>
          </Link>
        )}
      </div>

      <div className="h-0 md:hidden" />
    </header>
  );
};

export default Header;