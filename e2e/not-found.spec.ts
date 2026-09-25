import { expect, test } from '@playwright/test';

/**
 * The 404 for a URL no route matches (app/global-not-found.tsx) is a whole
 * document rendered on the server: styled, dark from the first paint and
 * complete without script. It once arrived as an empty error shell with no
 * stylesheet, a white page until the app bundle hydrated, and nothing at all
 * for readers without script, crawlers and link unfurlers. An id page with
 * an id it turns away (/detail/abc) gets the same 404 from proxy.ts, since
 * the page's own notFound() would arrive as that empty shell.
 */
const LANDING_HEADERS = { 'X-Forwarded-Host': 'cosmicsignature.com' };

test.use({ javaScriptEnabled: false });

for (const { host, path, lang, headers } of [
  { host: 'app', path: '/quality-assurance-route-not-found', lang: 'en', headers: {} },
  { host: 'app', path: '/ja/quality-assurance-route-not-found', lang: 'ja', headers: {} },
  { host: 'app', path: '/zh/detail/abc', lang: 'zh', headers: {} },
  { host: 'app', path: '/allocation/01', lang: 'en', headers: {} },
  {
    host: 'landing',
    path: '/quality-assurance-route-not-found',
    lang: 'en',
    headers: LANDING_HEADERS,
  },
  {
    host: 'landing',
    path: '/learn/quality-assurance-not-found',
    lang: 'en',
    headers: LANDING_HEADERS,
  },
]) {
  test(`${host} ${path} renders the designed 404 without script`, async ({ context, page }) => {
    await context.setExtraHTTPHeaders(headers);
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    expect(new URL(page.url()).pathname).toBe(path);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);

    const main = page.getByRole('main');
    await expect(main.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByTestId('not-found-plate')).toBeVisible();
    await expect(page.getByRole('banner')).toHaveCount(1);
    await expect(page.getByRole('contentinfo')).toHaveCount(1);
    await expect(page.locator('link[rel="stylesheet"]').first()).toBeAttached();

    // The page ground is the palette's, not the browser's white.
    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const [red = 255, green = 255, blue = 255] = (background.match(/\d+/g) ?? []).map(Number);
    expect(Math.max(red, green, blue), background).toBeLessThan(48);
  });
}

/**
 * With script the 404 hydrates in place: one document load, and the display
 * and text faces stay loaded after a scroll. A phone capture of the old 404
 * lost its fonts after the first scroll, the sign of a second document load
 * or a dropped font-face on the not-found boundary.
 */
test.describe('with script', () => {
  test.use({ javaScriptEnabled: true, viewport: { width: 390, height: 844 } });

  test('keeps one document and its fonts after hydration and a scroll', async ({ page }) => {
    const response = await page.goto('/quality-assurance-route-not-found');
    expect(response?.status()).toBe(404);
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.wheel(0, 2400);
    await page.waitForTimeout(500);

    const state = await page.evaluate(() => {
      const firstFamily = (element: Element) =>
        getComputedStyle(element).fontFamily.split(',')[0]!.trim().replace(/['"]/g, '');
      const loaded = (family: string) =>
        [...document.fonts].some(
          (face) => face.family.replace(/['"]/g, '') === family && face.status === 'loaded',
        );
      const heading = document.querySelector('h1')!;
      return {
        documents: performance.getEntriesByType('navigation').length,
        display: loaded(firstFamily(heading)),
        text: loaded(firstFamily(document.body)),
        scrolled: window.scrollY > 0,
      };
    });
    expect(state).toEqual({ documents: 1, display: true, text: true, scrolled: true });
  });

  test('keeps the address of a malformed id page once it hydrates', async ({ page }) => {
    const response = await page.goto('/zh/detail/abc');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(new URL(page.url()).pathname).toBe('/zh/detail/abc');
  });
});
