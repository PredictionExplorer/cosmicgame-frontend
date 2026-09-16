import { readFileSync } from 'node:fs';

import { expect, test, type Page } from '@playwright/test';

import { SITE_THEMES, THEME_COOKIE_NAME, THEME_STORAGE_KEY } from '../lib/theme/config';
import common from '../messages/en/common.json';

import { mockMobileAuditApi } from './mobile-audit-fixtures';

const label = common.themeSwitcher.label;
const landingHeaders = { 'X-Forwarded-Host': 'cosmicsignature.com' };

async function chooseTheme(page: Page, theme: (typeof SITE_THEMES)[number]) {
  await page.getByRole('button', { name: label, exact: true }).click();
  await page
    .getByRole('menuitemradio', {
      name: new RegExp(`^${common.themeSwitcher.themes[theme].name}`),
    })
    .click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

async function assertPaletteContrast(page: Page) {
  const contrasts = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement);
    const channels = (token: string) => {
      const [triplet, opacity = '1'] = css.getPropertyValue(token).trim().split('/');
      const [h, s, l] = triplet!.trim().split(/\s+/).map(parseFloat);
      const sat = s! / 100;
      const light = l! / 100;
      const a = sat * Math.min(light, 1 - light);
      const channel = (n: number) => {
        const k = (n + h! / 30) % 12;
        return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      };
      return { rgb: [channel(0), channel(8), channel(4)], alpha: parseFloat(opacity) };
    };
    const luminance = (rgb: number[]) => {
      const linear = rgb.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722;
    };
    const contrast = (a: number, b: number) => {
      const values = [a, b].sort((x, y) => y - x);
      return (values[0]! + 0.05) / (values[1]! + 0.05);
    };
    const ratio = (a: string, b: string) => {
      const ink = channels(a);
      const surface = channels(b).rgb;
      const composed = ink.rgb.map(
        (value, index) => value * ink.alpha + surface[index]! * (1 - ink.alpha),
      );
      return contrast(luminance(composed), luminance(surface));
    };
    return ['--background', '--card', '--popover']
      .flatMap((surface) =>
        ['--foreground', '--muted-foreground', '--primary', '--secondary'].map((ink) => ({
          pair: `${ink} on ${surface}`,
          value: ratio(ink, surface),
        })),
      )
      .concat({
        pair: 'solid primary palette pair',
        value: ratio('--primary', '--primary-foreground'),
      });
  });
  for (const { pair, value } of contrasts) expect(value, pair).toBeGreaterThanOrEqual(4.5);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockMobileAuditApi(page);
});

test('Original Glass restores the saved palette and gradient button colors', async ({
  page,
  context,
  baseURL,
}) => {
  await context.addCookies([{ name: THEME_COOKIE_NAME, value: 'liquid-glass', url: baseURL! }]);
  await page.goto('/faq');
  const colors = await page.evaluate(() => {
    const sample = document.createElement('span');
    document.body.append(sample);
    const color = (value: string) => {
      sample.style.color = value;
      return getComputedStyle(sample).color;
    };
    // Reference values from e58da429, before the upstream palette redesign.
    const references = [
      ['--foreground', '0 0% 100%'],
      ['--secondary', '205 100% 71%'],
      ['--accent', '271 98% 60%'],
      ['--popover', '235 60% 16%'],
      ['--border', '235 30% 20%'],
      ['--ring', '196 98% 54%'],
    ].map(([token, value]) => ({
      token,
      actual: color(`hsl(var(${token}))`),
      original: color(`hsl(${value})`),
    }));
    for (const [token, value] of [
      ['--aurora-cyan-rgb', '0 229 255'],
      ['--nebula-violet-rgb', '108 60 225'],
      ['--cosmic-indigo-rgb', '26 11 62'],
    ]) {
      references.push({
        token,
        actual: color(`rgb(var(${token}))`),
        original: color(`rgb(${value})`),
      });
    }
    sample.remove();
    return references;
  });
  for (const { token, actual, original } of colors) expect(actual, token).toBe(original);
  // Validate the actual newer consumers after substituting the original alpha-bearing token.
  for (const file of [
    'config/rainbowkit-theme.ts',
    'styles/global.css',
    'components/statistics/EnduranceTimelineChart.tsx',
    'components/statistics/CstCalibrationWindowChart.tsx',
    'components/statistics/CstGestureCostChart.tsx',
  ]) {
    const expressions = readFileSync(file, 'utf8').match(
      /(?:hsl|color-mix)\([^'"`;\n}]*var\(--muted-foreground\)[^'"`;\n}]*/g,
    );
    expect(expressions?.length, file).toBeGreaterThan(0);
    for (const expression of expressions!) {
      expect(
        await page.evaluate((value) => {
          const ink = getComputedStyle(document.documentElement).getPropertyValue(
            '--muted-foreground',
          );
          return CSS.supports('color', value.replace('var(--muted-foreground)', ink));
        }, expression),
        `${file}: ${expression}`,
      ).toBe(true);
    }
  }
  const cta = page.getByTestId('connect-wallet-button').first();
  await expect(cta).toHaveCSS('color', 'rgb(255, 255, 255)');
  const gradient = await cta.evaluate((element) => getComputedStyle(element).backgroundImage);
  for (const color of ['rgb(6, 174, 236)', 'rgb(53, 201, 255)', 'rgb(156, 55, 253)']) {
    expect(gradient).toContain(color);
  }
});

test('Original Glass source colors retain the known CTA contrast shortfall', async ({ page }) => {
  await page.goto('/faq');
  await chooseTheme(page, 'liquid-glass');
  const cta = page.getByTestId('connect-wallet-button').first();
  await expect(cta).toHaveCSS('color', 'rgb(255, 255, 255)');
  const gradient = await cta.evaluate((element) => getComputedStyle(element).backgroundImage);
  expect(gradient).toContain('rgb(53, 201, 255)');
  const rgb = [53, 201, 255].map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const middleContrast = 1.05 / (rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722 + 0.05);
  test.fail(
    true,
    'Requested faithful restoration: original white-on-cyan CTA is below AA. See docs/theme-system.md.',
  );
  expect(middleContrast).toBeGreaterThanOrEqual(4.5);
});

for (const host of ['app', 'landing'] as const) {
  test(`${host}: every palette has readable core text and is responsive and remembered`, async ({
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
    let lastLogoColor = '';
    for (const theme of SITE_THEMES) {
      await chooseTheme(page, theme);
      await assertPaletteContrast(page);
      const logos = page.locator('[data-brand-mark]');
      await expect(logos.first()).toBeVisible();
      const paints = await logos.evaluateAll((elements) =>
        elements.map((element) => {
          const style = getComputedStyle(element);
          return { color: style.backgroundColor, artwork: style.maskImage };
        }),
      );
      const primaryColor = await page.evaluate(() => {
        const sample = document.createElement('span');
        sample.style.color = 'hsl(var(--primary))';
        document.body.append(sample);
        const color = getComputedStyle(sample).color;
        sample.remove();
        return color;
      });
      expect(paints.length).toBeGreaterThanOrEqual(2);
      for (const paint of paints) {
        expect(paint.artwork).toContain('/images/logo2.svg');
        expect(paint.color).not.toBe('rgba(0, 0, 0, 0)');
        expect(paint.color).toBe(paints[0]!.color);
        expect(paint.color).toBe(primaryColor);
      }
      lastLogoColor = paints[0]!.color;
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await expect(page.getByRole('button', { name: label, exact: true })).toBeInViewport();
      await page.screenshot({
        path: testInfo.outputPath(`${host}-${theme}.png`),
        animations: 'disabled',
      });
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    }
    await page.goto(host === 'landing' ? '/about' : '/faq');
    await expect(page.locator('html')).toHaveAttribute('data-theme', SITE_THEMES.at(-1)!);
    await expect(page.locator('[data-brand-mark]').first()).toHaveCSS(
      'background-color',
      lastLogoColor,
    );
    await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible();
    expect(hydrationErrors).toEqual([]);
  });
}

test('palette menu works with the keyboard and follows a language change', async ({ page }) => {
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
  await page.getByRole('button', { name: 'Language', exact: true }).click();
  await page.getByRole('menuitemradio', { name: 'Українська', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'classic-blue');
});

test('Original Glass changes control material without moving controls and restores the prior palette', async ({
  page,
}) => {
  await page.goto('/faq');
  await chooseTheme(page, 'classic-blue');
  const trigger = page.getByRole('button', { name: label, exact: true });
  const cta = page.getByTestId('connect-wallet-button').first();
  const before = { trigger: await trigger.boundingBox(), cta: await cta.boundingBox() };
  const normal = await trigger.evaluate((element) => ({
    shadow: getComputedStyle(element).boxShadow,
    backdrop: getComputedStyle(element).getPropertyValue('backdrop-filter'),
  }));
  await chooseTheme(page, 'liquid-glass');
  expect(await trigger.boundingBox()).toEqual(before.trigger);
  expect(await cta.boundingBox()).toEqual(before.cta);
  await expect(trigger).toHaveCSS('backdrop-filter', 'saturate(1.45) contrast(1.06)');
  await expect(cta).toHaveCSS('background-image', /linear-gradient/);
  await trigger.hover();
  await expect(trigger).toHaveCSS('transform', 'none');
  await trigger.focus();
  await expect(trigger).toHaveCSS('outline-width', '2px');
  await chooseTheme(page, 'classic-blue');
  await expect(trigger).toHaveCSS('box-shadow', normal.shadow);
  await expect(trigger).toHaveCSS('backdrop-filter', normal.backdrop);
  await expect(cta).toHaveCSS('background-image', 'none');
});

test('Original Glass restores the indigo atmosphere and translucent panels without moving the dashboard', async ({
  page,
}) => {
  await page.goto('/');
  await chooseTheme(page, 'classic-blue');
  const clock = page.getByTestId('control-desk-clock');
  const originalAtmosphere = page.locator('[data-original-ambient="signature"]');
  const before = await clock.boundingBox();
  const originalFill = await clock.evaluate((element) => getComputedStyle(element).background);
  await expect(originalAtmosphere).toBeHidden();
  await chooseTheme(page, 'liquid-glass');
  await expect(originalAtmosphere).toBeVisible();
  expect(await clock.boundingBox()).toEqual(before);
  await expect(clock).toHaveCSS('background-image', /linear-gradient/);
  expect(await clock.evaluate((element) => getComputedStyle(element).background)).not.toBe(
    originalFill,
  );
  // A motion preference stops the stars, not the static color atmosphere.
  await expect(page.locator('#tsparticles canvas')).toHaveCount(0);
  await page.screenshot({ path: test.info().outputPath('original-glass-still-atmosphere.png') });
  await chooseTheme(page, 'classic-blue');
  await expect(originalAtmosphere).toBeHidden();
  await expect(clock).toHaveCSS('background', originalFill);
  await page.goto('/gallery');
  await chooseTheme(page, 'liquid-glass');
  await expect(page.locator('[data-original-surface="glass-bordered"].sticky')).toHaveCSS(
    'position',
    'sticky',
  );
});

test('Original Glass shows the existing drifting stars with motion enabled', async ({
  page,
  context,
  baseURL,
  isMobile,
}, testInfo) => {
  test.skip(isMobile, 'Moving particles retain the existing desktop-only behavior.');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await context.addCookies([{ name: THEME_COOKIE_NAME, value: 'liquid-glass', url: baseURL! }]);
  await page.goto('/');
  await expect(page.locator('[data-original-ambient="signature"]')).toBeVisible();
  const canvas = page.locator('#tsparticles canvas');
  await expect(canvas).toBeVisible();
  const firstFrame = await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL());
  // Contract reads settle after the first frames; keep checking responsiveness
  // through that point so a static screenshot cannot hide a stalled dashboard.
  await expect
    .poll(() => page.evaluate(() => performance.now()), { timeout: 20_000, intervals: [1_000] })
    .toBeGreaterThan(10_000);
  await expect
    .poll(() => canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL()))
    .not.toBe(firstFrame);
  await page.screenshot({ path: testInfo.outputPath('original-glass-moving-stars.png') });
  await chooseTheme(page, 'classic-blue');
  await chooseTheme(page, 'liquid-glass');
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
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(10, 24, 26)');
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
