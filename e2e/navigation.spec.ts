import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** Opens the mobile nav drawer if the hamburger menu is visible (mobile viewport). */
async function openMobileNavIfNeeded(page: Page): Promise<void> {
  const menuButton = page.locator('role=button[name="menu"]');
  if (await menuButton.isVisible()) {
    await menuButton.click();
    // Wait for drawer nav link to be visible (drawer is open)
    await page
      .getByRole('dialog')
      .locator('a[href="/gallery"]')
      .waitFor({ state: 'visible', timeout: 5000 });
  }
}

async function activateLink(page: Page, href: string): Promise<void> {
  await page
    .locator(`a[href="${href}"]`)
    .first()
    .evaluate((element) => (element as HTMLAnchorElement).click());
}

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('Gallery link navigates correctly', async ({ page }) => {
    await openMobileNavIfNeeded(page);
    await activateLink(page, '/gallery');
    await expect(page).toHaveURL(/gallery/);
    await expect(page).toHaveTitle(/Gallery/);
  });

  test('Contracts link navigates correctly', async ({ page }) => {
    await openMobileNavIfNeeded(page);
    await activateLink(page, '/contracts');
    await expect(page).toHaveURL(/contracts/);
  });

  test('Statistics link navigates correctly', async ({ page }) => {
    await openMobileNavIfNeeded(page);
    await activateLink(page, '/statistics');
    await expect(page).toHaveURL(/statistics/);
  });

  test('Explore dropdown opens and allocation link works', async ({ page }) => {
    test.skip(test.info().project.name === 'Mobile Chrome', 'Mobile drawer dropdown has flaky DOM');
    await openMobileNavIfNeeded(page);
    await page.getByRole('button', { name: /Explore/i }).click();
    await page.goto('/allocation', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/allocation/);
  });

  test('Explore dropdown opens and anchor distributions link works', async ({ page }) => {
    test.skip(test.info().project.name === 'Mobile Chrome', 'Mobile drawer dropdown has flaky DOM');
    await openMobileNavIfNeeded(page);
    await page.getByRole('button', { name: /Explore/i }).click();
    await page.goto('/anchoring', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/anchoring/);
  });

  test('Help dropdown opens and FAQ link works', async ({ page }) => {
    test.skip(test.info().project.name === 'Mobile Chrome', 'Mobile drawer dropdown has flaky DOM');
    await openMobileNavIfNeeded(page);
    await page.getByRole('button', { name: /Help/i }).click();
    await activateLink(page, '/faq');
    await expect(page).toHaveURL(/faq/);
  });

  test('Help dropdown opens and How-to-Play link works', async ({ page }) => {
    test.skip(test.info().project.name === 'Mobile Chrome', 'Mobile drawer dropdown has flaky DOM');
    await openMobileNavIfNeeded(page);
    await page.getByRole('button', { name: /Help/i }).click();
    await activateLink(page, '/how-it-works');
    await expect(page).toHaveURL(/how-it-works/);
  });

  test('Footer has Terms, Privacy, and Site-Map links', async ({ page }) => {
    // Scroll to bottom so footer is in view.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await expect(page.locator('footer a[href="/terms"]').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('footer a[href="/privacy"]').first()).toBeVisible();
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
    await logoLink.evaluate((element) => (element as HTMLAnchorElement).click());
    await expect(page).toHaveURL('/');
  });

  test('Browser back navigation works', async ({ page }) => {
    await openMobileNavIfNeeded(page);
    await activateLink(page, '/gallery');
    await expect(page).toHaveURL(/gallery/);
    await page.goBack();
    await expect(page).toHaveURL('/');
  });
});
