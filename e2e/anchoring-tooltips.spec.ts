import { test } from '@playwright/test';

import { expectAllLabelTooltips } from './tooltip-helpers';

const ANCHORING_TOOLTIPS = [
  {
    label: 'Anchor Distribution Pool',
    expected: /Total ETH currently allocated to the Anchor Distribution pool/,
  },
  {
    label: 'Cosmic Signature NFTs Anchored',
    expected: /Cosmic Signature NFTs currently anchored/,
  },
  {
    label: 'RWLK NFTs Anchored',
    expected: /RandomWalk NFTs currently anchored/,
  },
  {
    label: 'Distribution per NFT',
    expected: /Current ETH Anchor Distribution per anchored Cosmic Signature NFT/,
  },
  {
    label: 'Unique Anchor-holders',
    expected: /distinct wallet addresses that have anchored/,
  },
];

test.describe('/anchoring tooltips', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/anchoring', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('opens anchoring overview tooltips', async ({ page }) => {
    await expectAllLabelTooltips(page, ANCHORING_TOOLTIPS);
  });
});
