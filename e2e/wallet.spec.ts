import { test, expect, type Page } from '@playwright/test';

import { protocolFacts } from '../content/protocol-facts';
import { SITE_THEMES } from '../lib/theme/config';
import common from '../messages/en/common.json';
import home from '../messages/en/home.json';

import { mockZhQualityApi } from './zh-quality-mocks';

const MOCK_CST_ADDRESS = '0x6666666666666666666666666666666666666666';

/**
 * The connected wallet's pill in the header. The header renders a phone and
 * a desktop pill and shows one with CSS, and narrow phones show no address
 * text, so find the displayed pill by the address in its accessible name.
 */
function connectedPill(page: Page) {
  return page
    .getByRole('banner')
    .getByRole('button', { name: /0x1234…\u20605678/ })
    .filter({ visible: true })
    .first();
}

/**
 * Phones: the action dock steps aside while the inline gesture form is on
 * screen, so the quick-action sheet is reached once the form scrolls away.
 */
async function openSheetFromDock(page: Page) {
  await page.getByTestId('home-feed-layout').scrollIntoViewIfNeeded();
  const dockAction = page.getByTestId('dock-open-sheet');
  await expect(dockAction).toBeVisible();
  await dockAction.click();
}

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
    isMobile,
  }, testInfo) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockZhQualityApi(page);
    await installMockMetaMask(page);

    await page.goto('/', { waitUntil: 'networkidle' });
    const inlinePanel = page.locator('[data-testid="gesture-panel"][data-variant="card"]');
    const inlineMessage = inlinePanel.getByRole('textbox', {
      name: new RegExp(`^${home.form.advanced.messageLabel}`),
    });
    const draft = 'A note for the cosmos.';

    // The editor must be discoverable and usable before any wallet interaction:
    // the optional message recedes behind one control, never a disclosure
    // element or the advanced options.
    await inlinePanel.getByTestId('gesture-message-toggle').click();
    await expect(inlineMessage).toBeVisible();
    await expect(inlineMessage).toBeEditable();
    expect(await inlineMessage.evaluate((element) => element.closest('details') !== null)).toBe(
      false,
    );
    expect((await inlineMessage.boundingBox())!.height).toBeGreaterThanOrEqual(96);
    await inlineMessage.fill(draft);
    await expect(inlineMessage).toHaveValue(draft);
    await inlinePanel
      .getByTestId('connect-to-gesture')
      .getByRole('button', { name: /connect/i })
      .click();

    const dialog = page.getByRole('dialog', { name: /connect a wallet/i }).first();
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /^MetaMask$/i }).click();

    await expect(connectedPill(page)).toBeVisible({ timeout: 10_000 });
    await expect(inlineMessage).toHaveValue(draft);
    await expect
      .poll(() => page.evaluate(() => window.__mockEthereumRequests ?? []))
      .toContain('eth_requestAccounts');
    expect(pageErrors.join('\n')).not.toContain('@metamask/sdk');
    expect(pageErrors.join('\n')).not.toContain('Cannot find module');

    for (const theme of SITE_THEMES) {
      const themeName = common.themeSwitcher.themes[theme].name;
      const themeButton = page.getByRole('button', {
        name: common.themeSwitcher.label,
        exact: true,
      });
      if (await themeButton.isVisible()) {
        await themeButton.click();
        await page.getByRole('menuitemradio', { name: new RegExp(`^${themeName}`) }).click();
      } else {
        // Phones: the palette lives in the navigation drawer, not the header.
        await page
          .getByRole('banner')
          .getByRole('button', { name: /^Open menu/ })
          .click();
        const drawer = page.getByRole('dialog', { name: 'Navigation' });
        await drawer.getByRole('radio', { name: themeName, exact: true }).click();
        await page.keyboard.press('Escape');
        await expect(drawer).toBeHidden();
      }
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

      if (isMobile) await openSheetFromDock(page);
      const panel = page.locator(
        `[data-testid="gesture-panel"][data-variant="${isMobile ? 'sheet' : 'card'}"]`,
      );
      const message = panel.getByRole('textbox', {
        name: new RegExp(`^${home.form.advanced.messageLabel}`),
      });
      await expect(panel.locator(isMobile ? '#gesture-submit-sheet' : '#gesture-submit')).toHaveCSS(
        'background-image',
        /linear-gradient/,
      );

      // A connected participant can immediately find and use the editor;
      // opening Advanced or a separate message disclosure is never required.
      await expect(message).toBeVisible();
      await expect(message).toBeEditable();
      await expect(message).toHaveValue(draft);
      expect(await message.evaluate((element) => element.closest('details') !== null)).toBe(false);
      await expect(message).toHaveAttribute('placeholder', home.form.advanced.messagePlaceholder);
      expect((await message.boundingBox())!.height).toBeGreaterThanOrEqual(96);
      await message.fill('');
      await message.blur();
      await message.locator('..').screenshot({
        path: testInfo.outputPath(`message-${theme}-empty.png`),
        animations: 'disabled',
      });

      await message.fill(draft);
      await expect(message).toBeFocused();
      await expect(message).toHaveValue(draft);
      const counter = panel.getByTestId('gesture-message-char-count');
      const count = `${draft.length}/${protocolFacts.gestureMessageMaxLength}`;
      await expect(counter).toHaveText(count);
      await expect(message).toHaveAccessibleDescription(count);
      await message.locator('..').screenshot({
        path: testInfo.outputPath(`message-${theme}-focused.png`),
        animations: 'disabled',
      });

      if (isMobile) {
        await page.keyboard.press('Escape');
        await expect(inlineMessage).toHaveValue(draft);
      }
    }

    if (isMobile) await openSheetFromDock(page);
    const panel = page.locator(
      `[data-testid="gesture-panel"][data-variant="${isMobile ? 'sheet' : 'card'}"]`,
    );
    const message = panel.getByRole('textbox', {
      name: new RegExp(`^${home.form.advanced.messageLabel}`),
    });
    const advanced = panel.getByTestId('gesture-panel-advanced');
    const advancedTrigger = advanced.getByRole('button', {
      name: home.form.advanced.title,
      exact: true,
    });

    // The selected method's controls remain usable alongside the visible draft.
    await panel.getByTestId('panel-method-randomWalk').click();
    await expect(panel.getByTestId('panel-method-randomWalk')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const tokenPicker = panel.getByTestId('panel-rwlk-picker');
    await expect(tokenPicker.getByRole('heading', { name: home.form.rwlk.title })).toBeVisible();
    const tokenSearch = tokenPicker.getByPlaceholder(home.rwlkGrid.searchPlaceholder);
    await tokenSearch.fill('42');
    await expect(tokenSearch).toHaveValue('42');
    await expect(message).toHaveValue(draft);
    await expect(
      panel.locator(isMobile ? '#gesture-submit-sheet' : '#gesture-submit'),
    ).toBeDisabled();

    // Message, advanced options and the action share the form's main column;
    // from tablets up the wallet's standing sits beside it.
    const messageBox = (await panel.getByTestId('gesture-panel-message').boundingBox())!;
    const actionBox = (await panel.getByTestId('gesture-panel-action').boundingBox())!;
    const collapsedBox = (await advanced.boundingBox())!;
    expect(collapsedBox.x).toBeCloseTo(messageBox.x, 0);
    expect(collapsedBox.width).toBeCloseTo(messageBox.width, 0);
    expect(actionBox.x).toBeCloseTo(messageBox.x, 0);
    expect(actionBox.width).toBeCloseTo(messageBox.width, 0);
    if (!isMobile) {
      const standingBox = (await panel.getByTestId('gesture-panel-standing').boundingBox())!;
      expect(messageBox.x + messageBox.width).toBeLessThanOrEqual(standingBox.x);
    }

    await advancedTrigger.click();
    await expect(advancedTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(advanced.getByRole('region')).toBeVisible();
    const expandedBox = (await advanced.boundingBox())!;
    expect(expandedBox.x).toBeCloseTo(messageBox.x, 0);
    expect(expandedBox.width).toBeCloseTo(messageBox.width, 0);
    await expect(message).toHaveValue(draft);
    await expect(tokenSearch).toHaveValue('42');

    // The visible label is the checkbox's name.
    const acceptAnyReward = advanced.getByRole('checkbox', {
      name: home.form.advanced.minCstProtection.acceptAnyTitle,
    });
    await acceptAnyReward.check();
    await expect(acceptAnyReward).toBeChecked();
    const revisedDraft = `${draft} A little more to say.`;
    await message.fill(revisedDraft);
    await expect(message).toBeFocused();

    if (!isMobile) {
      // Reflow must preserve the same live editor and its keyboard focus.
      const viewport = page.viewportSize()!;
      await page.setViewportSize({ width: 720, height: viewport.height });
      await expect(message).toBeFocused();
      await expect(message).toHaveValue(revisedDraft);
      await page.setViewportSize(viewport);
      await expect(message).toBeFocused();
    }

    await advancedTrigger.click();
    await expect(advancedTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(advanced.getByRole('region')).toBeHidden();
    await expect(message).toHaveValue(revisedDraft);
    await expect(tokenSearch).toHaveValue('42');
    await advancedTrigger.click();
    await expect(acceptAnyReward).toBeChecked();
    await expect(message).toHaveValue(revisedDraft);
    if (isMobile) {
      await page.keyboard.press('Escape');
      await expect(inlineMessage).toHaveValue(revisedDraft);
    }
    expect(await page.evaluate(() => window.__mockEthereumRequests ?? [])).not.toContain(
      'eth_sendTransaction',
    );
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
    await expect(connectedPill(page)).toBeVisible({ timeout: 10_000 });
    await expect
      .poll(() => page.evaluate(() => window.__mockEthereumRequests ?? []))
      .toContain('eth_requestAccounts');
  });

  test('home page shows a connect prompt in the gesture area before wallet connection', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // The gesture panel only exists while a cycle is active (see home.spec.ts).
    const clock = page.getByTestId('cycle-clock');
    await expect(clock).toBeVisible({ timeout: 15000 });
    const phase = await clock.getAttribute('data-phase');
    test.skip(
      phase === 'opening-soon' || phase === 'loading' || phase === 'unavailable',
      'the gesture panel is legitimately hidden while no cycle is active',
    );

    // Phones host the one gesture panel in a bottom sheet behind the dock;
    // desktop renders it inline in the stage.
    const isMobile = await page.evaluate(() => window.innerWidth < 1024);
    if (isMobile) {
      const dock = page.getByTestId('dock-open-sheet');
      await expect(dock).toBeVisible({ timeout: 15000 });
      await dock.click();
    }
    const panel = page
      .locator(
        isMobile
          ? '[data-testid="gesture-panel"][data-variant="sheet"]:visible'
          : '[data-testid="gesture-panel"]:visible',
      )
      .first();
    await expect(panel).toBeVisible({ timeout: 15000 });

    const prompt = panel.getByTestId('connect-to-gesture');
    await expect(prompt).toBeVisible();
    // The compact desktop panel keeps its explanation for assistive technology;
    // the mobile sheet also renders the full visible heading.
    await expect(prompt).toContainText(home.orientation.connectHelp);
    if (isMobile) {
      await expect(prompt.getByRole('heading', { name: home.form.connect.title })).toBeVisible();
    }
    await expect(prompt.getByRole('button', { name: /connect/i })).toBeVisible();
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
