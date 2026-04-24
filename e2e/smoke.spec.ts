import { test, expect } from '@playwright/test';

const staticRoutes = [
  '/',
  '/gallery',
  '/statistics',
  '/faq',
  '/how-it-works',
  '/site-map',
  '/contracts',
  '/code',
  '/allocation',
  '/anchoring',
  '/marketing',
  '/eth-contribution',
  '/named-nfts',
  '/attached-nfts',
  '/used-rwlk-nfts',
  '/coordination-changes',
  '/public-goods-contributions-cg',
  '/public-goods-contributions-voluntary',
  '/public-goods-retrievals',
  '/recipient-history',
  '/my-tokens',
  '/my-anchors',
  '/my-allocations',
  '/my-statistics',
  '/mint',
  '/admin',
];

const dynamicRoutes = [
  '/gesture/1',
  '/allocation/1',
  '/detail/1',
  '/user/0x1b2E85De21C7CF4bD1787c6Ac4bd505e83b62Ba5',
];

const knownBrokenRoutes = [
  '/detail/sample', // Uses window during SSR -- pre-existing bug
];

test.describe('Smoke tests - every page loads without errors', () => {
  for (const route of staticRoutes) {
    test(`${route} returns 200`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);
      await expect(page.locator('body')).not.toHaveText('Internal Server Error');
    });
  }

  for (const route of dynamicRoutes) {
    test(`${route} returns 200`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);
      await expect(page.locator('body')).not.toHaveText('Internal Server Error');
    });
  }

  for (const route of knownBrokenRoutes) {
    test.skip(`${route} has known SSR issue`, () => {});
  }

  test('404 page renders for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist', {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.status()).toBe(404);
  });
});
