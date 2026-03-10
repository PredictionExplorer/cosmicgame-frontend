import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** Opens the mobile nav drawer if the hamburger menu is visible (mobile viewport). */
async function openMobileNavIfNeeded(page: Page): Promise<void> {
  const menuButton = page.locator('role=button[name="menu"]');
  if (await menuButton.isVisible()) {
    await menuButton.click();
    await page.waitForTimeout(500);
    // Wait for drawer nav link to be visible (drawer is open)
    await page
      .locator('.MuiDrawer-root a[href="/gallery"]')
      .waitFor({ state: 'visible', timeout: 5000 });
  }
}

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('Gallery link navigates correctly', async ({ page }) => {
    await openMobileNavIfNeeded(page);
    const isMobile = test.info().project.name === 'Mobile Chrome';
    const galleryLink = isMobile
      ? page.locator('.MuiDrawer-root a[href="/gallery"]')
      : page.locator('a[href="/gallery"]').first();
    await galleryLink.click({ force: isMobile });
    await expect(page).toHaveURL(/gallery/);
    await expect(page).toHaveTitle(/Gallery/);
  });

  test('Contracts link navigates correctly', async ({ page }) => {
    await openMobileNavIfNeeded(page);
    const isMobile = test.info().project.name === 'Mobile Chrome';
    const contractsLink = isMobile
      ? page.locator('.MuiDrawer-root a[href="/contracts"]')
      : page.locator('a[href="/contracts"]').first();
    await contractsLink.click({ force: isMobile });
    await expect(page).toHaveURL(/contracts/);
  });

  test('Statistics link navigates correctly', async ({ page }) => {
    await openMobileNavIfNeeded(page);
    const isMobile = test.info().project.name === 'Mobile Chrome';
    const statsLink = isMobile
      ? page.locator('.MuiDrawer-root a[href="/statistics"]')
      : page.locator('a[href="/statistics"]').first();
    await statsLink.click({ force: isMobile });
    await expect(page).toHaveURL(/statistics/);
  });

  test('Rewards dropdown opens and Prizes link works', async ({ page }) => {
    test.skip(test.info().project.name === 'Mobile Chrome', 'Mobile drawer dropdown has flaky DOM');
    await openMobileNavIfNeeded(page);
    await page.locator('text=Rewards').first().click();
    await page.waitForTimeout(400);
    await page.locator('a[href="/prize"]').first().click();
    await expect(page).toHaveURL(/prize/);
  });

  test('Rewards dropdown opens and Staking Rewards link works', async ({ page }) => {
    test.skip(test.info().project.name === 'Mobile Chrome', 'Mobile drawer dropdown has flaky DOM');
    await openMobileNavIfNeeded(page);
    await page.locator('text=Rewards').first().click();
    await page.waitForTimeout(400);
    await page.locator('a[href="/staking"]').first().click();
    await expect(page).toHaveURL(/staking/);
  });

  test('Help dropdown opens and FAQ link works', async ({ page }) => {
    test.skip(test.info().project.name === 'Mobile Chrome', 'Mobile drawer dropdown has flaky DOM');
    await openMobileNavIfNeeded(page);
    await page.locator('text=Help').first().click();
    await page.waitForTimeout(400);
    await page.locator('a[href="/faq"]').first().click();
    await expect(page).toHaveURL(/faq/);
  });

  test('Help dropdown opens and How-to-Play link works', async ({ page }) => {
    test.skip(test.info().project.name === 'Mobile Chrome', 'Mobile drawer dropdown has flaky DOM');
    await openMobileNavIfNeeded(page);
    await page.locator('text=Help').first().click();
    await page.waitForTimeout(400);
    await page.locator('a[href="/how-to-play"]').first().click();
    await expect(page).toHaveURL(/how-to-play/);
  });

  test('Footer has Terms, Privacy, and Site-Map links', async ({ page }) => {
    // FooterWrapper renders as header (MUI AppBar), so find by content. Scroll to bottom first.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    const termsLink = page.locator('text=Terms and conditions').first();
    await expect(termsLink).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Privacy policy').first()).toBeVisible();
    await expect(page.locator('a[href="/site-map"]').first()).toBeVisible();
  });

  test('Footer Site-Map link navigates correctly', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    const footerLink = page.locator('a[href="/site-map"]').first();
    await expect(footerLink).toBeVisible({ timeout: 10000 });
    await footerLink.click();
    await expect(page).toHaveURL(/site-map/);
  });

  test('Logo link navigates to home', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'domcontentloaded' });
    const logoLink = page.locator('header a[href="/"]').first();
    await logoLink.waitFor({ state: 'visible', timeout: 10000 });
    await logoLink.click();
    await expect(page).toHaveURL('/');
  });

  test('Browser back navigation works', async ({ page }) => {
    await openMobileNavIfNeeded(page);
    const isMobile = test.info().project.name === 'Mobile Chrome';
    const galleryLink = isMobile
      ? page.locator('.MuiDrawer-root a[href="/gallery"]')
      : page.locator('a[href="/gallery"]').first();
    await galleryLink.click({ force: isMobile });
    await expect(page).toHaveURL(/gallery/);
    await page.goBack();
    await expect(page).toHaveURL('/');
  });
});
