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

  test('explains each anchoring figure by its own label', async ({ page }) => {
    await page.goto('/statistics/anchoring', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('tab', { name: 'Random Walk NFT' }).click();
    const panel = page.getByRole('tabpanel', { name: 'Random Walk NFT' });
    // One definition mechanism: the label is the explained term (no Definitions disclosure).
    await expect(panel.locator('details')).toHaveCount(0);
    const trigger = panel.getByRole('button', {
      name: 'More information about Cosmic Signature NFTs imprinted',
    });
    await trigger.scrollIntoViewIfNeeded();
    await openTooltip(trigger);
    await expectTooltipFullyVisible(
      page,
      /imprinted for Random Walk NFT anchor-holders through Anchored-NFT/,
    );
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
        .filter({ hasText: 'Largest gesture (ETH)' })
        .first();
      await participantsTable.scrollIntoViewIfNeeded();
      await expect(participantsTable).toHaveAttribute('data-layout', 'compact');
      await expect(participantsTable.locator('thead th').first()).toBeVisible();

      // The recipients ledger leaves its mostly blank "Largest Signature
      // Allocation" off a phone, so it keeps the address, the count and the
      // ETH received and stays a table like every other ledger on the page.
      const recipientsTable = page
        .getByRole('table')
        .filter({ hasText: 'Allocations (all kinds)' })
        .first();
      await recipientsTable.scrollIntoViewIfNeeded();
      await expect(recipientsTable).toHaveAttribute('data-layout', 'compact');
      await expect(
        recipientsTable.getByRole('columnheader', { name: 'ETH received' }),
      ).toBeVisible();
      await expect(recipientsTable.locator('thead th[data-priority="secondary"]')).toBeHidden();
      return;
    }

    // Only a derived figure carries an explanation; a plain column does not.
    await expectLabelTooltip(page, {
      label: 'ETH received',
      expected: /NFT and CST allocations count toward Allocations \(all kinds\)/,
    });
    const participantsHeader = page.getByRole('columnheader', { name: 'Participant', exact: true });
    await expect(participantsHeader.locator('button[aria-label^="Explain column:"]')).toHaveCount(
      0,
    );
  });
});
