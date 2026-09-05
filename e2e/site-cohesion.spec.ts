import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

import { LEARN_STRUCTURE } from '../content/learn/structure';
import { QUIZ_TIER_IDS } from '../content/quiz/types';
import { routing } from '../i18n/routing';

import {
  LOCALE_ROUTE_INVENTORY,
  toLocalePath,
  type LocaleRouteEntry,
} from './locale-route-inventory';
import { mockMobileAuditApi } from './mobile-audit-fixtures';
import {
  LANDING_HEADERS,
  collectOverflowViolations,
  formatOverflowViolations,
  getPageOverflow,
  waitForStableLayout,
} from './mobile-audit-helpers';

/**
 * A shell contract for every page, including routes outside the main navigation.
 *
 * Reuse the filesystem-checked route inventory and populated, adversarial API
 * fixtures. Expand editorial templates to every published article and quiz tier;
 * data routes use the inventory's valid sample addresses, tokens, and cycles.
 * The embed is a deliberately chrome-free artifact. Redirects are checked at
 * their final destination, and the branded 404 must retain normal navigation.
 *
 * Desktop Chrome runs at 1440px and Mobile Chrome at the supported minimum 320px.
 * SITE_AUDIT_SCREENSHOTS=1 saves full-page review images as test attachments.
 */
const routes: readonly LocaleRouteEntry[] = [
  ...LOCALE_ROUTE_INVENTORY.flatMap((route) => {
    if (route.id === 'learn-article') {
      return LEARN_STRUCTURE.articles.map(({ slug }) => ({
        ...route,
        id: `learn-article-${slug}`,
        fixturePath: `/learn/${slug}`,
      }));
    }
    if (route.id === 'quiz-tier') {
      return QUIZ_TIER_IDS.map((tier) => ({
        ...route,
        id: `quiz-tier-${tier}`,
        fixturePath: `/quiz/${tier}`,
      }));
    }
    return [route];
  }),
  // Sibling landing routes must resolve their own branded missing-content
  // state. Falling through to the app boundary can pull in wallet chrome.
  ...LOCALE_ROUTE_INVENTORY.filter((route) =>
    ['learn-article', 'quiz-tier'].includes(route.id),
  ).map((route) => ({
    ...route,
    id: `${route.id}-not-found`,
    fixturePath: `${route.fixturePath.slice(0, route.fixturePath.lastIndexOf('/'))}/quality-assurance-not-found`,
  })),
];

const titleForRoute = (route: LocaleRouteEntry) =>
  `${route.host}: ${route.fixturePath} has complete, responsive site chrome`;

test.afterEach(async ({ page, isMobile }, testInfo) => {
  const route = routes.find((entry) => titleForRoute(entry) === testInfo.title);
  if (!route || process.env.SITE_AUDIT_SCREENSHOTS !== '1' || page.isClosed()) return;

  // Capture failed routes too, so a failing assertion cannot create a blind
  // spot in the visual review. Stable filenames also make review sheets easy
  // to assemble from Playwright's ignored output directory.
  const path = testInfo.outputPath(`${route.id}-${isMobile ? 'mobile' : 'desktop'}.png`);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
  await page.screenshot({ path, fullPage: true, animations: 'disabled' });
  await testInfo.attach(route.id, { path, contentType: 'image/png' });
});

test('the cohesion audit covers every page source', () => {
  const pageSources = readdirSync(join(__dirname, '../app/[locale]'), { recursive: true })
    .filter((path): path is string => typeof path === 'string' && path.endsWith('/page.tsx'))
    .sort();
  expect([...new Set(routes.map((route) => route.pageFile))].sort()).toEqual(pageSources);
});

test('quiz links preserve locale and query when crossing to the landing host', async ({
  request,
}) => {
  for (const locale of routing.locales) {
    for (const path of [
      '/quiz',
      `/quiz/${QUIZ_TIER_IDS[0]}`,
      '/quiz/quality-assurance-not-found',
    ]) {
      const localizedPath = locale === routing.defaultLocale ? path : toLocalePath(locale, path);
      const query = '?source=site-cohesion&view=compact';
      const response = await request.get(`${localizedPath}${query}`, {
        headers: { 'X-Forwarded-Host': 'app.cosmicsignature.com' },
        maxRedirects: 0,
      });
      expect(response.status(), localizedPath).toBe(308);
      const destination = new URL(response.headers()['location']!);
      // Redirect origins are compiled as .local in development and .com in
      // production; the canonical host family and exact path are invariant.
      expect(['cosmicsignature.com', 'cosmicsignature.local']).toContain(destination.hostname);
      expect(destination.pathname).toBe(localizedPath);
      expect(destination.search).toBe(query);
    }
  }
});

for (const route of routes) {
  test(titleForRoute(route), async ({ context, page, isMobile }) => {
    await page.setViewportSize(
      isMobile ? { width: 320, height: 800 } : { width: 1440, height: 1000 },
    );
    await context.setExtraHTTPHeaders(route.host === 'landing' ? LANDING_HEADERS : {});
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockMobileAuditApi(page);

    const response = await page.goto(route.fixturePath, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(route.id.endsWith('not-found') ? 404 : 200);
    if (route.redirectsTo) {
      expect(new URL(page.url()).pathname).toBe(route.redirectsTo);
    }

    await waitForStableLayout(page);
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
    await expect(page.locator('body')).not.toContainText('Application error');

    const main = page.getByRole('main');
    await expect(main).toHaveCount(1);
    await expect(main).toBeVisible();
    const embedded = route.id === 'endurance-embed';

    await expect
      .soft(page.getByRole('banner'), `${route.id}: site header`)
      .toHaveCount(embedded ? 0 : 1);
    await expect
      .soft(page.getByRole('contentinfo'), `${route.id}: site footer`)
      .toHaveCount(embedded ? 0 : 1);
    if (route.host === 'landing') {
      await expect
        .soft(page.getByRole('banner').getByRole('button', { name: /connect wallet/i }))
        .toHaveCount(0);
      if (route.id.endsWith('not-found')) {
        await expect.soft(page.getByRole('banner').locator('a[href="/learn"]')).toBeVisible();
      }
    }

    if (!embedded) {
      await expect.soft(main).toHaveAttribute('id', 'main');
      await expect.soft(main).toHaveAttribute('tabindex', '-1');
      await expect.soft(main.getByRole('heading', { level: 1 })).toHaveCount(1);

      const footer = page.getByRole('contentinfo');
      if ((await footer.count()) === 1) {
        await expect.soft(footer.getByRole('link').first()).toBeVisible();
        await expect.soft(footer.getByTestId('language-directory')).toBeVisible();
      }

      const header = page.getByRole('banner');
      const heading = main.getByRole('heading', { level: 1 });
      if ((await header.count()) === 1 && (await heading.count()) === 1) {
        const [headerBox, headingBox] = await Promise.all([
          header.boundingBox(),
          heading.boundingBox(),
        ]);
        expect.soft(headingBox, `${route.id}: visible primary heading`).not.toBeNull();
        if (headerBox && headingBox) {
          expect
            .soft(headingBox.y, `${route.id}: primary heading clears the site header`)
            .toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 1);
        }
      }
    }

    const { scrollWidth, viewportWidth } = await getPageOverflow(page);
    expect
      .soft(scrollWidth, `${route.id}: document fits ${viewportWidth}px viewport`)
      .toBeLessThanOrEqual(viewportWidth + 1);
    if (isMobile) {
      const violations = await collectOverflowViolations(page);
      expect.soft(violations, formatOverflowViolations(route.fixturePath, violations)).toEqual([]);
    }

    if (!embedded) {
      const skipLink = page.locator('a[href="#main"]');
      await expect(skipLink).toHaveCount(1);
      await skipLink.focus();
      await expect(skipLink).toBeVisible();
      await skipLink.press('Enter');
      await expect(main).toBeFocused();
    }
  });
}
