import { test, expect } from '@playwright/test';

import { mockMobileAuditApi } from './mobile-audit-fixtures';

declare global {
  interface Window {
    __allocationCls?: number;
  }
}

test.describe('Allocation pages', () => {
  test('allocation list page loads with cycles', async ({ page }) => {
    await page.goto('/allocation', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/Allocation|Cosmic Signature/);
    const response = await page.goto('/allocation');
    expect(response?.status()).toBe(200);
  });

  test('allocation detail page loads for round 1', async ({ page }) => {
    const response = await page.goto('/allocation/1', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });

  test('allocation detail shows recipient info', async ({ page }) => {
    await page.goto('/allocation/1', { waitUntil: 'networkidle' });
    await expect(page.getByText(/Allocation Recipients/i).first()).toBeVisible();
    await expect(page.getByText(/Cycle Recipients/i).first()).toBeVisible();
  });

  test('a finalized cycle’s record keeps its shape while it loads (CLS under 0.1)', async ({
    page,
  }) => {
    await mockMobileAuditApi(page);
    // Late reads, like a congested network: the server-rendered header (title and lede) and
    // the record's skeleton must already hold the space the record fills.
    await page.route('**/api/cosmicgame/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.fallback();
    });
    await page.addInitScript(() => {
      window.__allocationCls = 0;
      if (!PerformanceObserver.supportedEntryTypes.includes('layout-shift')) return;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!shift.hadRecentInput) window.__allocationCls! += shift.value ?? 0;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    const response = await page.goto('/allocation-finalized?cycle=42', { waitUntil: 'load' });
    expect(response?.status()).toBe(200);
    // The record's title is in the server HTML, before any read resolves.
    await expect(page.getByRole('heading', { level: 1, name: /Cycle #42/ })).toBeVisible();
    await expect(page.getByTestId('finalized-signature')).toBeVisible();
    await page.waitForTimeout(1_500);

    const cls = await page.evaluate(() => window.__allocationCls ?? 0);
    expect(cls).toBeLessThan(0.1);
  });

  test('navigating from allocation list to detail works', async ({ page }) => {
    await page.goto('/allocation', { waitUntil: 'networkidle' });
    const firstLink = page.locator('a[href*="/allocation/"]').first();
    if (await firstLink.isVisible()) {
      await firstLink.click();
      await expect(page).toHaveURL(/\/allocation\/\d+/);
    }
  });
});
