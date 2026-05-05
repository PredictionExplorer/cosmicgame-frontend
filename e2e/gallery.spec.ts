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
    await expect(page.getByRole('heading', { name: /NFT Gallery/i })).toBeVisible();
    await expect(page.getByText(/Showing 1 -|There is no NFT yet/i).first()).toBeVisible();
  });

  test('search box is visible and accepts input', async ({ page }) => {
    const searchBox = page.getByRole('textbox', { name: 'Search NFTs' });
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
    const firstCard = page.locator('a[href^="/detail/"]').first();

    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ensureVisible(firstCard);
      await firstCard.click();
      await expect(page).toHaveURL(/detail/);
    } else {
      await expect(page.getByText(/There is no NFT yet/i).first()).toBeVisible();
    }
  });
});
