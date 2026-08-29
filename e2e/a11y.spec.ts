import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

import { mockZhQualityApi } from './zh-quality-mocks';

/**
 * Live-route a11y smoke check.
 *
 * Complements the jest-axe coverage at the component level (393 assertions,
 * per the audit) by running the real page in a real browser — catches issues
 * only visible after hydration: focus trap regressions, missing skip-link
 * targets, ARIA live regions that only mount client-side.
 *
 * English coverage stays focused on high-traffic pages. Sprint 8 adds one
 * deterministic Chinese page from every route cluster, plus translated-name
 * assertions, while jest-axe continues to cover component primitives.
 */

const routes = [
  { path: '/', label: 'Home' },
  {
    path: '/experimental-ui?uxScenario=live-mid-cycle',
    label: 'Experimental UI',
  },
  { path: '/allocation', label: 'Allocation' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/statistics', label: 'Statistics' },
  { path: '/how-it-works', label: 'How it works' },
  { path: '/faq', label: 'FAQ' },
  { path: '/terms', label: 'Terms' },
  { path: '/privacy', label: 'Privacy' },
];

// Rules we're tracking but not failing on today. Remove entries as Phase 3+
// pages land redesigned. Keeping the list short + explicit avoids the trap
// of a silent exclusion baseline.
const disabledRules = [
  'color-contrast', // MUI-era palette has a few edge cases; full audit in Phase 7
];

const LANDING_HEADERS = { 'X-Forwarded-Host': 'cosmicsignature.com' };
const zhRoutes: ReadonlyArray<{
  path: string;
  label: string;
  landing?: boolean;
  assertAccessibleName: (page: Page) => Promise<void>;
}> = [
  {
    path: '/zh/site-map',
    label: 'global utility',
    assertAccessibleName: async (page) =>
      expect(page.getByRole('heading', { name: '网站地图' })).toBeVisible(),
  },
  {
    path: '/zh/learn',
    label: 'landing and Learn',
    landing: true,
    assertAccessibleName: async (page) =>
      expect(page.getByRole('heading', { name: '了解 Cosmic Signature' })).toBeVisible(),
  },
  {
    path: '/zh/gallery',
    label: 'core dApp',
    assertAccessibleName: async (page) =>
      expect(page.getByRole('textbox', { name: '搜索 NFT' })).toBeVisible(),
  },
  {
    path: '/zh/anchoring',
    label: 'transactions',
    assertAccessibleName: async (page) =>
      expect(page.getByRole('heading', { name: '锚定运作原理' })).toBeVisible(),
  },
  {
    path: '/zh/statistics',
    label: 'statistics',
    assertAccessibleName: async (page) =>
      expect(page.getByRole('heading', { name: 'Cosmic Signature 协议统计' })).toBeVisible(),
  },
  {
    path: '/zh/faq',
    label: 'FAQ and trust',
    assertAccessibleName: async (page) =>
      expect(page.getByRole('textbox', { name: '搜索常见问题' })).toBeVisible(),
  },
  {
    path: '/zh/eth-contribution',
    label: 'long-tail contribution',
    assertAccessibleName: async (page) =>
      expect(page.getByRole('heading', { name: 'ETH 贡献', exact: true }).first()).toBeVisible(),
  },
];

test.describe('A11y smoke (WCAG 2.1 AA)', () => {
  for (const route of routes) {
    test(`${route.label} has no serious/critical violations`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      // Wait for network-driven content so axe evaluates the post-hydrate DOM.
      await page.waitForLoadState('networkidle').catch(() => {
        /* some routes keep polling; swallow the timeout */
      });

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(disabledRules)
        .analyze();

      const seriousOrCritical = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );
      expect(seriousOrCritical, JSON.stringify(seriousOrCritical, null, 2)).toEqual([]);
    });
  }

  test('skip link jumps to #main on Tab+Enter', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // First Tab focuses the skip link (it's the first focusable in the tree).
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /skip to main/i });
    await expect(skipLink).toBeFocused();
    // Activating it should move focus to #main.
    await page.keyboard.press('Enter');
    const main = page.locator('#main:visible').first();
    await expect(main).toBeVisible();
  });

  for (const route of zhRoutes) {
    test(`Chinese ${route.label} page has no serious/critical violations`, async ({
      context,
      page,
    }) => {
      await context.setExtraHTTPHeaders(route.landing ? LANDING_HEADERS : {});
      await mockZhQualityApi(page);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
      await route.assertAccessibleName(page);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(disabledRules)
        .analyze();
      const seriousOrCritical = results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
      );
      expect(seriousOrCritical, JSON.stringify(seriousOrCritical, null, 2)).toEqual([]);
    });
  }

  test('Chinese skip link exposes its translated accessible name', async ({ page }) => {
    await mockZhQualityApi(page);
    await page.goto('/zh/faq', { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: '跳至主要内容' });
    await expect(skipLink).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main:visible').first()).toBeVisible();
  });
});
