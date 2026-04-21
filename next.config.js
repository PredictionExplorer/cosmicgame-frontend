/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /**
   * Optional: proxy /api/cosmicgame/* to the Go websrv so the browser can use same-origin
   * NEXT_PUBLIC_API_URL (e.g. http://localhost:3000/api/cosmicgame) and avoid CORS / mixed-content.
   * Set COSMICGAME_API_UPSTREAM=http://127.0.0.1:8099 (no path) in .env.local
   */
  async rewrites() {
    const upstream = process.env.COSMICGAME_API_UPSTREAM?.trim();
    if (!upstream) return [];
    const base = upstream.replace(/\/+$/, '');
    return [
      {
        source: '/api/cosmicgame/:path*',
        destination: `${base}/api/cosmicgame/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nfts.cosmicsignature.com',
        port: '',
        pathname: '/**',
        search: '',
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
  webpack: (config) => {
    config.context = __dirname;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
    };
    config.externals = [...(config.externals || []), 'pino-pretty'];
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },
};

const { withSentryConfig } = require('@sentry/nextjs');
module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
