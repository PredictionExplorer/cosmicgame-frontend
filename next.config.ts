import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * Tree-shake barrel imports for libraries we import heavily. Next compiles
   * `import { X, Y } from 'lucide-react'` as if we wrote per-icon ESM imports,
   * shaving ~100s of KB per page. Pair with direct imports in source where
   * the build output justifies it (rare).
   */
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      'recharts',
    ],
  },
  /**
   * Allow the dev server to serve assets (_next/static/*, HMR websocket) to
   * the marketing/app host aliases we document in lib/hostRouting.ts. Next
   * 16 blocks cross-origin dev requests by default; without this, visits to
   * `http://cosmicsignature.local:3000` load the HTML but then hang while
   * fetching chunks, producing a half-rendered page.
   */
  allowedDevOrigins: ['cosmicsignature.local', 'app.cosmicsignature.local'],
  /**
   * Optional: proxy /api/cosmicgame/* to the Go websrv so the browser can
   * use same-origin NEXT_PUBLIC_API_URL (e.g. http://localhost:3000/api/
   * cosmicgame) and avoid CORS / mixed-content. Set
   * COSMICGAME_API_UPSTREAM=http://127.0.0.1:8099 (no path) in .env.local.
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
      {
        protocol: 'https',
        hostname: 'nfts-sepolia.cosmicsignature.com',
        port: '',
        pathname: '/**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'nfts-local.cosmicsignature.com',
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
    config.resolve!.fallback = {
      ...(config.resolve?.fallback ?? {}),
      '@react-native-async-storage/async-storage': false,
    };
    config.externals = [...(config.externals ?? []), 'pino-pretty'];
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
          { key: 'Cross-Origin-Opener-Policy', value: 'unsafe-none' },
        ],
      },
    ];
  },
};

export default withSentryConfig(bundleAnalyzer(nextConfig), {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
