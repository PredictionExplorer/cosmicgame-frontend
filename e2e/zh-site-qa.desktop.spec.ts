import { expect, test, type Page } from '@playwright/test';

import { mockZhQualityApi } from './zh-quality-mocks';
import { toZhPath, ZH_ROUTE_INVENTORY, type ZhRouteInventoryEntry } from './zh-route-inventory';

const RELEASE_VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 800 },
  { name: 'tablet-768', width: 768, height: 1_024 },
  { name: 'desktop-1440', width: 1_440, height: 1_000 },
] as const;

const LANDING_HEADERS = { 'X-Forwarded-Host': 'cosmicsignature.com' };
const CJK = /[\u3400-\u9fff]/;
const PRODUCT_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  'cosmicsignature.com',
  'www.cosmicsignature.com',
  'app.cosmicsignature.com',
  'cosmicsignature.local',
  'app.cosmicsignature.local',
]);

const UNEXPECTED_ENGLISH_FALLBACKS = [
  /\bNFT Gallery\b/i,
  /\bCurrent Performance Cycle\b/i,
  /\bGesture Details?\b/i,
  /\bHow Cosmic Signature Works\b/i,
  /\bAllocation Recipients\b/i,
  /\bMy Allocations\b/i,
  /\bMy Anchors\b/i,
  /\bMy Statistics\b/i,
  /\bMy NFTs\b/i,
  /\bTransfer CST\b/i,
  /\bSite Map\b/i,
  /\bFrequently Asked Questions\b/i,
  /\bTerms of Use\b/i,
  /\bPrivacy Policy\b/i,
  /\bRisk Disclosures\b/i,
  /\bSource Code\b/i,
  /\bCoordination Changes\b/i,
  /\bAdmin Methods\b/i,
  /\bETH Contributions?\b/i,
  /\bPublic Goods Retrievals\b/i,
] as const;
const UNEXPECTED_EXACT_UI_COPY = new Set([
  'Signature Allocation',
  'Stellar Selection',
  'Public Goods',
  'Anchor Distribution',
  'Chrono-Warrior',
  'Next cycle',
  'Allocation Tracks',
  'Protocol Configuration',
]);
const NOINDEX_ROUTE_IDS = new Set([
  'admin',
  'admin-settings',
  'anchor-action',
  'cst-transfer-history',
  'endurance-embed',
  'eth-contribution-cycle',
  'eth-contribution-detail',
  'gesture-detail',
  'internal-outreach-transfer',
  'my-allocations',
  'my-anchors',
  'my-statistics',
  'my-tokens',
  'outreach-address',
  'recipient-history',
  'signature-transfer-history',
  'system-event',
  'token-distributions',
  'transfer-cst',
  'user',
  'user-stellar-eth',
  'user-stellar-nft',
]);

function isAssetOrInfrastructurePath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    /^\/(?:favicon|robots\.txt|sitemap\.xml|llms(?:-full)?\.txt|manifest\.webmanifest)/.test(
      pathname,
    ) ||
    // PDFs are downloadable assets (e.g. the white paper), not locale-scoped routes.
    /\.(?:png|jpe?g|gif|svg|webp|ico|avif|woff2?|ttf|eot|map|pdf)$/i.test(pathname)
  );
}

async function expectLocalePreservingLinks(page: Page): Promise<void> {
  const links = await page.locator('a[href]').evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      href: anchor.getAttribute('href') ?? '',
      text: (anchor.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 100),
    })),
  );
  const violations: string[] = [];

  for (const link of links) {
    if (
      !link.href ||
      link.href.startsWith('#') ||
      /^(?:mailto:|tel:|javascript:)/i.test(link.href)
    ) {
      continue;
    }

    let url: URL;
    try {
      url = new URL(link.href, page.url());
    } catch {
      violations.push(`${link.text || '(unlabelled)'} -> malformed ${link.href}`);
      continue;
    }

    if (!PRODUCT_HOSTS.has(url.hostname) || isAssetOrInfrastructurePath(url.pathname)) continue;
    if (url.pathname === '/zh' || url.pathname.startsWith('/zh/')) continue;

    violations.push(`${link.text || '(unlabelled)'} -> ${link.href}`);
  }

  expect(violations, `links lost /zh on ${page.url()}`).toEqual([]);
}

async function expectLocalizedMetadata(page: Page, route: ZhRouteInventoryEntry): Promise<void> {
  if (route.id === 'app-not-found') return;

  const title = await page.title();
  const description =
    (await page
      .locator('meta[name="description"]')
      .getAttribute('content')
      .catch(() => null)) ?? '';
  const metadata = `${title}\n${description}`;

  expect(metadata, `metadata must contain Chinese on ${route.id}`).toMatch(CJK);
  if (!route.allowBrandOnlyTitle) {
    expect(title, `title must contain Chinese on ${route.id}`).toMatch(CJK);
  }
  for (const fallback of UNEXPECTED_ENGLISH_FALLBACKS) {
    expect(metadata, `unexpected English metadata fallback on ${route.id}`).not.toMatch(fallback);
  }
}

async function expectChineseTypography(page: Page, route: ZhRouteInventoryEntry): Promise<void> {
  const typography = await page.evaluate(async () => {
    await document.fonts.ready;
    const bodyStyle = getComputedStyle(document.body);
    const heading = [...document.querySelectorAll<HTMLElement>('h1, h2, h3')].find(
      (element) => element.offsetParent !== null && /[\u3400-\u9fff]/.test(element.innerText),
    );
    const headingStyle = heading ? getComputedStyle(heading) : null;
    return {
      bodyFont: bodyStyle.fontFamily,
      headingFound: Boolean(heading),
      letterSpacing: headingStyle?.letterSpacing ?? '',
      wordBreak: headingStyle?.wordBreak ?? '',
      lineBreak: headingStyle?.lineBreak ?? '',
    };
  });

  expect(typography.bodyFont, `CJK fallback stack missing on ${route.id}`).toMatch(/Noto Sans SC/);
  if (!route.allowNoHeading) {
    expect(typography.headingFound, `Chinese heading missing on ${route.id}`).toBe(true);
  }
  if (typography.headingFound) {
    expect(['normal', '0px']).toContain(typography.letterSpacing);
    expect(typography.wordBreak).not.toBe('keep-all');
    expect(typography.lineBreak).not.toBe('anywhere');
  }
}

function readVisibleHeadings(page: Page): Promise<string> {
  return page.locator('h1, h2, h3').evaluateAll((elements) =>
    elements
      .filter((element) => (element as HTMLElement).offsetParent !== null)
      .map((element) => (element.textContent ?? '').trim().replace(/\s+/g, ' '))
      .filter(Boolean)
      .join('\n'),
  );
}

async function expectNoUnexpectedEnglishHeadings(
  page: Page,
  route: ZhRouteInventoryEntry,
): Promise<void> {
  // A route whose page suspends (the statistics pages await live data behind
  // `loading.tsx`) arrives as a streamed payload that React parks in a hidden
  // staging div and only moves into the layout on the next frame. `body`
  // already carries the text at that point, so the checks around this one pass
  // while every heading still computes as `display: none`. Poll rather than
  // sample once — everything after this reads the settled DOM.
  if (!route.allowNoHeading) {
    await expect
      .poll(() => readVisibleHeadings(page), {
        message: `no visible headings rendered on ${route.id}`,
      })
      .not.toBe('');
  }

  const headings = await readVisibleHeadings(page);
  if (!headings && route.allowNoHeading) return;
  expect(headings, `no visible headings rendered on ${route.id}`).not.toBe('');
  expect(headings, `Chinese heading missing on ${route.id}`).toMatch(CJK);
  for (const fallback of UNEXPECTED_ENGLISH_FALLBACKS) {
    expect(headings, `unexpected English heading fallback on ${route.id}`).not.toMatch(fallback);
  }
}

async function expectNoUnexpectedEnglishUiCopy(
  page: Page,
  route: ZhRouteInventoryEntry,
): Promise<void> {
  // Source-code pages intentionally display source literals as data.
  if (route.id === 'code' || route.id === 'source-code-alias') return;

  const visibleLines = await page
    .locator('body')
    .innerText()
    .then((text) =>
      text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    );
  const fallbackLines = visibleLines.filter((line) => UNEXPECTED_EXACT_UI_COPY.has(line));
  expect(fallbackLines, `unexpected exact English UI fallback on ${route.id}`).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page, route: ZhRouteInventoryEntry): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
        ),
      { message: `horizontal overflow on ${route.id}` },
    )
    .toBe(true);
}

test.describe('Sprint 8 Chinese full-site route QA', () => {
  for (const route of ZH_ROUTE_INVENTORY) {
    test(`${route.id} renders fluently at all release widths`, async ({ context, page }) => {
      test.slow();
      await context.setExtraHTTPHeaders(route.host === 'landing' ? LANDING_HEADERS : {});
      await mockZhQualityApi(page);
      await page.emulateMedia({ reducedMotion: 'reduce' });

      for (const viewport of RELEASE_VIEWPORTS) {
        await page.setViewportSize(viewport);
        const response = await page.goto(toZhPath(route.fixturePath), {
          waitUntil: 'domcontentloaded',
        });
        expect(
          [200, 404],
          `${route.id} returned ${response?.status() ?? 'no response'} at ${viewport.name}`,
        ).toContain(response?.status());
        if (route.id !== 'app-not-found') expect(response?.status()).toBe(200);

        if (route.redirectsTo) {
          await expect(page).toHaveURL(new RegExp(`${toZhPath(route.redirectsTo)}$`));
        }

        await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
        await expect(page.locator('body')).toContainText(route.expectedText);
        await expect(page.locator('body')).not.toContainText('Internal Server Error');
        await expect(page.locator('body')).not.toContainText('Application error');

        await expectLocalizedMetadata(page, route);
        await expectNoUnexpectedEnglishHeadings(page, route);
        await expectNoUnexpectedEnglishUiCopy(page, route);
        await expectChineseTypography(page, route);
        await expectLocalePreservingLinks(page);
        await expectNoHorizontalOverflow(page, route);
        if (NOINDEX_ROUTE_IDS.has(route.id)) {
          await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
            'content',
            /noindex/,
          );
        }
      }
    });
  }
});
