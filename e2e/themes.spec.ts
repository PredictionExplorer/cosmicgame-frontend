import { expect, test, type Page } from '@playwright/test';

import { SITE_THEMES, THEME_COOKIE_NAME, THEME_STORAGE_KEY } from '../lib/theme/config';
import common from '../messages/en/common.json';

import { mockMobileAuditApi } from './mobile-audit-fixtures';

const label = common.themeSwitcher.label;
const landingHeaders = { 'X-Forwarded-Host': 'cosmicsignature.com' };

async function chooseTheme(page: Page, theme: (typeof SITE_THEMES)[number]) {
  const name = common.themeSwitcher.themes[theme].name;
  const headerButton = page.getByRole('button', { name: label, exact: true });
  // A click that lands before hydration is dropped, so open until the popup is up.
  if (await headerButton.isVisible()) {
    const option = page.getByRole('menuitemradio', { name: new RegExp(`^${name}`) });
    await expect(async () => {
      if (!(await option.isVisible())) await headerButton.click();
      await expect(option).toBeVisible({ timeout: 2_000 });
    }).toPass();
    await option.click();
  } else {
    // Phones (both hosts): the palette lives in the menu sheet, not the header.
    const menuButton = page.getByRole('banner').getByRole('button', { name: /^Open menu/ });
    const sheet = page.getByRole('dialog', { name: 'Navigation' });
    await expect(async () => {
      if (!(await sheet.isVisible())) await menuButton.click();
      await expect(sheet).toBeVisible({ timeout: 2_000 });
    }).toPass();
    await sheet.getByRole('radio', { name, exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
  }
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

/** Where the palette is reached: the header's menu on wide screens, the menu button on phones. */
function paletteEntry(page: Page, isMobile: boolean) {
  return isMobile
    ? page.getByRole('banner').getByRole('button', { name: /^Open menu/ })
    : page.getByRole('button', { name: label, exact: true });
}

async function assertPaletteContrast(page: Page) {
  const contrasts = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement);
    type Rgb = readonly [number, number, number];
    const color = (token: string): Rgb => {
      const [h, s, l] = css.getPropertyValue(token).trim().split(/\s+/).map(parseFloat);
      const sat = s! / 100;
      const light = l! / 100;
      const a = sat * Math.min(light, 1 - light);
      const channel = (n: number) => {
        const k = (n + h! / 30) % 12;
        return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      };
      return [channel(0), channel(8), channel(4)];
    };
    const luminance = ([red, green, blue]: Rgb) => {
      const linear = (value: number) =>
        value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      return linear(red) * 0.2126 + linear(green) * 0.7152 + linear(blue) * 0.0722;
    };
    const ratio = (a: Rgb, b: Rgb) => {
      const first = luminance(a);
      const second = luminance(b);
      return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
    };
    const pairs = ['--background', '--card', '--popover', '--muted', '--accent'].flatMap(
      (surface) =>
        ['--foreground', '--muted-foreground', '--primary', '--secondary'].map((ink) => ({
          pair: `${ink} on ${surface}`,
          value: ratio(color(ink), color(surface)),
        })),
    );
    const primary = color('--primary');
    const secondary = color('--secondary');
    // The signature gradient explicitly interpolates in sRGB. Its middle can
    // be darker than either endpoint, so check its full path for text and CTAs.
    for (let percent = 0; percent <= 100; percent++) {
      const mix = (index: 0 | 1 | 2) =>
        primary[index] + (secondary[index] - primary[index]) * (percent / 100);
      const sample: Rgb = [mix(0), mix(1), mix(2)];
      for (const surface of ['--background', '--card', '--popover', '--primary-foreground']) {
        pairs.push({
          pair: `signature gradient at ${percent}% against ${surface}`,
          value: ratio(sample, color(surface)),
        });
      }
    }
    return pairs;
  });
  for (const { pair, value } of contrasts) expect(value, pair).toBeGreaterThanOrEqual(4.5);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockMobileAuditApi(page);
});

for (const host of ['app', 'landing'] as const) {
  test(`${host}: every palette is readable, responsive and remembered`, async ({
    page,
    context,
    isMobile,
  }, testInfo) => {
    await page.setViewportSize({ width: isMobile ? 320 : 1440, height: 1000 });
    if (host === 'landing') await context.setExtraHTTPHeaders(landingHeaders);
    const hydrationErrors: string[] = [];
    page.on('console', (message) => {
      if (/hydration|did not match|MISSING_MESSAGE/i.test(message.text()))
        hydrationErrors.push(message.text());
    });
    await page.goto('/');
    const logoColors = new Set<string>();
    for (const theme of SITE_THEMES) {
      await chooseTheme(page, theme);
      await assertPaletteContrast(page);
      if (host === 'app') {
        const backdrop = page.locator('[data-ambient-backdrop]');
        await expect(backdrop).toBeVisible();
        // Reduced motion should stop movement, not remove the static palette.
        expect(
          await backdrop.evaluate((element) =>
            [element, ...element.querySelectorAll('*')].some((layer) =>
              getComputedStyle(layer).backgroundImage.includes('radial-gradient('),
            ),
          ),
        ).toBe(true);
      }
      const logos = page.locator('[data-brand-mark]');
      await expect(logos.first()).toBeVisible();
      const paints = await logos.evaluateAll((elements) =>
        elements.map((element) => {
          const style = getComputedStyle(element);
          return { color: style.backgroundColor, artwork: style.maskImage };
        }),
      );
      expect(paints.length).toBeGreaterThanOrEqual(2);
      for (const paint of paints) {
        expect(paint.artwork).toContain('/images/logo2.svg');
        expect(paint.color).not.toBe('rgba(0, 0, 0, 0)');
        expect(paint.color).toBe(paints[0]!.color);
      }
      logoColors.add(paints[0]!.color);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      // Phones reach the palette through the menu button; wider screens show it in the header.
      await expect(paletteEntry(page, isMobile)).toBeInViewport();
      await page.screenshot({
        path: testInfo.outputPath(`${host}-${theme}.png`),
        animations: 'disabled',
      });
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    }
    expect(logoColors.size).toBe(SITE_THEMES.length);
    await page.goto(host === 'landing' ? '/about' : '/faq');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'ember');
    await expect(page.locator('[data-brand-mark]').first()).toHaveCSS(
      'background-color',
      [...logoColors].at(-1)!,
    );
    await expect(paletteEntry(page, isMobile)).toBeVisible();
    expect(hydrationErrors).toEqual([]);
  });
}

test('palette menu works with the keyboard and follows a language change', async ({ page }) => {
  // The header menus; phones reach the same palettes through the drawer.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/faq');
  const trigger = page.getByRole('button', { name: label, exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).toBeVisible();
  await page.keyboard.press('Home');
  await expect(page.getByRole('menuitemradio', { name: /^Midnight/ })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitemradio', { name: /^Classic Blue/ })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'classic-blue');
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: 'Language: English', exact: true }).click();
  await page.getByRole('menuitemradio', { name: 'Українська', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'classic-blue');
});

test('saved palette is applied before hydration scripts download', async ({
  page,
  context,
  baseURL,
}) => {
  await context.addCookies([{ name: THEME_COOKIE_NAME, value: 'aurora', url: baseURL! }]);
  // The synchronous inline bootstrap must be sufficient without any React JS.
  await page.route('**/_next/static/**/*.js', (route) => route.abort());
  await page.goto('/faq', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'aurora');
  const swatches = await page.evaluate(() => {
    const swatch = document.createElement('div');
    swatch.hidden = true;
    swatch.style.backgroundColor = 'hsl(var(--background))';
    document.body.append(swatch);
    try {
      // Scoped palette values supply an independent expectation even when the
      // document's saved-theme selector or pre-paint application is broken.
      swatch.dataset.palette = 'midnight';
      const midnight = getComputedStyle(swatch).backgroundColor;
      swatch.dataset.palette = 'aurora';
      const aurora = getComputedStyle(swatch).backgroundColor;
      return { midnight, aurora };
    } finally {
      swatch.remove();
    }
  });
  expect(swatches.aurora).not.toBe(swatches.midnight);
  await expect(page.locator('body')).toHaveCSS('background-color', swatches.aurora);
});

test('shared cookie carries the choice across real sibling origins and back', async ({
  page,
  context,
  baseURL,
}) => {
  // Serve local responses under distinct browser origins. No production page
  // is contacted, while cookie/localStorage isolation matches the real hosts.
  await context.route(/^https:\/\/(app\.)?cosmicsignature\.com\//, async (route) => {
    const url = new URL(route.request().url());
    const response = await route.fetch({
      url: `${baseURL}${url.pathname}${url.search}`,
      headers: { ...route.request().headers(), 'x-forwarded-host': url.hostname },
    });
    await route.fulfill({ response });
  });
  await page.goto('https://cosmicsignature.com/');
  await chooseTheme(page, 'classic-blue');
  expect(
    (await context.cookies()).find((cookie) => cookie.name === THEME_COOKIE_NAME),
  ).toMatchObject({
    domain: '.cosmicsignature.com',
    secure: true,
    sameSite: 'Lax',
    value: 'classic-blue',
  });
  await page.goto('https://app.cosmicsignature.com/faq');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'classic-blue');
  await chooseTheme(page, 'ember');
  await page.goto('https://cosmicsignature.com/about');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'ember');
  // The old landing-origin fallback must not override the newer shared cookie.
  expect(await page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE_KEY)).toBe(
    'classic-blue',
  );
  // Next may still prefetch page chunks when the assertions finish.
  await context.unrouteAll({ behavior: 'ignoreErrors' });
});

test('desktop ambient scene keeps its canvas through palette changes', async ({
  page,
  context,
  isMobile,
}, testInfo) => {
  test.skip(isMobile, 'The animated backdrop is desktop-only.');
  const supportsWebGL = await page.evaluate(() => {
    const context = document.createElement('canvas').getContext('webgl2');
    const supported = context !== null;
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return supported;
  });
  test.skip(!supportsWebGL, 'This browser environment does not provide a WebGL2 context.');
  await context.setExtraHTTPHeaders(landingHeaders);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const renderingErrors: string[] = [];
  page.on('pageerror', (error) => renderingErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && /shader|THREE|WebGL|hydration/i.test(message.text())) {
      renderingErrors.push(message.text());
    }
  });
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  const originalCanvas = await canvas.elementHandle();
  for (const theme of SITE_THEMES) {
    await chooseTheme(page, theme);
    expect(await originalCanvas!.evaluate((element) => element.isConnected)).toBe(true);
  }
  await page.screenshot({ path: testInfo.outputPath('animated-ember.png') });
  expect(renderingErrors).toEqual([]);
});

test('palette menu scrolls within a short landscape viewport', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/faq');
  await page.getByRole('button', { name: label, exact: true }).click();
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  const bounds = await menu.boundingBox();
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(390);
  await page.getByRole('menuitemradio', { name: /^Ember/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'ember');
});
