import { test, expect } from '@playwright/test';

import { MOBILE_AUDIT_SAMPLE_TEXT, mockMobileAuditApi } from './mobile-audit-fixtures';

// lexicon-allow-start: the fixture mirrors sealed backend wire keys.
/** A participant with history in every profile section, at the widest figures the UI takes. */
const POPULATED_PROFILE = {
  UserInfo: {
    Address: MOBILE_AUDIT_SAMPLE_TEXT.longAddress,
    NumBids: 12_345,
    NumPrizes: 87,
    MaxBidAmount: 1.2345678,
    MaxWinAmount: 123.4567891,
    CosmicSignatureNumTransfers: 42,
    TotalCSTokensWon: 1_234_567.891,
    SumRaffleEthWinnings: 12.3456789,
    SumRaffleEthWithdrawal: 98.7654321,
    UnclaimedNFTs: 3,
    NumRaffleEthWinnings: 64,
    RaffleNFTsCount: 21,
    RewardNFTsCount: 9,
    StakingStatisticsRWalk: {
      TotalNumStakeActions: 30,
      TotalNumUnstakeActions: 12,
      TotalTokensStaked: 18,
      TotalTokensMinted: 5,
    },
  },
  Gestures: [],
};
// lexicon-allow-end

async function expectNoHorizontalPageOverflow(page: import('@playwright/test').Page) {
  const { bodyWidth, viewportWidth } = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
}

async function openStatisticsAnchorActions(page: import('@playwright/test').Page) {
  const anchoringHeading = page.getByRole('heading', { level: 1, name: 'Anchoring statistics' });
  await anchoringHeading.scrollIntoViewIfNeeded();
  await expect(anchoringHeading).toBeVisible();

  const cstTab = page.getByRole('tab', { name: /Cosmic Signature NFT/i });
  const rwlkTab = page.getByRole('tab', { name: /Random ?Walk NFT/i });
  await expect(cstTab).toBeVisible();
  await rwlkTab.click();
  await expect(rwlkTab).toHaveAttribute('aria-selected', 'true');
  await cstTab.click();
  await expect(cstTab).toHaveAttribute('aria-selected', 'true');

  const actions = page.getByRole('heading', { name: /Anchor \/ release actions/i }).first();
  await actions.scrollIntoViewIfNeeded();
  await expect(actions).toBeVisible();
}

/** No child widens the layout viewport past the device (the fixed header sizes against it). */
async function expectLayoutViewportFits(page: import('@playwright/test').Page) {
  const { clientWidth, viewportWidth } = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(clientWidth).toBe(viewportWidth);
}

/**
 * Opens the navigation drawer from the menu button at the header's end. A tap
 * before hydration is dropped, so it retries until the drawer is open.
 */
async function openDrawer(page: import('@playwright/test').Page) {
  const menuButton = page.getByRole('banner').getByRole('button', { name: /^Open menu/ });
  await expect(async () => {
    await menuButton.click({ timeout: 5_000 });
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 30_000 });
}

test.describe('Responsive - Mobile viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('hamburger menu is visible at 375px width', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const menuButton = page.getByRole('banner').getByRole('button', { name: /^Open menu/ });
    await menuButton.scrollIntoViewIfNeeded();
    await expect(menuButton).toBeVisible();
  });

  test('opening hamburger menu shows navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openDrawer(page);
    const galleryLink = page.getByRole('dialog').locator('a[href="/gallery"]');
    await galleryLink.scrollIntoViewIfNeeded();
    await expect(galleryLink).toBeVisible();
  });

  test('mobile menu navigation works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openDrawer(page);
    const galleryLink = page.getByRole('dialog').locator('a[href="/gallery"]');
    await galleryLink.scrollIntoViewIfNeeded();
    await galleryLink.click();
    await expect(page).toHaveURL(/gallery/);
  });

  test('home page renders without horizontal overflow at 375px', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expectNoHorizontalPageOverflow(page);
  });

  test('gallery page renders on mobile', async ({ page }) => {
    const response = await page.goto('/gallery', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });

  test('statistics page renders on mobile', async ({ page }) => {
    const response = await page.goto('/statistics', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
    await expectNoHorizontalPageOverflow(page);
    await expectLayoutViewportFits(page);
  });

  test('a participant profile never widens the phone layout viewport', async ({ page }) => {
    // Regression (F139): a wide child on a populated profile widened the layout viewport,
    // so the fixed header pushed Connect off screen while scrollWidth still looked fine.
    // Deterministic: the dense table fixtures plus a populated user/info, not a live address.
    await mockMobileAuditApi(page);
    await page.route('**/api/cosmicgame/**', async (route) => {
      if (!new URL(route.request().url()).pathname.includes('/user/info/')) {
        await route.fallback();
        return;
      }
      await route.fulfill({ json: POPULATED_PROFILE });
    });
    const response = await page.goto(`/user/${MOBILE_AUDIT_SAMPLE_TEXT.longAddress}`, {
      waitUntil: 'networkidle',
    });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Populated: the fixture's gesture count is on the page.
    await expect(page.getByText('12,345').first()).toBeVisible();
    await expectLayoutViewportFits(page);
  });

  test('statistics activity keeps its charts and controls inside 375px', async ({ page }) => {
    const response = await page.goto('/statistics/activity', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    const cycle = page.getByRole('heading', { level: 2, name: 'One cycle in detail' });
    await cycle.scrollIntoViewIfNeeded();
    await expect(cycle).toBeVisible();
    await expectNoHorizontalPageOverflow(page);
    await expectLayoutViewportFits(page);
  });

  test('statistics anchoring remains readable without page overflow at 375px', async ({ page }) => {
    const response = await page.goto('/statistics/anchoring', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await openStatisticsAnchorActions(page);
    await expect(page.getByText(/No anchor actions yet|Anchor|Release/i).first()).toBeVisible();
    await expectNoHorizontalPageOverflow(page);
  });

  test('FAQ accordions work at 375px width', async ({ page }) => {
    await page.goto('/faq', { waitUntil: 'networkidle' });
    const firstAccordion = page.getByRole('button', {
      name: 'What is Cosmic Signature?',
      exact: true,
    });
    await firstAccordion.scrollIntoViewIfNeeded();
    await firstAccordion.click();
    await expect(page.getByText(/procedural on-chain art protocol/i).first()).toBeVisible();
  });
});

test.describe('Responsive - Tablet viewport', () => {
  test.use({ viewport: { width: 820, height: 1180 } });

  test('statistics anchoring remains readable without page overflow at medium width', async ({
    page,
  }) => {
    const response = await page.goto('/statistics/anchoring', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await openStatisticsAnchorActions(page);
    await expectNoHorizontalPageOverflow(page);
  });
});
