import { expect, test, type Locator, type Page } from '@playwright/test';

import { LOCALE_CHROME, LOCALE_LABELS, TRANSLATED_LOCALES, routing } from './locale-fixtures';

type TranslatedLocale = (typeof TRANSLATED_LOCALES)[number];

/**
 * Opens the header language menu (trigger named `label`) and returns it.
 *
 * The pill lives in the header only — the footer carries the crawlable
 * language directory — and the header is server-rendered in its desktop
 * layout, then re-rendered for phones once React has hydrated. A locator
 * resolved before that swap points at a detached button, and a click before
 * hydration is dropped by a menu that has not mounted yet, so the trigger is
 * re-resolved (visible instances only) and the click retried until the menu
 * is actually open.
 */
export async function openLanguageMenu(page: Page, label: string): Promise<Locator> {
  const menu = page.getByRole('menu');
  await expect(async () => {
    const trigger = page.getByRole('button', { name: label }).filter({ visible: true }).first();
    await trigger.click({ timeout: 5_000 });
    await expect(menu).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 30_000 });
  return menu;
}

/** Switches language through the header menu: `label` names the trigger, `option` the language. */
export async function switchLanguage(page: Page, label: string, option: string): Promise<void> {
  const menu = await openLanguageMenu(page, label);
  await menu.getByRole('menuitemradio', { name: option, exact: true }).click();
}

/**
 * Smoke coverage for one translated locale: the locale prefix serves both
 * hosts' routes with the right `lang`, the shared chrome (nav, footer, 404,
 * site map) is translated, internal and cross-host links keep the prefix,
 * and the language switcher round-trips through the locale while the
 * NEXT_LOCALE cookie persists the choice.
 *
 * Runs on localhost (neither configured host), which serves the dApp routes
 * without host redirects — same assumption as the other e2e suites.
 */
export function defineLocaleSmoke(locale: TranslatedLocale): void {
  const chrome = LOCALE_CHROME[locale];
  const prefix = `/${locale}`;
  const englishChrome = { switcherLabel: 'Language', switcherOption: 'English' };

  test.describe(`${locale} locale smoke`, () => {
    test(`${prefix} renders the dApp home with lang="${locale}"`, async ({ page }) => {
      await page.goto(prefix);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
      await expect(page.locator('body')).toContainText(/Cosmic Signature/i);
      await expect(page.locator('body')).toContainText(chrome.script);
    });

    test(`${prefix}/gallery and ${prefix}/faq render under the locale prefix`, async ({ page }) => {
      await page.goto(`${prefix}/gallery`);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page).toHaveURL(new RegExp(`${prefix}/gallery$`));

      await page.goto(`${prefix}/faq`);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      // Footer links come from the shared chrome and must be locale-aware.
      await expect(page.locator(`footer a[href="${prefix}/gallery"]`).first()).toBeAttached();
    });

    test(`global app chrome is translated and cross-host links carry ${prefix}`, async ({
      page,
    }) => {
      await page.goto(`${prefix}/faq`);

      const footer = page.locator('footer');
      await expect(footer.getByText(chrome.footer.terms, { exact: true })).toBeVisible();
      await expect(footer.getByText(chrome.footer.privacy, { exact: true })).toBeVisible();

      if ((page.viewportSize()?.width ?? 0) < 1024) {
        await page.getByRole('button', { name: chrome.nav.openMenu }).click();
        const drawer = page.getByRole('dialog');
        await expect(drawer.getByText(chrome.nav.gallery, { exact: true })).toBeVisible();
        await expect(drawer.getByText(chrome.nav.explore, { exact: true })).toBeVisible();
        await expect(drawer.getByText(chrome.nav.help, { exact: true })).toBeVisible();
        await expect(drawer.getByRole('link', { name: chrome.nav.aboutPattern })).toHaveAttribute(
          'href',
          `https://cosmicsignature.com${prefix}/about`,
        );
      } else {
        const primary = page.getByRole('navigation', { name: chrome.nav.primaryLabel });
        await expect(primary.getByText(chrome.nav.gallery, { exact: true })).toBeVisible();
        await expect(primary.getByText(chrome.nav.explore, { exact: true })).toBeVisible();
        await expect(primary.getByText(chrome.nav.help, { exact: true })).toBeVisible();
        await primary.getByRole('button', { name: chrome.nav.help }).click();
        await expect(page.getByRole('menuitem', { name: chrome.nav.aboutPattern })).toHaveAttribute(
          'href',
          `https://cosmicsignature.com${prefix}/about`,
        );
      }
    });

    test('site map and 404 render translated copy', async ({ page }) => {
      await page.goto(`${prefix}/site-map`);
      await expect(
        page.getByRole('heading', { level: 1, name: chrome.siteMap.heading }),
      ).toBeVisible();
      await expect(page).toHaveTitle(chrome.siteMap.title);
      await expect(page.getByText(chrome.siteMap.section, { exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: chrome.nav.aboutPattern })).toHaveAttribute(
        'href',
        `https://cosmicsignature.com${prefix}/about`,
      );

      await page.goto(`${prefix}/this-page-does-not-exist`);
      await expect(
        page.getByRole('heading', { level: 1, name: chrome.notFound.headingPattern }),
      ).toBeVisible();
      await expect(page.getByRole('link', { name: chrome.notFound.homeLink })).toHaveAttribute(
        'href',
        prefix,
      );
    });

    test(`language switcher round-trips en -> ${locale} -> en and persists the cookie`, async ({
      page,
      context,
    }) => {
      await page.goto('/faq');
      await expect(page.locator('html')).toHaveAttribute('lang', routing.defaultLocale);

      await switchLanguage(page, englishChrome.switcherLabel, chrome.switcherOption);

      await expect(page).toHaveURL(new RegExp(`${prefix}/faq$`));
      await expect(page.locator('html')).toHaveAttribute('lang', locale);

      // The middleware persists the preference in the NEXT_LOCALE cookie.
      await expect
        .poll(async () => {
          const cookies = await context.cookies();
          return cookies.find((cookie) => cookie.name === 'NEXT_LOCALE')?.value;
        })
        .toBe(locale);

      // A later visit to the unprefixed URL redirects to the preferred locale.
      await page.goto('/faq');
      await expect(page).toHaveURL(new RegExp(`${prefix}/faq$`));

      // Switch back to English.
      await switchLanguage(page, chrome.switcherLabel, englishChrome.switcherOption);

      // A bare /\/faq$/ regex would also match the OLD prefixed URL — match exactly.
      await page.waitForURL((url) => url.pathname === '/faq');
      await expect(page.locator('html')).toHaveAttribute('lang', routing.defaultLocale);
      await expect
        .poll(async () => {
          const cookies = await context.cookies();
          return cookies.find((cookie) => cookie.name === 'NEXT_LOCALE')?.value;
        })
        .toBe(routing.defaultLocale);

      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('lang', routing.defaultLocale);
    });

    test('the footer language directory links every locale to the same page', async ({
      page,
      context,
    }) => {
      await page.goto(`${prefix}/faq`);
      const directory = page.locator('footer').getByRole('navigation', {
        name: chrome.switcherLabel,
      });
      await directory.scrollIntoViewIfNeeded();

      // Server-rendered anchors at the canonical URL of every edition — the
      // same URLs the hreflang alternates advertise, and the one place a
      // crawler or a no-JS reader discovers the other languages from.
      const links = directory.getByRole('link');
      await expect(links).toHaveCount(routing.locales.length);
      for (const candidate of routing.locales) {
        const link = directory.getByRole('link', { name: LOCALE_LABELS[candidate], exact: true });
        const candidatePrefix = candidate === routing.defaultLocale ? '' : `/${candidate}`;
        await expect(link).toHaveAttribute('href', `${candidatePrefix}/faq`);
        await expect(link).toHaveAttribute('hreflang', candidate);
        await expect(link).toHaveAttribute('lang', candidate);
      }
      await expect(
        directory.getByRole('link', { name: chrome.switcherOption, exact: true }),
      ).toHaveAttribute('aria-current', 'true');

      // A plain click behaves like the pill: same route, cookie persisted.
      await directory
        .getByRole('link', { name: englishChrome.switcherOption, exact: true })
        .click();
      await page.waitForURL((url) => url.pathname === '/faq');
      await expect(page.locator('html')).toHaveAttribute('lang', routing.defaultLocale);
      await expect
        .poll(async () => {
          const cookies = await context.cookies();
          return cookies.find((cookie) => cookie.name === 'NEXT_LOCALE')?.value;
        })
        .toBe(routing.defaultLocale);
    });

    test('switching between two translated locales keeps the route', async ({ page }) => {
      const other = TRANSLATED_LOCALES.find((candidate) => candidate !== locale);
      test.skip(!other, 'needs a second translated locale');
      const otherChrome = LOCALE_CHROME[other!];

      await page.goto(`${prefix}/gallery`);
      await switchLanguage(page, chrome.switcherLabel, otherChrome.switcherOption);

      await expect(page).toHaveURL(new RegExp(`/${other}/gallery$`));
      await expect(page.locator('html')).toHaveAttribute('lang', other!);
    });

    test('English URLs are unchanged and stay lang="en"', async ({ page }) => {
      await page.goto('/faq');
      await expect(page).toHaveURL(/\/faq$/);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    });
  });
}
