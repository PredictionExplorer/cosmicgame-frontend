import { test, expect, type Page } from '@playwright/test';

async function openMobileMenuIfNeeded(page: Page) {
  const menuButton = page.locator('role=button[name="menu"]');
  if (await menuButton.isVisible()) {
    await menuButton.click();
    await page.waitForTimeout(300);
  }
}

test.describe('Wallet connection state (disconnected)', () => {
  test('Connect Wallet is visible in the mobile header without opening the menu', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'Mobile Chrome', 'mobile-only visibility check');

    await page.goto('/', { waitUntil: 'networkidle' });

    const connectBtn = page.getByRole('button', { name: /connect/i }).first();
    await expect(connectBtn).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('Connect Wallet button is visible on home page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await openMobileMenuIfNeeded(page);
    // RainbowKit may show "Connect Wallet" on desktop or shorter text/icon on mobile
    const connectBtn = page.getByRole('button', { name: /connect/i }).first();
    await connectBtn.scrollIntoViewIfNeeded();
    await expect(connectBtn).toBeVisible();
  });

  test('Connect Wallet opens a connector modal', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await openMobileMenuIfNeeded(page);

    const connectBtn = page.getByRole('button', { name: /connect/i }).first();
    await connectBtn.scrollIntoViewIfNeeded();
    await connectBtn.click();

    await expect(page.getByRole('dialog').first()).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText(/MetaMask|WalletConnect|Coinbase|Injected|Browser Wallet/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('home page shows a connect prompt in the gesture area before wallet connection', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(page.getByText('Connect to make a gesture')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /connect/i }).first()).toBeVisible();
  });

  test('my-tokens page handles no wallet gracefully', async ({ page }) => {
    const response = await page.goto('/my-tokens', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });

  test('my-anchors page handles no wallet gracefully', async ({ page }) => {
    const response = await page.goto('/my-anchors', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });

  test('my-statistics page handles no wallet gracefully', async ({ page }) => {
    const response = await page.goto('/my-statistics', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });

  test('my-winnings page handles no wallet gracefully', async ({ page }) => {
    const response = await page.goto('/my-allocations', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });

  test('winning-history page handles no wallet gracefully', async ({ page }) => {
    const response = await page.goto('/recipient-history', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });
});
