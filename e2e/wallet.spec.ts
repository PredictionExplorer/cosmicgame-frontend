import { test, expect } from '@playwright/test';

test.describe('Wallet connection state (disconnected)', () => {
  test('Connect Wallet button is visible on home page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // On mobile, Connect Wallet is inside the hamburger drawer - open it first
    const menuButton = page.locator('role=button[name="menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);
    }
    // RainbowKit may show "Connect Wallet" on desktop or shorter text/icon on mobile
    const connectBtn = page.getByRole('button', { name: /connect/i });
    await connectBtn.scrollIntoViewIfNeeded();
    await expect(connectBtn).toBeVisible();
  });

  test('my-tokens page handles no wallet gracefully', async ({ page }) => {
    const response = await page.goto('/my-tokens', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });

  test('my-staking page handles no wallet gracefully', async ({ page }) => {
    const response = await page.goto('/my-staking', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });

  test('my-statistics page handles no wallet gracefully', async ({ page }) => {
    const response = await page.goto('/my-statistics', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });

  test('my-winnings page handles no wallet gracefully', async ({ page }) => {
    const response = await page.goto('/my-winnings', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });

  test('winning-history page handles no wallet gracefully', async ({ page }) => {
    const response = await page.goto('/winning-history', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });
});
