import { expect, test } from '@playwright/test';

import {
  expectAllLabelTooltips,
  expectTooltipPortaledOutOfMain,
  openTooltip,
  tooltipTriggerForLabel,
} from './tooltip-helpers';

/**
 * The header figures explain themselves behind an info button, the page's
 * one explanation pattern for figures. The cycle's own labels (Contributed
 * ETH, Attached NFTs, the allocation names) are plain words: the allocations
 * are explained together in one disclosure (D079).
 */
const CURRENT_CYCLE_TOOLTIPS = [
  {
    label: 'Total gestures',
    expected: /Total gestures made in this cycle/,
  },
  {
    label: 'Signature Allocation',
    expected: /ETH portion of the Signature Allocation/,
  },
];

test.describe('/current-cycle tooltips', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/current-cycle', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('opens every documented tooltip on the current-cycle page', async ({ page }) => {
    await expectAllLabelTooltips(page, CURRENT_CYCLE_TOOLTIPS);
  });

  test('keeps the Total gestures tooltip fully visible and portaled', async ({ page }) => {
    const trigger = tooltipTriggerForLabel(page, 'Total gestures');
    await trigger.scrollIntoViewIfNeeded();
    await openTooltip(trigger);

    await expectTooltipPortaledOutOfMain(page, /Total gestures made in this cycle/);
  });

  test('explains every allocation in one disclosure instead of ten hover cards', async ({
    page,
  }) => {
    const allocations = page.locator('#allocations');
    await expect(allocations.getByRole('button', { name: 'Public Goods' })).toHaveCount(0);

    const disclosure = page.getByTestId('allocation-definitions');
    const summary = disclosure.locator('summary');
    await summary.scrollIntoViewIfNeeded();
    await expect(summary).toHaveText('How the reserve splits');
    await expect(disclosure.getByText(/forwarded to Protocol Guild/)).toBeHidden();

    // A native disclosure: it opens from the keyboard.
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(disclosure.getByText(/forwarded to Protocol Guild/)).toBeVisible();
    await expect(disclosure.getByRole('term')).toHaveCount(10);
  });
});
