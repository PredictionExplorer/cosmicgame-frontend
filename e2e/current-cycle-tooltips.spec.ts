import { expect, test } from '@playwright/test';

import {
  expectTooltipFullyVisible,
  expectTooltipPortaledOutOfMain,
  openTooltip,
} from './tooltip-helpers';

/**
 * One explanation pattern per screen (D079): the page explains its coined
 * words in place, as dotted terms (Cycle Reserve, the standings roles), and
 * its allocations together in one disclosure. The header figures and the
 * cycle's own labels (Contributed ETH, Attached NFTs, the allocation names)
 * are plain words.
 */
test.describe('/current-cycle tooltips', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/current-cycle', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('sets the header figures as plain labels, with no info buttons', async ({ page }) => {
    const header = page.getByRole('main').locator('header').first();
    await expect(header.getByText('Total gestures', { exact: true })).toBeVisible();
    await expect(header.getByText('Opened', { exact: true })).toBeVisible();
    // The Signature Allocation is the standings' Last Gesture figure, shown once (V227).
    await expect(header.getByText('Signature Allocation', { exact: true })).toHaveCount(0);
    await expect(header.getByRole('button', { name: /^More information/ })).toHaveCount(0);
  });

  test('puts the clock and the commit action in the first screen (V227)', async ({ page }) => {
    const clock = page.getByTestId('cycle-clock');
    await expect(clock).toBeInViewport();
    await expect(clock.getByRole('link').first()).toBeInViewport();
  });

  test('explains the coined Cycle Reserve in place, fully visible and portaled', async ({
    page,
  }) => {
    const term = page
      .getByRole('main')
      .getByRole('button', { name: 'Cycle Reserve', exact: true })
      .first();
    await term.scrollIntoViewIfNeeded();
    await openTooltip(term);

    await expectTooltipFullyVisible(page, /The ETH held for the current cycle/);
    await expectTooltipPortaledOutOfMain(page, /The ETH held for the current cycle/);
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
