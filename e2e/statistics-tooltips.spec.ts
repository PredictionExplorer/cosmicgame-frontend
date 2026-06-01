import { test } from '@playwright/test';

import { expectAllLabelTooltips } from './tooltip-helpers';

const STATISTICS_TOOLTIPS = [
  {
    label: 'Total Cycles',
    expected: /Total Performance Cycles completed or currently indexed/,
  },
  {
    label: 'Allocations Distributed',
    expected: /Indexed allocation records across all cycles/,
  },
  {
    label: 'NFTs Imprinted',
    expected: /Cumulative count of Cosmic Signature NFT ERC-721 tokens imprinted/,
  },
  {
    label: 'Contract Balance',
    expected: /ETH currently held by the Cosmic Signature protocol contract/,
  },
  {
    label: 'Unique Participants',
    expected: /Unique wallet addresses that have made at least one indexed gesture/,
  },
  {
    label: 'Unique Recipients',
    expected: /received at least one indexed allocation/,
  },
  {
    label: 'Unique ETH Contributors',
    expected: /contributed ETH to the protocol/,
  },
  {
    label: 'Unique Anchor-holders',
    expected: /Combined unique wallets that have anchored Cosmic Signature NFTs or RandomWalk NFTs/,
  },
  {
    label: 'Outreach Reserve',
    expected: /CST imprinted for outreach and ecosystem contributors/,
  },
  {
    label: 'RandomWalk NFTs Used',
    expected: /attached to ETH gestures for a one-time Gesture Cost reduction/,
  },
  {
    label: 'Total Tokens Imprinted',
    expected: /Total Cosmic Signature NFTs imprinted for wallets/,
  },
];

test.describe('/statistics tooltips', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/statistics', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('opens representative statistics tooltips across overview groups', async ({ page }) => {
    await expectAllLabelTooltips(page, STATISTICS_TOOLTIPS);
  });
});
