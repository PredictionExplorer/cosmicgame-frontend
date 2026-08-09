import { test, expect } from '@playwright/test';

import { mockMobileAuditApi } from './mobile-audit-fixtures';
import {
  APP_AUDIT_ROUTES,
  MOBILE_AUDIT_VIEWPORTS,
  collectTapTargetViolations,
  formatTapTargetViolations,
  waitForStableLayout,
} from './mobile-audit-helpers';

/**
 * Touch target sizing across the dApp.
 *
 * Inline links inside body copy are exempt (WCAG 2.5.8), which the helper
 * handles by skipping `display: inline` anchors. Everything else that a finger
 * is expected to hit must be at least 44x44.
 */

const NARROW = MOBILE_AUDIT_VIEWPORTS[0];

test.beforeEach(async ({ page }) => {
  await mockMobileAuditApi(page);
});

test.describe('Mobile tap targets', () => {
  test.use({ viewport: { width: NARROW.width, height: NARROW.height } });

  for (const route of APP_AUDIT_ROUTES) {
    test(`${route.path} controls are at least 44x44`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await waitForStableLayout(page);

      const violations = await collectTapTargetViolations(page);
      expect(violations, formatTapTargetViolations(route.path, violations)).toEqual([]);
    });
  }

  test('mobile navigation drawer controls are reachable', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStableLayout(page);

    await page.getByRole('button', { name: 'menu' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await waitForStableLayout(page);

    const violations = await collectTapTargetViolations(page);
    expect(violations, formatTapTargetViolations('/ (drawer open)', violations)).toEqual([]);
  });
});
