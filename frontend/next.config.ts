import type { NextConfig } from "next";

const rawApiUrl = (
  process.env.API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'http://server:8000'
    : 'http://localhost:8000')
).replace(/\/+$/, '');
const apiBase = rawApiUrl.replace(/\/api\/?$/, '');

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: false,
  reactCompiler: true,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'http', hostname: 'server' },
      { protocol: 'https', hostname: 'gyanmitranews.com' },
      { protocol: 'http', hostname: 'gyanmitranews.com' },
      { protocol: 'https', hostname: 'www.gyanmitranews.com' },
      { protocol: 'http', hostname: 'www.gyanmitranews.com' },
      { protocol: 'https', hostname: 'api.gyanmitranews.com' },
      { protocol: 'http', hostname: 'api.gyanmitranews.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/.well-known/ard.json',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiBase}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
