import { test, expect } from '@playwright/test';

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

test.describe('Responsive - Mobile viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('hamburger menu is visible at 375px width', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const menuButton = page.locator('role=button[name="menu"]');
    await menuButton.scrollIntoViewIfNeeded();
    await expect(menuButton).toBeVisible();
  });

  test('opening hamburger menu shows navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const menuButton = page.locator('role=button[name="menu"]');
    await menuButton.scrollIntoViewIfNeeded();
    await menuButton.click();
    await page.waitForTimeout(500);
    const galleryLink = page.getByRole('dialog').locator('a[href="/gallery"]');
    await galleryLink.scrollIntoViewIfNeeded();
    await expect(galleryLink).toBeVisible();
  });

  test('mobile menu navigation works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const menuButton = page.locator('role=button[name="menu"]');
    await menuButton.scrollIntoViewIfNeeded();
    await menuButton.click();
    await page.waitForTimeout(500);
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
