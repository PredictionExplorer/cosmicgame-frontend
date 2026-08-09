import { test, expect } from '@playwright/test';

import { expectAllLabelTooltips, expectLabelTooltip } from './tooltip-helpers';

const HUB_TOOLTIPS = [
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
    label: 'Outreach Reserve',
    expected: /CST imprinted for outreach and ecosystem contributors/,
  },
  {
    label: 'Allocation Economy',
    expected: /Cumulative allocation records and ETH flows/,
  },
  {
    label: 'RandomWalk NFTs Used',
    expected: /attached to ETH gestures for a one-time Gesture Cost reduction/,
  },
];

const PARTICIPATION_TOOLTIPS = [
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
];

test.describe('/statistics tooltips', () => {
  test('opens representative tooltips on the hub', async ({ page }) => {
    await page.goto('/statistics', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expectAllLabelTooltips(page, HUB_TOOLTIPS);
  });

  test('opens participation tooltips', async ({ page }) => {
    await page.goto('/statistics/participation', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expectAllLabelTooltips(page, PARTICIPATION_TOOLTIPS);
  });

  test('opens anchoring tooltips', async ({ page }) => {
    await page.goto('/statistics/anchoring', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expectAllLabelTooltips(page, [
      {
        label: 'Total Tokens Imprinted',
        expected: /Indexed Cosmic Signature NFT imprint count associated/,
      },
    ]);
  });

  test('opens activity tooltips', async ({ page }) => {
    await page.goto('/statistics/activity', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expectAllLabelTooltips(page, [
      {
        label: 'Cycle Activations',
        expected: /System event windows that show when protocol cycles/,
      },
    ]);
  });

  test('opens a representative table header tooltip', async ({ page }, testInfo) => {
    await page.goto('/statistics/participation', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });

    if (testInfo.project.name !== 'Desktop Chrome') {
      // The card layout hides the header row, so there is no header tooltip to
      // open on a phone. What has to hold instead is that each value still
      // carries its column name: the header text stays in `thead` for assistive
      // tech, and every cell repeats it from `data-label` via CSS `::before`.
      const participantsTable = page
        .getByRole('table')
        .filter({ hasText: 'Participant Address' })
        .first();
      await expect(participantsTable.locator('thead th').first()).toContainText(
        'Participant Address',
      );

      const firstParticipantRow = participantsTable.locator('tbody tr').first();
      await firstParticipantRow.scrollIntoViewIfNeeded();
      await expect(firstParticipantRow.locator('td').first()).toHaveAttribute(
        'data-label',
        'Participant Address',
      );
      await expect(firstParticipantRow.locator('td').nth(1)).toHaveAttribute(
        'data-label',
        'Number of Gestures',
      );

      const renderedLabels = await firstParticipantRow
        .locator('td')
        .evaluateAll((cells) =>
          cells.map((cell) => getComputedStyle(cell, '::before').content.replace(/^"|"$/g, '')),
        );
      expect(renderedLabels).toEqual(
        expect.arrayContaining(['Participant Address', 'Number of Gestures']),
      );
      return;
    }

    await expectLabelTooltip(page, {
      label: 'Participant Address',
      expected: /Wallet address that made at least one indexed gesture/,
    });
  });
});
