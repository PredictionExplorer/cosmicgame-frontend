import { test } from '@playwright/test';

import { expectAllLabelTooltips } from './tooltip-helpers';

// The terms of the hub's Anchor Distribution flow, in reading order.
const ANCHORING_TOOLTIPS = [
  {
    label: 'Anchor Distribution pool',
    expected: /The ETH this cycle sets aside for anchored Cosmic Signature NFTs/,
  },
  {
    label: 'Anchored Cosmic Signature NFTs',
    expected: /Cosmic Signature NFTs anchored right now, across every anchor-holder/,
  },
  {
    label: 'Per anchored NFT',
    expected: /The pool divided by the anchored Cosmic Signature NFTs/,
  },
  {
    label: 'Anchored Random Walk NFTs',
    expected: /Random Walk NFTs anchored right now/,
  },
  {
    label: 'Active anchor-holders',
    expected: /Distinct wallets that anchor at least one Cosmic Signature or Random Walk NFT/,
  },
];

test.describe('/anchoring tooltips', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/anchoring', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('opens the Anchor Distribution flow tooltips', async ({ page }) => {
    await expectAllLabelTooltips(page, ANCHORING_TOOLTIPS);
  });
});
