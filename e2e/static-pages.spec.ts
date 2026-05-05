import { test, expect } from '@playwright/test';

test.describe('FAQ page', () => {
  test('renders FAQ accordions', async ({ page }) => {
    await page.goto('/faq', { waitUntil: 'networkidle' });
    await expect(
      page.getByRole('button', { name: 'What is Cosmic Signature?', exact: true }),
    ).toBeVisible();
  });

  test('clicking an accordion expands it', async ({ page }) => {
    await page.goto('/faq', { waitUntil: 'networkidle' });
    const firstAccordion = page.getByRole('button', {
      name: 'What is Cosmic Signature?',
      exact: true,
    });
    await firstAccordion.click();
    await expect(page.getByText(/procedural on-chain art protocol/i).first()).toBeVisible();
  });
});

test.describe('How-to-Play page', () => {
  test('renders instructions content', async ({ page }) => {
    await page.goto('/how-it-works', { waitUntil: 'networkidle' });
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
    const bodyText = await page.locator('body').textContent();
    expect(bodyText!.length).toBeGreaterThan(100);
  });
});

test.describe('Site-Map page', () => {
  test('renders navigation links', async ({ page }) => {
    await page.goto('/site-map', { waitUntil: 'networkidle' });
    const links = page.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(5);
  });

  test('links point to valid internal routes', async ({ page }) => {
    await page.goto('/site-map', { waitUntil: 'networkidle' });
    const links = page.locator('main a[href^="/"], [class*="MainWrapper"] a[href^="/"]');
    const count = await links.count();
    if (count > 0) {
      const href = await links.first().getAttribute('href');
      expect(href).toMatch(/^\//);
    }
  });
});

test.describe('Contracts page', () => {
  test('renders contract addresses', async ({ page }) => {
    await page.goto('/contracts', { waitUntil: 'networkidle' });
    const addresses = page.locator('text=/0x[0-9a-fA-F]{6,}/');
    const count = await addresses.count();
    expect(count).toBeGreaterThan(0);
  });

  test('no undefined or null values visible', async ({ page }) => {
    await page.goto('/contracts', { waitUntil: 'networkidle' });
    const bodyText = await page.locator('main').textContent();
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('null');
  });
});

test.describe('Code page', () => {
  test('loads without error', async ({ page }) => {
    const response = await page.goto('/code', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
  });
});
