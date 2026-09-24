import { test, expect } from '@playwright/test';

import {
  expectAllLabelTooltips,
  expectLabelTooltip,
  expectTooltipFullyVisible,
  openTooltip,
} from './tooltip-helpers';

const HUB_TOOLTIPS = [
  {
    label: 'Active Performance Cycle',
    expected: /current Performance Cycle number indexed/,
  },
  {
    label: 'Allocations distributed',
    expected: /Indexed allocation records across all cycles/,
  },
  {
    label: 'NFTs imprinted',
    expected: /Cumulative count of Cosmic Signature NFT ERC-721 tokens imprinted/,
  },
  {
    label: 'Contract balance',
    expected: /ETH currently held by the Cosmic Signature protocol contract/,
  },
];

const PARTICIPATION_TOOLTIPS = [
  {
    label: 'Unique participants',
    expected: /Unique wallet addresses that have made at least one indexed gesture/,
  },
  {
    label: 'Unique recipients',
    expected: /received at least one indexed allocation/,
  },
  {
    label: 'Unique ETH contributors',
    expected: /contributed ETH to the protocol/,
  },
  {
    label: 'Active anchor-holders',
    expected:
      /Distinct wallets that currently anchor at least one Cosmic Signature or Random Walk NFT/,
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

  test('explains the anchoring figures in one Definitions disclosure', async ({ page }) => {
    await page.goto('/statistics/anchoring', { waitUntil: 'networkidle' });
    await page.getByRole('tab', { name: 'Random Walk NFT' }).click();
    const panel = page.getByRole('tabpanel', { name: 'Random Walk NFT' });
    const definitions = panel.locator('details').filter({ hasText: 'Definitions' }).first();
    await definitions.scrollIntoViewIfNeeded();
    await definitions.locator('summary').click();
    await expect(
      definitions.getByText(/imprinted for Random Walk NFT anchor-holders through Anchored-NFT/),
    ).toBeVisible();
  });

  test('explains a section once, beside its title', async ({ page }) => {
    await page.goto('/statistics/activity', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    // The explanation sits beside the H2 (which folds the section), not inside it.
    const trigger = page.getByRole('button', { name: 'More information about Cycle activations' });
    await trigger.scrollIntoViewIfNeeded();
    await openTooltip(trigger);
    await expectTooltipFullyVisible(page, /System event windows that show when protocol cycles/);
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

      const renderedLabels = await firstRecipientRow.locator('td').evaluateAll((cells) =>
        // The label is drawn with empty alternative text
        // (`"Recipient Address" / ""`): read the drawn string only.
        cells.map(
          (cell) =>
            /^"((?:[^"\\]|\\.)*)"/.exec(getComputedStyle(cell, '::before').content)?.[1] ?? '',
        ),
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
