import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const CST_UNISWAP_SWAP_URL =
  'https://app.uniswap.org/swap?chain=arbitrum&inputCurrency=NATIVE&outputCurrency=0xAD91843e6A58Ba560F577E676986AFb1dba6FBA0';
const AXIOM_ZERO_URL = 'https://www.axiomzero.market/cosmic-signature';
const CHAOS_ZERO_URL = 'https://chaoszero.com';

async function isMobile(page: Page): Promise<boolean> {
  return page.evaluate(() => window.innerWidth < 1024);
}

/** Returns the container holding the ecosystem links for the active layout. */
async function openEcosystemSurface(page: Page) {
  if (await isMobile(page)) {
    await page.getByRole('button', { name: 'menu' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    return dialog;
  }
  return page.getByRole('group', { name: 'Cosmic Signature ecosystem' });
}

test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('shows the ecosystem destinations with correct targets', async ({ page }) => {
    const surface = await openEcosystemSurface(page);

    const uniswap = surface.getByRole('link', { name: 'Trade CST on Uniswap' }).first();
    await expect(uniswap).toBeVisible();
    await expect(uniswap).toHaveAttribute('href', CST_UNISWAP_SWAP_URL);

    const axiom = surface.getByRole('link', { name: 'Axiom Zero NFT marketplace' }).first();
    await expect(axiom).toBeVisible();
    await expect(axiom).toHaveAttribute('href', AXIOM_ZERO_URL);
    await expect(axiom).toContainText('Axiom Zero');

    const chaos = surface.getByRole('link', { name: 'Make predictions on Chaos Zero' }).first();
    await expect(chaos).toBeVisible();
    await expect(chaos).toHaveAttribute('href', CHAOS_ZERO_URL);
    await expect(chaos).toContainText('Chaos Zero');
  });

  test('ecosystem links open in a new tab with safe rel attributes', async ({ page }) => {
    const surface = await openEcosystemSurface(page);

    for (const name of [
      'Trade CST on Uniswap',
      'Axiom Zero NFT marketplace',
      'Make predictions on Chaos Zero',
    ]) {
      const link = surface.getByRole('link', { name }).first();
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  test('Explore panel shows descriptions for destinations (desktop)', async ({ page }) => {
    test.skip(await isMobile(page), 'Rich panels are a desktop affordance');

    await page.getByRole('button', { name: /^Explore$/ }).click();
    const menu = page.locator('[role="menu"]');
    await expect(menu.getByRole('menuitem', { name: /Current Cycle/ })).toBeVisible();
    await expect(menu.getByText('Live gestures shaping the active cycle')).toBeVisible();
    await expect(menu.getByRole('menuitem', { name: /Statistics/ })).toHaveAttribute(
      'href',
      '/statistics',
    );
  });

  test('brand wordmark is visible on wide viewports', async ({ page }) => {
    test.skip(await isMobile(page), 'Wordmark pairs with the desktop layout');

    await page.setViewportSize({ width: 1440, height: 900 });
    const home = page.getByRole('link', { name: 'Cosmic Signature home' });
    await expect(home).toBeVisible();
    await expect(home).toContainText('Cosmic Signature');
  });

  test('mobile drawer groups navigation into labelled sections', async ({ page }) => {
    test.skip(!(await isMobile(page)), 'Drawer is a mobile affordance');

    await page.getByRole('button', { name: 'menu' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Protocol', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Explore', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Help', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Ecosystem', { exact: true })).toBeVisible();
    await expect(dialog.locator('a[href="/gallery"]')).toBeVisible();
  });
});
