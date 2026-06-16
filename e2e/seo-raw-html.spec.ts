import { expect, test } from '@playwright/test';

const APP_HOST = 'app.cosmicsignature.com';
const LANDING_HOST = 'cosmicsignature.com';

const publicPages = [
  { path: '/', host: LANDING_HOST, h1: 'Cosmic Signature:' },
  { path: '/about', host: LANDING_HOST, h1: 'About Cosmic Signature' },
  { path: '/learn', host: LANDING_HOST, h1: 'Learn Cosmic Signature' },
  {
    path: '/',
    host: APP_HOST,
    h1: /Shape the next Cosmic Signature|Next Cycle Opens Soon|Cycle #\d+ Is Open|The Final Window Is Open|Cycle Ready to Finalize/,
  },
  { path: '/statistics', host: APP_HOST, h1: 'Cosmic Signature Protocol Statistics' },
  { path: '/faq', host: APP_HOST, h1: 'Cosmic Signature FAQ' },
  { path: '/anchoring', host: APP_HOST, h1: 'Anchor Distributions' },
  { path: '/allocation', host: APP_HOST, h1: 'Allocation Recipients' },
  { path: '/contracts', host: APP_HOST, h1: 'Cosmic Signature Contracts' },
  { path: '/code', host: APP_HOST, h1: 'Cosmic Signature Source Code' },
];

function hostHeaders(host: string) {
  return { Host: host, 'X-Forwarded-Host': host };
}

function countMatches(text: string, pattern: RegExp): number {
  return text.match(pattern)?.length ?? 0;
}

test.describe('raw HTML SEO', () => {
  for (const page of publicPages) {
    test(`${page.host}${page.path} has crawler-visible metadata and content`, async ({
      request,
    }) => {
      const response = await request.get(page.path, { headers: hostHeaders(page.host) });
      expect(response.status()).toBe(200);
      const html = await response.text();

      expect(html).toMatch(/<title>[^<]{10,}<\/title>/);
      expect(html).toMatch(/<meta[^>]+name="description"[^>]+content="[^"]{30,}"/);
      expect(html).toMatch(/<link[^>]+rel="canonical"[^>]+href="https?:\/\//);
      if (typeof page.h1 === 'string') {
        expect(html).toContain(page.h1);
      } else {
        expect(html).toMatch(page.h1);
      }
      expect(countMatches(html, /<h1[\s>]/g)).toBe(1);
      expect(html).not.toMatch(/name="robots"[^>]+content="[^"]*noindex/i);
      expect(html).not.toMatch(/<body[^>]*>\s*<[^>]*>\s*Loading/i);
      for (const match of html.matchAll(
        /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
      )) {
        expect(() => JSON.parse(match[1] ?? '')).not.toThrow();
      }
    });
  }

  test('app sitemap does not include noindex demo or wallet-personal routes', async ({
    request,
  }) => {
    const response = await request.get('/sitemap.xml', { headers: hostHeaders(APP_HOST) });
    expect(response.status()).toBe(200);
    const xml = await response.text();

    expect(xml).toContain('https://app.cosmicsignature.com/statistics');
    expect(xml).not.toContain('https://app.cosmicsignature.com/recipient-history');
    expect(xml).not.toContain('https://app.cosmicsignature.com/detail/sample');
  });

  test('invalid token detail routes return a real 404', async ({ request }) => {
    const response = await request.get('/detail/not-a-token', { headers: hostHeaders(APP_HOST) });
    expect(response.status()).toBe(404);
  });
});
