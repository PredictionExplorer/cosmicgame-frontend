import { expect, test, type Page } from '@playwright/test';

import {
  LOCALE_ROUTE_INVENTORY,
  toLocalePath,
  type LocaleRouteEntry,
} from './locale-route-inventory';
import { mockZhQualityApi } from './zh-quality-mocks';

/**
 * Full-site route QA for one translated locale: every route in the inventory
 * renders with the right `lang`, carries the locale's script in its body,
 * headings and metadata, never falls back to a known English UI string,
 * keeps every internal link under the locale prefix, uses the locale's
 * font stack, and does not overflow at release widths.
 *
 * The Chinese rollout kept its own copy of these checks
 * (zh-site-qa.desktop.spec.ts); this runner is the locale-generic version
 * every later language plugs into via a `LocaleQaProfile`.
 */
export interface LocaleQaProfile {
  readonly locale: string;
  /** Matches at least one character of the language's script (Cyrillic, CJK, …). */
  readonly script: RegExp;
  /** Route id → text the rendered body must contain (from ./locale-fixtures.ts). */
  readonly expectedText: Readonly<Record<string, string>>;
  /** Font family that must be in the computed body stack once fonts are ready. */
  readonly bodyFontFamily: RegExp;
  /**
   * Font family the display typography (`type-display-*`, `type-heading-1/2`)
   * must resolve to for this script — the companion face that replaces Clash
   * Display where Clash has no glyphs.
   */
  readonly displayFontFamily: RegExp;
  /**
   * A face that must never lead the stack of a visible heading in this
   * script (it lacks the glyphs, so the browser would fall back per glyph to
   * an unstyled system font). Headings that use the body face are fine.
   */
  readonly forbiddenHeadingFontFamily: RegExp;
  /** Exact English UI lines that indicate an untranslated fallback. */
  readonly unexpectedExactUiCopy: ReadonlySet<string>;
}

const RELEASE_VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 800 },
  { name: 'tablet-768', width: 768, height: 1_024 },
  { name: 'desktop-1440', width: 1_440, height: 1_000 },
] as const;

const LANDING_HEADERS = { 'X-Forwarded-Host': 'cosmicsignature.com' };
const PRODUCT_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  'cosmicsignature.com',
  'www.cosmicsignature.com',
  'app.cosmicsignature.com',
  'cosmicsignature.local',
  'app.cosmicsignature.local',
]);

/** English page headings that must never survive into a translated locale. */
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
    /\.(?:png|jpe?g|gif|svg|webp|ico|avif|woff2?|ttf|eot|map|pdf)$/i.test(pathname)
  );
}

async function expectLocalePreservingLinks(page: Page, locale: string): Promise<void> {
  const links = await page.locator('a[href]').evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      href: anchor.getAttribute('href') ?? '',
      hreflang: anchor.getAttribute('hreflang'),
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
    // The footer language directory links the same page in every other
    // language on purpose; an anchor that declares `hreflang` is an alternate,
    // not a link that dropped the prefix.
    if (link.hreflang) continue;

    let url: URL;
    try {
      url = new URL(link.href, page.url());
    } catch {
      violations.push(`${link.text || '(unlabelled)'} -> malformed ${link.href}`);
      continue;
    }

    if (!PRODUCT_HOSTS.has(url.hostname) || isAssetOrInfrastructurePath(url.pathname)) continue;
    if (url.pathname === `/${locale}` || url.pathname.startsWith(`/${locale}/`)) continue;

    violations.push(`${link.text || '(unlabelled)'} -> ${link.href}`);
  }

  expect(violations, `links lost /${locale} on ${page.url()}`).toEqual([]);
}

async function expectLocalizedMetadata(
  page: Page,
  route: LocaleRouteEntry,
  profile: LocaleQaProfile,
): Promise<void> {
  if (route.id === 'app-not-found') return;

  const title = await page.title();
  const description =
    (await page
      .locator('meta[name="description"]')
      .getAttribute('content')
      .catch(() => null)) ?? '';
  const metadata = `${title}\n${description}`;

  expect(metadata, `metadata must be in ${profile.locale} on ${route.id}`).toMatch(profile.script);
  if (!route.allowBrandOnlyTitle) {
    expect(title, `title must be in ${profile.locale} on ${route.id}`).toMatch(profile.script);
  }
  for (const fallback of UNEXPECTED_ENGLISH_FALLBACKS) {
    expect(metadata, `unexpected English metadata fallback on ${route.id}`).not.toMatch(fallback);
  }
}

async function expectLocaleTypography(
  page: Page,
  route: LocaleRouteEntry,
  profile: LocaleQaProfile,
): Promise<void> {
  const typography = await page.evaluate(async (scriptSource: string) => {
    await document.fonts.ready;
    const script = new RegExp(scriptSource);
    const visible = (element: HTMLElement) =>
      element.offsetParent !== null && script.test(element.innerText);
    const headings = [...document.querySelectorAll<HTMLElement>('h1, h2, h3')].filter(visible);
    const displayElements = [
      ...document.querySelectorAll<HTMLElement>(
        '[class*="type-display"], [class*="type-heading-1"], [class*="type-heading-2"]',
      ),
    ].filter(visible);
    // The leading family of each stack is what actually renders the text.
    const leadingFamily = (element: HTMLElement) =>
      getComputedStyle(element).fontFamily.split(',')[0]?.trim() ?? '';
    return {
      bodyFont: getComputedStyle(document.body).fontFamily,
      headingFound: headings.length > 0,
      headingLeadingFamilies: headings.map(leadingFamily),
      displayFonts: displayElements.map((element) => getComputedStyle(element).fontFamily),
    };
  }, profile.script.source);

  expect(typography.bodyFont, `body font stack on ${route.id}`).toMatch(profile.bodyFontFamily);
  if (!route.allowNoHeading) {
    expect(typography.headingFound, `${profile.locale} heading missing on ${route.id}`).toBe(true);
  }
  for (const family of typography.headingLeadingFamilies) {
    expect(
      family,
      `heading set in a face without ${profile.locale} glyphs on ${route.id}`,
    ).not.toMatch(profile.forbiddenHeadingFontFamily);
  }
  for (const stack of typography.displayFonts) {
    expect(stack, `display typography stack on ${route.id}`).toMatch(profile.displayFontFamily);
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
  route: LocaleRouteEntry,
  profile: LocaleQaProfile,
): Promise<void> {
  // Streamed routes park their payload in a hidden staging div for a frame;
  // poll for settled, visible headings rather than sampling once.
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
  expect(headings, `${profile.locale} heading missing on ${route.id}`).toMatch(profile.script);
  for (const fallback of UNEXPECTED_ENGLISH_FALLBACKS) {
    expect(headings, `unexpected English heading fallback on ${route.id}`).not.toMatch(fallback);
  }
}

async function expectNoUnexpectedEnglishUiCopy(
  page: Page,
  route: LocaleRouteEntry,
  profile: LocaleQaProfile,
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
  const fallbackLines = visibleLines.filter((line) => profile.unexpectedExactUiCopy.has(line));
  expect(fallbackLines, `unexpected exact English UI fallback on ${route.id}`).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page, route: LocaleRouteEntry): Promise<void> {
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

/** Registers the full-site QA suite for one locale. Call once per spec file. */
export function defineLocaleSiteQa(profile: LocaleQaProfile): void {
  const missing = LOCALE_ROUTE_INVENTORY.filter((route) => !profile.expectedText[route.id]);

  test.describe(`${profile.locale} full-site route QA`, () => {
    test('fixture table covers every route in the inventory', () => {
      expect(missing.map((route) => route.id)).toEqual([]);
    });

    for (const route of LOCALE_ROUTE_INVENTORY) {
      test(`${route.id} renders fluently at all release widths`, async ({ context, page }) => {
        test.slow();
        await context.setExtraHTTPHeaders(route.host === 'landing' ? LANDING_HEADERS : {});
        await mockZhQualityApi(page);
        await page.emulateMedia({ reducedMotion: 'reduce' });

        for (const viewport of RELEASE_VIEWPORTS) {
          await page.setViewportSize(viewport);
          const response = await page.goto(toLocalePath(profile.locale, route.fixturePath), {
            waitUntil: 'domcontentloaded',
          });
          expect(
            [200, 404],
            `${route.id} returned ${response?.status() ?? 'no response'} at ${viewport.name}`,
          ).toContain(response?.status());
          if (route.id !== 'app-not-found') expect(response?.status()).toBe(200);

          if (route.redirectsTo) {
            await expect(page).toHaveURL(
              new RegExp(`${toLocalePath(profile.locale, route.redirectsTo)}$`),
            );
          }

          await expect(page.locator('html')).toHaveAttribute('lang', profile.locale);
          await expect(page.locator('body')).toContainText(profile.expectedText[route.id]!);
          await expect(page.locator('body')).not.toContainText('Internal Server Error');
          await expect(page.locator('body')).not.toContainText('Application error');

          await expectLocalizedMetadata(page, route, profile);
          await expectNoUnexpectedEnglishHeadings(page, route, profile);
          await expectNoUnexpectedEnglishUiCopy(page, route, profile);
          await expectLocaleTypography(page, route, profile);
          await expectLocalePreservingLinks(page, profile.locale);
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
}
