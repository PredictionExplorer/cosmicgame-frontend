import { expect, test } from '@playwright/test';

import { expectAllLabelTooltips } from './tooltip-helpers';

const ALLOCATION_DETAIL_TOOLTIPS = [
  {
    label: 'Cycle Reserve',
    expected: /total ETH retrieved by the participant/,
  },
  {
    label: 'Public Goods',
    expected: /Public Goods Beneficiary/,
  },
  {
    label: 'Anchor Distribution',
    expected: /distributed across Cosmic Signature NFTs anchored to the protocol/,
  },
  {
    label: 'Stellar Selection Pool',
    expected: /allocated to the Stellar Selection pool/,
  },
  {
    label: 'Total Gestures',
    expected: /total number of gestures made during this cycle/,
  },
  {
    label: 'Attached NFTs',
    expected: /NFTs attached to gestures by participants/,
  },
  {
    label: 'Total Contributed',
    expected: /ERC-20 token contributions attached to gestures/,
  },
  {
    label: 'Cycle Statistics',
    expected: /Key metrics summarizing this cycle/,
  },
  {
    label: 'Allocation Distribution',
    expected: /Visual breakdown of how the cycle's Cycle Reserve/,
  },
];

test.describe('/allocation tooltips', () => {
  test('opens allocation list recipient tooltip from the Radix replacement for title=', async ({
    page,
  }) => {
    await page.goto('/allocation', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const recipient = page.locator('main span.font-mono').filter({ hasText: /^0x/i }).first();
    await recipient.scrollIntoViewIfNeeded();
    await recipient.hover();
    await expect(page.getByRole('tooltip', { name: /^0x[a-fA-F0-9]{40}$/ })).toBeVisible();
  });

  test('opens representative allocation detail tooltips', async ({ page }) => {
    await page.goto('/allocation/1', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expectAllLabelTooltips(page, ALLOCATION_DETAIL_TOOLTIPS);
  });
});
