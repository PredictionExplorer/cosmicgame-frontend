import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

import config from '@/next.config';

jest.mock('@sentry/nextjs');

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

  it('configures NFT image remote patterns for all CDN hosts', () => {
    const patterns = (config as NextConfig).images?.remotePatterns;
    expect(patterns).toEqual(
      expect.arrayContaining([
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
    expect(patterns).toHaveLength(3);
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

    beforeAll(async () => {
      headers = await (config as NextConfig).headers!();
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
