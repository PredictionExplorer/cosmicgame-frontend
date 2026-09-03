import { expect, test } from '@playwright/test';

import { switchLanguage } from './locale-smoke';

/**
 * Sprint 0 smoke coverage for the Chinese locale (docs/i18n/progress-zh.md).
 *
 * Sprint 1 translates global chrome and shared UI while later-sprint route
 * bodies continue to use English fallback copy.
 *
 * Runs on localhost (neither configured host), which serves the dApp routes
 * without host redirects — same assumption as the other e2e suites.
 */

test.describe('zh locale smoke', () => {
  test('/zh renders the dApp home with lang="zh"', async ({ page }) => {
    await page.goto('/zh');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    // English fallback content still renders — the page must not be blank.
    await expect(page.locator('body')).toContainText(/Cosmic Signature/i);
  });

  test('/zh/gallery renders under the locale prefix', async ({ page }) => {
    await page.goto('/zh/gallery');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    await expect(page).toHaveURL(/\/zh\/gallery$/);
    await expect(page.getByRole('textbox', { name: '搜索 NFT' })).toBeVisible();
    await expect(page.getByRole('button', { name: '搜索', exact: true })).toBeVisible();
  });

  test('/zh/faq renders under the locale prefix', async ({ page }) => {
    await page.goto('/zh/faq');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
  });

  test('internal links keep the /zh prefix', async ({ page }) => {
    await page.goto('/zh/faq');
    // Footer links come from the shared chrome and must be locale-aware.
    const galleryLink = page.locator('footer a[href="/zh/gallery"]').first();
    await expect(galleryLink).toBeAttached();
  });

  test('global app chrome is Chinese and cross-host links carry /zh', async ({ page }) => {
    await page.goto('/zh/faq');

    await expect(page.locator('footer').getByText('服务条款', { exact: true })).toBeVisible();
    await expect(page.locator('footer').getByText('隐私政策', { exact: true })).toBeVisible();

    if ((page.viewportSize()?.width ?? 0) < 1024) {
      await page.getByRole('button', { name: '打开菜单' }).click();
      const drawer = page.getByRole('dialog');
      await expect(drawer.getByText('画廊', { exact: true })).toBeVisible();
      await expect(drawer.getByText('探索', { exact: true })).toBeVisible();
      await expect(drawer.getByText('帮助', { exact: true })).toBeVisible();
      await expect(drawer.getByRole('link', { name: /关于 Cosmic Signature/ })).toHaveAttribute(
        'href',
        'https://cosmicsignature.com/zh/about',
      );
    } else {
      const primary = page.getByRole('navigation', { name: '主导航' });
      await expect(primary.getByText('画廊', { exact: true })).toBeVisible();
      await expect(primary.getByText('探索', { exact: true })).toBeVisible();
      await expect(primary.getByText('帮助', { exact: true })).toBeVisible();
      await primary.getByRole('button', { name: '帮助' }).click();
      await expect(page.getByRole('menuitem', { name: /关于 Cosmic Signature/ })).toHaveAttribute(
        'href',
        'https://cosmicsignature.com/zh/about',
      );
    }
  });

  test('Sprint 1 routes render Chinese copy', async ({ page }) => {
    await page.goto('/zh/site-map');
    await expect(page.getByRole('heading', { level: 1, name: '网站地图' })).toBeVisible();
    await expect(page).toHaveTitle('网站地图 · Cosmic Signature');
    await expect(page.getByText('个人工具', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /关于 Cosmic Signature/ })).toHaveAttribute(
      'href',
      'https://cosmicsignature.com/zh/about',
    );

    await page.goto('/zh/this-page-does-not-exist');
    await expect(page.getByRole('heading', { level: 1, name: /404：找不到页面/ })).toBeVisible();
    await expect(page.getByRole('link', { name: '返回首页' })).toHaveAttribute('href', '/zh');
  });

  test('language switcher round-trips en -> zh -> en and persists the cookie', async ({
    page,
    context,
  }) => {
    await page.goto('/faq');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // Switch to Chinese via the header switcher. Three Chinese locales share
    // the "中文" substring; the helper matches the full label exactly.
    await switchLanguage(page, 'Language', '简体中文');

    await expect(page).toHaveURL(/\/zh\/faq$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');

    // The middleware persists the preference in the NEXT_LOCALE cookie.
    await expect
      .poll(async () => {
        const cookies = await context.cookies();
        return cookies.find((cookie) => cookie.name === 'NEXT_LOCALE')?.value;
      })
      .toBe('zh');

    // A later visit to the unprefixed URL redirects to the preferred locale.
    await page.goto('/faq');
    await expect(page).toHaveURL(/\/zh\/faq$/);

    // Switch back to English.
    await switchLanguage(page, '语言', 'English');

    // NOTE: a bare /\/faq$/ regex would also match the OLD /zh/faq URL and
    // let assertions run before the navigation lands — match exactly.
    await page.waitForURL((url) => url.pathname === '/faq');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect
      .poll(async () => {
        const cookies = await context.cookies();
        return cookies.find((cookie) => cookie.name === 'NEXT_LOCALE')?.value;
      })
      .toBe('en');

    // The preference must survive a full reload on the unprefixed URL.
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('English URLs are unchanged and stay lang="en"', async ({ page }) => {
    await page.goto('/faq');
    await expect(page).toHaveURL(/\/faq$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
