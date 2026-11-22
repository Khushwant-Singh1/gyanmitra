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
import { Trophy } from 'lucide-react';

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
      <div className="border-b-customLightGray flex items-center justify-between border-b-2 px-3 sm:px-4 py-1.5 w-full overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
          {/* Mobile Sidebar Category Drawer Trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 min-h-[44px] min-w-[44px] text-zinc-800 hover:text-tertiary hover:bg-zinc-100 p-0 shrink-0"
                aria-label="Open categories sidebar"
              >
                <FontAwesomeIcon icon={faBars} className="text-xl" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col bg-white">
              <SheetHeader className="p-5 border-b border-zinc-100 flex-shrink-0 text-left bg-zinc-50/70">
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src="/assets/gyanmitra.webp"
                    alt="GyanMitra Logo"
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <SheetTitle className="text-lg font-bold text-zinc-900">समाचार श्रेणियां (Categories)</SheetTitle>
                <SheetDescription className="text-xs text-zinc-500">
                  सभी मुख्य समाचार श्रेणियां और अपडेट्स
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-3 pb-1">
                    Categories
                  </p>
                  <Navigation
                    className="flex flex-col gap-1"
                    onLinkClick={() => setOpen(false)}
                    linkClassName={cn(
                      buttonVariants({ variant: 'ghost' }),
                      "justify-start text-sm font-semibold py-2.5 px-3 h-auto w-full hover:bg-zinc-100 hover:text-[#e98571] text-zinc-800 rounded-lg transition-colors"
                    )}
                    data={NAV_LINKS}
                  />
                </div>

                <div className="border-t border-zinc-100 pt-4 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-3 pb-1">
                    Quick Links
                  </p>
                  <Link
                    to="/competitions"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-zinc-700 hover:text-[#e98571] hover:bg-zinc-50 rounded-lg transition-colors"
                  >
                    <Trophy className="h-4 w-4 text-[#e98571]" />
                    <span>Competition Hub</span>
                  </Link>
                  <Link
                    to="/search"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-zinc-700 hover:text-[#e98571] hover:bg-zinc-50 rounded-lg transition-colors"
                  >
                    <FontAwesomeIcon icon={faSearch} className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Search News</span>
                  </Link>
                </div>

                <div className="border-t border-zinc-100 pt-4 pb-[calc(2.5rem+env(safe-area-inset-bottom))] flex flex-col items-center gap-3">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Follow Gyanmitra</p>
                  <SocialLinks className="flex gap-4" />
                </div>
              </div>
            </SheetContent>
          </Sheet>

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

      {/* Mobile Horizontal Category Scroller */}
      <div className="flex md:hidden border-b border-zinc-200 bg-white/95 backdrop-blur-sm w-full overflow-x-auto scroll-smooth no-scrollbar px-3 py-1.5 shadow-xs">
        <Navigation
          className="flex items-center gap-1.5 overflow-x-auto scroll-smooth no-scrollbar"
          linkClassName={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            "h-8 px-3 text-xs font-semibold shrink-0 rounded-full bg-zinc-50 border border-zinc-200/80 text-zinc-700 hover:text-black hover:bg-zinc-100"
          )}
          data={NAV_LINKS}
        />
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

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 gap-1 min-w-[60px] text-muted-foreground hover:text-secondary transition-colors"
          aria-label="Open categories sidebar"
        >
          <FontAwesomeIcon icon={faShapes} className="text-xl" />
          <span className="text-[10px]">Categories</span>
        </button>

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