import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const rawApiUrl = (
    process.env.API_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'http://server:8000'
      : 'http://localhost:8000')
  ).replace(/\/+$/, '');
  const apiBase = rawApiUrl.replace(/\/api\/?$/, '');

  const search = req.nextUrl.search || '';
  const targetUrl = `${apiBase}/api/${path.join('/')}${search}`;

  const headers = new Headers(req.headers);
  headers.delete('host');

  try {
    const init: RequestInit = {
      method: req.method,
      headers,
      redirect: 'manual',
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = req.body;
      (init as any).duplex = 'half';
    }

    const response = await fetch(targetUrl, init);

    const resHeaders = new Headers(response.headers);
    
    // Explicitly preserve and append all Set-Cookie headers (e.g. access_token)
    if (typeof (response.headers as any).getSetCookie === 'function') {
      const setCookies = (response.headers as any).getSetCookie();
      if (setCookies && setCookies.length > 0) {
        resHeaders.delete('set-cookie');
        for (const cookie of setCookies) {
          resHeaders.append('set-cookie', cookie);
        }
      }
    }

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  } catch (error) {
    console.error(`Proxy error for ${targetUrl}:`, error);
    return NextResponse.json(
      { message: 'Backend connection error', error: (error as any).message },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
