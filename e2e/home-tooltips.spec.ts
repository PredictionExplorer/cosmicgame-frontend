import { expect, test } from '@playwright/test';

import { expectAllLabelTooltips } from './tooltip-helpers';

// Targets must exist in EVERY cycle phase: the gesture panel (and its price
// labels) disappears while a cycle awaits opening, which made
// phase-dependent labels flaky between cycles.
const HOME_TOOLTIPS = [
  // Tracks ribbon header ("Signature Allocation" is not a unique label: it
  // appears as the clock reserve label and a ribbon row, so the label-based
  // helper targets unique labels).
  {
    label: 'Allocation Tracks',
    expected: /Live view of every allocation track/,
  },
];

test.describe('/ tooltips', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('opens representative home-page tooltips across stat and section surfaces', async ({
    page,
  }) => {
    const disclosure = page.getByTestId('allocations-disclosure');
    await disclosure.locator('summary').click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expectAllLabelTooltips(page, HOME_TOOLTIPS);
  });

  test('explains each standing role in place, without opening a disclosure', async ({ page }) => {
    // The ledger's roles are explained terms: the word itself opens its
    // definition, on hover or on a press (which pins it for touch).
    const latest = page
      .getByTestId('latest-participant-intel')
      .getByRole('button', { name: 'Last Gesture', exact: true });
    await latest.scrollIntoViewIfNeeded();
    await latest.click();
    await expect(page.getByRole('tooltip')).toContainText(/The most recent participant/);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);

    const chrono = page.getByTestId('chrono-role-summary').getByRole('button').first();
    await chrono.click();
    await expect(page.getByRole('tooltip')).toBeVisible();
  });
});
