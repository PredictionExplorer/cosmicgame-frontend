import { test } from '@playwright/test';

import { expectAllLabelTooltips } from './tooltip-helpers';

// Targets must exist in EVERY cycle phase: the metric cards (e.g. "ETH
// Gesture") disappear while a cycle awaits its first gesture, which made
// phase-dependent labels flaky between cycles.
const HOME_TOOLTIPS = [
  // Deck board header ("Signature Allocation" is no longer a unique label:
  // it appears as the board's first row, the monument reserve label, and a
  // status metric card, so the label-based helper targets unique labels).
  {
    label: 'Allocation Tracks',
    expected: /Live view of every allocation track/,
  },
  // Public-goods impact card in the console rail (rendered in all phases).
  {
    label: 'Lifetime Contributed',
    expected: /Automatic protocol forwards plus voluntary/,
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
    await expectAllLabelTooltips(page, HOME_TOOLTIPS);
  });
});
