import { expect, test, type Page } from '@playwright/test';

import {
  dismissOpenTooltips,
  expectAllLabelTooltips,
  expectTooltipFullyVisible,
  openTooltip,
} from './tooltip-helpers';

const ALLOCATION_LIST_TOOLTIPS = [
  {
    label: 'Finalized cycle records only',
    expected: /Active cycles and separate allocation retrieval records are excluded/,
  },
  {
    label: 'Cycle reserve split',
    expected: /ETH reserve is allocated across protocol tracks/,
  },
];

/** Split legend entries and role names explain themselves: the word is the trigger. */
const ALLOCATION_LIST_TERMS = [
  {
    label: 'Signature Allocation',
    expected: /retrieved by the participant who made the Final Gesture/,
  },
  { label: 'Stellar Selection', expected: /randomly selected participants/ },
  { label: 'Next cycle', expected: /Compounding Cycle Reserve/ },
];

const ALLOCATION_DETAIL_TOOLTIPS = [
  {
    label: 'Signature Allocation',
    expected: /ETH portion of the Signature Allocation retrieved by the participant/,
  },
  {
    label: 'Recipients',
    expected: /received at least one allocation this cycle/,
  },
  {
    label: 'Allocation distribution',
    expected: /How the ETH distributed this cycle splits across allocation tracks/,
  },
  {
    label: 'Cycle statistics',
    expected: /Key metrics summarizing this cycle/,
  },
  {
    label: 'Contributed ETH',
    expected: /Direct ETH contributions from the community/,
  },
];

const ALLOCATION_DETAIL_TERMS = [
  { label: 'Chrono-Warrior', expected: /Endurance Champion/ },
  { label: 'Public Goods', expected: /Public Goods Beneficiary/ },
];

async function expectTermTooltips(
  page: Page,
  terms: readonly { label: string; expected: RegExp }[],
): Promise<void> {
  for (const { label, expected } of terms) {
    await dismissOpenTooltips(page);
    const trigger = page.getByRole('button', { name: label, exact: true }).first();
    await trigger.scrollIntoViewIfNeeded();
    await openTooltip(trigger);
    await expectTooltipFullyVisible(page, expected);
    await dismissOpenTooltips(page);
  }
}

test.describe('/allocation tooltips', () => {
  test('opens representative allocation list tooltips', async ({ page }) => {
    await page.goto('/allocation', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expectAllLabelTooltips(page, ALLOCATION_LIST_TOOLTIPS);
    await expectTermTooltips(page, ALLOCATION_LIST_TERMS);
  });

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
    await expectTermTooltips(page, ALLOCATION_DETAIL_TERMS);
  });
});
