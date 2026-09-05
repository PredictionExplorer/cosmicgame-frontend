import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { getLandingContent } from '../content/landing';

import {
  collectOverflowViolations,
  formatOverflowViolations,
  getPageOverflow,
  LANDING_HEADERS,
  waitForStableLayout,
} from './mobile-audit-helpers';

const VIEWPORTS = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

/** Keep the live clock deterministic without stopping its actual browser interval. */
async function mockLandingApi(page: Page, openingDelayDays?: number) {
  const now = Math.floor(Date.now() / 1000);
  await page.route('**/api/cosmicgame/time/current', (route) =>
    route.fulfill({ json: { CurrentTimeStamp: now } }),
  );
  await page.route('**/api/cosmicgame/rounds/current/time', (route) =>
    route.fulfill({ json: { CurRoundPrizeTime: now + 4 * 86_400 + 7_265 } }),
  );
  await page.route('**/api/cosmicgame/statistics/dashboard', (route) =>
    route.fulfill({
      json: {
        CurRoundNum: 42,
        CurNumBids: 128,
        TsRoundStart: openingDelayDays ? 0 : now - 3600,
        LastBidderAddr: openingDelayDays
          ? '0x0000000000000000000000000000000000000000'
          : '0x1111111111111111111111111111111111111111',
        ...(openingDelayDays
          ? { CurRoundStats: { ActivationTime: now + openingDelayDays * 86_400 + 3600 } }
          : {}),
      },
    }),
  );
  // The collection's empty/loading state must be just as usable as live artwork.
  await page.route('**/api/cosmicgame/cst/list/all/**', (route) =>
    route.fulfill({ json: { CosmicSignatureTokenList: [] } }),
  );
}

async function openLanding(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    getLandingContent('en').hero.headlineLead,
  );
  await expect(page.getByRole('timer')).toBeVisible();
  await expect(page.getByTestId('countdown-value')).toHaveCount(4);
  await waitForStableLayout(page);
}

test.describe('Landing responsive regressions', () => {
  test.use({
    extraHTTPHeaders: LANDING_HEADERS,
    contextOptions: { reducedMotion: 'reduce' },
  });

  test.beforeEach(async ({ page }) => {
    await mockLandingApi(page);
  });

  for (const viewport of VIEWPORTS) {
    test(`content and live countdown fit at ${viewport.width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      await openLanding(page);

      const timer = page.getByRole('timer');
      await expect(timer).toHaveAttribute('aria-live', 'off');
      await expect(timer).toHaveAccessibleName(/Cycle #42.*4 days/i);

      const cards = page.getByTestId('countdown-units').locator('[data-countdown-unit]');
      await expect(cards).toHaveCount(4);
      const cardRects = await cards.evaluateAll((elements) =>
        elements.map((element) => {
          const { left, right, top, width } = element.getBoundingClientRect();
          return { unit: element.getAttribute('data-countdown-unit'), left, right, top, width };
        }),
      );
      expect(cardRects.map(({ unit }) => unit)).toEqual(['days', 'hours', 'minutes', 'seconds']);
      for (const [index, card] of cardRects.entries()) {
        expect(card.width, `${card.unit} needs a visible card`).toBeGreaterThan(0);
        expect(card.left, `${card.unit} starts inside the viewport`).toBeGreaterThanOrEqual(0);
        expect(card.right, `${card.unit} ends inside the viewport`).toBeLessThanOrEqual(
          viewport.width + 1,
        );
        expect(
          Math.abs(card.top - cardRects[0]!.top),
          'all four units stay on one row',
        ).toBeLessThan(1);
        if (index > 0) {
          expect(card.left, 'countdown cards must not overlap').toBeGreaterThanOrEqual(
            cardRects[index - 1]!.right,
          );
        }
      }

      // A four-column grid can still be broken when its two-digit values wrap.
      // Measure individual glyphs: checking CSS classes or page width misses that bug.
      const values = await page.getByTestId('countdown-value').evaluateAll((elements) =>
        elements.map((element) => {
          const rect = element.getBoundingClientRect();
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
          const glyphs: { left: number; right: number; top: number }[] = [];
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            for (let offset = 0; offset < (node.textContent?.length ?? 0); offset += 1) {
              if (!/\d/.test(node.textContent?.[offset] ?? '')) continue;
              const range = document.createRange();
              range.setStart(node, offset);
              range.setEnd(node, offset + 1);
              const glyph = range.getBoundingClientRect();
              glyphs.push({ left: glyph.left, right: glyph.right, top: glyph.top });
            }
          }
          return { text: element.textContent?.trim(), left: rect.left, right: rect.right, glyphs };
        }),
      );
      for (const value of values) {
        expect(value.text).toMatch(/^\d{2}$/);
        expect(value.glyphs).toHaveLength(2);
        expect(Math.abs(value.glyphs[0]!.top - value.glyphs[1]!.top), value.text).toBeLessThan(1);
        expect(value.glyphs[1]!.left, value.text).toBeGreaterThan(value.glyphs[0]!.left);
        expect(value.glyphs[0]!.left, value.text).toBeGreaterThanOrEqual(value.left - 1);
        expect(value.glyphs[1]!.right, value.text).toBeLessThanOrEqual(value.right + 1);
      }

      const { scrollWidth, viewportWidth } = await getPageOverflow(page);
      expect(scrollWidth, 'the page must not scroll sideways').toBeLessThanOrEqual(
        viewportWidth + 1,
      );
      const overflow = await collectOverflowViolations(page);
      expect(overflow, formatOverflowViolations('/', overflow)).toEqual([]);

      await testInfo.attach(`landing-${viewport.width}px`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
    });
  }

  test('three-digit opening countdown stays readable on the narrowest phone', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS[0]);
    await mockLandingApi(page, 123);
    await openLanding(page);

    await expect(page.getByRole('timer')).toHaveAccessibleName(/Cycle #42.*123 days/i);
    const days = page.locator('[data-countdown-unit="days"]').getByTestId('countdown-value');
    await expect(days).toHaveText('123');
    const geometry = await days.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return {
        lines: range.getClientRects().length,
        textWidth: range.getBoundingClientRect().width,
        boxWidth: element.clientWidth,
      };
    });
    expect(geometry.lines).toBe(1);
    expect(geometry.textWidth).toBeLessThanOrEqual(geometry.boxWidth + 1);
    const overflow = await collectOverflowViolations(page);
    expect(overflow, formatOverflowViolations('/', overflow)).toEqual([]);
  });

  for (const width of [390, 1440]) {
    test(`skip link and language navigation work by keyboard at ${width}px`, async ({
      page,
      browserName,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await openLanding(page);

      // Safari uses Option+Tab to include links in keyboard navigation.
      await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
      const skip = page.getByRole('link', { name: /skip to main/i });
      await expect(skip).toBeFocused();
      await expect(skip).toBeInViewport();
      await page.keyboard.press('Enter');
      await expect(page.locator('main#main')).toBeFocused();

      const languages = page.getByRole('button', { name: 'Language', exact: true });
      await languages.focus();
      await page.keyboard.press('Enter');
      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();
      await expect(
        menu.getByRole('menuitemradio', { name: 'English', exact: true }),
      ).toHaveAttribute('aria-checked', 'true');
      await page.keyboard.press('ArrowDown');
      await expect(menu.locator(':focus')).toHaveCount(1);
      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();
      await expect(languages).toBeFocused();

      const cycleLink = page
        .locator('header nav')
        .getByRole('link', { name: getLandingContent('en').cycle.eyebrow, exact: true });
      await cycleLink.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/#cycle$/);
      await expect(page.locator('#cycle')).toBeInViewport({ ratio: 0.01 });
    });
  }

  test('reduced motion keeps the landing accessible without continuous decorative motion', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openLanding(page);

    expect(
      await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches),
      'the browser must expose the requested reduced-motion preference',
    ).toBe(true);
    await expect(page.locator('main canvas')).toHaveCount(0);
    const continuousAnimations = await page.evaluate(() =>
      (document.querySelector('main')?.getAnimations({ subtree: true }) ?? [])
        .filter(
          (animation) =>
            animation.playState === 'running' &&
            animation.effect?.getTiming().iterations === Infinity,
        )
        .map((animation) =>
          animation instanceof CSSAnimation ? animation.animationName : animation.id,
        ),
    );
    expect(continuousAnimations).toEqual([]);

    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const seriousViolations = results.violations.filter(
      ({ impact }) => impact === 'serious' || impact === 'critical',
    );
    expect(seriousViolations, JSON.stringify(seriousViolations, null, 2)).toEqual([]);
  });
});
