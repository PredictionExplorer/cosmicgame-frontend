import { expect, test, type Page } from '@playwright/test';

import { routing } from './locale-fixtures';
import { mockMobileAuditApi } from './mobile-audit-fixtures';
import { collectOverflowViolations, waitForStableLayout } from './mobile-audit-helpers';

async function expectChromeFits(page: Page) {
  const violations = await collectOverflowViolations(page);
  expect(violations).toEqual([]);

  const outsideViewport = await page.locator('header a, header button').evaluateAll((controls) =>
    controls.flatMap((control) => {
      const rect = control.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return [];
      return rect.left < -1 || rect.right > document.documentElement.clientWidth + 1
        ? [control.textContent?.trim() || control.getAttribute('aria-label')]
        : [];
    }),
  );
  expect(outsideViewport).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await mockMobileAuditApi(page);
});

for (const locale of routing.locales) {
  test(`shared chrome fits phones, tablets, laptops and desktops in ${locale}`, async ({
    page,
  }) => {
    await page.goto(`${locale === 'en' ? '' : `/${locale}`}/faq`, {
      waitUntil: 'domcontentloaded',
    });
    await waitForStableLayout(page);

    for (const width of [320, 375, 640, 820, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await expectChromeFits(page);
      const menu = page.locator('header button[aria-haspopup="dialog"]');
      if (width < 1280) await expect(menu).toBeVisible();
      else await expect(menu).toBeHidden();
    }
  });
}

test('drawer fits a small phone, returns focus and resets after a desktop resize', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/faq', { waitUntil: 'domcontentloaded' });
  await waitForStableLayout(page);
  const menu = page.getByRole('button', { name: 'menu', exact: true });
  await menu.click();
  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();
  await expect(drawer.locator('a[href="/gallery"]')).toBeInViewport();
  expect(
    await drawer.evaluate((element) => element.getBoundingClientRect().width),
  ).toBeLessThanOrEqual(320);
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(menu).toBeFocused();

  await menu.click();
  await expect(drawer).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(drawer).toBeHidden();
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(drawer).toBeHidden();
});

test('phone navigation fits in the server-rendered page before hydration', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 320, height: 568 },
  });
  const page = await context.newPage();
  try {
    await page.goto('/faq', { waitUntil: 'load' });
    await expect(page.getByRole('button', { name: 'menu', exact: true })).toBeVisible();
    await expect(page.locator('header a[href="/gallery"]')).toBeHidden();
    await expectChromeFits(page);
  } finally {
    await context.close();
  }
});
