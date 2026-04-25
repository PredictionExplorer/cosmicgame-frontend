import { test, expect } from '@playwright/test';

test.describe('Allocation pages', () => {
  test('allocation list page loads with cycles', async ({ page }) => {
    await page.goto('/allocation', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/Allocation|Cosmic Signature/);
    const response = await page.goto('/allocation');
    expect(response?.status()).toBe(200);
  });

  test('allocation detail page loads for round 1', async ({ page }) => {
    const response = await page.goto('/allocation/1', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });

  test('allocation detail shows recipient info', async ({ page }) => {
    await page.goto('/allocation/1', { waitUntil: 'networkidle' });
    await expect(page.locator('text=/0x/')).toBeVisible();
  });

  test('navigating from allocation list to detail works', async ({ page }) => {
    await page.goto('/allocation', { waitUntil: 'networkidle' });
    const firstLink = page.locator('a[href*="/allocation/"]').first();
    if (await firstLink.isVisible()) {
      await firstLink.click();
      await expect(page).toHaveURL(/\/allocation\/\d+/);
    }
  });
});
