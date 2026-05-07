import { test } from '@playwright/test';

import { expectAllLabelTooltips } from './tooltip-helpers';

const STATISTICS_TOOLTIPS = [
  {
    label: 'Total Cycles',
    expected: /Total Performance Cycles completed since launch/,
  },
  {
    label: 'Allocations Distributed',
    expected: /Rows in cg_prize/,
  },
  {
    label: 'NFTs Imprinted',
    expected: /Total Cosmic Signature NFTs/,
  },
  {
    label: 'Contract Balance',
    expected: /ETH held by the protocol smart contract/,
  },
  {
    label: 'Unique Participants',
    expected: /Total unique wallet addresses that have made at least one gesture/,
  },
  {
    label: 'Unique Recipients',
    expected: /retrieved at least one Signature Allocation/,
  },
  {
    label: 'Unique ETH Contributors',
    expected: /contributed ETH to the protocol/,
  },
  {
    label: 'Unique Anchor-holders',
    expected: /Combined unique CST and RandomWalk token anchor-holders/,
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
