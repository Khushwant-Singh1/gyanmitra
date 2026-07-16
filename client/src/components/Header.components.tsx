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
import { useQueryClient } from '@tanstack/react-query';
import type { IApiCurrentUserSession } from '@/api/client.api';
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
  <ul className={`*:inline *:duration-200 ${className}`}>
    {FOLLOW_US_LINKS.map((val, i) => (
      <li key={i} className={`hover:text-tertiary ${itemClassName}`}>
        <a
          href={val.url}
          target="_blank"
          aria-label="Follow us on more platforms"
          rel="noopener noreferrer"
          className={
            buttonVariants({ variant: 'ghost', size: 'sm' }) + ' ' + '!px-1.5'
          }
        >
          <FontAwesomeIcon icon={val.icon} />
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

  const user = (
    (clientQuery.getQueryData(['me']) as any)?.data as IApiCurrentUserSession
  )?.user;

  const activeCategories =
    ((clientQuery.getQueryData(['categories', 'active']) as any)?.data as
      | Array<{ name: string; _id: { $oid: string } }>
      | undefined) || [];

  const NAV_LINKS: { name: string; url: string }[] = [
    { name: 'Competition', url: '/competitions' },
    { name: 'Home', url: '/' },
    ...activeCategories.map((val) => ({
      name: val.name,
      url: `/categories/${val.name.toLowerCase().replace(/\s+/g, '-')}`,
    })),
  ];

  const subCatsData = 
    clientQuery.getQueryData(['subCategories', 'active']) as any || 
    clientQuery.getQueryData(['subcategories', 'active']) as any;
  
  const fetchedSubcategories = (subCatsData?.data || subCatsData || []) as Array<{ name: string }>;

  const ACTIVE_SUBCATEGORIES_LINKS = fetchedSubcategories.length > 0 
    ? fetchedSubcategories.map((val) => ({
        name: val.name,
        url: `/categories/${val.name.toLowerCase().replace(/\s+/g, '-')}`,
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

          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/assets/gyanmitra.png"
              alt="GyanMitra Logo"
              title="GyanMitra News - ताज़ा हिंदी समाचार" 
              className="h-9 md:h-11 w-auto object-contain"
            />
            <div className="flex flex-col leading-none border-l pl-2 border-gray-300">
              <span className="text-sm md:text-base font-bold tracking-tight text-gray-800">Gyanmitra</span>
              <span className="text-[10px] font-semibold text-secondary uppercase tracking-widest">News</span>
            </div>
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
                to={user.role === USER_ROLE.Editor ? '/administrator/articles-draft' : '/administrator'}
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
            <Link to="/search">
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

        <Link to="/search" className={cn(buttonVariants({ variant: 'ghost' }), 'border-secondary rounded-none border-b flex items-center gap-2 h-12 shrink-0 ml-4')}>
          <span>Search</span>
          <SearchButton />
        </Link>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t bg-white md:hidden shadow-[0_-2px_15px_rgba(0,0,0,0.1)]">
        <NavLink to="/" className={({ isActive }) => cn("flex flex-col items-center gap-1 min-w-[60px]", isActive ? "text-secondary font-bold" : "text-muted-foreground")}>
          <FontAwesomeIcon icon={faHome} className="text-xl" />
          <span className="text-[10px]">Home</span>
        </NavLink>

        <NavLink to="/competitions" className={({ isActive }) => cn("flex flex-col items-center gap-1 min-w-[60px]", isActive ? "text-secondary font-bold" : "text-muted-foreground")}>
          <FontAwesomeIcon icon={faShapes} className="text-xl" />
          <span className="text-[10px]">Competition</span>
        </NavLink>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="flex flex-col items-center gap-1 min-w-[60px] text-muted-foreground">
            <FontAwesomeIcon icon={faBars} className="text-xl" />
            <span className="text-[10px]">Menu</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl p-6 flex flex-col">
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
              <div className="border-t mt-6 pt-6 pb-10 flex justify-center">
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
              to={user.role === USER_ROLE.Editor ? '/administrator/articles-draft' : '/administrator'}
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