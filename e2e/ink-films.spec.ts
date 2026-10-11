import { test, expect, type Page } from '@playwright/test';

import { mockZhQualityApi } from './zh-quality-mocks';

type Variant = 'short' | 'medium' | 'slow';

const FILMS: Record<Variant, { role: string; path: string; duration_seconds: number }> = {
  short: { role: 'ember_web', path: 'videos/web/ember.mp4', duration_seconds: 30 },
  medium: { role: 'ember_medium_web', path: 'videos/web/ember_medium.mp4', duration_seconds: 112 },
  slow: { role: 'ember_slow_web', path: 'videos/web/ember_slow.mp4', duration_seconds: 280 },
};
const ALL_VARIANTS: Variant[] = ['short', 'medium', 'slow'];

// A self-generated, one-frame 16 × 16 white H.264 film. Serving valid media
// exercises browser loading, pause and retry without fetching the real films.
const VIDEO = Buffer.from(
  'AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAALpbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAA+gAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAjh0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAA+gAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAABAAAAAQAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAPoAAAAAAABAAAAAAGwbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAABAAAAAQABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABW21pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAARtzdGJsAAAAt3N0c2QAAAAAAAAAAQAAAKdhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAABAAEABIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAALWF2Y0MBQsAK/+EAFWdCwAraewEQAAADABAAAAMAIPEiagEABWjOA5yAAAAAEHBhc3AAAAABAAAAAQAAABRidHJ0AAAAAAAAEygAAABwAAAAGHN0dHMAAAAAAAAAAQAAAAEAAEAAAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAABAAAAAQAAABRzdHN6AAAAAAAAAA4AAAABAAAAFHN0Y28AAAAAAAAAAQAAAxkAAAA9dWR0YQAAADVtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAAhpbHN0AAAACGZyZWUAAAAWbWRhdAAAAApliIQ6JigACBZg',
  'base64',
);

async function mockInkGallery(page: Page, variants: Variant[] = ALL_VARIANTS) {
  await mockZhQualityApi(page);
  const inkRequests: string[] = [];
  const manifests: string[] = [];
  const posterRequests: string[] = [];
  const state = { failVideos: false };

  // Wire keys and URLs match the existing backend fixture contract.
  const tokens = [
    { TokenId: 420, TokenName: 'Ink fixture A', Seed: '123456789' },
    { TokenId: 421, TokenName: 'Ink fixture B', Seed: 'abc123' },
  ].map((token) => ({
    ...token,
    CurOwnerAddr: '0x1111111111111111111111111111111111111111',
    RoundNum: 42,
    TimeStamp: 1_700_000_000,
    MintTimeStamp: 1_700_000_000,
    Staked: false,
  }));

  await page.route('**/api/cosmicgame/cst/list/all/**', (route) =>
    route.fulfill({ json: { CosmicSignatureTokenList: tokens } }),
  );
  await page.route('**/api/cosmicgame/cst/info/*', (route) => {
    const id = Number(new URL(route.request().url()).pathname.split('/').at(-1));
    return route.fulfill({ json: { TokenInfo: tokens.find((token) => token.TokenId === id) } });
  });
  await page.route('**/api/gallery/traits', (route) =>
    route.fulfill({
      json: {
        version: 1,
        total: tokens.length,
        indexed: 0,
        missing: tokens.length,
        partial: false,
        generatedAt: '2026-10-11T00:00:00.000Z',
        entries: [],
      },
    }),
  );
  await page.route('**/metadata/42*', (route) => route.fulfill({ status: 404, json: {} }));
  await page.route('**/images/new/cosmicsignature/**', async (route) => {
    const url = route.request().url();
    if (url.endsWith('/metadata/assets.json')) {
      manifests.push(url);
      await route.fulfill({
        json: {
          schema_version: 2,
          assets: [
            ...variants.map((variant) => ({
              ...FILMS[variant],
              kind: 'video',
              format: 'mp4',
            })),
            {
              role: 'ember_web_full',
              path: 'images/web/ember_full.webp',
              kind: 'image',
              format: 'webp',
            },
          ],
        },
      });
    } else if (url.endsWith('.mp4')) {
      const ink = /\/ember(?:_medium|_slow)?\.mp4$/.test(url);
      if (ink) inkRequests.push(url);
      await route.fulfill(
        ink && state.failVideos
          ? { status: 404, body: '' }
          : { contentType: 'video/mp4', body: VIDEO },
      );
    } else {
      if (url.endsWith('/ember_full.webp')) posterRequests.push(url);
      await route.fulfill({ path: 'public/images/landing/signature-24.webp' });
    }
  });
  // The main art may use the image optimizer; keep that path deterministic too.
  await page.route('**/_next/image?*', (route) =>
    route.fulfill({ path: 'public/images/landing/signature-24.webp' }),
  );

  return { inkRequests, manifests, posterRequests, state };
}

function requestedVariants(urls: string[]) {
  return new Set(urls.map((url) => new URL(url).pathname.split('/').at(-1)));
}

async function expectDialogFits(page: Page) {
  const dialog = page.getByTestId('ink-film-dialog');
  const box = await dialog.boundingBox();
  const viewport = page.viewportSize()!;
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(
    true,
  );
  await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeInViewport();
  await dialog.getByRole('radiogroup', { name: 'Film length' }).scrollIntoViewIfNeeded();
  await expect(dialog.getByRole('radio', { name: '≈5 min' }).locator('..')).toBeInViewport();
}

test.describe('Ink films', () => {
  test('keeps media lazy, starts with medium, and pauses the primary animation', async ({
    page,
  }, testInfo) => {
    const fixture = await mockInkGallery(page);
    await page.goto('/detail/420');
    const trigger = page.getByRole('button', { name: 'Ink films', exact: true });
    await expect(trigger).toBeVisible();
    expect(fixture.inkRequests).toEqual([]);
    expect(fixture.posterRequests).toEqual([]);
    await expect(page.getByTestId('ink-film-video')).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath('detail-primary.png'),
      animations: 'disabled',
    });

    // Native radios are visually hidden; pointer users select their full labels.
    await page.getByRole('radio', { name: 'In motion', exact: true }).locator('..').click();
    const primary = page.getByTestId('signature-motion');
    await expect
      .poll(() => primary.evaluate((video: HTMLVideoElement) => video.paused))
      .toBe(false);
    await trigger.click();
    const dialog = page.getByTestId('ink-film-dialog');
    const video = page.getByTestId('ink-film-video');
    await expect(dialog.getByRole('radio', { name: '≈2 min' })).toBeChecked();
    await expect(video).toHaveAttribute('src', /\/ember_medium\.mp4$/);
    await expect.poll(() => fixture.inkRequests.length).toBeGreaterThan(0);
    expect(requestedVariants(fixture.inkRequests)).toEqual(new Set(['ember_medium.mp4']));
    await page.screenshot({
      path: testInfo.outputPath('detail-ink-open.png'),
      animations: 'disabled',
    });
    await expect
      .poll(() => primary.evaluate((element: HTMLVideoElement) => element.paused))
      .toBe(true);

    await dialog.getByRole('radio', { name: '≈5 min' }).locator('..').click();
    await expect(video).toHaveAttribute('src', /\/ember_slow\.mp4$/);
    await expect.poll(() => requestedVariants(fixture.inkRequests).size).toBe(2);
    expect(requestedVariants(fixture.inkRequests)).toEqual(
      new Set(['ember_medium.mp4', 'ember_slow.mp4']),
    );

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(video).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect
      .poll(() => primary.evaluate((element: HTMLVideoElement) => element.paused))
      .toBe(true);
    await trigger.click();
    await expect(dialog.getByRole('radio', { name: '≈2 min' })).toBeChecked();
  });

  for (const { variants, selected, missing } of [
    { variants: ['short', 'slow'] as Variant[], selected: '30 sec', missing: '≈2 min' },
    { variants: ['slow'] as Variant[], selected: '≈5 min', missing: '30 sec' },
  ]) {
    test(`offers only published versions (${variants.join(', ')})`, async ({ page }) => {
      const fixture = await mockInkGallery(page, variants);
      await page.goto('/detail/420');
      await page.getByRole('button', { name: 'Ink films', exact: true }).click();
      const dialog = page.getByTestId('ink-film-dialog');
      if (variants.length === 1) {
        await expect(dialog.getByRole('radio')).toHaveCount(0);
        await expect(dialog.getByText(`Film length · ${selected}`)).toBeVisible();
      } else {
        await expect(dialog.getByRole('radio')).toHaveCount(variants.length);
        await expect(dialog.getByRole('radio', { name: selected })).toBeChecked();
      }
      await expect(dialog.getByRole('radio', { name: missing })).toHaveCount(0);
      await expect.poll(() => fixture.inkRequests.length).toBeGreaterThan(0);
      expect(requestedVariants(fixture.inkRequests)).toEqual(
        new Set([FILMS[variants[0]!].path.split('/').at(-1)]),
      );
    });
  }

  test('leaves the primary viewer alone when no ink films are published', async ({ page }) => {
    const fixture = await mockInkGallery(page, []);
    await page.goto('/detail/420');
    await expect(page.getByTestId('signature-viewer')).toBeVisible();
    await expect.poll(() => fixture.manifests.length).toBeGreaterThan(0);
    await expect(page.getByRole('button', { name: 'Ink films', exact: true })).toHaveCount(0);
    await expect(page.getByRole('radio', { name: 'Still', exact: true })).toBeChecked();
    expect(fixture.inkRequests).toEqual([]);
    expect(fixture.posterRequests).toEqual([]);
  });

  test('waits for explicit playback when motion is reduced', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const fixture = await mockInkGallery(page);
    await page.goto('/detail/420');
    await page.getByRole('button', { name: 'Ink films', exact: true }).click();
    const video = page.getByTestId('ink-film-video');
    await expect(video).not.toHaveAttribute('autoplay');
    await expect(video).toHaveAttribute('preload', 'none');
    expect(fixture.inkRequests).toEqual([]);
    await video.focus();
    await page.keyboard.press('Space');
    await expect.poll(() => fixture.inkRequests.length).toBeGreaterThan(0);
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState))
      .toBeGreaterThanOrEqual(2);
  });

  test('recovers from failed media servers without changing the chosen length', async ({
    page,
  }) => {
    const fixture = await mockInkGallery(page);
    fixture.state.failVideos = true;
    await page.goto('/detail/420');
    await page.getByRole('button', { name: 'Ink films', exact: true }).click();
    const dialog = page.getByTestId('ink-film-dialog');
    await expect(dialog.getByRole('status')).toHaveText('This ink film could not be loaded.');
    // Local environments may configure one media server; production has mirrors.
    expect(fixture.inkRequests.length).toBeGreaterThan(0);
    expect(requestedVariants(fixture.inkRequests)).toEqual(new Set(['ember_medium.mp4']));
    await expect(dialog.getByRole('radio', { name: '≈2 min' })).toBeChecked();

    fixture.state.failVideos = false;
    await dialog.getByRole('button', { name: 'Try again' }).click();
    const video = dialog.getByTestId('ink-film-video');
    await expect(video).toHaveAttribute('src', /\/ember_medium\.mp4$/);
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState))
      .toBeGreaterThanOrEqual(2);
    await expect(dialog.getByRole('status')).toHaveCount(0);
  });

  test('keeps the film and its controls reachable in portrait and landscape', async ({ page }) => {
    await mockInkGallery(page);
    await page.goto('/detail/420');
    await page.getByRole('button', { name: 'Ink films', exact: true }).click();
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(viewport);
      await expectDialogFits(page);
    }
  });

  test('keeps nested keyboard navigation and focus inside the film', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Quick view is a pointer-fine shortcut; touch cards open the detail page.');
    const fixture = await mockInkGallery(page);
    await page.goto('/gallery');
    const card = page.getByTestId('signature-card').filter({ hasText: 'Ink fixture A' });
    await expect(card).toBeVisible();
    expect(fixture.manifests).toEqual([]);
    await card.getByTestId('quick-view-button').click();
    const quickView = page.getByTestId('nft-quick-view');
    const trigger = quickView.getByRole('button', { name: 'Ink films', exact: true });
    await trigger.click();
    const dialog = page.getByTestId('ink-film-dialog');
    const close = dialog.getByRole('button', { name: 'Close', exact: true });
    await close.focus();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByRole('heading')).toContainText('Ink fixture A');
    await dialog.getByRole('radio', { name: '≈2 min' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByRole('radio', { name: '≈5 min' })).toBeChecked();
    await expect(dialog.getByRole('heading')).toContainText('Ink fixture A');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(quickView).toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(quickView.getByRole('heading')).toHaveText('Ink fixture A');
    await page.keyboard.press('Escape');
    await expect(quickView).toBeHidden();
    await expect(card.getByTestId('quick-view-button')).toBeFocused();
  });
});
