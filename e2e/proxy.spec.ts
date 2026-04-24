import { expect, request, test } from '@playwright/test';

/**
 * End-to-end tests for the proxy middleware (proxy.ts).
 *
 * The proxy handles three categories of request:
 *   1. Landing host (cosmicsignature.com): rewrites / to /landing-site; redirects
 *      app-only paths (308) to app.cosmicsignature.com.
 *   2. App host (app.cosmicsignature.com): serves the dApp as-is.
 *   3. Lexicon-safe URL aliases: rewrites /gesture/:id to /bid/:id, etc.
 *
 * We use a Playwright APIRequestContext to avoid following redirects
 * automatically, so we can assert on 3xx status + Location headers.
 */

const BASE = 'http://localhost:3000';

test.describe('proxy middleware', () => {
  test.describe('on landing host', () => {
    test('rewrites / to the landing page (serves without redirect)', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/`, { maxRedirects: 0 });
      expect(res.status()).toBe(200);
      const body = await res.text();
      expect(body).toContain('Every Gesture Shapes the');
      await ctx.dispose();
    });

    test('redirects /gallery to app subdomain with 308', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/gallery`, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers()['location']).toBe('https://app.cosmicsignature.com/gallery');
      await ctx.dispose();
    });

    test('redirects /current-round and /current-cycle to app subdomain', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'cosmicsignature.com' },
      });

      const r1 = await ctx.get(`${BASE}/current-round`, { maxRedirects: 0 });
      expect(r1.status()).toBe(308);
      expect(r1.headers()['location']).toBe('https://app.cosmicsignature.com/current-round');

      const r2 = await ctx.get(`${BASE}/current-cycle`, { maxRedirects: 0 });
      expect(r2.status()).toBe(308);
      expect(r2.headers()['location']).toBe('https://app.cosmicsignature.com/current-cycle');

      await ctx.dispose();
    });

    test('preserves query strings when redirecting', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/gallery?round=5&sort=desc`, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers()['location']).toBe(
        'https://app.cosmicsignature.com/gallery?round=5&sort=desc',
      );
      await ctx.dispose();
    });

    test('does not redirect unrelated paths (404 or pass-through)', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/landing-site`, { maxRedirects: 0 });
      // Direct access to /landing-site on landing host is allowed (200 via pass-through).
      expect([200, 404]).toContain(res.status());
      await ctx.dispose();
    });
  });

  test.describe('on app host', () => {
    test('serves dApp home page at / without redirect', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'app.cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/`, { maxRedirects: 0 });
      expect(res.status()).toBe(200);
      const body = await res.text();
      // The dApp home page has an accessibility H1 about the protocol.
      expect(body.toLowerCase()).toContain('cosmic signature');
      await ctx.dispose();
    });

    test('blocks direct access to /landing-site with 404', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'app.cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/landing-site`, { maxRedirects: 0 });
      expect(res.status()).toBe(404);
      await ctx.dispose();
    });

    test('rewrites /current-cycle to the /current-round handler', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'app.cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/current-cycle`, { maxRedirects: 0 });
      // Rewrite is internal: status is 200 (not a redirect).
      expect(res.status()).toBe(200);
      await ctx.dispose();
    });

    test('rewrites /anchoring to the /staking handler', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'app.cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/anchoring`, { maxRedirects: 0 });
      expect(res.status()).toBe(200);
      await ctx.dispose();
    });

    test('rewrites /allocation to /prize handler', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'app.cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/allocation`, { maxRedirects: 0 });
      expect(res.status()).toBe(200);
      await ctx.dispose();
    });

    test('unrelated paths fall through unchanged', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'app.cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/faq`, { maxRedirects: 0 });
      expect(res.status()).toBe(200);
      await ctx.dispose();
    });
  });

  test.describe('host-aware robots.txt', () => {
    test('landing host has landing-oriented disallow list', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/robots.txt`);
      expect(res.status()).toBe(200);
      const body = await res.text();
      expect(body).toContain('Sitemap: https://www.cosmicsignature.com/sitemap.xml');
      await ctx.dispose();
    });

    test('app host has minimal disallow (only admin/api)', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'app.cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/robots.txt`);
      expect(res.status()).toBe(200);
      const body = await res.text();
      expect(body).toContain('Sitemap: https://app.cosmicsignature.com/sitemap.xml');
      expect(body).toContain('/admin/');
      expect(body).toContain('/api/');
      await ctx.dispose();
    });
  });
});
