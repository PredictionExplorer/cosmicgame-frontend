import { test, expect, type Page } from '@playwright/test';

import { mockZhQualityApi } from './zh-quality-mocks';

const MOCK_CST_ADDRESS = '0x6666666666666666666666666666666666666666';

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
    const mockWindow = window as Window & {
      __mockEthereumRequests?: string[];
      __mockWatchAssetRequests?: unknown[];
    };
    const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
    const provider = {
      isMetaMask: true as const,
      selectedAddress: null as string | null,
      chainId: '0xa4b1',
      request: async ({ method, params }: { method: string; params?: unknown }) => {
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
          const chainParams = params as Array<{ chainId?: string }> | undefined;
          provider.chainId = chainParams?.[0]?.chainId ?? provider.chainId;
          return null;
        }
        if (method === 'wallet_addEthereumChain') return null;
        if (method === 'wallet_watchAsset') {
          mockWindow.__mockWatchAssetRequests = [
            ...(mockWindow.__mockWatchAssetRequests ?? []),
            params,
          ];
          return true;
        }
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
    __mockWatchAssetRequests?: unknown[];
  }
}

test.describe('Wallet connection state (disconnected)', () => {
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

  test('connected users can add CST to MetaMask with the expected metadata', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome', 'Desktop wallet menu payload coverage');
    await mockZhQualityApi(page);
    await installMockMetaMask(page);

    const dialog = await openWalletModal(page);
    await dialog.getByRole('button', { name: /^MetaMask$/i }).click();

    const walletTrigger = page.getByRole('button', { name: /0x1234/i }).first();
    await expect(walletTrigger).toBeVisible({ timeout: 10_000 });
    await walletTrigger.click();
    await page.getByRole('menuitem', { name: 'Add CST to MetaMask' }).click();

    const image = new URL('/images/logo2.svg', page.url()).href;
    await expect
      .poll(() => page.evaluate(() => window.__mockWatchAssetRequests?.[0]))
      .toEqual({
        type: 'ERC20',
        options: {
          address: MOCK_CST_ADDRESS,
          symbol: 'CST',
          decimals: 18,
          image,
        },
      });
  });

  test('Chinese wallet chooser connects through the non-mutating injected flow', async ({
    page,
  }) => {
    await installMockMetaMask(page);
    await page.goto('/zh', { waitUntil: 'networkidle' });

    const connectBtn = page.getByRole('button', { name: /连接钱包/ }).first();
    await expect(connectBtn).toBeVisible();
    await connectBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await expect(dialog).toContainText(/连接钱包|选择钱包/);
    await dialog.getByRole('button', { name: /^MetaMask$/i }).click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    await expect(page.getByText(/0x1234\.{4}5678/).first()).toBeVisible({ timeout: 10_000 });
    await expect
      .poll(() => page.evaluate(() => window.__mockEthereumRequests ?? []))
      .toContain('eth_requestAccounts');
  });

  test('home page shows a connect prompt in the gesture area before wallet connection', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(page.getByText('Connect to submit your gesture')).toBeVisible({ timeout: 15000 });
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
