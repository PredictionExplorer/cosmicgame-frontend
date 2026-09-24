import { test, expect, type Page } from '@playwright/test';

import { mockMobileAuditApi } from './mobile-audit-fixtures';
import { MIN_TAP_TARGET_PX, waitForStableLayout } from './mobile-audit-helpers';

/**
 * A connected wallet on the wrong network must never push the wallet pill
 * out of the header: the pill opens the account panel with the Switch and
 * Disconnect actions, which is exactly what a participant needs then.
 *
 * The wallet is a mock EIP-1193 provider on Ethereum (0x1), a chain the app
 * is never configured for, restored by wagmi's injected connector at boot.
 */

const ACCOUNT = '0x1Ec14a3F6C1D5E4b7C2A9a0b9D3E8f7A6B5cD7E9';

async function installWalletOnWrongNetwork(page: Page) {
  await page.addInitScript((account: string) => {
    try {
      window.localStorage.setItem('wagmi.injected.connected', 'true');
      window.localStorage.setItem('wagmi.recentConnectorId', '"injected"');
    } catch {
      /* storage unavailable: the test fails on the missing chip instead */
    }
    const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
    const provider = {
      isMetaMask: true,
      request: async ({ method }: { method: string }) => {
        switch (method) {
          case 'eth_accounts':
          case 'eth_requestAccounts':
            return [account];
          case 'eth_chainId':
            return '0x1';
          case 'net_version':
            return '1';
          case 'wallet_getPermissions':
          case 'wallet_requestPermissions':
            return [{ parentCapability: 'eth_accounts' }];
          case 'wallet_switchEthereumChain':
            throw Object.assign(new Error('User rejected the request.'), { code: 4001 });
          default:
            return null;
        }
      },
      on: (event: string, callback: (...args: unknown[]) => void) => {
        listeners[event] = [...(listeners[event] ?? []), callback];
      },
      removeListener: () => undefined,
    };
    Object.assign(window, { ethereum: provider });
  }, ACCOUNT);
}

async function headerFacts(page: Page) {
  return page.evaluate(() => {
    const visible = (element: Element | null) =>
      !!element && getComputedStyle(element).display !== 'none';
    const box = (element: Element | null) => element?.getBoundingClientRect() ?? null;
    // The header renders the phone (sheet) and desktop (menu) pills and shows
    // one of them with CSS, so every lookup takes the one that is displayed.
    const shown = (selector: string) =>
      Array.from(document.querySelectorAll(selector)).find(
        (element) => element.getClientRects().length > 0,
      ) ?? null;
    const nav = document.querySelector('header nav');
    const chip = shown('header [data-testid="wrong-network-chip"]');
    const badge = shown('header [data-testid="wrong-network-badge"]');
    const pill = shown(
      'header [data-testid="wallet-account-trigger"], header [data-testid="wallet-menu-trigger"]',
    );
    const pillBox = box(pill);
    const chipBox = visible(chip) ? box(chip) : null;
    return {
      viewport: window.innerWidth,
      pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
      navOverflow: nav ? nav.scrollWidth - nav.clientWidth : 0,
      pill: pillBox && { left: pillBox.left, right: pillBox.right, width: pillBox.width },
      chip: chipBox && { width: chipBox.width, height: chipBox.height },
      badgeVisible: visible(badge),
    };
  });
}

test.beforeEach(async ({ page }) => {
  await mockMobileAuditApi(page);
  await installWalletOnWrongNetwork(page);
});

for (const width of [320, 375, 390, 768, 1024, 1280]) {
  test(`wrong network keeps the wallet pill in the header at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/faq', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('header [data-testid$="-trigger"]:visible').first()).toBeVisible({
      timeout: 15_000,
    });
    await waitForStableLayout(page);

    const facts = await headerFacts(page);
    expect(facts.pageOverflow).toBeLessThanOrEqual(0);
    expect(facts.navOverflow).toBeLessThanOrEqual(0);
    expect(facts.pill).not.toBeNull();
    expect(facts.pill!.left).toBeGreaterThanOrEqual(0);
    expect(facts.pill!.right).toBeLessThanOrEqual(facts.viewport);

    if (width < 360 || width >= 1024) {
      // No room for the chip (the navigation fills the row from 1024px):
      // the pill itself carries the state.
      expect(facts.chip).toBeNull();
      expect(facts.badgeVisible).toBe(true);
    } else {
      expect(facts.badgeVisible).toBe(false);
      expect(facts.chip).not.toBeNull();
      if (width < 640) {
        expect(facts.chip!.width).toBeGreaterThanOrEqual(MIN_TAP_TARGET_PX);
        expect(facts.chip!.height).toBeGreaterThanOrEqual(MIN_TAP_TARGET_PX);
      }
    }
  });
}

test('the account panel offers the switch from the phone header', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/faq', { waitUntil: 'domcontentloaded' });
  const pill = page.locator('header [data-testid="wallet-account-trigger"]');
  await expect(pill).toBeVisible({ timeout: 15_000 });
  await pill.click();

  const panel = page.getByTestId('wallet-account-panel');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('button', { name: /switch to/i })).toBeVisible();
  await expect(panel.getByRole('button', { name: /disconnect/i })).toBeVisible();
});
