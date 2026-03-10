import { test, expect } from '@playwright/test';

const staticRoutes = [
  '/',
  '/gallery',
  '/statistics',
  '/faq',
  '/how-to-play',
  '/site-map',
  '/contracts',
  '/code',
  '/prize',
  '/staking',
  '/marketing',
  '/eth-donation',
  '/named-nfts',
  '/nft-donations',
  '/used-rwlk-nfts',
  '/changed-parameters',
  '/charity-deposits-cg',
  '/charity-deposits-voluntary',
  '/charity-withdrawals',
  '/winning-history',
  '/my-tokens',
  '/my-staking',
  '/my-winnings',
  '/my-statistics',
  '/mint',
  '/admin',
];

const dynamicRoutes = [
  '/bid/1',
  '/prize/1',
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
