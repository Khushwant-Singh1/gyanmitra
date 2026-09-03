import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function fetchBackendSitemap(pathname: string) {
  const rawApiUrl = (process.env.API_URL || 'http://localhost:8000').replace(/\/+$/, '');
  const apiBase = rawApiUrl.replace(/\/api\/?$/, '');

  try {
    const res = await fetch(`${apiBase}${pathname}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return new NextResponse('Error generating sitemap', { status: 500 });
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
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

export async function GET() {
  return fetchBackendSitemap('/sitemap.xml');
}
