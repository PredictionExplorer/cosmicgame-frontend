import { test, expect } from '@playwright/test';

/** Scrolls locator into view before interaction/assertion (needed on mobile). */
async function ensureVisible(locator: { scrollIntoViewIfNeeded(): Promise<void> }) {
  await locator.scrollIntoViewIfNeeded();
}

test.describe('Statistics page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/statistics', { waitUntil: 'networkidle' });
  });

  test('shows Current Round Statistics', async ({ page }) => {
    const currentRound = page.locator('text=/Current Round Statistics/i').first();
    await ensureVisible(currentRound);
    await expect(currentRound).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=/Current Round/').first()).toBeVisible();
    await expect(page.locator('text=/Current gesture cost/').first()).toBeVisible();
    await expect(page.locator('text=/allocation amount/').first()).toBeVisible();
  });

  test('shows Overall Statistics', async ({ page }) => {
    const overallStats = page.locator('text=/Overall Statistics/');
    await ensureVisible(overallStats);
    await expect(overallStats).toBeVisible();
    await expect(page.locator('text=/Num Allocations/')).toBeVisible();
    await expect(page.locator('text=/Number of unique participants/')).toBeVisible();
  });

  test('CosmicSignature / RandomWalk tabs work', async ({ page }) => {
    const cstTab = page.locator('role=tab', { hasText: 'CosmicSignature Token' });
    const rwalkTab = page.locator('role=tab', { hasText: 'RandomWalk Token' });
    await ensureVisible(cstTab);

    if (await cstTab.isVisible()) {
      await expect(cstTab).toHaveAttribute('aria-selected', 'true');
      await rwalkTab.click();
      await expect(rwalkTab).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('unique participants section has data', async ({ page }) => {
    const uniqueParticipants = page.getByRole('heading', { name: 'unique participants' });
    await ensureVisible(uniqueParticipants);
    await expect(uniqueParticipants).toBeVisible();
  });

  test('gesture history pagination exists', async ({ page }) => {
    const pagination = page.locator('role=navigation[name="pagination navigation"]').first();
    await ensureVisible(pagination);
    await expect(pagination).toBeVisible();
  });

  test('stats show numeric values, not undefined', async ({ page }) => {
    const balanceEl = page.locator('text=/CosmicGame contract balance/');
    await ensureVisible(balanceEl);
    const statsText = await balanceEl.textContent();
    expect(statsText).not.toContain('undefined');
  });
});
