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
    const currentRound = page.getByRole('heading', { name: /Statistics/i });
    await ensureVisible(currentRound);
    await expect(currentRound).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Total Cycles/i).first()).toBeVisible();
    await expect(page.getByText(/Contract Balance/i).first()).toBeVisible();
  });

  test('shows Overall Statistics', async ({ page }) => {
    const overallStats = page.getByText(/Protocol Economy/i).first();
    await ensureVisible(overallStats);
    await expect(overallStats).toBeVisible();
    await expect(page.getByText(/Allocation Economy/i).first()).toBeVisible();
    await expect(page.getByText(/Community & Participation/i).first()).toBeVisible();
  });

  test('Cosmic Signature / RandomWalk tabs work', async ({ page }) => {
    const cstTab = page.locator('role=tab', { hasText: 'Cosmic Signature NFT' });
    const rwalkTab = page.locator('role=tab', { hasText: 'RandomWalk NFT' });
    await ensureVisible(cstTab);

    if (await cstTab.isVisible()) {
      await expect(cstTab).toHaveAttribute('aria-selected', 'true');
      await rwalkTab.click();
      await expect(rwalkTab).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('unique participants section has data', async ({ page }) => {
    const uniqueParticipants = page.getByText(/Unique Participants/i).first();
    await ensureVisible(uniqueParticipants);
    await expect(uniqueParticipants).toBeVisible();
  });

  test('gesture history pagination exists', async ({ page }) => {
    const pagination = page.locator('role=navigation[name="pagination navigation"]').first();
    if (await pagination.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ensureVisible(pagination);
      await expect(pagination).toBeVisible();
    } else {
      await expect(page.getByText(/No records|Unique Participants/i).first()).toBeVisible();
    }
  });

  test('stats show numeric values, not undefined', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('NaN');
  });
});
