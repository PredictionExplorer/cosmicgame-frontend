import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

import config from '@/next.config';

jest.mock('@sentry/nextjs');

describe('next.config', () => {
  it('enables React strict mode', () => {
    expect(config).toHaveProperty('reactStrictMode', true);
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
