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
  // Decision information is present without opening any disclosure.
  {
    label: 'Last Gesture',
    expected: /latest gesture maker is building an endurance window/i,
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
});
