import { expect, test, type Locator, type Page } from '@playwright/test';

import { LOCALE_PREFIXES } from './locale-fixtures';

/**
 * Performance guardrails distilled from the RES-82 investigation. Each test
 * pins one root cause so it cannot regress silently:
 *
 * 1. LCP text must paint from server HTML alone (no JS): entrance
 *    animations once server-rendered the whole page at opacity 0, gating
 *    mobile LCP on the full bundle download + hydration.
 * 2. The app home must stay layout-stable while live data streams in
 *    (measured CLS was 1.0: the footer travelled a full viewport).
 * 3. Fonts must stay subsetted (a full-range 352KB body font used to be
 *    preloaded on every page).
 * 4. Phones must never mount the WebGL hero (its three.js chunk is ~320KB
 *    of gzip that small viewports render nothing with).
 */

const LANDING_HEADERS = { 'X-Forwarded-Host': 'cosmicsignature.com' };

declare global {
  interface Window {
    __perfGuards?: { cls: number };
  }
}

/** True if the element or any ancestor computes to opacity 0. */
async function isHiddenByOpacity(locator: Locator): Promise<boolean> {
  return locator.evaluate((element) => {
    for (let node = element as HTMLElement | null; node; node = node.parentElement) {
      if (Number(window.getComputedStyle(node).opacity) === 0) return true;
    }
    return false;
  });
}

async function installClsObserver(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__perfGuards = { cls: 0 };
    if (!PerformanceObserver.supportedEntryTypes.includes('layout-shift')) return;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!shift.hadRecentInput) {
          window.__perfGuards!.cls += shift.value ?? 0;
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
}

test.describe('LCP text paints from server HTML without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('app home hero text is visible in the raw SSR HTML', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('main h1').first();
    await expect(heading).toBeVisible();
    expect(await isHiddenByOpacity(heading)).toBe(false);
  });

  test('experimental UI heading is visible in the raw SSR HTML', async ({ page }) => {
    await page.goto('/experimental-ui');
    const heading = page.locator('main h1').first();
    await expect(heading).toBeVisible();
    expect(await isHiddenByOpacity(heading)).toBe(false);
  });

  test('landing hero headline and subhead are visible in the raw SSR HTML', async ({ page }) => {
    await page.setExtraHTTPHeaders(LANDING_HEADERS);
    await page.goto('/');
    const heading = page.locator('main h1').first();
    const subhead = page.locator('main h1 + p').first();
    await expect(heading).toBeVisible();
    expect(await isHiddenByOpacity(heading)).toBe(false);
    await expect(subhead).toBeVisible();
    expect(await isHiddenByOpacity(subhead)).toBe(false);
  });
});

test.describe('app home layout stability', () => {
  test('cumulative layout shift stays in the good range while data loads', async ({ page }) => {
    // Delay-only interception: the live reads pass through unchanged but
    // arrive late, like a congested mobile network. The page's prerendered
    // seed must have reserved space for everything the late data fills in.
    // (Deliberately NOT fixture mocks: replacing the baked seed with
    // different fixture values measures content replacement, which
    // production never does — the seed and the live read come from the same
    // backend at most seconds apart.)
    await page.route('**/api/cosmicgame/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.fallback();
    });

    await installClsObserver(page);
    await page.goto('/', { waitUntil: 'load' });
    // Let the delayed data land, sections hydrate, and fonts settle.
    await page.waitForTimeout(2_500);

    const cls = await page.evaluate(() => window.__perfGuards?.cls ?? 0);
    expect(cls).toBeLessThan(0.1);
  });
});

test.describe('message scoping stays complete', () => {
  // The scoped-messages architecture serializes only declared namespaces
  // into each page. A missing declaration surfaces as a MISSING_MESSAGE
  // console error (next-intl renders the raw key). The static walker
  // (i18n-scoping.test.ts) covers page/layout trees; this crawl catches
  // anything it cannot see, in both locales.
  const routes = [
    '/',
    '/experimental-ui',
    '/current-cycle',
    '/statistics',
    '/gallery',
    '/faq',
    '/my-anchors',
  ];
  for (const localePrefix of LOCALE_PREFIXES) {
    test(`no missing-message errors across key routes (${localePrefix || '/en'})`, async ({
      page,
    }) => {
      const missingMessages: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error' && message.text().includes('MISSING_MESSAGE')) {
          missingMessages.push(message.text());
        }
      });

      for (const route of routes) {
        await page.goto(`${localePrefix}${route}`, { waitUntil: 'load' });
        await page.waitForTimeout(400);
      }

      expect(missingMessages).toEqual([]);
    });
  }
});

test.describe('font payload stays subsetted', () => {
  test('English pages transfer a bounded set of WOFF2 bytes', async ({ page }) => {
    const fontResponses: Array<Promise<number>> = [];
    page.on('response', (response) => {
      if (!/\.woff2(\?|$)/i.test(response.url())) return;
      fontResponses.push(
        response
          .body()
          .then((body) => body.length)
          .catch(() => 0),
      );
    });

    await page.goto('/');
    await page.waitForTimeout(1_500);

    const totalBytes = (await Promise.all(fontResponses)).reduce((sum, n) => sum + n, 0);
    expect(totalBytes).toBeGreaterThan(0);
    // Measured ~160KB: Clash Display (~29KB) + Inter latin/latin-ext slices
    // + the Noto slice for the language switcher's CJK label. The old
    // full-range body font ALONE was 352KB, so a regression to an
    // unsubsetted file blows well past this bound.
    expect(totalBytes).toBeLessThan(200 * 1024);
  });
});

test.describe('WebGL hero stays desktop-only', () => {
  test('phones never mount the three.js canvas on the landing', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile-only guard');
    await page.setExtraHTTPHeaders(LANDING_HEADERS);
    await page.goto('/');
    await page.waitForTimeout(1_500);
    expect(await page.locator('canvas').count()).toBe(0);
  });

  test('desktop mounts the three.js canvas on the landing (positive control)', async ({
    page,
    isMobile,
  }) => {
    test.skip(Boolean(isMobile), 'desktop-only control');
    await page.setExtraHTTPHeaders(LANDING_HEADERS);
    await page.goto('/');
    await expect(page.locator('canvas').first()).toBeAttached({ timeout: 20_000 });
  });
});
