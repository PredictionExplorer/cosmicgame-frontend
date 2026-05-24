import { test, expect, type Page } from '@playwright/test';

async function openMobileMenuIfNeeded(page: Page) {
  const menuButton = page.locator('role=button[name="menu"]');
  if (await menuButton.isVisible()) {
    await menuButton.click();
    await page.waitForTimeout(300);
  }
}

async function openWalletModal(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });

  let connectBtn = page.getByRole('button', { name: /connect/i }).first();
  if (!(await connectBtn.isVisible())) {
    await openMobileMenuIfNeeded(page);
    connectBtn = page.getByRole('button', { name: /connect/i }).first();
  }

  await connectBtn.scrollIntoViewIfNeeded();
  await connectBtn.click();

  const dialog = page.getByRole('dialog', { name: /connect a wallet/i }).first();
  await expect(dialog).toBeVisible({ timeout: 10000 });
  return dialog;
}

async function installMockMetaMask(page: Page) {
  await page.addInitScript(() => {
    const mockWindow = window as Window & { __mockEthereumRequests?: string[] };
    const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
    const provider = {
      isMetaMask: true as const,
      selectedAddress: null as string | null,
      chainId: '0xa4b1',
      request: async ({
        method,
        params,
      }: {
        method: string;
        params?: Array<{ chainId?: string }>;
      }) => {
        mockWindow.__mockEthereumRequests = [...(mockWindow.__mockEthereumRequests ?? []), method];
        if (method === 'eth_accounts') {
          return provider.selectedAddress ? [provider.selectedAddress] : [];
        }
        if (method === 'eth_requestAccounts') {
          provider.selectedAddress = '0x1234567890abcdef1234567890abcdef12345678';
          return [provider.selectedAddress];
        }
        if (method === 'eth_chainId') return provider.chainId;
        if (method === 'wallet_switchEthereumChain') {
          provider.chainId = params?.[0]?.chainId ?? provider.chainId;
          return null;
        }
        if (method === 'wallet_addEthereumChain') return null;
        if (method === 'net_version') return '42161';
        return null;
      },
      on: (event: string, callback: (...args: unknown[]) => void) => {
        listeners[event] = [...(listeners[event] ?? []), callback];
      },
      removeListener: (event: string, callback: (...args: unknown[]) => void) => {
        listeners[event] = (listeners[event] ?? []).filter((listener) => listener !== callback);
      },
    };
    (window as unknown as { ethereum: typeof provider }).ethereum = provider;
    window.dispatchEvent(new Event('ethereum#initialized'));
  });
}

declare global {
  interface Window {
    __mockEthereumRequests?: string[];
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

  test('Connect Wallet opens all expected connector options', async ({ page }) => {
    const dialog = await openWalletModal(page);

    await expect(dialog.getByRole('button', { name: /^Rainbow$/i })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /^Base Account$/i })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /^MetaMask$/i })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /^WalletConnect$/i })).toBeVisible();
  });

  test('MetaMask connects through injected provider without loading MetaMask SDK', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await installMockMetaMask(page);

    const dialog = await openWalletModal(page);
    await dialog.getByRole('button', { name: /^MetaMask$/i }).click();

    await expect(page.getByText(/0x1234\.{4}5678/).first()).toBeVisible({ timeout: 10_000 });
    await expect
      .poll(() => page.evaluate(() => window.__mockEthereumRequests ?? []))
      .toContain('eth_requestAccounts');
    expect(pageErrors.join('\n')).not.toContain('@metamask/sdk');
    expect(pageErrors.join('\n')).not.toContain('Cannot find module');
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
