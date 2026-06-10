import { test, expect } from '@playwright/test';

test.describe('Wallet connection state (mobile header)', () => {
  test('Connect Wallet is visible without opening the menu', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const connectBtn = page.getByRole('button', { name: /connect/i }).first();
    await expect(connectBtn).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});
