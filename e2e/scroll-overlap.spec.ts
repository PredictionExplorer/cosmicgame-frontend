import { test, expect } from '@playwright/test';

import { mockMobileAuditApi } from './mobile-audit-fixtures';
import {
  collectBrokenFixedElements,
  collectOverlapViolations,
  formatBrokenFixed,
  formatOverlapViolations,
} from './overlap-audit-helpers';

/**
 * Guards pinned chrome against being painted over as the page scrolls.
 *
 * The reported symptom was the home page chat rail: it is sticky, and the cards
 * below it in the same column are exactly the container height that lets it
 * travel, so they scrolled up through it.
 */

/** Every route that pins something: a rail, a sub-nav, or a toolbar. */
const STICKY_ROUTES = [
  { id: 'home', path: '/' },
  {
    id: 'experimental-ui',
    path: '/experimental-ui?uxScenario=live-mid-cycle',
  },
  { id: 'gallery', path: '/gallery' },
  { id: 'faq', path: '/faq' },
  { id: 'statistics', path: '/statistics' },
  { id: 'statistics-activity', path: '/statistics/activity' },
  { id: 'statistics-anchoring', path: '/statistics/anchoring' },
  { id: 'statistics-participation', path: '/statistics/participation' },
  { id: 'statistics-tokens', path: '/statistics/tokens' },
  { id: 'current-cycle', path: '/current-cycle' },
] as const;

test.beforeEach(async ({ page }) => {
  await mockMobileAuditApi(page);
});

test.describe('Scroll overlap - desktop', () => {
  // The chat rail only becomes sticky at xl, which is where this was reported.
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const route of STICKY_ROUTES) {
    test(`${route.path} keeps pinned chrome on top while scrolling`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);

      const violations = await collectOverlapViolations(page);
      expect(violations, formatOverlapViolations(route.path, violations)).toEqual([]);
    });
  }

  test('fixed elements anchor to the viewport, not a transformed ancestor', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const broken = await collectBrokenFixedElements(page);
    expect(broken, formatBrokenFixed('/', broken)).toEqual([]);
  });
});

test.describe('Scroll overlap - mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const route of STICKY_ROUTES) {
    test(`${route.path} keeps pinned chrome on top while scrolling`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);

      const violations = await collectOverlapViolations(page);
      expect(violations, formatOverlapViolations(route.path, violations)).toEqual([]);
    });
  }

  test('the floating gesture CTA stays anchored to the viewport', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const broken = await collectBrokenFixedElements(page);
    expect(broken, formatBrokenFixed('/', broken)).toEqual([]);
  });
});
