import { test } from '@playwright/test';

import { dismissOpenTooltips, expectTooltipFullyVisible } from './tooltip-helpers';

test.describe('/gallery tooltips', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('explains the status filters and names the icon-only view options', async ({ page }) => {
    await page.getByRole('radio', { name: 'Anchored' }).hover();
    await expectTooltipFullyVisible(
      page,
      /NFTs currently anchored and receiving Anchor Distributions/,
    );
    await dismissOpenTooltips(page);

    await page.getByRole('radio', { name: 'Grid view' }).hover();
    await expectTooltipFullyVisible(page, /Grid view/);
  });
});
