import { test, expect } from '@playwright/test';

import { expectAllLabelTooltips, expectLabelTooltip } from './tooltip-helpers';

const STATISTICS_TOOLTIPS = [
  {
    label: 'Active Performance Cycle',
    expected: /current Performance Cycle number indexed/,
  },
  {
    label: 'Active Cycle Gestures',
    expected: /indexed gestures made in the active Performance Cycle/,
  },
  {
    label: 'Protocol Contract Balance',
    expected: /ETH currently held by the Cosmic Signature protocol contract/,
  },
  {
    label: 'Cosmic Signature NFTs Imprinted',
    expected: /Cumulative count of Cosmic Signature NFT ERC-721 tokens imprinted/,
  },
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
    label: 'Allocation Economy',
    expected: /Cumulative allocation records and ETH flows/,
  },
  {
    label: 'Cycle Activations',
    expected: /System event windows that show when protocol cycles/,
  },
  {
    label: 'RandomWalk NFTs Used',
    expected: /attached to ETH gestures for a one-time Gesture Cost reduction/,
  },
  {
    label: 'Total Tokens Imprinted',
    expected: /Indexed Cosmic Signature NFT imprint count associated/,
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

  test('opens a representative table header tooltip', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'Desktop Chrome') {
      const firstParticipantRow = page
        .getByRole('table')
        .filter({ hasText: 'Participant Address' })
        .first()
        .locator('tbody tr')
        .first();
      await firstParticipantRow.scrollIntoViewIfNeeded();
      await expect(firstParticipantRow).toContainText('Participant Address');
      await expect(firstParticipantRow).toContainText('Number of Gestures');
      return;
    }

    await expectLabelTooltip(page, {
      label: 'Participant Address',
      expected: /Wallet address that made at least one indexed gesture/,
    });
  });
});
