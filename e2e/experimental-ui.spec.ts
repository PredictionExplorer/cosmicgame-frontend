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
  test('preserves the PR deck structure without replacing the current home', async ({ page }) => {
    await openExperiment(page);

    const header = page.getByTestId('home-deck-header');
    const art = page.getByTestId('home-art-hero');
    const deck = page.getByTestId('home-deck-layout');

    await expect(header).toBeVisible();
    await expect(art).toBeVisible();
    await expect(deck).toBeVisible();
    await expect(deck.getByTestId('home-deck-board')).toBeVisible();
    await expect(deck.getByTestId('home-deck-monument')).toBeVisible();
    await expect(deck.getByTestId('home-deck-chat')).toBeVisible();
    await expect(page.getByTestId('experimental-ui-return')).toHaveAttribute('href', '/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex,\s*follow/,
    );

    const order = await page.evaluate(() => {
      const headerNode = document.querySelector('[data-testid="home-deck-header"]');
      const artNode = document.querySelector('[data-testid="home-art-hero"]');
      const deckNode = document.querySelector('[data-testid="home-deck-layout"]');
      if (!headerNode || !artNode || !deckNode) return [];
      return [
        Boolean(headerNode.compareDocumentPosition(artNode) & Node.DOCUMENT_POSITION_FOLLOWING),
        Boolean(artNode.compareDocumentPosition(deckNode) & Node.DOCUMENT_POSITION_FOLLOWING),
      ];
    });
    expect(order).toEqual([true, true]);

    const currentHome = await page.context().newPage();
    try {
      await currentHome.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(currentHome.getByTestId('control-desk')).toBeVisible();
      await expect(currentHome.getByTestId('experimental-ui-entry')).toHaveAttribute(
        'href',
        '/experimental-ui',
      );
    } finally {
      await currentHome.close();
    }
  });

  test('opens Advanced sideways without making the monument taller', async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), 'desktop-only geometry contract');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openExperiment(page);

    const monument = page.getByTestId('home-deck-monument');
    await monument.scrollIntoViewIfNeeded();
    const before = await monument.boundingBox();
    expect(before).not.toBeNull();

    await page.getByRole('button', { name: 'Advanced' }).click();
    await expect(page.getByTestId('gesture-advanced-panel')).toBeVisible();
    await expect(page.getByTestId('home-deck-chat')).toBeHidden();
    await expect(monument).toHaveClass(/xl:col-span-2/);

    const after = await monument.boundingBox();
    expect(after).not.toBeNull();
    expect(Math.abs(after!.height - before!.height)).toBeLessThanOrEqual(8);
  });

  test('does not show the sticky mini-bar before the deck has passed', async ({
    page,
    isMobile,
  }) => {
    test.skip(Boolean(isMobile), 'desktop sticky bar contract');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openExperiment(page);

    await expect(page.getByTestId('deck-mini-bar')).toHaveCount(0);
    await page.evaluate(() => {
      const deck = document.querySelector('[data-testid="home-deck-layout"]');
      window.scrollTo({ top: (deck?.getBoundingClientRect().bottom ?? 0) + window.scrollY + 200 });
    });
    await expect(page.getByTestId('deck-mini-bar')).toBeVisible();
  });

  test('uses the intended phone order and still-art fallback', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile-only responsive contract');
    await page.setViewportSize({ width: 390, height: 844 });
    await openExperiment(page);

    await expect(page.locator('[data-testid="deck-art-reel"]')).toHaveCount(0);
    const positions = await page.evaluate(() => {
      const top = (testId: string) =>
        document.querySelector(`[data-testid="${testId}"]`)?.getBoundingClientRect().top ??
        Number.POSITIVE_INFINITY;
      return {
        monument: top('home-deck-monument'),
        board: top('home-deck-board'),
        chat: top('home-deck-chat'),
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      };
    });

    expect(positions.monument).toBeLessThan(positions.board);
    expect(positions.board).toBeLessThan(positions.chat);
    expect(positions.scrollWidth).toBeLessThanOrEqual(positions.clientWidth + 1);
    await expect(page.getByTestId('mobile-composer-fab')).toBeVisible();
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

  test('matches the pinned deck appearance at the primary desktop breakpoint', async ({
    page,
    isMobile,
  }) => {
    test.skip(Boolean(isMobile), 'desktop visual contract');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openExperiment(page);
    await page.addStyleTag({
      content: 'nextjs-portal { display: none !important; }',
    });

    const deck = page.getByTestId('home-deck-layout');
    await deck.scrollIntoViewIfNeeded();
    await expect(deck).toHaveScreenshot('deck-1440.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.02,
      maskColor: '#151a42',
      mask: [deck.getByRole('timer')],
    });
  });
});
