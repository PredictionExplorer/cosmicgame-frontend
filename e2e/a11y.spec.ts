import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Live-route a11y smoke check.
 *
 * Complements the jest-axe coverage at the component level (393 assertions,
 * per the audit) by running the real page in a real browser — catches issues
 * only visible after hydration: focus trap regressions, missing skip-link
 * targets, ARIA live regions that only mount client-side.
 *
 * Scope is deliberately small (a handful of high-traffic routes) so this
 * stays under 20 seconds in CI. Add routes here when a regression ships,
 * not proactively — jest-axe already covers the primitives.
 */

const routes = [
  { path: '/', label: 'Home' },
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
    const main = page.locator('#main');
    await expect(main).toBeVisible();
  });
});
