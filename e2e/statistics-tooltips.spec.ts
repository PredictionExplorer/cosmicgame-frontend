import { test, expect } from '@playwright/test';

import { expectAllLabelTooltips, expectLabelTooltip } from './tooltip-helpers';

const HUB_TOOLTIPS = [
  {
    label: 'Active Performance Cycle',
    expected: /current Performance Cycle number indexed/,
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
    label: 'Outreach CST Allocated',
    expected: /CST sent from the Outreach Reserve to outreach and ecosystem contributors/,
  },
  {
    label: 'Allocation Economy',
    expected: /Cumulative allocation records and ETH flows/,
  },
  {
    label: 'Random Walk NFTs Used',
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
    label: 'Active Anchor-holders',
    expected:
      /Distinct wallets that currently anchor at least one Cosmic Signature or RandomWalk NFT/,
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
      // A three-column table stays a compact table on a phone, header row
      // included, so its column names are visible text.
      const participantsTable = page
        .getByRole('table')
        .filter({ hasText: 'Participant Address' })
        .first();
      await participantsTable.scrollIntoViewIfNeeded();
      await expect(participantsTable).toHaveAttribute('data-layout', 'compact');
      await expect(participantsTable.locator('thead th').first()).toBeVisible();

      // A wider table becomes one record per row. Each value still carries its
      // column name: the header stays in `thead` for assistive tech, and every
      // cell repeats it from `data-label` via CSS `::before`.
      const recipientsTable = page
        .getByRole('table')
        .filter({ hasText: 'Recipient Address' })
        .first();
      await expect(recipientsTable).toHaveAttribute('data-layout', 'cards');
      const firstRecipientRow = recipientsTable.locator('tbody tr').first();
      await firstRecipientRow.scrollIntoViewIfNeeded();
      await expect(firstRecipientRow.locator('td').first()).toHaveAttribute(
        'data-label',
        'Recipient Address',
      );

      const renderedLabels = await firstRecipientRow
        .locator('td')
        .evaluateAll((cells) =>
          cells.map((cell) => getComputedStyle(cell, '::before').content.replace(/^"|"$/g, '')),
        );
      expect(renderedLabels).toEqual(
        expect.arrayContaining(['Recipient Address', 'Allocations Received']),
      );
      return;
    }

    await expectLabelTooltip(page, {
      label: 'Participant Address',
      expected: /Wallet address that made at least one indexed gesture/,
    });
  });
});
