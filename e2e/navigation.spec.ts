import { test, expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

/**
 * Where each destination lives in the navigation taxonomy (config/siteNav.ts):
 * the header panel that holds it from 1024px, and the drawer section below.
 * Destinations without a panel sit directly in the header bar.
 */
const DESTINATIONS: Record<string, { panel?: 'Explore' | 'Learn'; section: string }> = {
  '/gallery': { section: 'Collection' },
  '/statistics': { panel: 'Explore', section: 'Explore' },
  '/allocation': { panel: 'Explore', section: 'Records' },
  '/anchoring': { panel: 'Explore', section: 'Records' },
  '/faq': { panel: 'Learn', section: 'Learn' },
  '/how-it-works': { panel: 'Learn', section: 'Learn' },
  '/contracts': { panel: 'Learn', section: 'Trust' },
  '/security': { panel: 'Learn', section: 'Trust' },
  '/risk-disclosures': { panel: 'Learn', section: 'Trust' },
};

async function usesDrawer(page: Page): Promise<boolean> {
  return page.evaluate(() => window.innerWidth < 1024);
}

/** Opens a `<details>` disclosure by its summary text, unless it is already open. */
async function openDisclosure(root: Locator, title: string): Promise<void> {
  const details = root.locator('details', {
    has: root.page().locator('summary', { hasText: new RegExp(`^${title}$`) }),
  });
  if ((await details.first().getAttribute('open')) === null) {
    await details.first().locator('summary').click();
  }
}

/** Follows a destination the way a visitor would: header panel, or drawer section. */
async function navigateTo(page: Page, href: string): Promise<void> {
  const destination = DESTINATIONS[href];
  if (!destination) throw new Error(`No navigation entry for ${href}`);
  // Menus and the drawer animate out: one still closing from the last
  // navigation reads as open, and its links detach mid-click. Let it go first.
  await expect(
    page.locator('[role="menu"][data-state="closed"], [role="dialog"][data-state="closed"]'),
  ).toHaveCount(0);

  let link: Locator;
  if (await usesDrawer(page)) {
    const trigger = page.getByRole('banner').getByRole('button', { name: /^Open menu/ });
    const drawer = page.getByRole('dialog', { name: 'Navigation' });
    // A tap that lands before hydration only focuses the button; try again.
    await expect(async () => {
      if (!(await drawer.isVisible())) await trigger.click();
      await expect(drawer).toBeVisible({ timeout: 2000 });
    }).toPass();
    await openDisclosure(drawer, destination.section);
    link = drawer.locator(`a[href="${href}"]`).first();
  } else if (destination.panel) {
    const trigger = page
      .getByRole('banner')
      .getByRole('button', { name: new RegExp(`^${destination.panel}$`) });
    const menu = page.getByRole('menu', { name: destination.panel });
    // A click that lands before hydration only focuses the trigger; try again.
    await expect(async () => {
      if (!(await menu.isVisible())) await trigger.click();
      await expect(menu).toBeVisible({ timeout: 2000 });
    }).toPass();
    link = menu.locator(`a[href="${href}"]`).first();
  } else {
    link = page.getByRole('banner').locator(`a[href="${href}"]`).first();
  }
  await link.waitFor({ state: 'visible' });
  await link.click();
}

/** The footer's groups fold behind their headings on phones; unfold the group first. */
async function footerLink(page: Page, group: string, href: string): Promise<Locator> {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const footer = page.getByRole('contentinfo');
  const toggle = footer.getByRole('button', { name: group, exact: true });
  if (await toggle.isVisible()) {
    if ((await toggle.getAttribute('aria-expanded')) === 'false') await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  }
  return footer.locator(`a[href="${href}"]`).first();
}

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('Gallery link navigates correctly', async ({ page }) => {
    await navigateTo(page, '/gallery');
    await expect(page).toHaveURL(/gallery/);
    await expect(page).toHaveTitle(/Gallery/);
  });

  test('Contracts link navigates correctly', async ({ page }) => {
    await navigateTo(page, '/contracts');
    await expect(page).toHaveURL(/contracts/);
  });

  test('Statistics link navigates correctly', async ({ page }) => {
    await navigateTo(page, '/statistics');
    await expect(page).toHaveURL(/statistics/);
  });

  test('Explore menu leads to the allocation recipients', async ({ page }) => {
    await navigateTo(page, '/allocation');
    await expect(page).toHaveURL(/allocation/);
  });

  test('Explore menu leads to the anchor distributions', async ({ page }) => {
    await navigateTo(page, '/anchoring');
    await expect(page).toHaveURL(/anchoring/);
  });

  test('Learn menu leads to the FAQ', async ({ page }) => {
    await navigateTo(page, '/faq');
    await expect(page).toHaveURL(/faq/);
  });

  test('Learn menu leads to How It Works', async ({ page }) => {
    await navigateTo(page, '/how-it-works');
    await expect(page).toHaveURL(/how-it-works/);
  });

  test('Security and Risk Disclosures are one step from any page', async ({ page }) => {
    await navigateTo(page, '/security');
    await expect(page).toHaveURL(/security/);
    await navigateTo(page, '/risk-disclosures');
    await expect(page).toHaveURL(/risk-disclosures/);
  });

  test('Footer has Terms, Privacy, and Site-Map links', async ({ page }) => {
    await expect(await footerLink(page, 'Trust', '/site-map')).toBeVisible();
    const footer = page.getByRole('contentinfo');
    await expect(footer.locator('a[href="/terms"]').first()).toBeVisible();
    await expect(footer.locator('a[href="/privacy"]').first()).toBeVisible();
  });

  test('Footer Site-Map link navigates correctly', async ({ page }) => {
    const link = await footerLink(page, 'Trust', '/site-map');
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/site-map/);
  });

  test('Logo link navigates to home', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'domcontentloaded' });
    const logoLink = page.getByRole('banner').getByRole('link', { name: 'Cosmic Signature home' });
    await logoLink.waitFor({ state: 'visible', timeout: 10000 });
    await Promise.all([page.waitForURL('/'), logoLink.click()]);
    await expect(page).toHaveURL('/');
  });

  test('Browser back navigation works', async ({ page }) => {
    await navigateTo(page, '/gallery');
    await expect(page).toHaveURL(/gallery/);
    await page.goBack();
    await expect(page).toHaveURL('/');
  });
});
