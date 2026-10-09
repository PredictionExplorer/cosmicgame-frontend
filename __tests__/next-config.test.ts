import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

import config from '@/next.config';

jest.mock('@sentry/nextjs');

// The real plugin resolves i18n/request.ts via createRequire(import.meta.url),
// which jsdom cannot satisfy. The identity mock keeps the config chain
// (withSentryConfig(bundleAnalyzer(withNextIntl(nextConfig)))) inspectable.
jest.mock('next-intl/plugin', () => ({
  __esModule: true,
  default: () => (nextConfig: unknown) => nextConfig,
}));

describe('next.config', () => {
  it('enables React strict mode', () => {
    expect(config).toHaveProperty('reactStrictMode', true);
  });

  it('inlines public build metadata for the client bundle', () => {
    expect((config as NextConfig).env).toMatchObject({
      NEXT_PUBLIC_BUILD_COMMIT: expect.any(String),
      NEXT_PUBLIC_BUILD_REF: expect.any(String),
      NEXT_PUBLIC_VERCEL_ENV: expect.any(String),
    });
  });

  it('configures NFT image remote patterns for rotated API origins and legacy CDN hosts', () => {
    const patterns = (config as NextConfig).images?.remotePatterns;
    expect(patterns).toEqual(
      expect.arrayContaining([
        // Derived from jest.setup.ts NEXT_PUBLIC_API_URL: media is served by
        // the rotated API servers (utils/urls.ts nftCdnOrigin).
        expect.objectContaining({
          protocol: 'http',
          hostname: 'test-api.example',
        }),
        expect.objectContaining({
          protocol: 'https',
          hostname: 'nfts.cosmicsignature.com',
        }),
        expect.objectContaining({
          protocol: 'https',
          hostname: 'nfts-sepolia.cosmicsignature.com',
        }),
        expect.objectContaining({
          protocol: 'https',
          hostname: 'nfts-local.cosmicsignature.com',
        }),
      ]),
    );
    expect(patterns).toHaveLength(4);
  });

  it('keeps optimized renditions of the seed-named art for a month', () => {
    expect((config as NextConfig).images?.minimumCacheTTL).toBe(2_678_400);
  });

  it('enables turbopack', () => {
    expect(config).toHaveProperty('turbopack');
  });

  describe('rewrites', () => {
    const originalUpstream = process.env.COSMICGAME_API_UPSTREAM;

    afterEach(() => {
      if (originalUpstream === undefined) {
        delete process.env.COSMICGAME_API_UPSTREAM;
      } else {
        process.env.COSMICGAME_API_UPSTREAM = originalUpstream;
      }
    });

    it('does not proxy Cosmic Game API requests when no upstream is configured', async () => {
      delete process.env.COSMICGAME_API_UPSTREAM;

      await expect((config as NextConfig).rewrites!()).resolves.toEqual([]);
    });

    it('proxies same-origin Cosmic Game API requests to the configured upstream', async () => {
      process.env.COSMICGAME_API_UPSTREAM = 'http://127.0.0.1:8099/';

      await expect((config as NextConfig).rewrites!()).resolves.toEqual([
        {
          source: '/api/cosmicgame/:path*',
          destination: 'http://127.0.0.1:8099/api/cosmicgame/:path*',
        },
        {
          source: '/api/v2/cosmicgame/:path*',
          destination: 'http://127.0.0.1:8099/api/v2/cosmicgame/:path*',
        },
      ]);
    });
  });

  describe('webpack customizations', () => {
    const webpackFn = (config as NextConfig).webpack!;
    const baseConfig = {
      resolve: { fallback: { existing: true } },
      externals: ['existing-external'],
    };

    let result: ReturnType<typeof webpackFn>;

    beforeAll(() => {
      result = webpackFn(baseConfig as never, {} as never);
    });

    it('preserves existing resolve.fallback entries', () => {
      expect(result.resolve.fallback).toHaveProperty('existing', true);
    });

    it('disables @react-native-async-storage/async-storage', () => {
      expect(result.resolve.fallback).toHaveProperty(
        '@react-native-async-storage/async-storage',
        false,
      );
    });

    it('preserves existing externals', () => {
      expect(result.externals).toContain('existing-external');
    });

    it('adds pino-pretty to externals', () => {
      expect(result.externals).toContain('pino-pretty');
    });
  });

  describe('security headers', () => {
    let headers: Awaited<ReturnType<NonNullable<NextConfig['headers']>>>;

    const DSN = 'https://abc123@o42.ingest.sentry.io/4507';
    const savedDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

    beforeAll(async () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = DSN;
      headers = await (config as NextConfig).headers!();
    });

    afterAll(() => {
      if (savedDsn === undefined) delete process.env.NEXT_PUBLIC_SENTRY_DSN;
      else process.env.NEXT_PUBLIC_SENTRY_DSN = savedDsn;
    });

    it('applies headers to all routes', () => {
      expect(headers[0]?.source).toBe('/(.*)');
    });

    it.each([
      ['X-Frame-Options', 'SAMEORIGIN'],
      ['X-Content-Type-Options', 'nosniff'],
      ['Referrer-Policy', 'strict-origin-when-cross-origin'],
      ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
    ])('includes %s header', (key, value) => {
      const headerValues = headers[0]?.headers;
      expect(headerValues).toContainEqual({ key, value });
    });

    it('enforces the CSP baseline and reports against the full allowlist', () => {
      const value = (key: string) =>
        headers[0]?.headers.find((header) => header.key === key)?.value;
      expect(value('Content-Security-Policy')).toBe(
        "object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'",
      );
      const reportOnly = value('Content-Security-Policy-Report-Only');
      expect(reportOnly).toMatch(/^default-src 'self'; script-src 'self' 'unsafe-inline' /);
      // jest.setup.ts points the API at a plain-http origin, which is named.
      expect(reportOnly).toContain("connect-src 'self' https: wss: http://test-api.example");
      expect(reportOnly).toContain(
        'report-uri https://o42.ingest.sentry.io/api/4507/security/?sentry_key=abc123',
      );
    });

    it('sends no report-only policy when there is nowhere to report', async () => {
      delete process.env.NEXT_PUBLIC_SENTRY_DSN;
      const withoutDsn = await (config as NextConfig).headers!();
      process.env.NEXT_PUBLIC_SENTRY_DSN = DSN;
      const keys = withoutDsn[0]?.headers.map((header) => header.key);
      expect(keys).toContain('Content-Security-Policy');
      expect(keys).not.toContain('Content-Security-Policy-Report-Only');
    });

    it('lets browsers keep static images for a day and revalidate in the background', () => {
      const images = headers.find((rule) => rule.source === '/images/:path*');
      expect(images?.headers).toEqual([
        { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
      ]);
    });
  });

  describe('Sentry integration', () => {
    it('wraps config with withSentryConfig', () => {
      expect(withSentryConfig).toHaveBeenCalledWith(
        expect.objectContaining({ reactStrictMode: true }),
        expect.objectContaining({ silent: true }),
      );
    });

    it('passes org and project from environment', () => {
      expect(withSentryConfig).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
        }),
      );
    });
  });
});
