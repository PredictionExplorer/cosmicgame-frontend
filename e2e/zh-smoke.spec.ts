import { expect, test } from '@playwright/test';

/**
 * Sprint 0 smoke coverage for the Chinese locale (docs/i18n/progress.md).
 *
 * At this stage /zh renders ENGLISH fallback copy — these tests assert the
 * i18n plumbing (routing, lang attribute, switcher, cookie persistence), not
 * translations. Translation assertions arrive with Sprints 1+.
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

  test('language switcher round-trips en -> zh -> en and persists the cookie', async ({
    page,
    context,
  }) => {
    await page.goto('/faq');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // Switch to Chinese via the footer switcher.
    const switcher = page.getByRole('button', { name: 'Language' }).last();
    await switcher.scrollIntoViewIfNeeded();
    await switcher.click();
    await page.getByRole('menuitem', { name: '中文' }).click();

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
    const zhSwitcher = page.getByRole('button', { name: 'Language' }).last();
    await zhSwitcher.scrollIntoViewIfNeeded();
    await zhSwitcher.click();
    await page.getByRole('menuitem', { name: 'English' }).click();

    await expect(page).toHaveURL(/\/faq$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('English URLs are unchanged and stay lang="en"', async ({ page }) => {
    await page.goto('/faq');
    await expect(page).toHaveURL(/\/faq$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
