import { test, expect } from '@playwright/test';

import { mockMobileAuditApi } from './mobile-audit-fixtures';
import {
  APP_AUDIT_ROUTES,
  LANDING_AUDIT_ROUTES,
  LANDING_HEADERS,
  MOBILE_AUDIT_VIEWPORTS,
  collectOverflowViolations,
  formatOverflowViolations,
  getPageOverflow,
  waitForStableLayout,
} from './mobile-audit-helpers';

/**
 * Element-level overflow sweep across every route the dApp serves.
 *
 * Runs on the Mobile Chrome / Mobile Safari projects only. The narrowest
 * viewport (320px) is where layout actually breaks, so every route is checked
 * there; 375 and 414 are sampled on the table-heavy routes where column count
 * drives the failure mode.
 */

const NARROW = MOBILE_AUDIT_VIEWPORTS[0];

/** Routes whose primary content is a wide data table. */
const TABLE_HEAVY_ROUTE_IDS = new Set([
  'app-home',
  'current-cycle',
  'allocation',
  'allocation-detail',
  'anchoring',
  'my-anchors',
  'my-statistics',
  'my-tokens',
  'recipient-history',
  'named-nfts',
  'attached-nfts',
  'used-rwlk-nfts',
  'statistics-anchoring',
  'statistics-participation',
  'statistics-performance',
  'statistics-tokens',
  'user',
  'signature-transfer-history',
  'cst-transfer-history',
  'token-distributions',
]);

test.beforeEach(async ({ page }) => {
  await mockMobileAuditApi(page);
});

test.describe('Mobile overflow — every app route at 320px', () => {
  test.use({ viewport: { width: NARROW.width, height: NARROW.height } });

  for (const route of APP_AUDIT_ROUTES) {
    test(`${route.path} has no element overflow`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await waitForStableLayout(page);

      const violations = await collectOverflowViolations(page);
      expect(violations, formatOverflowViolations(route.path, violations)).toEqual([]);
    });
  }
});

test.describe('Mobile overflow — page never scrolls sideways at 320px', () => {
  test.use({ viewport: { width: NARROW.width, height: NARROW.height } });

  for (const route of APP_AUDIT_ROUTES) {
    test(`${route.path} fits the viewport`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await waitForStableLayout(page);

      const { scrollWidth, viewportWidth } = await getPageOverflow(page);
      expect(
        scrollWidth,
        `${route.path} scrolls horizontally: ${scrollWidth}px content in a ${viewportWidth}px viewport`,
      ).toBeLessThanOrEqual(viewportWidth + 1);
    });
  }
});

for (const viewport of MOBILE_AUDIT_VIEWPORTS.slice(1)) {
  test.describe(`Mobile overflow — table-heavy routes at ${viewport.width}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const route of APP_AUDIT_ROUTES.filter((r) => TABLE_HEAVY_ROUTE_IDS.has(r.id))) {
      test(`${route.path} has no element overflow`, async ({ page }) => {
        await page.goto(route.path, { waitUntil: 'domcontentloaded' });
        await waitForStableLayout(page);

        const violations = await collectOverflowViolations(page);
        expect(violations, formatOverflowViolations(route.path, violations)).toEqual([]);
      });
    }
  });
}

test.describe('Mobile overflow — landing host at 320px', () => {
  test.use({
    viewport: { width: NARROW.width, height: NARROW.height },
    extraHTTPHeaders: LANDING_HEADERS,
  });

  for (const route of LANDING_AUDIT_ROUTES) {
    test(`${route.path} has no element overflow`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await waitForStableLayout(page);

      const violations = await collectOverflowViolations(page);
      expect(violations, formatOverflowViolations(route.path, violations)).toEqual([]);
    });
  }
});
