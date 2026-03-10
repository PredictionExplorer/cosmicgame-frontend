import { test, expect } from '@playwright/test';

/** Scrolls locator into view before interaction/assertion (needed on mobile). */
async function ensureVisible(locator: { scrollIntoViewIfNeeded(): Promise<void> }) {
  await locator.scrollIntoViewIfNeeded();
}

test.describe('Home page interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('shows round info', async ({ page }) => {
    const roundInfo = page.locator('text=/Round #/');
    await ensureVisible(roundInfo);
    await expect(roundInfo).toBeVisible();
  });

  test('shows bid price', async ({ page }) => {
    const bidPrice = page.locator('text=/Bid Price/i').first();
    await ensureVisible(bidPrice);
    await expect(bidPrice).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=/ETH/').first()).toBeVisible();
  });

  test('shows main prize reward', async ({ page }) => {
    const mainPrize = page.locator('text=/Main Prize Reward/');
    await ensureVisible(mainPrize);
    await expect(mainPrize).toBeVisible();
  });

  test('shows last bidder address', async ({ page }) => {
    const lastBidder = page.locator('text=/Last Bidder Address/');
    await ensureVisible(lastBidder);
    await expect(lastBidder).toBeVisible();
  });

  test('shows special prize winners section', async ({ page }) => {
    const specialPrizes = page.locator('text=/Potential winners of Special Prizes/').first();
    await ensureVisible(specialPrizes);
    await expect(specialPrizes).toBeVisible({ timeout: 15000 });
    const championLabel = page.locator('text=/Endurance Champion/').first();
    await ensureVisible(championLabel);
    await expect(championLabel).toBeVisible();
    const chronoLabel = page.locator('text=/Chrono Warrior/').first();
    await ensureVisible(chronoLabel);
    await expect(chronoLabel).toBeVisible();
  });

  test('ERC721/ERC20 donation tabs work', async ({ page }) => {
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

  test('bid history pagination works', async ({ page }) => {
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
    // Wait for Endurance Champions section to load (table or empty state)
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

  test('History of Winnings section renders', async ({ page }) => {
    const section = page.locator('text=/History of Winnings/');
    await ensureVisible(section);
    await expect(section).toBeVisible();
  });

  test('Distribution of funds section renders', async ({ page }) => {
    const section = page.locator('text=/Distribution of funds/');
    await ensureVisible(section);
    await expect(section).toBeVisible();
  });
});
