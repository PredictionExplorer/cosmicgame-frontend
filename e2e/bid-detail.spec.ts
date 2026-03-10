import { test, expect } from '@playwright/test';

test.describe('Bid detail page', () => {
  test('bid/1 loads without errors', async ({ page }) => {
    const response = await page.goto('/bid/1', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });

  test('shows bid information fields', async ({ page }) => {
    await page.goto('/bid/1', { waitUntil: 'networkidle' });
    await expect(page.locator('text=/Bid Price/')).toBeVisible();
    await expect(page.locator('text=/Bidder/')).toBeVisible();
  });

  test('bid price does not show NaN or undefined', async ({ page }) => {
    await page.goto('/bid/1', { waitUntil: 'networkidle' });
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('NaN');
    expect(bodyText).not.toContain('undefined ETH');
    expect(bodyText).not.toContain('undefined CST');
  });

  test('bidder address is a valid hex string', async ({ page }) => {
    await page.goto('/bid/1', { waitUntil: 'networkidle' });
    const addressLink = page.locator('a[href*="/user/0x"]').first();
    if (await addressLink.isVisible()) {
      const href = await addressLink.getAttribute('href');
      expect(href).toMatch(/\/user\/0x[0-9a-fA-F]+/);
    }
  });

  test('multiple bid pages load correctly', async ({ page }) => {
    for (const id of [1, 2, 5, 10]) {
      const response = await page.goto(`/bid/${id}`, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);
    }
  });
});
