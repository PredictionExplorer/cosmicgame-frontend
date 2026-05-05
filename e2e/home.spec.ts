import { test, expect } from '@playwright/test';

/**
 * End-to-end tests for the dApp home at app.cosmicsignature.com.
 *
 * Localhost intentionally serves the dApp by default. Avoid forcing
 * `X-Forwarded-Host` here: Playwright applies extra headers to browser fetches
 * too, which can break API CORS preflights against the remote dev API.
 */

/** Scrolls locator into view before interaction/assertion (needed on mobile). */
async function ensureVisible(locator: { scrollIntoViewIfNeeded(): Promise<void> }) {
  await locator.scrollIntoViewIfNeeded();
}

test.describe('dApp home page @ app.cosmicsignature.com', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('shows cycle info', async ({ page }) => {
    const cycleInfo = page.locator('text=/Cycle #/');
    await ensureVisible(cycleInfo);
    await expect(cycleInfo).toBeVisible();
  });

  test('shows gesture cost', async ({ page }) => {
    const gestureCost = page.locator('text=/ETH Gesture/i').first();
    await ensureVisible(gestureCost);
    await expect(gestureCost).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=/ETH/').first()).toBeVisible();
  });

  test('shows main allocation reward', async ({ page }) => {
    const signatureAllocation = page.locator('text=/Signature Allocation/i').first();
    await ensureVisible(signatureAllocation);
    await expect(signatureAllocation).toBeVisible();
  });

  test('shows last gesture address', async ({ page }) => {
    const lastParticipant = page.locator('text=/Last Participant/i').first();
    await ensureVisible(lastParticipant);
    await expect(lastParticipant).toBeVisible();
  });

  test('shows special allocation recipients section', async ({ page }) => {
    const specialAllocations = page.getByText('Special Allocation Leaders').first();
    await ensureVisible(specialAllocations);
    await expect(specialAllocations).toBeVisible({ timeout: 15000 });
    const championLabel = page.getByText('Endurance Champion').first();
    await ensureVisible(championLabel);
    await expect(championLabel).toBeVisible();
    const chronoLabel = page.getByText(/Chrono-Warrior|Chrono Warrior/i).first();
    await ensureVisible(chronoLabel);
    await expect(chronoLabel).toBeVisible();
  });

  test('ERC721/ERC20 contribution tabs work', async ({ page }) => {
    const erc721Tab = page.locator('role=tab', { hasText: 'ERC721 Tokens' });
    const erc20Tab = page.locator('role=tab', { hasText: 'ERC20 Tokens' });
    if (await erc721Tab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ensureVisible(erc721Tab);
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
    const latestNfts = page.locator("text=/Latest NFT's/i").first();
    await ensureVisible(latestNfts);
    await expect(latestNfts).toBeVisible();
  });

  test('special allocation leader labels exist', async ({ page }) => {
    const section = page.getByText(/Endurance Champion|No holder yet/i).first();
    await section.waitFor({ state: 'visible', timeout: 15000 });
    await ensureVisible(section);
    await expect(page.getByText(/Chrono-Warrior|Chrono Warrior/i).first()).toBeVisible();
  });

  test('Recipient History section renders', async ({ page }) => {
    const section = page.getByText(/Gesture history, leaderboards/i).first();
    await ensureVisible(section);
    await expect(section).toBeVisible();
  });

  test('Distribution of funds section renders', async ({ page }) => {
    const section = page.locator('text=/Allocation Breakdown|Distribution of funds/').first();
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
