import { test, expect } from '@playwright/test';

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
    await galleryLink.evaluate((element) => (element as HTMLAnchorElement).click());
    await expect(page).toHaveURL(/gallery/);
  });

  test('home page renders without horizontal overflow at 375px', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
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
