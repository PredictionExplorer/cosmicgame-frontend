import { test, expect, type Locator, type Page } from '@playwright/test';

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

async function mockInkGallery(
  page: Page,
  variants: Variant[] = ALL_VARIANTS,
  { hasImage = true }: { hasImage?: boolean } = {},
) {
  await mockZhQualityApi(page);
  const inkRequests: string[] = [];
  const manifests: string[] = [];
  const posterRequests: string[] = [];
  const state = {
    failVideos: false,
    manifestStatus: 200,
    holdManifest: undefined as Promise<void> | undefined,
  };

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
      await state.holdManifest;
      await route.fulfill({
        status: state.manifestStatus,
        json: {
          schema_version: 2,
          assets: [
            ...variants.map((variant) => ({
              ...FILMS[variant],
              kind: 'video',
              format: 'mp4',
            })),
            ...(hasImage
              ? [
                  {
                    role: 'ember_web_full',
                    path: 'images/web/ember_full.webp',
                    kind: 'image',
                    format: 'webp',
                  },
                ]
              : []),
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

async function captureClipboard(page: Page) {
  await page.addInitScript(() => {
    const copied: string[] = [];
    Object.defineProperty(window, '__copiedInkLinks', { value: copied });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (value: string) => void copied.push(value) },
    });
  });
  return () =>
    page.evaluate(() =>
      (window as typeof window & { __copiedInkLinks: string[] }).__copiedInkLinks.at(-1),
    );
}

function viewer(page: Page) {
  return page.getByTestId('signature-viewer');
}

async function selectView(scope: Locator, name: string) {
  // Native radios keep their standard keyboard behavior; their labels are
  // the pointer targets and must remain usable on touch screens as well.
  await scope.getByRole('radio', { name, exact: true }).locator('..').click();
}

async function expectInlineStage(page: Page, kind: 'image' | 'film' | 'original') {
  const stage = viewer(page).getByTestId('artwork-stage');
  await expect(stage).toBeVisible();
  await expect(stage.locator('img, video')).toHaveCount(1);
  if (kind === 'image')
    await expect(stage.getByTestId('ink-image-view').locator('img')).toBeVisible();
  if (kind === 'film') await expect(stage.getByTestId('ink-film-video')).toBeVisible();
  if (kind === 'original') {
    await expect(stage.getByTestId('ink-image-view')).toHaveCount(0);
    await expect(stage.getByTestId('ink-film-video')).toHaveCount(0);
  }
  // Selecting an edition never covers or hides the rest of the detail page.
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ink fixture A');
  expect(
    await page.locator('h1').evaluate((element) => element.closest('[aria-hidden="true"]')),
  ).toBeNull();
}

async function expectViewerFits(page: Page) {
  const scope = viewer(page);
  const viewport = page.viewportSize()!;
  const touchTargets =
    viewport.width < 640 || (await page.evaluate(() => matchMedia('(pointer: coarse)').matches));
  const box = await scope.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(await scope.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(
    true,
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
  for (const name of ['Original', 'Ink study', 'Image', '30 sec', '≈2 min', '≈5 min']) {
    const label = scope.getByRole('radio', { name, exact: true }).locator('..');
    await label.scrollIntoViewIfNeeded();
    await expect(label).toBeInViewport();
    const target = await label.boundingBox();
    expect(target!.width).toBeGreaterThanOrEqual(44);
    expect(target!.height).toBeGreaterThanOrEqual(touchTargets ? 44 : 36);
  }
  const share = scope.getByRole('button', { name: 'Share', exact: true });
  await share.scrollIntoViewIfNeeded();
  await expect(share).toBeInViewport();
}

test.describe('Inline ink studies', () => {
  test('keeps ink lazy and replaces the primary artwork with the selected medium film', async ({
    page,
  }, testInfo) => {
    const fixture = await mockInkGallery(page);
    await page.goto('/detail/420');
    const scope = viewer(page);
    const ink = scope.getByRole('radio', { name: 'Ink study', exact: true });
    await expect(ink).toBeVisible();
    await expect(scope.getByRole('radio', { name: 'Original', exact: true })).toBeChecked();
    await expect(scope.getByRole('radio', { name: 'Still', exact: true })).toBeChecked();
    await expectInlineStage(page, 'original');
    expect(fixture.inkRequests).toEqual([]);
    expect(fixture.posterRequests).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath('detail-original.png'),
      animations: 'disabled',
    });

    await selectView(scope, 'In motion');
    const primary = scope.getByTestId('signature-motion');
    await expect
      .poll(() => primary.evaluate((video: HTMLVideoElement) => video.paused))
      .toBe(false);
    const previousPrimary = await primary.elementHandle();
    await selectView(scope, 'Ink study');
    const video = scope.getByTestId('ink-film-video');
    await expect(scope.getByRole('radio', { name: '≈2 min' })).toBeChecked();
    await expect(page).toHaveURL(/\/detail\/420\?ink=medium$/);
    await expect(video).toHaveAttribute('src', /\/ember_medium\.mp4$/);
    await expect(primary).toHaveCount(0);
    expect(
      await previousPrimary!.evaluate((element: HTMLVideoElement) => ({
        paused: element.paused,
        src: element.getAttribute('src'),
      })),
    ).toEqual({ paused: true, src: null });
    await previousPrimary!.dispose();
    await expectInlineStage(page, 'film');
    await expect.poll(() => fixture.inkRequests.length).toBeGreaterThan(0);
    expect(requestedVariants(fixture.inkRequests)).toEqual(new Set(['ember_medium.mp4']));
    await page.screenshot({
      path: testInfo.outputPath('detail-inline-ink.png'),
      animations: 'disabled',
    });

    await selectView(scope, '≈5 min');
    await expect(video).toHaveAttribute('src', /\/ember_slow\.mp4$/);
    await expect.poll(() => requestedVariants(fixture.inkRequests).size).toBe(2);
    expect(requestedVariants(fixture.inkRequests)).toEqual(
      new Set(['ember_medium.mp4', 'ember_slow.mp4']),
    );
    const previousVideo = await video.elementHandle();
    await selectView(scope, 'Image');
    await expect(scope.getByTestId('ink-image-view').locator('img')).toHaveAttribute(
      'src',
      /\/ember_full\.webp$/,
    );
    await expectInlineStage(page, 'image');
    expect(
      await previousVideo!.evaluate((element: HTMLVideoElement) => ({
        paused: element.paused,
        src: element.getAttribute('src'),
      })),
    ).toEqual({ paused: true, src: null });
    await previousVideo!.dispose();

    await selectView(scope, 'Original');
    await expect(page).toHaveURL(/\/detail\/420$/);
    await expect(scope.getByRole('radio', { name: 'Original', exact: true })).toBeFocused();
    await expect(scope.getByRole('radio', { name: 'Still', exact: true })).toBeChecked();
    await expectInlineStage(page, 'original');
    await selectView(scope, 'Ink study');
    await expect(scope.getByRole('radio', { name: '≈2 min' })).toBeChecked();
  });

  test('preserves the exhibition stage dimensions across every image and film', async ({
    page,
  }) => {
    await mockInkGallery(page);
    await page.goto('/detail/420');
    const scope = viewer(page);
    const stage = scope.getByTestId('artwork-stage');
    await expect(stage.locator('img')).toBeVisible();
    const initial = await stage.boundingBox();
    expect(initial!.height).toBeGreaterThan(100);
    for (const name of [
      'In motion',
      'Still',
      'Ink study',
      'Image',
      '30 sec',
      '≈2 min',
      '≈5 min',
      'Original',
    ]) {
      await selectView(scope, name);
      await expect(stage.locator('img, video')).toHaveCount(1);
      const current = await stage.boundingBox();
      expect(Math.abs(current!.height - initial!.height)).toBeLessThanOrEqual(1);
      expect(Math.abs(current!.width - initial!.width)).toBeLessThanOrEqual(1);
      await expect(page.getByRole('dialog')).toHaveCount(0);
    }
  });

  for (const { variants, selected, missing } of [
    { variants: ['short', 'slow'] as Variant[], selected: '30 sec', missing: '≈2 min' },
    { variants: ['slow'] as Variant[], selected: '≈5 min', missing: '30 sec' },
  ]) {
    test(`offers only published versions (${variants.join(', ')})`, async ({ page }) => {
      const fixture = await mockInkGallery(page, variants);
      await page.goto('/detail/420');
      const scope = viewer(page);
      await selectView(scope, 'Ink study');
      const options = scope.getByRole('radiogroup', { name: 'Ink view' });
      await expect(options.getByRole('radio')).toHaveCount(variants.length + 1);
      await expect(options.getByRole('radio', { name: 'Image', exact: true })).toBeVisible();
      await expect(options.getByRole('radio', { name: selected })).toBeChecked();
      await expect(options.getByRole('radio', { name: missing })).toHaveCount(0);
      await expect.poll(() => fixture.inkRequests.length).toBeGreaterThan(0);
      expect(requestedVariants(fixture.inkRequests)).toEqual(
        new Set([FILMS[variants[0]!].path.split('/').at(-1)]),
      );
    });
  }

  test('leaves the primary viewer alone when no ink media are published', async ({ page }) => {
    const fixture = await mockInkGallery(page, [], { hasImage: false });
    await page.goto('/detail/420');
    const scope = viewer(page);
    await expect(scope).toBeVisible();
    await expect.poll(() => fixture.manifests.length).toBeGreaterThan(0);
    await expect(scope.getByRole('radio', { name: 'Ink study', exact: true })).toHaveCount(0);
    await expect(scope.getByRole('radio', { name: 'Still', exact: true })).toBeChecked();
    await expectInlineStage(page, 'original');
    expect(fixture.inkRequests).toEqual([]);
    expect(fixture.posterRequests).toEqual([]);
  });

  for (const view of ['image', ...ALL_VARIANTS] as const) {
    test(`opens and shares the exact ${view} view inline from a direct link`, async ({ page }) => {
      const lastCopied = await captureClipboard(page);
      const fixture = await mockInkGallery(page);
      await page.goto(`/detail/420?ink=${view}`);
      const scope = viewer(page);
      const label = { image: 'Image', short: '30 sec', medium: '≈2 min', slow: '≈5 min' }[view];
      await expect(scope.getByRole('radio', { name: label, exact: true })).toBeChecked();
      await expect(scope.getByRole('radio', { name: 'Ink study', exact: true })).toBeChecked();
      const media =
        view === 'image'
          ? scope.getByTestId('ink-image-view').locator('img')
          : scope.getByTestId('ink-film-video');
      const assetPath = view === 'image' ? 'images/web/ember_full.webp' : FILMS[view].path;
      await expect(media).toHaveAttribute(
        'src',
        new RegExp(`/${assetPath.replaceAll('.', '\\.')}$`),
      );
      await expectInlineStage(page, view === 'image' ? 'image' : 'film');
      if (view === 'image') {
        expect(fixture.inkRequests).toEqual([]);
      } else {
        await expect.poll(() => fixture.inkRequests.length).toBeGreaterThan(0);
        expect(requestedVariants(fixture.inkRequests)).toEqual(
          new Set([assetPath.split('/').at(-1)]),
        );
      }
      await scope.getByRole('button', { name: 'Share', exact: true }).click();
      await page.getByRole('menuitem', { name: 'Copy link to this view', exact: true }).click();
      await expect.poll(lastCopied).toBe(new URL(`/detail/420?ink=${view}`, page.url()).href);
      await scope.getByRole('button', { name: 'Share', exact: true }).click();
      await page.getByRole('menuitem', { name: 'Copy media link', exact: true }).click();
      await expect
        .poll(lastCopied)
        .toBe(fixture.manifests[0]!.replace('metadata/assets.json', assetPath));

      await page.reload();
      await expect(scope.getByRole('radio', { name: label, exact: true })).toBeChecked();
      await expect(media).toHaveAttribute(
        'src',
        new RegExp(`/${assetPath.replaceAll('.', '\\.')}$`),
      );
      if (view === 'image') expect(fixture.inkRequests).toEqual([]);
      await selectView(scope, 'Original');
      await expect(page).toHaveURL(/\/detail\/420$/);
      await expectInlineStage(page, 'original');
    });
  }

  test('offers the image when no films have been published', async ({ page }) => {
    const fixture = await mockInkGallery(page, []);
    await page.goto('/detail/420');
    const scope = viewer(page);
    await selectView(scope, 'Ink study');
    await expect(page).toHaveURL(/\/detail\/420\?ink=image$/);
    await expect(scope.getByTestId('ink-image-view').locator('img')).toHaveAttribute(
      'src',
      /\/ember_full\.webp$/,
    );
    await expect(scope.getByRole('radio', { name: /sec|min/ })).toHaveCount(0);
    await expectInlineStage(page, 'image');
    expect(fixture.inkRequests).toEqual([]);
  });

  test('keeps Back and Forward in sync without navigating or stacking each selection', async ({
    page,
  }) => {
    await mockInkGallery(page);
    const serverNavigations: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (
        url.pathname === '/detail/420' &&
        (request.isNavigationRequest() || request.headers().rsc === '1')
      )
        serverNavigations.push(request.url());
    });
    await page.goto('/detail/420?ref=archive#artwork');
    const scope = viewer(page);
    await expect(scope.getByRole('radio', { name: 'Ink study', exact: true })).toBeVisible();
    const initialRequests = serverNavigations.length;
    const initialHistory = await page.evaluate(() => window.history.length);
    await selectView(scope, 'Ink study');
    await expect(page).toHaveURL(/\?ref=archive&ink=medium#artwork$/);
    await selectView(scope, '≈5 min');
    await selectView(scope, 'Image');
    await expect(page).toHaveURL(/\?ref=archive&ink=image#artwork$/);
    expect(await page.evaluate(() => window.history.length)).toBe(initialHistory + 1);
    await page.goBack();
    await expect(page).toHaveURL(/\/detail\/420\?ref=archive#artwork$/);
    await expect(scope.getByRole('radio', { name: 'Original', exact: true })).toBeChecked();
    await expectInlineStage(page, 'original');
    await page.goForward();
    await expect(scope.getByRole('radio', { name: 'Image', exact: true })).toBeChecked();
    await expect(page).toHaveURL(/\?ref=archive&ink=image#artwork$/);
    await selectView(scope, 'Original');
    await expect(page).toHaveURL(/\/detail\/420\?ref=archive#artwork$/);
    await expectInlineStage(page, 'original');
    expect(serverNavigations).toHaveLength(initialRequests);
  });

  test('shares a localized artwork link without unrelated query parameters', async ({ page }) => {
    const lastCopied = await captureClipboard(page);
    await mockInkGallery(page);
    await page.goto('/uk/detail/420?ref=archive&ink=image#artwork');
    const scope = viewer(page);
    await expect(scope.getByTestId('ink-image-view').locator('img')).toBeVisible();
    await scope.getByRole('button', { name: 'Поділитися', exact: true }).click();
    await page
      .getByRole('menuitem', { name: 'Копіювати посилання на цей варіант', exact: true })
      .click();
    await expect.poll(lastCopied).toBe(new URL('/uk/detail/420?ink=image', page.url()).href);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('shows an unavailable requested film without silently loading an alternative', async ({
    page,
  }) => {
    const fixture = await mockInkGallery(page, ['short', 'slow']);
    await page.goto('/detail/420?ink=medium');
    const scope = viewer(page);
    await expect(scope.getByRole('status')).toHaveText(
      'This ink view is not available for this artwork.',
    );
    const options = scope.getByRole('radiogroup', { name: 'Ink view' });
    await expect(options.getByRole('radio', { checked: true })).toHaveCount(0);
    await expect(options.getByRole('radio', { name: '≈2 min' })).toHaveCount(0);
    await expect(scope.getByTestId('artwork-stage').locator('img, video')).toHaveCount(0);
    expect(fixture.inkRequests).toEqual([]);
    expect(fixture.posterRequests).toEqual([]);
    await expect(page).toHaveURL(/\?ink=medium$/);
    await selectView(scope, '30 sec');
    await expect(scope.getByTestId('ink-film-video')).toHaveAttribute('src', /\/ember\.mp4$/);
    await expect(page).toHaveURL(/\?ink=short$/);
  });

  test('keeps missing image links inline with available films to choose', async ({ page }) => {
    const fixture = await mockInkGallery(page, ['medium'], { hasImage: false });
    await page.goto('/detail/420?ink=image');
    const scope = viewer(page);
    await expect(scope.getByRole('status')).toHaveText(
      'This ink view is not available for this artwork.',
    );
    await expect(scope.getByTestId('artwork-stage').locator('img')).toHaveCount(0);
    expect(fixture.inkRequests).toEqual([]);
    await selectView(scope, '≈2 min');
    await expect(scope.getByTestId('ink-film-video')).toHaveAttribute(
      'src',
      /\/ember_medium\.mp4$/,
    );
    await expect(page).toHaveURL(/\?ink=medium$/);
  });

  test('keeps the surrounding page and Original choice available for an entirely missing ink edition', async ({
    page,
  }) => {
    const fixture = await mockInkGallery(page, [], { hasImage: false });
    await page.goto('/detail/420?ink=image');
    const scope = viewer(page);
    await expect(scope.getByRole('status')).toHaveText(
      'This ink view is not available for this artwork.',
    );
    await expect(scope.getByRole('radio', { name: 'Ink study', exact: true })).toBeChecked();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ink fixture A');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(fixture.inkRequests).toEqual([]);
    expect(fixture.posterRequests).toEqual([]);
    await selectView(scope, 'Original');
    await expect(page).toHaveURL(/\/detail\/420$/);
    await expectInlineStage(page, 'original');
  });

  test('leaves unknown or ambiguous ink query values inert', async ({ page }) => {
    const fixture = await mockInkGallery(page);
    for (const query of ['ink=unknown', 'ink=IMAGE', 'ink=short&ink=slow']) {
      await page.goto(`/detail/420?${query}`);
      await expect(
        viewer(page).getByRole('radio', { name: 'Original', exact: true }),
      ).toBeChecked();
      await expectInlineStage(page, 'original');
      expect(fixture.inkRequests).toEqual([]);
      expect(fixture.posterRequests).toEqual([]);
    }
  });

  test('shows availability loading in the stage before displaying a directly linked image', async ({
    page,
  }) => {
    const fixture = await mockInkGallery(page);
    let releaseManifest!: () => void;
    fixture.state.holdManifest = new Promise<void>((resolve) => {
      releaseManifest = resolve;
    });
    try {
      await page.goto('/detail/420?ink=image');
      const scope = viewer(page);
      const stage = scope.getByTestId('artwork-stage');
      await expect(stage.getByRole('status')).toHaveText('Loading ink study…');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      expect(fixture.inkRequests).toEqual([]);
      expect(fixture.posterRequests).toEqual([]);
      const loadingBox = await stage.boundingBox();
      releaseManifest();
      await expectInlineStage(page, 'image');
      expect(
        Math.abs((await stage.boundingBox())!.height - loadingBox!.height),
      ).toBeLessThanOrEqual(1);
      expect(fixture.inkRequests).toEqual([]);
    } finally {
      releaseManifest();
    }
  });

  test('allows a directly linked image to recover from a manifest error', async ({ page }) => {
    const fixture = await mockInkGallery(page);
    fixture.state.manifestStatus = 400;
    await page.goto('/detail/420?ink=image');
    const scope = viewer(page);
    await expect(scope.getByRole('status')).toHaveText(
      'The ink study could not be checked. Try again.',
    );
    expect(fixture.inkRequests).toEqual([]);
    expect(fixture.posterRequests).toEqual([]);
    fixture.state.manifestStatus = 200;
    await scope.getByRole('button', { name: 'Try again' }).click();
    await expectInlineStage(page, 'image');
    await expect(page).toHaveURL(/\?ink=image$/);
    expect(fixture.inkRequests).toEqual([]);
  });

  test('waits for explicit playback when motion is reduced', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const fixture = await mockInkGallery(page);
    await page.goto('/detail/420');
    await selectView(viewer(page), 'Ink study');
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
    const scope = viewer(page);
    await selectView(scope, 'Ink study');
    await expect(scope.getByRole('status')).toHaveText('This ink film could not be loaded.');
    expect(fixture.inkRequests.length).toBeGreaterThan(0);
    expect(requestedVariants(fixture.inkRequests)).toEqual(new Set(['ember_medium.mp4']));
    await expect(scope.getByRole('radio', { name: '≈2 min' })).toBeChecked();
    const stageBox = await scope.getByTestId('artwork-stage').boundingBox();
    fixture.state.failVideos = false;
    await scope.getByRole('button', { name: 'Try again' }).click();
    const video = scope.getByTestId('ink-film-video');
    await expect(video).toHaveAttribute('src', /\/ember_medium\.mp4$/);
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState))
      .toBeGreaterThanOrEqual(2);
    await expect(scope.getByRole('status')).toHaveCount(0);
    expect(
      Math.abs((await scope.getByTestId('artwork-stage').boundingBox())!.height - stageBox!.height),
    ).toBeLessThanOrEqual(1);
  });

  test('keeps the inline film and touch controls reachable in portrait and landscape', async ({
    page,
  }) => {
    await mockInkGallery(page);
    await page.goto('/detail/420?ink=medium');
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(viewport);
      await expectViewerFits(page);
      await expect(page.getByRole('dialog')).toHaveCount(0);
    }
  });

  test('lets keyboard users switch editions without trapping focus or treating Escape as close', async ({
    page,
  }) => {
    await mockInkGallery(page);
    await page.goto('/detail/420');
    const scope = viewer(page);
    const original = scope.getByRole('radio', { name: 'Original', exact: true });
    await original.focus();
    await page.keyboard.press('ArrowRight');
    const ink = scope.getByRole('radio', { name: 'Ink study', exact: true });
    await expect(ink).toBeChecked();
    await expect(ink).toBeFocused();
    await scope.getByRole('radio', { name: '≈2 min', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(scope.getByRole('radio', { name: '≈5 min', exact: true })).toBeChecked();
    await expect(scope.getByRole('radio', { name: '≈5 min', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\?ink=slow$/);
    await expectInlineStage(page, 'film');
    await ink.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(original).toBeChecked();
    await expect(original).toBeFocused();
    await expect(page).toHaveURL(/\/detail\/420$/);
  });

  test('opens an image lightbox only on explicit Full screen and restores its trigger', async ({
    page,
  }) => {
    await mockInkGallery(page);
    await page.goto('/detail/420?ink=image');
    const scope = viewer(page);
    await expectInlineStage(page, 'image');
    await scope.getByTestId('ink-image-view').locator('img').click();
    await expectInlineStage(page, 'image');
    const fullscreen = scope.getByRole('button', { name: 'Full screen', exact: true });
    await fullscreen.click();
    const lightbox = page.getByRole('dialog');
    await expect(lightbox).toBeVisible();
    await expect(lightbox.locator('img')).toHaveAttribute('src', /\/ember_full\.webp$/);
    await page.keyboard.press('Escape');
    await expect(lightbox).toBeHidden();
    await expect(fullscreen).toBeFocused();
    await expect(page).toHaveURL(/\?ink=image$/);
    await expectInlineStage(page, 'image');
  });

  test('keeps ink, sharing, and keyboard selection inside the one gallery quick view', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Quick view is a pointer-fine shortcut; touch cards open the detail page.');
    const lastCopied = await captureClipboard(page);
    const fixture = await mockInkGallery(page);
    await page.goto('/gallery?sort=oldest');
    const galleryUrl = page.url();
    const card = page.getByTestId('signature-card').filter({ hasText: 'Ink fixture A' });
    await expect(card).toBeVisible();
    expect(fixture.manifests).toEqual([]);
    await card.getByTestId('quick-view-button').click();
    const quickView = page.getByTestId('nft-quick-view');
    const scope = quickView.getByTestId('signature-viewer');
    await expect(scope.getByRole('radio', { name: 'Still', exact: true })).toBeChecked();
    await selectView(scope, 'Ink study');
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await expect(scope.getByTestId('artwork-stage').getByTestId('ink-film-video')).toBeVisible();
    await scope.getByRole('radio', { name: '≈2 min' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(scope.getByRole('radio', { name: '≈5 min' })).toBeChecked();
    await expect(quickView.getByRole('heading')).toHaveText('Ink fixture A');
    await scope.getByRole('button', { name: 'Share', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Copy link to this view', exact: true }).click();
    await expect.poll(lastCopied).toBe(new URL('/detail/420?ink=slow', page.url()).href);
    await expect(page).toHaveURL(galleryUrl);
    await expect(scope.getByRole('button', { name: 'Share', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(quickView).toBeHidden();
    await expect(card.getByTestId('quick-view-button')).toBeFocused();
  });

  test('keeps explicit fullscreen arrow keys within the selected gallery artwork', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Quick view is a pointer-fine shortcut; touch cards open the detail page.');
    await mockInkGallery(page);
    await page.goto('/gallery?sort=oldest');
    const card = page.getByTestId('signature-card').filter({ hasText: 'Ink fixture A' });
    await card.getByTestId('quick-view-button').click();
    const quickView = page.getByTestId('nft-quick-view');
    const scope = quickView.getByTestId('signature-viewer');
    await selectView(scope, 'Ink study');
    await selectView(scope, 'Image');
    const fullscreen = scope.getByRole('button', { name: 'Full screen', exact: true });
    await fullscreen.click();
    const lightbox = page.getByTestId('art-lightbox');
    await expect(lightbox).toBeVisible();
    await lightbox.getByRole('button', { name: 'Close', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(lightbox).toBeVisible();
    await expect(lightbox.getByRole('heading')).toHaveText('Ink fixture A');
    await page.keyboard.press('Escape');
    await expect(lightbox).toBeHidden();
    await expect(quickView.getByRole('heading')).toHaveText('Ink fixture A');
    await expect(scope.getByRole('radio', { name: 'Image', exact: true })).toBeChecked();
    await expect(fullscreen).toBeFocused();
  });

  test('releases the selected ink film and restores Original when the gallery advances to another artwork', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Quick view is a pointer-fine shortcut; touch cards open the detail page.');
    await mockInkGallery(page);
    await page.goto('/gallery?sort=oldest');
    const card = page.getByTestId('signature-card').filter({ hasText: 'Ink fixture A' });
    await card.getByTestId('quick-view-button').click();
    const quickView = page.getByTestId('nft-quick-view');
    const scope = quickView.getByTestId('signature-viewer');
    await selectView(scope, 'Ink study');
    const previousVideo = await scope.getByTestId('ink-film-video').elementHandle();
    const previousStage = await scope.getByTestId('artwork-stage').boundingBox();
    await quickView.getByRole('button', { name: 'Next Signature', exact: true }).click();
    await expect(quickView.getByRole('heading')).toHaveText('Ink fixture B');
    await expect(scope.getByRole('radio', { name: 'Still', exact: true })).toBeChecked();
    await expect(scope.getByTestId('ink-film-video')).toHaveCount(0);
    expect(
      await previousVideo!.evaluate((element: HTMLVideoElement) => ({
        paused: element.paused,
        src: element.getAttribute('src'),
      })),
    ).toEqual({ paused: true, src: null });
    await previousVideo!.dispose();
    expect(
      Math.abs(
        (await scope.getByTestId('artwork-stage').boundingBox())!.height - previousStage!.height,
      ),
    ).toBeLessThanOrEqual(1);
    await expect(page.getByRole('dialog')).toHaveCount(1);
  });
});
