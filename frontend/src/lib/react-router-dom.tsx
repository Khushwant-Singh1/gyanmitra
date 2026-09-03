'use client';

import React, { createContext, useContext, useEffect, useTransition } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import {
  useRouter as useNextRouter,
  usePathname as useNextPathname,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from 'next/navigation';

export interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: any;
  key: string;
}

export const OutletContext = createContext<React.ReactNode>(null);

export function Outlet() {
  const children = useContext(OutletContext);
  return <>{children}</>;
}

export function useLocation(): Location {
  const pathname = useNextPathname() || '/';
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    setSearch(window.location.search || '');
  }, [pathname]);

  return {
    pathname,
    search,
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    state: null,
    key: 'default',
  };
}

export type NavigateFunction = (
  to: string | number,
  options?: { replace?: boolean; state?: any }
) => void;

export function useNavigate(): NavigateFunction {
  const router = useNextRouter();
  const [, startTransition] = useTransition();

  return (to: string | number, options?: { replace?: boolean; state?: any }) => {
    if (typeof to === 'number') {
      if (typeof window !== 'undefined') {
        window.history.go(to);
      }
      return;
    }

    startTransition(() => {
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    });
  };
}

export function useParams<T extends Record<string, string | string[]> = Record<string, string>>(): T {
  const params = useNextParams();
  return (params || {}) as unknown as T;
}

export function useSearchParams(): [URLSearchParams, (params: URLSearchParams | Record<string, string>) => void] {
  const searchParams = useNextSearchParams();
  const router = useNextRouter();
  const pathname = useNextPathname();

  const currentParams = React.useMemo(() => {
    return new URLSearchParams(searchParams ? searchParams.toString() : '');
  }, [searchParams]);

  const setSearchParams = React.useCallback(
    (nextParams: URLSearchParams | Record<string, string>) => {
      const q = new URLSearchParams(nextParams as any);
      router.push(`${pathname}?${q.toString()}`);
    },
    [router, pathname]
  );

  return [currentParams, setSearchParams];
}

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  replace?: boolean;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, replace, children, className, ...props }, ref) => {
    return (
      <NextLink
        ref={ref}
        href={to}
        replace={replace}
        className={className}
        {...props}
      >
        {children}
      </NextLink>
    );
  }
);
Link.displayName = 'Link';

export interface NavLinkProps extends Omit<LinkProps, 'className'> {
  className?: string | ((props: { isActive: boolean; isPending: boolean }) => string | undefined);
}

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, replace, children, className, ...props }, ref) => {
    const pathname = useNextPathname();
    const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));

    const computedClassName =
      typeof className === 'function'
        ? className({ isActive, isPending: false })
        : className;

    return (
      <NextLink
        ref={ref}
        href={to}
        replace={replace}
        className={computedClassName}
        {...props}
      >
        {children}
      </NextLink>
    );
  }
);
NavLink.displayName = 'NavLink';

export function Navigate({ to, replace = true }: { to: string; replace?: boolean }) {
  const router = useNextRouter();

  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router, to, replace]);

  return null;
}
