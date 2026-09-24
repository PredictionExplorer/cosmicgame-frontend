import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { mockMobileAuditApi } from './mobile-audit-fixtures';
import { waitForStableLayout } from './mobile-audit-helpers';

const CST_UNISWAP_SWAP_URL =
  'https://app.uniswap.org/swap?chain=arbitrum&inputCurrency=NATIVE&outputCurrency=0xAD91843e6A58Ba560F577E676986AFb1dba6FBA0';
const AXIOM_ZERO_URL = 'https://www.axiomzero.market/cosmic-signature';
const CHAOS_ZERO_URL = 'https://chaoszero.com';

/** Below 1024px the header's navigation moves into the drawer. */
async function usesDrawer(page: Page): Promise<boolean> {
  return page.evaluate(() => window.innerWidth < 1024);
}

async function openDrawer(page: Page) {
  await page.getByRole('banner').getByRole('button', { name: 'Open menu' }).click();
  const drawer = page.getByRole('dialog', { name: 'Navigation' });
  await drawer.waitFor({ state: 'visible' });
  return drawer;
}

/**
 * The ecosystem links: menu items in the Explore panel's strip, or links in
 * the drawer's Ecosystem section.
 */
async function openEcosystemSurface(page: Page) {
  if (await usesDrawer(page)) {
    const drawer = await openDrawer(page);
    await drawer.getByText('Ecosystem', { exact: true }).click();
    return { surface: drawer, role: 'link' as const };
  }
  await page.getByRole('button', { name: /^Explore$/ }).click();
  return { surface: page.getByRole('menu', { name: 'Explore' }), role: 'menuitem' as const };
}

test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await mockMobileAuditApi(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStableLayout(page);
  });

  test('ecosystem links sit behind the main menu and open in a new tab', async ({ page }) => {
    const { surface, role } = await openEcosystemSurface(page);

    for (const [name, href] of [
      ['Trade CST on Uniswap', CST_UNISWAP_SWAP_URL],
      ['Axiom Zero', AXIOM_ZERO_URL],
      ['Chaos Zero', CHAOS_ZERO_URL],
    ] as const) {
      const link = surface.getByRole(role, { name: `${name} (opens in a new tab)` });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', href);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  test('primary navigation leads with the Observatory and marks the current page', async ({
    page,
  }) => {
    test.skip(await usesDrawer(page), 'The inline navigation starts at 1024px');

    const nav = page.getByRole('banner').getByRole('navigation', { name: 'Primary' });
    const observatory = nav.getByRole('link', { name: 'Observatory' });
    await expect(observatory).toHaveAttribute('href', '/');
    await expect(observatory).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Gallery' })).toHaveAttribute('href', '/gallery');
    await expect(nav.getByRole('button', { name: /^Explore$/ })).toBeVisible();
    await expect(nav.getByRole('button', { name: /^Learn$/ })).toBeVisible();

    await page.goto('/statistics/participation', { waitUntil: 'domcontentloaded' });
    await expect(nav.getByRole('button', { name: /^Explore$/ })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  test('Explore panel describes destinations and lists Public Goods', async ({ page }) => {
    test.skip(await usesDrawer(page), 'Rich panels are a desktop affordance');

    await page.getByRole('button', { name: /^Explore$/ }).click();
    const menu = page.getByRole('menu');
    await expect(menu.getByRole('menuitem', { name: /Current Cycle/ })).toBeVisible();
    await expect(
      menu.getByText('The live cycle in full: every gesture and standing'),
    ).toBeVisible();
    await expect(menu.getByRole('menuitem', { name: /^Statistics/ })).toHaveAttribute(
      'href',
      '/statistics',
    );
    await expect(menu.getByRole('menuitem', { name: /Public Goods/ })).toBeVisible();
  });

  test('Learn panel reaches Security and Risk Disclosures', async ({ page }) => {
    test.skip(await usesDrawer(page), 'Rich panels are a desktop affordance');

    await page.getByRole('button', { name: /^Learn$/ }).click();
    const menu = page.getByRole('menu');
    await expect(menu.getByRole('menuitem', { name: /^Security/ })).toHaveAttribute(
      'href',
      '/security',
    );
    await expect(menu.getByRole('menuitem', { name: /^Risk Disclosures/ })).toHaveAttribute(
      'href',
      '/risk-disclosures',
    );
  });

  test('the wordmark is visible at every width', async ({ page }) => {
    const home = page.getByRole('banner').getByRole('link', { name: 'Cosmic Signature home' });
    await expect(home).toBeVisible();
    await expect(home.getByText(/Cosmic\s*Signature/)).toBeVisible();
  });

  test('the command palette jumps straight to a token', async ({ page }) => {
    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog', { name: 'Search Cosmic Signature' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('combobox').fill('25');
    // A bare number offers the token first, then the cycle and the gesture.
    await expect(dialog.getByRole('option', { name: /^Signature #0*25\b/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(dialog.getByRole('option', { name: /^Cycle #25\b/ })).toBeVisible();
    await page.keyboard.press('Enter');
    await page.waitForURL('**/detail/25');
  });

  test('phone drawer groups the taxonomy into sections, preferences last', async ({ page }) => {
    test.skip(!(await usesDrawer(page)), 'The drawer replaces the inline navigation below 1024px');

    const banner = page.getByRole('banner');
    // Preferences live in the drawer, so the phone header keeps room for the wordmark.
    await expect(banner.getByRole('button', { name: /language/i })).toBeHidden();

    const drawer = await openDrawer(page);
    for (const section of ['Participate', 'Collection', 'Explore', 'Records', 'Learn', 'Trust']) {
      await expect(drawer.getByText(section, { exact: true })).toBeVisible();
    }
    await expect(drawer.getByRole('link', { name: 'Observatory' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(drawer.locator('a[href="/gallery"]')).toBeVisible();
    await expect(drawer.getByText('Preferences', { exact: true })).toBeVisible();
  });
});
