// lexicon-allow-start: exercises legacy URL rewrites by design
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

const BASE = `http://localhost:${process.env.PLAYWRIGHT_PORT ?? 3000}`;

/**
 * The proxy middleware bakes the redirect target into the build via
 * `lib/hostRouting.ts`'s `APP_ORIGIN`, which switches on `NODE_ENV` at compile
 * time so static landing-page links can be pre-rendered. As a result, the
 * Location header is `http://app.cosmicsignature.local:3000` under `next dev`
 * and `https://app.cosmicsignature.com` under `next start` (and CI). Both are
 * acceptable; we just need to verify the redirect hits an app origin and
 * preserves the path + query string. This mirrors the pattern in
 * `e2e/landing.spec.ts`.
 */
const APP_ORIGIN_PREFIX_PATTERN =
  /^https:\/\/app\.cosmicsignature\.com|^http:\/\/app\.cosmicsignature\.local:3000/;
const LANDING_ORIGIN_PREFIX_PATTERN =
  /^https:\/\/cosmicsignature\.com|^http:\/\/cosmicsignature\.local:3000/;

function expectedAppLocation(pathAndQuery: string): RegExp {
  const escaped = pathAndQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${APP_ORIGIN_PREFIX_PATTERN.source}${escaped}$`);
}

function expectedLandingLocation(pathAndQuery: string): RegExp {
  const escaped = pathAndQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${LANDING_ORIGIN_PREFIX_PATTERN.source}${escaped}$`);
}

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
      expect(res.headers()['location']).toMatch(expectedAppLocation('/gallery'));
      await ctx.dispose();
    });

    test('redirects /current-cycle to app subdomain', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'cosmicsignature.com' },
      });

      const res = await ctx.get(`${BASE}/current-cycle`, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers()['location']).toMatch(expectedAppLocation('/current-cycle'));

      await ctx.dispose();
    });

    test('redirects /experimental-ui to the app subdomain and preserves its query', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/experimental-ui?source=landing`, {
        maxRedirects: 0,
      });

      expect(res.status()).toBe(308);
      expect(res.headers()['location']).toMatch(
        expectedAppLocation('/experimental-ui?source=landing'),
      );
      await ctx.dispose();
    });

    test('preserves query strings when redirecting', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/gallery?round=5&sort=desc`, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers()['location']).toMatch(expectedAppLocation('/gallery?round=5&sort=desc'));
      await ctx.dispose();
    });

    test('serves apex-only learn pages on the landing host', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/learn/what-is-cosmic-signature`, { maxRedirects: 0 });
      expect(res.status()).toBe(200);
      await ctx.dispose();
    });

    test('308-redirects direct /landing-site access to / (canonicalization)', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/landing-site`, { maxRedirects: 0 });
      // The landing is public at `/` only. Direct access to the internal
      // /landing-site route is canonicalized via 308 so there is exactly one
      // URL in the search index for this content.
      expect(res.status()).toBe(308);
      expect(res.headers()['location']).toMatch(/\/$/);
      await ctx.dispose();
    });

    test('redirects www landing host to apex canonical host', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'www.cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/gallery?round=5`, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers()['location']).toMatch(expectedLandingLocation('/gallery?round=5'));
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

    test('rewrites /anchoring to the /anchoring handler', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'app.cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/anchoring`, { maxRedirects: 0 });
      expect(res.status()).toBe(200);
      await ctx.dispose();
    });

    test('rewrites /allocation to /allocation handler', async () => {
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

    test('redirects landing-only content back to the apex host', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'app.cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/about`, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers()['location']).toMatch(expectedLandingLocation('/about'));
      await ctx.dispose();
    });
  });

  test.describe('locale-prefixed paths (/zh)', () => {
    test('landing host serves /zh as the Chinese landing page (rewrite, no redirect)', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/zh`, { maxRedirects: 0 });
      expect(res.status()).toBe(200);
      const body = await res.text();
      expect(body).toContain('lang="zh"');
      expect(body).toContain('程序化链上艺术');
      await ctx.dispose();
    });

    test('landing host redirects /zh/gallery to app subdomain keeping the prefix', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/zh/gallery?round=5`, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers()['location']).toMatch(expectedAppLocation('/zh/gallery?round=5'));
      await ctx.dispose();
    });

    test('landing host keeps the locale when redirecting /zh/experimental-ui', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/zh/experimental-ui?source=landing`, {
        maxRedirects: 0,
      });

      expect(res.status()).toBe(308);
      expect(res.headers()['location']).toMatch(
        expectedAppLocation('/zh/experimental-ui?source=landing'),
      );
      await ctx.dispose();
    });

    test('landing host canonicalizes /zh/landing-site to /zh', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/zh/landing-site`, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers()['location']).toMatch(/\/zh$/);
      await ctx.dispose();
    });

    test('app host serves /zh dApp home with lang="zh"', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'app.cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/zh`, { maxRedirects: 0 });
      expect(res.status()).toBe(200);
      const body = await res.text();
      expect(body).toContain('lang="zh"');
      await ctx.dispose();
    });

    test('app host redirects landing-only /zh/about to the apex host keeping the prefix', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'app.cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/zh/about`, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers()['location']).toMatch(expectedLandingLocation('/zh/about'));
      await ctx.dispose();
    });

    test('default-locale prefix /en/gallery canonicalizes to the unprefixed URL', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'app.cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/en/gallery`, { maxRedirects: 0 });
      // localePrefix 'as-needed': English never carries a prefix publicly.
      expect([307, 308]).toContain(res.status());
      expect(res.headers()['location']).toMatch(/\/gallery$/);
      await ctx.dispose();
    });

    test('www landing host redirect preserves the /zh prefix', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'www.cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/zh/gallery`, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers()['location']).toMatch(expectedLandingLocation('/zh/gallery'));
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
      expect(body).toMatch(
        /Sitemap: (https:\/\/cosmicsignature\.com|http:\/\/cosmicsignature\.local:3000)\/sitemap\.xml/,
      );
      await ctx.dispose();
    });

    test('app host disallows crawl-waste paths without hiding noindex pages', async () => {
      const ctx = await request.newContext({
        extraHTTPHeaders: { Host: 'app.cosmicsignature.com' },
      });
      const res = await ctx.get(`${BASE}/robots.txt`);
      expect(res.status()).toBe(200);
      const body = await res.text();
      expect(body).toMatch(
        /Sitemap: (https:\/\/app\.cosmicsignature\.com|http:\/\/app\.cosmicsignature\.local:3000)\/sitemap\.xml/,
      );
      expect(body).toContain('/api/');
      expect(body).toContain('/internal/');
      expect(body).toContain('/debug/');
      expect(body).toContain('/wallet/');
      expect(body).toContain('/account/');
      expect(body).not.toContain('/admin/');
      await ctx.dispose();
    });
  });
});

// lexicon-allow-end
