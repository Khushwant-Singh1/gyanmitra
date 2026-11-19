import { NextResponse } from 'next/server';

export const revalidate = 3600;

async function fetchBackendSitemap(pathname: string) {
  const rawApiUrl = (process.env.API_URL || 'http://localhost:8000').replace(/\/+$/, '');
  const apiBase = rawApiUrl.replace(/\/api\/?$/, '');

  try {
    const res = await fetch(`${apiBase}${pathname}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
        status: 200,
        headers: { 'Content-Type': 'text/xml; charset=utf-8', 'Cache-Control': 'public, max-age=60, s-maxage=60' },
      });
    }

    const xml = await res.text();
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error(`Error fetching ${pathname}:`, error);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml; charset=utf-8', 'Cache-Control': 'public, max-age=60, s-maxage=60' },
    });
  }
}

export async function GET() {
  return fetchBackendSitemap('/sitemap.xml');
}
