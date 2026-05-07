import { expect, test } from '@playwright/test';

import { dismissOpenTooltips, expectTooltipFullyVisible } from './tooltip-helpers';

test.describe('/gallery tooltips', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('opens gallery hero card and control tooltips', async ({ page }) => {
    const totalNfts = page.getByText('Total Imprinted', { exact: true }).first();
    await totalNfts.scrollIntoViewIfNeeded();
    await totalNfts.hover();
    await expectTooltipFullyVisible(page, /total number of COSMIC NFTs imprinted/i);
    await dismissOpenTooltips(page);

    await page.getByRole('radio', { name: 'All' }).hover();
    await expectTooltipFullyVisible(page, /Show all NFTs in the collection/);
    await dismissOpenTooltips(page);

    await page.getByRole('radio', { name: 'Grid view' }).hover();
    await expectTooltipFullyVisible(page, /Grid view/);
    await dismissOpenTooltips(page);

    await page.getByRole('combobox', { name: 'Sort order' }).hover();
    await expectTooltipFullyVisible(page, /Change the order NFTs are displayed/);
    await dismissOpenTooltips(page);

    await page.getByRole('combobox', { name: 'Items per page' }).hover();
    await expectTooltipFullyVisible(page, /Number of NFTs displayed per page/);
  });

  test('opens NFT card badge tooltips without clipping inside card overflow containers', async ({
    page,
  }) => {
    const tokenId = page
      .locator('.font-mono')
      .filter({ hasText: /^#?\d+/ })
      .first();
    await expect(tokenId).toBeVisible();
    await tokenId.hover();
    await expectTooltipFullyVisible(page, /Unique sequential identifier for this COSMIC NFT/);
  });
});
