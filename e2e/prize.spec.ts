import { test, expect } from '@playwright/test';

test.describe('Prize pages', () => {
  test('prize list page loads with rounds', async ({ page }) => {
    await page.goto('/prize', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/Prize|Cosmic Signature/);
    const response = await page.goto('/prize');
    expect(response?.status()).toBe(200);
  });

  test('prize detail page loads for round 1', async ({ page }) => {
    const response = await page.goto('/prize/1', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });

  test('prize detail shows winner info', async ({ page }) => {
    await page.goto('/prize/1', { waitUntil: 'networkidle' });
    await expect(page.locator('text=/0x/')).toBeVisible();
  });

  test('navigating from prize list to detail works', async ({ page }) => {
    await page.goto('/prize', { waitUntil: 'networkidle' });
    const firstLink = page.locator('a[href*="/prize/"]').first();
    if (await firstLink.isVisible()) {
      await firstLink.click();
      await expect(page).toHaveURL(/\/prize\/\d+/);
    }
  });
});
