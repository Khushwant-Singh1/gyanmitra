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
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'http', hostname: 'server' },
      { protocol: 'https', hostname: 'gyanmitranews.com' },
      { protocol: 'https', hostname: 'api.gyanmitranews.com' },
    ],
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
