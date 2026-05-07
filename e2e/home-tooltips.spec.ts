import { test } from '@playwright/test';

import { expectAllLabelTooltips } from './tooltip-helpers';

const HOME_TOOLTIPS = [
  {
    label: 'Signature Allocation',
    expected: /ETH portion of the Signature Allocation/,
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
