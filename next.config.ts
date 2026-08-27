import { execSync } from 'node:child_process';

import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import withBundleAnalyzer from '@next/bundle-analyzer';
import createNextIntlPlugin from 'next-intl/plugin';

function resolveGitSha(): string {
  if (process.env.VERCEL_GIT_COMMIT_SHA?.trim()) return process.env.VERCEL_GIT_COMMIT_SHA.trim();
  if (process.env.GITHUB_SHA?.trim()) return process.env.GITHUB_SHA.trim();
  try {
    return execSync('git rev-parse HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function resolveGitRef(): string {
  if (process.env.VERCEL_GIT_COMMIT_REF?.trim()) return process.env.VERCEL_GIT_COMMIT_REF.trim();
  if (process.env.GITHUB_REF_NAME?.trim()) return process.env.GITHUB_REF_NAME.trim();
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

interface RemoteImagePattern {
  protocol: 'http' | 'https';
  hostname: string;
  port: string;
  pathname: string;
  search: string;
}

/**
 * One next/image remote pattern per configured API origin. NFT media is
 * served by the same rotated API servers (see lib/serverRotation.ts and
 * utils/urls.ts), so any host in NEXT_PUBLIC_API_URLS / NEXT_PUBLIC_API_URL
 * may appear as an image src depending on the hourly rotation.
 */
function apiOriginRemotePatterns(): RemoteImagePattern[] {
  const raw = [process.env.NEXT_PUBLIC_API_URLS, process.env.NEXT_PUBLIC_API_URL]
    .filter(Boolean)
    .join(',');
  const patterns: RemoteImagePattern[] = [];
  const seen = new Set<string>();
  for (const entry of raw.split(',')) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    try {
      const url = new URL(trimmed);
      if (seen.has(url.origin)) continue;
      seen.add(url.origin);
      patterns.push({
        protocol: url.protocol === 'https:' ? 'https' : 'http',
        hostname: url.hostname,
        port: url.port,
        pathname: '/**',
        search: '',
      });
    } catch {
      // Malformed origins surface at runtime through the fetch layer.
    }
  }
  return patterns;
}

// Links i18n/request.ts to next-intl (docs/i18n/README.md §2).
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /**
   * The local test harness (scripts/harness) runs its own dev server with a
   * separate dist dir so it can coexist with a regular `npm run dev`/`start`
   * on the default `.next`. Unset everywhere else.
   */
  ...(process.env.NEXT_DIST_DIR?.trim() ? { distDir: process.env.NEXT_DIST_DIR.trim() } : {}),
  env: {
    NEXT_PUBLIC_BUILD_COMMIT: resolveGitSha(),
    NEXT_PUBLIC_BUILD_REF: resolveGitRef(),
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || '',
  },
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
      // Rotated API origins (the media servers actually used by the app).
      ...apiOriginRemotePatterns(),
      // Legacy media host: kept for URLs stored in metadata / third-party
      // caches. Frontend code no longer builds URLs against it.
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

export default withSentryConfig(bundleAnalyzer(withNextIntl(nextConfig)), {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
