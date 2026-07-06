import { expect, test } from '@playwright/test';

const APP_HOST = 'app.cosmicsignature.com';
const LANDING_HOST = 'cosmicsignature.com';

interface PublicPage {
  path: string;
  host: string;
  h1: string | RegExp;
  /** JSON-LD @type values that must be present in the raw HTML. */
  jsonLd?: string[];
}

const publicPages: PublicPage[] = [
  {
    path: '/',
    host: LANDING_HOST,
    h1: 'Cosmic Signature:',
    jsonLd: ['Organization', 'WebSite', 'CreativeWork'],
  },
  { path: '/about', host: LANDING_HOST, h1: 'About Cosmic Signature', jsonLd: ['AboutPage'] },
  { path: '/learn', host: LANDING_HOST, h1: 'Learn Cosmic Signature', jsonLd: ['BreadcrumbList'] },
  {
    path: '/learn/collecting-and-trading-cosmic-signature',
    host: LANDING_HOST,
    h1: 'Collecting and Trading Cosmic Signature',
    jsonLd: ['Article', 'BreadcrumbList'],
  },
  {
    path: '/',
    host: APP_HOST,
    h1: /Shape the next Cosmic Signature|Next Cycle Opens Soon|Cycle #\d+ Is Open|The Final Window Is Open|Cycle Ready to Finalize/,
    jsonLd: ['Organization', 'WebSite', 'WebApplication'],
  },
  {
    path: '/statistics',
    host: APP_HOST,
    h1: 'Cosmic Signature Protocol Statistics',
    jsonLd: ['WebPage', 'Dataset'],
  },
  {
    path: '/faq',
    host: APP_HOST,
    h1: 'Cosmic Signature FAQ',
    jsonLd: ['FAQPage', 'BreadcrumbList'],
  },
  {
    path: '/how-it-works',
    host: APP_HOST,
    h1: 'How Cosmic Signature Works',
    jsonLd: ['WebPage', 'BreadcrumbList'],
  },
  { path: '/anchoring', host: APP_HOST, h1: 'Anchor Distributions' },
  { path: '/allocation', host: APP_HOST, h1: 'Allocation Recipients' },
  {
    path: '/contracts',
    host: APP_HOST,
    h1: 'Cosmic Signature Contracts',
    jsonLd: ['WebPage', 'BreadcrumbList'],
  },
  {
    path: '/code',
    host: APP_HOST,
    h1: 'Cosmic Signature Source Code',
    jsonLd: ['WebPage', 'BreadcrumbList'],
  },
  {
    path: '/gallery',
    host: APP_HOST,
    h1: 'Cosmic Signature Gallery',
    jsonLd: ['CollectionPage', 'BreadcrumbList'],
  },
];

function hostHeaders(host: string) {
  return { Host: host, 'X-Forwarded-Host': host };
}

function countMatches(text: string, pattern: RegExp): number {
  return text.match(pattern)?.length ?? 0;
}

/** Parses every JSON-LD script and returns the flat set of @type values. */
function collectJsonLdTypes(html: string): Set<string> {
  const types = new Set<string>();
  for (const match of html.matchAll(
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  )) {
    const parsed = JSON.parse(match[1] ?? '') as unknown;
    const nodes = Array.isArray(parsed) ? parsed : [parsed];
    for (const node of nodes) {
      const type = (node as { '@type'?: string | string[] })['@type'];
      if (typeof type === 'string') types.add(type);
      else if (Array.isArray(type)) for (const t of type) types.add(t);
    }
  }
  return types;
}

function extractTitle(html: string): string {
  return html.match(/<title>([^<]+)<\/title>/)?.[1] ?? '';
}

function extractDescription(html: string): string {
  return html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/)?.[1] ?? '';
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

      const jsonLdTypes = collectJsonLdTypes(html);
      for (const expectedType of page.jsonLd ?? []) {
        if (!jsonLdTypes.has(expectedType)) {
          throw new Error(
            `${page.host}${page.path} is missing JSON-LD @type "${expectedType}" ` +
              `(found: ${[...jsonLdTypes].join(', ') || 'none'})`,
          );
        }
      }
    });
  }

  test('public pages have unique titles and meta descriptions', async ({ request }) => {
    const titles = new Map<string, string>();
    const descriptions = new Map<string, string>();

    for (const page of publicPages) {
      const response = await request.get(page.path, { headers: hostHeaders(page.host) });
      expect(response.status()).toBe(200);
      const html = await response.text();
      const key = `${page.host}${page.path}`;

      const title = extractTitle(html);
      const description = extractDescription(html);
      expect(title.length).toBeGreaterThan(10);
      expect(description.length).toBeGreaterThan(30);

      for (const [otherKey, otherTitle] of titles) {
        expect(title, `duplicate <title> between ${otherKey} and ${key}`).not.toBe(otherTitle);
      }
      for (const [otherKey, otherDescription] of descriptions) {
        expect(description, `duplicate meta description between ${otherKey} and ${key}`).not.toBe(
          otherDescription,
        );
      }
      titles.set(key, title);
      descriptions.set(key, description);
    }
  });

  for (const host of [APP_HOST, LANDING_HOST]) {
    test(`${host} sitemap URLs all resolve to indexable 200 pages`, async ({ request }) => {
      const response = await request.get('/sitemap.xml', { headers: hostHeaders(host) });
      expect(response.status()).toBe(200);
      const xml = await response.text();

      const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]!);
      expect(locs.length).toBeGreaterThan(host === APP_HOST ? 20 : 10);

      for (const loc of locs) {
        const url = new URL(loc);
        expect(url.hostname).toBe(host);
        const pageResponse = await request.get(url.pathname, {
          headers: hostHeaders(host),
          maxRedirects: 0,
        });
        expect(pageResponse.status(), `${loc} should return 200 without redirects`).toBe(200);
        const pageHtml = await pageResponse.text();
        expect(pageHtml, `${loc} must not be noindex while listed in the sitemap`).not.toMatch(
          /name="robots"[^>]+content="[^"]*noindex/i,
        );
      }
    });

    test(`${host} serves the AI docs (llms.txt, llms-full.txt)`, async ({ request }) => {
      for (const file of ['/llms.txt', '/llms-full.txt']) {
        const response = await request.get(file, { headers: hostHeaders(host) });
        expect(response.status()).toBe(200);
        const text = await response.text();
        expect(text).toContain('Cosmic Signature');
        expect(text).toMatch(/not related to the COSMIC cancer mutation database/i);
        expect(text).toContain('Axiom Zero');
        expect(text).toContain('Chaos Zero');
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
  });

  test('invalid token detail routes return a real 404', async ({ request }) => {
    const response = await request.get('/detail/not-a-token', { headers: hostHeaders(APP_HOST) });
    expect(response.status()).toBe(404);
  });

  test('unknown top-level routes return a real 404 with branded content', async ({ request }) => {
    const response = await request.get('/this-route-does-not-exist', {
      headers: hostHeaders(APP_HOST),
    });
    expect(response.status()).toBe(404);
    const html = await response.text();
    expect(html).toContain('Page Not Found');
  });

  test('static content pages are CDN-cacheable (no forced dynamic rendering)', async ({
    request,
  }) => {
    // Before the route-group refactor, headers() in the root layout forced
    // every page to render per-request with `private, no-cache, no-store`.
    // These content routes must stay prerendered.
    const staticPages = [
      { path: '/faq', host: APP_HOST },
      { path: '/how-it-works', host: APP_HOST },
      { path: '/terms', host: APP_HOST },
      { path: '/about', host: LANDING_HOST },
      { path: '/learn/what-is-cosmic-signature', host: LANDING_HOST },
    ];
    for (const page of staticPages) {
      const response = await request.get(page.path, { headers: hostHeaders(page.host) });
      expect(response.status()).toBe(200);
      const cacheControl = response.headers()['cache-control'] ?? '';
      expect(
        cacheControl,
        `${page.host}${page.path} must not be force-dynamic (got "${cacheControl}")`,
      ).not.toMatch(/private|no-store/);
    }
  });
});
