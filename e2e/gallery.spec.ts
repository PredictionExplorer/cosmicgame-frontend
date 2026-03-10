import { test, expect } from '@playwright/test';

/** Scrolls locator into view before interaction/assertion (needed on mobile). */
async function ensureVisible(locator: { scrollIntoViewIfNeeded(): Promise<void> }) {
  await locator.scrollIntoViewIfNeeded();
}

test.describe('Gallery page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });
  });

  test('renders NFT cards', async ({ page }) => {
    const nftCards = page.locator('role=button', { hasText: /^#\d{6}$/ });
    const count = await nftCards.count();
    if (count > 0) await ensureVisible(nftCards.first());
    await expect(nftCards.first()).toBeVisible();
    expect(count).toBeGreaterThan(0);
  });

  test('search box is visible and accepts input', async ({ page }) => {
    const searchBox = page.locator('role=textbox[name="Enter NFT ID or Name"]');
    await ensureVisible(searchBox);
    await expect(searchBox).toBeVisible();
    await searchBox.fill('1');
    await expect(searchBox).toHaveValue('1');
  });

  test('pagination works', async ({ page }) => {
    const page2Btn = page.locator('role=button', { hasText: 'Go to page 2' });
    if (await page2Btn.isVisible()) {
      await ensureVisible(page2Btn);
      await page2Btn.click();
      await page.waitForTimeout(1000);
      const activePage = page.locator('role=button[name="page 2"]');
      await ensureVisible(activePage);
      await expect(activePage).toBeVisible();
    }
  });

  test('clicking an NFT card navigates to detail page', async ({ page }) => {
    const firstCard = page.locator('role=button', { hasText: /^#\d{6}$/ }).first();
    await ensureVisible(firstCard);
    await firstCard.click();
    await expect(page).toHaveURL(/detail/);
  });
});
