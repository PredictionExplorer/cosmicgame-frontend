import { test, expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

/** Opens the mobile nav drawer if the hamburger menu is visible (mobile viewport). */
async function openMobileNavIfNeeded(page: Page): Promise<void> {
  const isMobileViewport = await page.evaluate(() => window.innerWidth < 1024);
  if (!isMobileViewport) return;

  const menuButton = page.getByRole('button', { name: 'menu' });
  await menuButton.waitFor({ state: 'visible', timeout: 15000 });
  await menuButton.click();
  // Wait for drawer nav link to be visible (drawer is open)
  await page
    .getByRole('dialog')
    .locator('a[href="/gallery"]')
    .waitFor({ state: 'visible', timeout: 5000 });
}

async function activateLink(page: Page, href: string): Promise<void> {
  const isMobileViewport = await page.evaluate(() => window.innerWidth < 1024);
  let link: Locator;
  if (isMobileViewport) {
    link = page.getByRole('dialog').locator(`a[href="${href}"]:visible`).first();
  } else {
    link = page.locator(`header a[href="${href}"]:visible`).first();
    if (!(await link.isVisible().catch(() => false))) {
      const openMenuLink = page.locator(`[role="menu"] a[href="${href}"]:visible`).first();
      if (await openMenuLink.isVisible().catch(() => false)) {
        link = openMenuLink;
      }
    }
    if (!(await link.isVisible().catch(() => false))) {
      const groupName =
        href === '/faq' || href === '/how-it-works'
          ? /Help/i
          : ['/allocation', '/anchoring', '/marketing', '/statistics', '/contracts'].includes(href)
            ? /Explore/i
            : null;
      if (groupName) {
        const trigger = page.getByRole('button', { name: groupName }).first();
        await trigger.waitFor({ state: 'visible', timeout: 10000 });
        const menuLink = page.locator(`[role="menu"] a[href="${href}"]:visible`).first();
        for (let attempt = 0; attempt < 2; attempt += 1) {
          await trigger.click();
          await menuLink.waitFor({ state: 'visible', timeout: 3000 }).catch(() => undefined);
          if (await menuLink.isVisible().catch(() => false)) {
            link = menuLink;
            break;
          }
        }
      }
    }
  }
  await link.waitFor({ state: 'visible' });
  await link.click();
}

async function openNavGroupIfPresent(
  page: Page,
  name: RegExp,
  expectedHref?: string,
): Promise<void> {
  const isMobileViewport = await page.evaluate(() => window.innerWidth < 1024);
  const root = isMobileViewport ? page.getByRole('dialog') : page;
  const groupButton = root.getByRole('button', { name }).first();
  if (await groupButton.isVisible().catch(() => false)) {
    await groupButton.click();
    if (!isMobileViewport && expectedHref) {
      await page
        .locator(`[role="menu"] a[href="${expectedHref}"]:visible`)
        .first()
        .waitFor({ state: 'visible', timeout: 5000 })
        .catch(() => undefined);
    }
  }
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
    await openNavGroupIfPresent(page, /Explore/i, '/statistics');
    await activateLink(page, '/statistics');
    await expect(page).toHaveURL(/statistics/);
  });

  test('Explore dropdown opens and allocation link works', async ({ page }) => {
    await openMobileNavIfNeeded(page);
    await openNavGroupIfPresent(page, /Explore/i, '/allocation');
    await activateLink(page, '/allocation');
    await expect(page).toHaveURL(/allocation/);
  });

  test('Explore dropdown opens and anchor distributions link works', async ({ page }) => {
    await openMobileNavIfNeeded(page);
    await openNavGroupIfPresent(page, /Explore/i, '/anchoring');
    await activateLink(page, '/anchoring');
    await expect(page).toHaveURL(/anchoring/);
  });

  test('Help dropdown opens and FAQ link works', async ({ page }) => {
    await openMobileNavIfNeeded(page);
    await openNavGroupIfPresent(page, /Help/i, '/faq');
    await activateLink(page, '/faq');
    await expect(page).toHaveURL(/faq/);
  });

  test('Help dropdown opens and How-to-Play link works', async ({ page }) => {
    await openMobileNavIfNeeded(page);
    await openNavGroupIfPresent(page, /Help/i, '/how-it-works');
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
    await logoLink.click();
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
