import { expect, test, type Locator, type Page } from '@playwright/test';

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
];

/** Split legend entries and role names explain themselves: the word is the trigger. */
const ALLOCATION_LIST_TERMS = [
  {
    label: 'Signature Allocation',
    expected: /retrieved by the participant who made the Final Gesture/,
  },
  { label: 'Stellar Selection', expected: /randomly selected participants/ },
  { label: 'Compounding Cycle Reserve', expected: /roll forward into the next cycle/ },
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
    label: 'Cycle recipients',
    expected: /Chrono-Warrior: held the Endurance Champion position/,
  },
  {
    label: 'Allocation distribution',
    expected: /Each track’s share of the Cycle Reserve when this cycle was finalized/,
  },
  {
    label: 'Direct contributions',
    expected: /Direct ETH contributions from the community/,
  },
];

/** The distribution legend's track names explain themselves. */
const ALLOCATION_DETAIL_TERMS = [
  { label: 'Chrono-Warrior', expected: /ETH allocation to the Chrono-Warrior/ },
  { label: 'Public Goods', expected: /Public Goods Beneficiary/ },
];

async function expectTermTooltips(
  page: Page,
  terms: readonly { label: string; expected: RegExp }[],
  scope: Page | Locator = page,
): Promise<void> {
  for (const { label, expected } of terms) {
    await dismissOpenTooltips(page);
    const trigger = scope.getByRole('button', { name: label, exact: true }).first();
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
    // The ledger leads (its column headers name the same tracks), so the terms are read in
    // the split's own legend, after it.
    const split = page.getByRole('region', { name: 'Cycle Reserve split' });
    await expectTermTooltips(page, ALLOCATION_LIST_TERMS, split);
    // The split is a constant: one sentence under its heading, after the ledger.
    await expect(
      split.getByText('ETH reserve is allocated across protocol tracks', { exact: false }),
    ).toBeVisible();
  });

  test('gives each ledger recipient its full address and the way to its page', async ({ page }) => {
    await page.goto('/allocation', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // The one address display (AddressChip): the short checksummed address, the full address
    // on hover, and the recipient's page one click away, on every screen size.
    const ledger = page.getByRole('table', { name: 'Finalized cycles' });
    const recipient = ledger.getByRole('link', { name: /^0x[0-9a-fA-F]{4}…/ }).first();
    await recipient.scrollIntoViewIfNeeded();
    await expect(recipient).toBeVisible();
    await expect(recipient).toHaveAttribute('title', /^0x[a-fA-F0-9]{40}$/);
    const full = await recipient.getAttribute('title');
    await expect(recipient).toHaveAttribute('href', `/user/${full}`);
  });

  test('opens representative allocation detail tooltips', async ({ page }) => {
    await page.goto('/allocation/1', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expectAllLabelTooltips(page, ALLOCATION_DETAIL_TOOLTIPS);
    await expectTermTooltips(page, ALLOCATION_DETAIL_TERMS);
  });
});
