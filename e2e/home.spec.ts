import { test, expect } from '@playwright/test';

/**
 * End-to-end tests for the dApp home at app.cosmicsignature.com.
 *
 * Since the proxy routes hosts differently, we force Playwright's request
 * Host header to the app subdomain. Without this, `/` serves the landing
 * page instead of the dApp.
 */

// Browsers forbid setting `Host` directly; the proxy reads `X-Forwarded-Host`
// first so this is equivalent.
const APP_HEADERS = { 'X-Forwarded-Host': 'app.cosmicsignature.com' };

/** Scrolls locator into view before interaction/assertion (needed on mobile). */
async function ensureVisible(locator: { scrollIntoViewIfNeeded(): Promise<void> }) {
  await locator.scrollIntoViewIfNeeded();
}

test.describe('dApp home page @ app.cosmicsignature.com', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.setExtraHTTPHeaders(APP_HEADERS);
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('shows cycle info', async ({ page }) => {
    const cycleInfo = page.locator('text=/Round #/');
    await ensureVisible(cycleInfo);
    await expect(cycleInfo).toBeVisible();
  });

  test('shows gesture cost', async ({ page }) => {
    const gestureCost = page.locator('text=/gesture cost/i').first();
    await ensureVisible(gestureCost);
    await expect(gestureCost).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=/ETH/').first()).toBeVisible();
  });

  test('shows main allocation reward', async ({ page }) => {
    const signatureAllocation = page.locator('text=/signature allocation Reward/');
    await ensureVisible(signatureAllocation);
    await expect(signatureAllocation).toBeVisible();
  });

  test('shows last gesture address', async ({ page }) => {
    const lastParticipant = page.locator('text=/Last Participant Address/');
    await ensureVisible(lastParticipant);
    await expect(lastParticipant).toBeVisible();
  });

  test('shows special allocation recipients section', async ({ page }) => {
    const specialAllocations = page
      .locator('text=/Potential recipients of Special Allocations/')
      .first();
    await ensureVisible(specialAllocations);
    await expect(specialAllocations).toBeVisible({ timeout: 15000 });
    const championLabel = page.locator('text=/Endurance Champion/').first();
    await ensureVisible(championLabel);
    await expect(championLabel).toBeVisible();
    const chronoLabel = page.locator('text=/Chrono Warrior/').first();
    await ensureVisible(chronoLabel);
    await expect(chronoLabel).toBeVisible();
  });

  test('ERC721/ERC20 contribution tabs work', async ({ page }) => {
    const erc721Tab = page.locator('role=tab', { hasText: 'ERC721 Tokens' });
    const erc20Tab = page.locator('role=tab', { hasText: 'ERC20 Tokens' });
    await ensureVisible(erc721Tab);

    if (await erc721Tab.isVisible()) {
      await expect(erc721Tab).toHaveAttribute('aria-selected', 'true');
      await erc20Tab.click();
      await expect(erc20Tab).toHaveAttribute('aria-selected', 'true');
      await erc721Tab.click();
      await expect(erc721Tab).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('gesture history pagination works', async ({ page }) => {
    const nextPageBtn = page.locator('role=button', { hasText: 'Go to page 2' }).first();
    if (await nextPageBtn.isVisible()) {
      await ensureVisible(nextPageBtn);
      await nextPageBtn.click();
      await page.waitForTimeout(1000);
      const currentPage = page.locator('role=button[name="page 2"]').first();
      await expect(currentPage).toBeVisible();
    }
  });

  test('NFT grid shows items', async ({ page }) => {
    const nftButtons = page.locator('role=button', { hasText: /^#\d{6}$/ });
    const count = await nftButtons.count();
    if (count > 0) await ensureVisible(nftButtons.first());
    expect(count).toBeGreaterThan(0);
  });

  test('Champion Time / Chrono Warrior toggle buttons exist', async ({ page }) => {
    const section = page.locator('text=/Champion Time|No endurance champions yet/').first();
    await section.waitFor({ state: 'visible', timeout: 15000 });
    await ensureVisible(section);
    const championBtn = page.locator('button', { hasText: 'Champion Time' });
    const chronoBtn = page.locator('button', { hasText: 'Chrono Warrior' });
    if (await championBtn.isVisible()) {
      await ensureVisible(championBtn);
      await chronoBtn.click();
      await page.waitForTimeout(500);
      await championBtn.click();
    }
  });

  test('Recipient History section renders', async ({ page }) => {
    const section = page.locator('text=/History of Winnings/');
    await ensureVisible(section);
    await expect(section).toBeVisible();
  });

  test('Distribution of funds section renders', async ({ page }) => {
    const section = page.locator('text=/Distribution of funds/');
    await ensureVisible(section);
    await expect(section).toBeVisible();
  });

  test('home page metadata description uses lexicon-safe copy', async ({ page }) => {
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!).toContain('procedural on-chain art protocol');
    expect(description!).not.toMatch(/strategy bidding game/i);
  });

  test('header has a cross-host link to the protocol site', async ({ page }) => {
    // On desktop viewports the "Protocol site" chip is visible. On mobile,
    // it lives inside the drawer. Assert at least the anchor exists.
    const links = page.locator('a[href="https://cosmicsignature.com"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});
