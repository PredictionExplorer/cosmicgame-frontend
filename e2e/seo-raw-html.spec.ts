import { expect, test } from '@playwright/test';

import { getLandingContent } from '../content/landing';

import { LOCALE_CHROME, LOCALE_SEO, TRANSLATED_LOCALES } from './locale-fixtures';

const APP_HOST = 'app.cosmicsignature.com';
const LANDING_HOST = 'cosmicsignature.com';

interface PublicPage {
  path: string;
  host: string;
  /** Text the raw HTML must contain (the H1's text). */
  h1: string;
  /**
   * The H1 is one rich message (the accent in a span inside it): `h1` is then
   * its exact text once the tags are stripped.
   */
  richH1?: true;
  /** JSON-LD @type values that must be present in the raw HTML. */
  jsonLd?: string[];
}

const publicPages: PublicPage[] = [
  {
    path: '/',
    host: LANDING_HOST,
    h1: getLandingContent('en').hero.headlineLead,
    jsonLd: ['Organization', 'WebSite', 'CreativeWork'],
  },
  { path: '/about', host: LANDING_HOST, h1: 'About Cosmic Signature', jsonLd: ['AboutPage'] },
  { path: '/learn', host: LANDING_HOST, h1: 'Learn Cosmic Signature', jsonLd: ['BreadcrumbList'] },
  {
    path: '/learn/collecting-and-trading-cosmic-signature',
    host: LANDING_HOST,
    h1: 'Collecting and trading Cosmic Signature',
    jsonLd: ['Article', 'BreadcrumbList'],
  },
  {
    path: '/zh',
    host: LANDING_HOST,
    h1: getLandingContent('zh').hero.headlineLead,
    jsonLd: ['Organization', 'WebSite', 'CreativeWork'],
  },
  {
    path: '/zh/about',
    host: LANDING_HOST,
    h1: '关于 Cosmic Signature',
    jsonLd: ['AboutPage'],
  },
  {
    path: '/zh/learn',
    host: LANDING_HOST,
    h1: '了解 Cosmic Signature',
    jsonLd: ['BreadcrumbList'],
  },
  {
    path: '/zh/learn/what-is-cosmic-signature',
    host: LANDING_HOST,
    h1: '什么是 Cosmic Signature？',
    jsonLd: ['Article', 'BreadcrumbList'],
  },
  {
    path: '/uk',
    host: LANDING_HOST,
    h1: getLandingContent('uk').hero.headlineLead,
    jsonLd: ['Organization', 'WebSite', 'CreativeWork'],
  },
  {
    path: '/uk/about',
    host: LANDING_HOST,
    h1: 'Про Cosmic Signature',
    jsonLd: ['AboutPage'],
  },
  {
    path: '/uk/learn',
    host: LANDING_HOST,
    h1: 'Дізнайтеся, як працює Cosmic Signature',
    jsonLd: ['BreadcrumbList'],
  },
  {
    path: '/uk/learn/what-is-cosmic-signature',
    host: LANDING_HOST,
    h1: 'Що таке Cosmic Signature?',
    jsonLd: ['Article', 'BreadcrumbList'],
  },
  {
    path: '/',
    host: APP_HOST,
    // The Deck header owns a stable H1; the phase-driven hero headline is a
    // server-rendered H2 in the story section below.
    h1: 'The Cosmic Signature Observatory',
    jsonLd: ['Organization', 'WebSite', 'WebApplication'],
  },
  {
    path: '/statistics',
    host: APP_HOST,
    h1: 'Protocol statistics',
    jsonLd: ['WebPage', 'Dataset'],
  },
  {
    path: '/faq',
    host: APP_HOST,
    h1: 'Cosmic Signature FAQ',
    richH1: true,
    jsonLd: ['FAQPage', 'BreadcrumbList'],
  },
  {
    path: '/how-it-works',
    host: APP_HOST,
    h1: 'How Cosmic Signature works',
    richH1: true,
    jsonLd: ['WebPage', 'BreadcrumbList'],
  },
  { path: '/anchoring', host: APP_HOST, h1: 'Anchor Distributions' },
  { path: '/allocation', host: APP_HOST, h1: 'Allocation Recipients' },
  {
    path: '/contracts',
    host: APP_HOST,
    h1: 'Cosmic Signature contracts',
    jsonLd: ['WebPage', 'BreadcrumbList'],
  },
  {
    path: '/code',
    host: APP_HOST,
    h1: 'Cosmic Signature source code',
    jsonLd: ['WebPage', 'BreadcrumbList'],
  },
  {
    path: '/gallery',
    host: APP_HOST,
    h1: 'Cosmic Signature Gallery',
    jsonLd: ['CollectionPage', 'BreadcrumbList'],
  },
  {
    path: '/zh/statistics',
    host: APP_HOST,
    h1: '协议统计',
    jsonLd: ['Organization', 'WebSite', 'WebApplication', 'WebPage', 'Dataset'],
  },
  {
    path: '/zh/faq',
    host: APP_HOST,
    h1: 'Cosmic Signature 常见问题',
    richH1: true,
    jsonLd: ['Organization', 'WebSite', 'WebApplication', 'FAQPage', 'BreadcrumbList'],
  },
  {
    path: '/zh/gallery',
    host: APP_HOST,
    h1: 'Cosmic Signature 画廊',
    jsonLd: ['Organization', 'WebSite', 'WebApplication', 'CollectionPage', 'BreadcrumbList'],
  },
  {
    path: '/zh/anchoring',
    host: APP_HOST,
    h1: '锚定派发',
    jsonLd: ['Organization', 'WebSite', 'WebApplication'],
  },
  {
    path: '/uk/statistics',
    host: APP_HOST,
    h1: 'Статистика протоколу',
    jsonLd: ['Organization', 'WebSite', 'WebApplication', 'WebPage', 'Dataset'],
  },
  {
    path: '/uk/faq',
    host: APP_HOST,
    h1: 'Поширені запитання про Cosmic Signature',
    richH1: true,
    jsonLd: ['Organization', 'WebSite', 'WebApplication', 'FAQPage', 'BreadcrumbList'],
  },
  {
    path: '/uk/gallery',
    host: APP_HOST,
    h1: 'Галерея Cosmic Signature',
    jsonLd: ['Organization', 'WebSite', 'WebApplication', 'CollectionPage', 'BreadcrumbList'],
  },
  {
    path: '/uk/anchoring',
    host: APP_HOST,
    h1: 'Надходження за закріплення',
    jsonLd: ['Organization', 'WebSite', 'WebApplication'],
  },
];

function hostHeaders(host: string) {
  return { Host: host, 'X-Forwarded-Host': host };
}

/** The first H1's text with its tags stripped and whitespace collapsed. */
function extractH1Text(html: string): string {
  const inner = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '';
  return inner
    .replace(/<[^>]+>/g, '')
    .replaceAll('&amp;', '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function countMatches(text: string, pattern: RegExp): number {
  return text.match(pattern)?.length ?? 0;
}

interface JsonLdNode {
  '@type'?: string | string[];
  description?: string;
  inLanguage?: string;
  url?: string;
}

/** Parses every JSON-LD script and returns a flat node list. */
function collectJsonLdNodes(html: string): JsonLdNode[] {
  const result: JsonLdNode[] = [];
  for (const match of html.matchAll(
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  )) {
    const parsed = JSON.parse(match[1] ?? '') as unknown;
    const nodes = Array.isArray(parsed) ? parsed : [parsed];
    for (const node of nodes) {
      result.push(node as JsonLdNode);
    }
  }
  return result;
}

/** Parses every JSON-LD script and returns the flat set of @type values. */
function collectJsonLdTypes(html: string): Set<string> {
  const types = new Set<string>();
  for (const node of collectJsonLdNodes(html)) {
    const type = node['@type'];
    if (typeof type === 'string') types.add(type);
    else if (Array.isArray(type)) for (const value of type) types.add(value);
  }
  return types;
}

function extractTitle(html: string): string {
  return html.match(/<title>([^<]+)<\/title>/)?.[1] ?? '';
}

/**
 * A 404's own head, in the HTML crawlers read: the error's title (not the
 * site default) and no "index, follow" beside the `noindex` Next.js adds.
 */
function expectNotFoundHead(html: string, path: string): void {
  const title = extractTitle(html);
  expect(title, `${path} names the error in its title`).toMatch(/ · Cosmic Signature$/);
  expect(title, `${path} does not keep the site default title`).not.toBe('Cosmic Signature');
  expect(html, `${path} has no indexable robots line`).not.toMatch(
    /name="robots"[^>]+content="index/i,
  );
}

function extractDescription(html: string): string {
  return html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/)?.[1] ?? '';
}

function extractIconHrefs(html: string): string[] {
  return [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => {
      if (!/\brel=["']icon["']/i.test(tag)) return undefined;
      return tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    })
    .filter((href): href is string => href !== undefined);
}

function extractOgImageUrl(html: string): string {
  const value =
    html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/)?.[1] ??
    html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/)?.[1] ??
    '';
  return value.replaceAll('&amp;', '&');
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
      if (page.richH1) {
        expect(extractH1Text(html)).toBe(page.h1);
      } else {
        // Tag-agnostic: a Chinese or Japanese heading glues each closing mark
        // to its character in a nowrap span (PhrasedText).
        expect(extractH1Text(html)).toContain(page.h1);
      }
      expect(countMatches(html, /<h1[\s>]/g)).toBe(1);
      expect(html).not.toMatch(/name="robots"[^>]+content="[^"]*noindex/i);
      expect(html).not.toMatch(/<body[^>]*>\s*<[^>]*>\s*Loading/i);
      expect(html).not.toContain('"@type":"SearchAction"');

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

  for (const locale of TRANSLATED_LOCALES) {
    const seo = LOCALE_SEO[locale];
    const script = LOCALE_CHROME[locale].script;
    const scriptClass = script.source.replace(/^\[|\]$/g, '');

    test(`${locale} landing pages emit localized canonicals, hreflang, and structured data`, async ({
      request,
    }) => {
      for (const page of seo.landingPages) {
        const response = await request.get(page.path, { headers: hostHeaders(LANDING_HOST) });
        expect(response.status()).toBe(200);
        const html = await response.text();

        expect(html).toMatch(new RegExp(`<html[^>]+lang="${locale}"`));
        expect(extractTitle(html)).toMatch(script);
        expect(extractDescription(html)).toMatch(script);
        expect(html).toContain(`rel="canonical" href="https://${LANDING_HOST}${page.path}"`);
        expect(html).toMatch(/hreflang="en"/i);
        expect(html).toMatch(new RegExp(`hreflang="${locale}"`, 'i'));
        expect(html).toContain(`"inLanguage":"${seo.inLanguage}"`);
        expect(extractH1Text(html)).toContain(page.h1);
      }
    });

    test(`${locale} app SEO is localized across metadata, summaries, and JSON-LD`, async ({
      request,
    }) => {
      for (const page of seo.appSummaries) {
        const response = await request.get(page.path, { headers: hostHeaders(APP_HOST) });
        expect(response.status()).toBe(200);
        const html = await response.text();
        const canonical = `https://${APP_HOST}${page.path}`;

        expect(html).toMatch(new RegExp(`<html[^>]+lang="${locale}"`));
        expect(extractTitle(html)).toMatch(script);
        expect(extractDescription(html)).toMatch(script);
        expect(html).toContain(`rel="canonical" href="${canonical}"`);
        expect(html).toMatch(/hreflang="en"/i);
        expect(html).toMatch(new RegExp(`hreflang="${locale}"`, 'i'));
        expect(html).toMatch(/hreflang="x-default"/i);
        expect(html).toMatch(new RegExp(`property="og:locale" content="${seo.ogLocale}"`));
        expect(html).toMatch(new RegExp(`property="og:title" content="[^"]*[${scriptClass}]`));
        expect(html).toMatch(
          new RegExp(`property="og:description" content="[^"]*[${scriptClass}]`),
        );
        expect(html).toContain(`"inLanguage":"${seo.inLanguage}"`);
        expect(html).toContain(page.summary);
        expect(html).not.toContain('initial HTML for search engines and AI crawlers');

        const nodes = collectJsonLdNodes(html);
        for (const schemaType of ['WebSite', 'WebApplication']) {
          const node = nodes.find((candidate) => candidate['@type'] === schemaType);
          expect(node?.inLanguage).toBe(seo.inLanguage);
          expect(node?.description).toMatch(script);
          expect(node?.url).toContain(`/${locale}`);
        }
        const organization = nodes.find((candidate) => candidate['@type'] === 'Organization');
        expect(organization?.inLanguage).toBeUndefined();
        expect(organization?.description).toMatch(script);
        expect(organization?.url).toContain(`/${locale}`);
      }
    });

    test(`${locale} Open Graph image endpoint renders a PNG`, async ({ request }) => {
      const response = await request.get(`/${locale}/gallery`, { headers: hostHeaders(APP_HOST) });
      expect(response.status()).toBe(200);
      const html = await response.text();
      const imageUrl = extractOgImageUrl(html);
      expect(imageUrl).toBeTruthy();

      const parsed = new URL(imageUrl);
      expect(parsed.pathname).toMatch(new RegExp(`^/${locale}/gallery/opengraph-image`));
      const image = await request.get(`${parsed.pathname}${parsed.search}`, {
        headers: hostHeaders(APP_HOST),
        maxRedirects: 0,
      });
      expect(image.status()).toBe(200);
      expect(image.headers()['content-type']).toContain('image/png');
      expect((await image.body()).subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });
  }

  test('both hosts emit and serve the same versioned favicon assets', async ({ request }) => {
    const expectedHrefs = ['/favicon.ico?v=20260923', '/favicon.svg?v=20260923'];
    let baselineAssets: Buffer[] | undefined;

    for (const host of [APP_HOST, LANDING_HOST]) {
      const page = await request.get('/', { headers: hostHeaders(host) });
      expect(page.status()).toBe(200);
      expect(extractIconHrefs(await page.text())).toEqual(expectedHrefs);

      const assets = await Promise.all(
        expectedHrefs.map(async (href) => {
          const response = await request.get(href, {
            headers: hostHeaders(host),
            maxRedirects: 0,
          });
          expect(response.status(), `${host}${href} must render directly`).toBe(200);
          const contentType = response.headers()['content-type'] ?? '';
          if (href.includes('.svg')) {
            expect(contentType).toContain('image/svg+xml');
          } else {
            expect(contentType).toMatch(/^image\/(?:vnd\.microsoft\.icon|x-icon)/);
          }
          return response.body();
        }),
      );

      if (baselineAssets === undefined) {
        baselineAssets = assets;
      } else {
        assets.forEach((asset, index) => {
          expect(asset.equals(baselineAssets?.[index] ?? Buffer.alloc(0))).toBe(true);
        });
      }
    }
  });

  test('only the app host links its localized web manifest, served as JSON', async ({
    request,
  }) => {
    const manifestHref = (html: string) =>
      html
        .match(/<link\b[^>]*rel=["']manifest["'][^>]*>/i)?.[0]
        .match(/href=["']([^"']+)["']/)?.[1];

    const landing = await request.get('/', { headers: hostHeaders(LANDING_HOST) });
    expect(manifestHref(await landing.text())).toBeUndefined();

    for (const [path, href, lang] of [
      ['/', '/en/manifest.webmanifest', 'en'],
      ['/ja', '/ja/manifest.webmanifest', 'ja'],
    ] as const) {
      const page = await request.get(path, { headers: hostHeaders(APP_HOST) });
      expect(manifestHref(await page.text())).toBe(href);
      const manifest = await request.get(href, {
        headers: hostHeaders(APP_HOST),
        maxRedirects: 0,
      });
      expect(manifest.status()).toBe(200);
      expect(manifest.headers()['content-type']).toContain('application/manifest+json');
      expect(await manifest.json()).toEqual(
        expect.objectContaining({ id: '/', lang, theme_color: '#090A11' }),
      );
    }
  });

  test('root metadata keeps canonicals and Open Graph images on the serving host', async ({
    request,
  }) => {
    const roots = [
      { path: '/', host: APP_HOST, canonical: `https://${APP_HOST}` },
      { path: '/zh', host: APP_HOST, canonical: `https://${APP_HOST}/zh` },
      { path: '/', host: LANDING_HOST, canonical: `https://${LANDING_HOST}` },
      { path: '/zh', host: LANDING_HOST, canonical: `https://${LANDING_HOST}/zh` },
    ];

    for (const root of roots) {
      const response = await request.get(root.path, { headers: hostHeaders(root.host) });
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toContain(`rel="canonical" href="${root.canonical}"`);

      const imageUrl = extractOgImageUrl(html);
      expect(imageUrl).toBeTruthy();
      const parsed = new URL(imageUrl);
      expect(parsed.hostname).toBe(root.host);

      const image = await request.get(`${parsed.pathname}${parsed.search}`, {
        headers: hostHeaders(root.host),
        maxRedirects: 0,
      });
      expect(image.status(), `${imageUrl} must render without redirecting`).toBe(200);
      expect(image.headers()['content-type']).toContain('image/png');
    }
  });

  test('allocation detail emits cycle-specific indexable metadata', async ({ request }) => {
    const cases = [
      {
        path: '/allocation/42',
        title: 'Cycle 42 Allocation Information · Cosmic Signature',
        canonical: `https://${APP_HOST}/allocation/42`,
      },
      {
        path: '/zh/allocation/42',
        title: '第 42 个周期分配详情 · Cosmic Signature',
        canonical: `https://${APP_HOST}/zh/allocation/42`,
      },
    ];

    for (const item of cases) {
      const response = await request.get(item.path, { headers: hostHeaders(APP_HOST) });
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(extractTitle(html)).toBe(item.title);
      expect(extractDescription(html)).toContain('42');
      expect(html).toContain(`rel="canonical" href="${item.canonical}"`);
      expect(html).not.toMatch(/name="robots"[^>]+content="[^"]*noindex/i);
    }
  });

  test('invalid allocation cycle IDs 404 without an indexable self-canonical', async ({
    request,
  }) => {
    const paths = [
      '/allocation/-1',
      '/allocation/12abc',
      '/allocation/01',
      '/allocation/1.5',
      '/allocation/9007199254740992',
      '/zh/allocation/01',
    ];

    for (const path of paths) {
      const response = await request.get(path, {
        headers: hostHeaders(APP_HOST),
        maxRedirects: 0,
      });
      expect(response.status(), `${path} must be a real 404`).toBe(404);
      const html = await response.text();
      expect(html).toMatch(/name="robots"[^>]+content="[^"]*noindex/i);
      expectNotFoundHead(html, path);
      expect(html).not.toContain(`rel="canonical" href="https://${APP_HOST}${path}"`);
    }
  });

  test('spot-renders the emitted image for all twelve Open Graph generators', async ({
    request,
  }) => {
    const pages = [
      { path: '/', host: APP_HOST },
      { path: '/gallery', host: APP_HOST },
      { path: '/current-cycle', host: APP_HOST },
      { path: '/anchoring', host: APP_HOST },
      { path: '/faq', host: APP_HOST },
      { path: '/how-it-works', host: APP_HOST },
      { path: '/gesture/9101', host: APP_HOST },
      { path: '/allocation/42', host: APP_HOST },
      {
        path: '/user/0x1111111111111111111111111111111111111111',
        host: APP_HOST,
      },
      { path: '/about', host: LANDING_HOST },
      { path: '/learn', host: LANDING_HOST },
      { path: '/', host: LANDING_HOST },
    ] as const;

    expect(pages).toHaveLength(12);
    const emittedImages = new Set<string>();

    for (const page of pages) {
      const pageResponse = await request.get(page.path, {
        headers: hostHeaders(page.host),
        maxRedirects: 0,
      });
      expect(pageResponse.status(), `${page.host}${page.path} must render directly`).toBe(200);
      const imageUrl = extractOgImageUrl(await pageResponse.text());
      expect(imageUrl, `${page.host}${page.path} must emit og:image`).toBeTruthy();
      expect(emittedImages.has(imageUrl), `${imageUrl} must identify one generator`).toBe(false);
      emittedImages.add(imageUrl);

      const parsed = new URL(imageUrl);
      expect(parsed.hostname).toBe(page.host);
      const imageResponse = await request.get(`${parsed.pathname}${parsed.search}`, {
        headers: hostHeaders(page.host),
        maxRedirects: 0,
      });
      expect(imageResponse.status(), `${imageUrl} must render unchanged without redirecting`).toBe(
        200,
      );
      expect(imageResponse.headers()['content-type']).toContain('image/png');
    }
  });

  test('the Learn hub and each guide have their own localized share card', async ({ request }) => {
    const imageUrls: string[] = [];
    for (const [path, pattern] of [
      ['/zh/learn', /^\/zh\/learn\/opengraph-image/],
      [
        '/zh/learn/what-is-cosmic-signature',
        /^\/zh\/learn\/what-is-cosmic-signature\/opengraph-image/,
      ],
      ['/zh/learn/how-gestures-work', /^\/zh\/learn\/how-gestures-work\/opengraph-image/],
    ] as const) {
      const response = await request.get(path, { headers: hostHeaders(LANDING_HOST) });
      expect(response.status()).toBe(200);
      const imageUrl = extractOgImageUrl(await response.text());
      expect(new URL(imageUrl).pathname).toMatch(pattern);
      imageUrls.push(imageUrl);
    }
    expect(new Set(imageUrls).size).toBe(3);
  });

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
      expect(countMatches(xml, /hreflang="en"/g)).toBe(locs.length);
      for (const locale of TRANSLATED_LOCALES) {
        expect(countMatches(xml, new RegExp(`hreflang="${locale}"`, 'g'))).toBe(locs.length);
        expect(xml).toContain(`href="https://${host}/${locale}`);
      }
      expect(countMatches(xml, /hreflang="x-default"/g)).toBe(locs.length);

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
    expectNotFoundHead(await response.text(), '/detail/not-a-token');
  });

  test('unknown top-level routes return a real 404 with branded content', async ({ request }) => {
    const response = await request.get('/this-route-does-not-exist', {
      headers: hostHeaders(APP_HOST),
    });
    expect(response.status()).toBe(404);
    const html = await response.text();
    // The heading is written in sentence case ("Page not found").
    expect(html).toMatch(/Page not found/i);
    expect(html).toContain('<title>Page not found · Cosmic Signature</title>');
    expectNotFoundHead(html, '/this-route-does-not-exist');
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
