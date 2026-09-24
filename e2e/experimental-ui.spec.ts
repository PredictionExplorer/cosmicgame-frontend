import { expect, test, type Page } from '@playwright/test';

const EXPERIMENT_PATH = '/experimental-ui?uxScenario=live-mid-cycle';

async function openExperiment(page: Page, path = EXPERIMENT_PATH): Promise<void> {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('UX scenario: live-mid-cycle')).toBeVisible({ timeout: 20_000 });
  await expect(
    page.getByRole('heading', { level: 1, name: 'The Cosmic Signature Observatory' }),
  ).toBeVisible();
}

test.describe('experimental UI', () => {
  test('hangs the art beside the monument without replacing the current home', async ({ page }) => {
    await openExperiment(page);

    const header = page.getByTestId('home-deck-header');
    const deck = page.getByTestId('home-deck-layout');

    await expect(header).toBeVisible();
    await expect(deck.getByTestId('home-art-hero')).toBeVisible();
    await expect(deck.getByTestId('home-deck-monument')).toBeVisible();
    await expect(deck.getByTestId('home-deck-board')).toBeVisible();
    await expect(page.getByTestId('home-deck-chat')).toBeVisible();
    await expect(page.getByTestId('experimental-ui-return')).toHaveAttribute('href', '/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex,\s*follow/,
    );

    // One gesture form: one submit, one message field, no second composer.
    await expect(page.locator('#gesture-submit')).toHaveCount(1);
    await expect(page.getByTestId('gesture-message-input')).toHaveCount(1);
    await expect(page.getByTestId('gesture-composer')).toHaveCount(0);
    // One allocation view, and no legacy strip or second hero at the end.
    await expect(page.getByTestId('allocation-tracks-board')).toHaveCount(1);
    await expect(page.getByTestId('home-story-section')).toHaveCount(0);

    const order = await page.evaluate(() => {
      const at = (testId: string) => document.querySelector(`[data-testid="${testId}"]`);
      const header = at('home-deck-header');
      const art = at('home-art-hero');
      const monument = at('home-deck-monument');
      const board = at('home-deck-board');
      if (!header || !art || !monument || !board) return [];
      const follows = (a: Element, b: Element) =>
        Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
      return [follows(header, art), follows(art, monument), follows(monument, board)];
    });
    expect(order).toEqual([true, true, true]);

    const currentHome = await page.context().newPage();
    try {
      await currentHome.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(currentHome.getByTestId('control-desk')).toBeVisible();
      // The experiment is reached by its URL; the public home does not link it (F280).
      await expect(currentHome.getByTestId('experimental-ui-entry')).toHaveCount(0);
    } finally {
      await currentHome.close();
    }
  });

  test('keeps the clock and the art in the first desktop viewport', async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), 'desktop geometry contract');
    await page.setViewportSize({ width: 1440, height: 900 });
    await openExperiment(page);

    const clock = await page.getByRole('timer').boundingBox();
    const art = await page.getByTestId('home-art-hero').boundingBox();
    expect(clock).not.toBeNull();
    expect(art).not.toBeNull();
    expect(clock!.y + clock!.height).toBeLessThanOrEqual(900);
    expect(art!.y).toBeLessThan(900);
    // The monument sits beside the art, not under it.
    expect(clock!.x).toBeGreaterThan(art!.x + art!.width);
  });

  test('prices every method in its segment and opens Advanced inside the console', async ({
    page,
    isMobile,
  }) => {
    test.skip(Boolean(isMobile), 'desktop console contract');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openExperiment(page);

    const methods = page.getByRole('radiogroup', { name: 'Gesture method' }).getByRole('radio');
    await expect(methods).toHaveCount(3);
    await expect(methods.first()).toContainText('ETH');
    await expect(page.getByTestId('calibration-window')).toBeVisible();

    const console_ = page.getByTestId('gesture-console').first();
    await console_.getByText('Advanced', { exact: true }).click();
    await expect(console_.getByTestId('gesture-advanced-fields')).toBeVisible();
  });

  test('uses the intended phone order, the shared dock and the still art', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'mobile-only responsive contract');
    await page.setViewportSize({ width: 390, height: 844 });
    await openExperiment(page);

    await expect(page.locator('[data-testid="deck-art-reel"]')).toHaveCount(0);
    const positions = await page.evaluate(() => {
      const top = (testId: string) =>
        document.querySelector(`[data-testid="${testId}"]`)?.getBoundingClientRect().top ??
        Number.POSITIVE_INFINITY;
      return {
        art: top('home-art-hero'),
        monument: top('home-deck-monument'),
        board: top('home-deck-board'),
        chat: top('home-deck-chat'),
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      };
    });

    expect(positions.art).toBeLessThan(positions.monument);
    expect(positions.monument).toBeLessThan(positions.board);
    expect(positions.board).toBeLessThan(positions.chat);
    expect(positions.scrollWidth).toBeLessThanOrEqual(positions.clientWidth + 1);

    // The header's actions and its related link share one row on phones.
    const header = page.getByTestId('home-deck-header');
    await expect(header.getByTestId('experimental-ui-new-here')).toBeVisible();
    await expect(header.getByRole('navigation')).toBeHidden();
    const rows = await page.evaluate(() => {
      const top = (testId: string) =>
        document.querySelector(`[data-testid="${testId}"]`)?.getBoundingClientRect().top ?? 0;
      return { back: top('experimental-ui-return'), newHere: top('experimental-ui-new-here') };
    });
    expect(Math.abs(rows.back - rows.newHere)).toBeLessThan(12);

    // The dock carries the clock and the priced action, and opens the same console.
    await expect(page.getByTestId('action-dock')).toBeVisible();
    await page.getByTestId('dock-open-sheet').click();
    await expect(
      page.locator('[data-testid="gesture-console"][data-variant="sheet"]'),
    ).toBeVisible();
    // The dialog is named by the heading it shows.
    await expect(page.getByRole('dialog', { name: 'Make a gesture' })).toBeVisible();
  });

  test('keeps keyboard focus clear of the phone dock', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'the dock floats over phones only');
    await page.setViewportSize({ width: 390, height: 844 });
    await openExperiment(page);
    await expect(page.getByTestId('action-dock')).toBeVisible();

    // Tab to the art's Pause control, which first paints under the dock.
    const toggle = page.getByTestId('art-motion-toggle');
    for (let press = 0; press < 40; press += 1) {
      await page.keyboard.press('Tab');
      if (await toggle.evaluate((node) => node === document.activeElement)) break;
    }
    await expect(toggle).toBeFocused();
    const overlap = await page.evaluate(() => {
      const focused = document.activeElement!.getBoundingClientRect();
      const dock = document.querySelector('[data-action-dock]')!.getBoundingClientRect();
      return focused.bottom - dock.top;
    });
    expect(overlap).toBeLessThanOrEqual(0);
  });

  test('pauses the artwork and remembers it', async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), 'the reel runs on wide screens');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openExperiment(page);

    const toggle = page.getByTestId('art-motion-toggle');
    await expect(toggle).toHaveAccessibleName('Pause animation');
    await toggle.click();
    await expect(toggle).toHaveAccessibleName('Play animation');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('art-motion-toggle')).toHaveAccessibleName('Play animation');
  });

  test('honors reduced motion by keeping generation video unmounted', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openExperiment(page);

    await expect(page.locator('[data-testid="deck-art-reel"]')).toHaveCount(0);
    await expect(page.getByTestId('home-art-hero')).toBeVisible();
  });

  test('renders localized Chinese chrome and return navigation', async ({ page }) => {
    await page.goto('/zh/experimental-ui?uxScenario=live-mid-cycle', {
      waitUntil: 'domcontentloaded',
    });

    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Cosmic Signature 观测台' }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('link', { name: '返回当前界面' })).toHaveAttribute('href', '/zh');
  });
});
