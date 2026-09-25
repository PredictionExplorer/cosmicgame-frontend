import { expect, test, type Page } from '@playwright/test';

import { getAboutContent } from '../content/about';
import { getLandingContent } from '../content/landing';

import { LOCALE_CHROME, LOCALE_SEO, TRANSLATED_LOCALES, routing } from './locale-fixtures';

/**
 * End-to-end tests for the landing site at cosmicsignature.com.
 *
 * Browsers forbid setting the `Host` header directly (CORS security), so
 * we use `X-Forwarded-Host` instead. The proxy middleware reads this
 * header first (`req.headers.get('x-forwarded-host') ?? req.headers.get('host')`),
 * so the effect is identical: the server treats the request as coming from
 * the landing host and rewrites `/` to `/landing-site`.
 */

const LANDING_HEADERS = { 'X-Forwarded-Host': 'cosmicsignature.com' };
const APP_ORIGIN_PATTERN =
  /^https:\/\/app\.cosmicsignature\.com$|^http:\/\/app\.cosmicsignature\.local:3000$/;
const APP_ZH_ORIGIN_PATTERN =
  /^https:\/\/app\.cosmicsignature\.com\/zh$|^http:\/\/app\.cosmicsignature\.local:3000\/zh$/;
const CURRENT_CYCLE_PATTERN =
  /^https:\/\/app\.cosmicsignature\.com(\/zh)?\/current-cycle$|^http:\/\/app\.cosmicsignature\.local:3000(\/zh)?\/current-cycle$/;
const MOCK_NOW_SECONDS = 1_700_000_000;
const MOCK_CYCLE_FINALIZATION_SECONDS = MOCK_NOW_SECONDS + 7_265;
const CURRENT_TIME_ROUTE = '**/api/cosmicgame/time/current';
const CYCLE_FINALIZATION_TIME_ROUTE = '**/api/cosmicgame/rounds/current/time';
const DASHBOARD_ROUTE = '**/api/cosmicgame/statistics/dashboard';

async function mockLandingCycleApi(
  page: Page,
  overrides: {
    currentTimeSeconds?: number;
    finalizationSeconds?: number;
    dashboard?: Record<string, unknown>;
  } = {},
) {
  const currentTimeSeconds = overrides.currentTimeSeconds ?? MOCK_NOW_SECONDS;
  const finalizationSeconds = overrides.finalizationSeconds ?? MOCK_CYCLE_FINALIZATION_SECONDS;

  await page.unroute(CURRENT_TIME_ROUTE).catch(() => undefined);
  await page.unroute(CYCLE_FINALIZATION_TIME_ROUTE).catch(() => undefined);
  await page.unroute(DASHBOARD_ROUTE).catch(() => undefined);

  await page.route(CURRENT_TIME_ROUTE, (route) =>
    route.fulfill({ json: { CurrentTimeStamp: currentTimeSeconds } }),
  );
  await page.route(CYCLE_FINALIZATION_TIME_ROUTE, (route) =>
    route.fulfill({ json: { CurRoundPrizeTime: finalizationSeconds } }),
  );
  await page.route(DASHBOARD_ROUTE, (route) =>
    route.fulfill({
      json: {
        CurRoundNum: 42,
        CurNumBids: 128,
        PrizeAmountEth: 2.5,
        PrizeClaimTs: 0,
        TsRoundStart: currentTimeSeconds - 3600,
        LastBidderAddr: '0x1111111111111111111111111111111111111111',
        GestureCostEth: 0.01,
        StakingAmountEth: 0,
        MainStats: {
          NumCSTokenMints: 100,
          TotalRaffleEthDeposits: 0,
          TotalCSTConsumedEth: 0,
          TotalMktRewardsEth: 0,
          NumMktRewards: 0,
          TotalRaffleEthWithdrawn: 0,
          NumBidsCST: 0,
          NumUniqueBidders: 12,
          NumUniqueWinners: 0,
          NumUniqueDonors: 0,
          TotalNamedTokens: 0,
          NumUniqueStakersCST: 0,
          NumUniqueStakersRWalk: 0,
          StakeStatisticsCST: { NumActiveStakers: 0, TotalTokensStaked: 0 },
          StakeStatisticsRWalk: { NumActiveStakers: 0, TotalTokensStaked: 0 },
        },
        NumRaffleNFTWinnersBidding: 0,
        NumRaffleNFTWinnersStakingRWalk: 0,
        ...overrides.dashboard,
      },
    }),
  );
}

test.describe('Landing page @ cosmicsignature.com', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.setExtraHTTPHeaders(LANDING_HEADERS);
    await mockLandingCycleApi(page);
  });

  test('renders the hero headline with lexicon-safe copy', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const h1 = page.getByRole('heading', { level: 1 });
    const hero = getLandingContent('en').hero;
    await expect(h1).toContainText(hero.headlineLead);
    await expect(h1).toContainText(hero.headlineAccent);
  });

  test('primary CTA links to the app subdomain', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const cta = page.getByRole('link', { name: /open the app/i }).first();
    await expect(cta).toHaveAttribute('href', APP_ORIGIN_PATTERN);
  });

  test('renders the live Event Horizon cycle timer in the hero', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const timer = page.getByLabel('Live Performance Cycle countdown');
    await expect(timer).toBeVisible({ timeout: 10_000 });
    await expect(timer.getByText('Live cycle clock')).toBeVisible();
    await expect(timer.getByRole('heading', { name: /Cycle #42 finalizes in/i })).toBeVisible();
    await expect(timer.getByText('128 Gestures')).toBeVisible();
    // One freshness stamp replaces the three "same clock as the app" lines.
    await expect(timer.getByText(/^Updated /)).toBeVisible();
    await expect(timer.getByTestId('countdown-value')).toHaveCount(4);

    const liveCycleLink = timer.getByRole('link', { name: /open the current cycle/i });
    await expect(liveCycleLink).toHaveAttribute('href', CURRENT_CYCLE_PATTERN);
  });

  test('keeps counting from the last reading when a poll fails', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const timer = page.getByLabel('Live Performance Cycle countdown');
    await expect(timer.getByTestId('countdown-value')).toHaveCount(4, { timeout: 10_000 });

    await page.route('**/api/cosmicgame/**', (route) => route.abort());
    await expect(timer.getByRole('status')).toHaveText('Reconnecting…', { timeout: 20_000 });
    await expect(timer.getByRole('heading', { name: /Cycle #42 finalizes in/i })).toBeVisible();
    await expect(timer.getByTestId('countdown-value')).toHaveCount(4);
    await expect(timer.getByText(/unavailable/i)).toHaveCount(0);
  });

  test('renders opening-soon state in the hero timer', async ({ page }) => {
    await mockLandingCycleApi(page, {
      dashboard: {
        TsRoundStart: 0,
        LastBidderAddr: '0x0000000000000000000000000000000000000000',
        CurRoundStats: {
          TotalBids: 0,
          ActivationTime: Math.floor(Date.now() / 1000) + 3600,
        },
      },
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const timer = page.getByLabel('Live Performance Cycle countdown');
    await expect(timer.getByRole('heading', { name: /Cycle #42 opens soon/i })).toBeVisible();
    await expect(timer.getByTestId('countdown-value')).toHaveCount(4);
  });

  test('renders waiting-for-first-Gesture state in the hero timer', async ({ page }) => {
    await mockLandingCycleApi(page, {
      dashboard: {
        TsRoundStart: 0,
        LastBidderAddr: '0x0000000000000000000000000000000000000000',
      },
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const timer = page.getByLabel('Live Performance Cycle countdown');
    await expect(
      timer.getByRole('heading', { name: /Cycle #42 is waiting for its first Gesture/i }),
    ).toBeVisible();
    await expect(timer.getByText(/The first gesture ignites/i)).toBeVisible();
    await expect(timer.getByRole('link', { name: /open the app/i })).toHaveAttribute(
      'href',
      APP_ORIGIN_PATTERN,
    );
  });

  test('every landing section is present, art first', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const sectionTitles = [
      getLandingContent('en').art.heading,
      'A Performance Cycle',
      'More than ten ways the protocol distributes',
      'Anchor Cosmic Signature',
      'Every cycle funds Ethereum',
      'Protocol Coordination',
      'Open, verified, reproducible',
      'Questions worth answering plainly',
      'Every cycle adds to the collection',
    ];

    for (const title of sectionTitles) {
      const heading = page.getByRole('heading', { name: new RegExp(title, 'i') }).first();
      await expect(heading).toBeVisible({ timeout: 10_000 });
    }
  });

  test('renders the FAQPage JSON-LD script', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const scripts = page.locator('script[type="application/ld+json"]');
    const count = await scripts.count();
    expect(count).toBeGreaterThanOrEqual(1);

    const contents = await scripts.allInnerTexts();
    const hasFAQ = contents.some((c) => c.includes('"@type":"FAQPage"'));
    expect(hasFAQ).toBe(true);
  });

  test('renders the complete Chinese landing page and localized FAQ JSON-LD', async ({ page }) => {
    await page.goto('/zh', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      getLandingContent('zh').hero.headlineLead,
    );
    await expect(page.getByRole('link', { name: '打开应用' }).first()).toHaveAttribute(
      'href',
      APP_ZH_ORIGIN_PATTERN,
    );

    const timer = page.getByLabel('实时演绎周期倒计时');
    await expect(timer.getByText('实时周期时钟')).toBeVisible({ timeout: 10_000 });
    await expect(timer.getByRole('heading', { name: /第 42 个周期距收官还有/ })).toBeVisible();
    await expect(timer.getByText('128 次落笔')).toBeVisible();
    await expect(timer.getByRole('link', { name: '查看当前周期' })).toHaveAttribute(
      'href',
      CURRENT_CYCLE_PATTERN,
    );

    await expect(page.getByText('参与者实际要做什么？')).toBeVisible();
    const scripts = await page.locator('script[type="application/ld+json"]').allInnerTexts();
    const faq = scripts.find((content) => content.includes('"@type":"FAQPage"'));
    expect(faq).toContain('"inLanguage":"zh-Hans"');
    expect(faq).toContain('参与者实际要做什么？');
  });

  test('keeps Chinese landing copy within the viewport at release breakpoints', async ({
    page,
  }, testInfo) => {
    for (const viewport of [
      { name: 'mobile-320', width: 320, height: 800 },
      { name: 'tablet-768', width: 768, height: 1024 },
      { name: 'desktop-1440', width: 1440, height: 1000 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/zh', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { level: 1 })).toContainText(
        getLandingContent('zh').hero.headlineLead,
      );
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        )
        .toBe(true);
      await testInfo.attach(`zh-landing-${viewport.name}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });

      for (const route of [
        { path: '/zh/about', heading: getAboutContent('zh').heading },
        { path: '/zh/learn', heading: '了解 Cosmic Signature' },
        {
          path: '/zh/learn/what-is-cosmic-signature',
          heading: '什么是 Cosmic Signature？',
        },
      ]) {
        await page.goto(route.path, { waitUntil: 'domcontentloaded' });
        await expect(page.getByRole('heading', { level: 1, name: route.heading })).toBeVisible();
        await expect
          .poll(() =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
            ),
          )
          .toBe(true);
      }
    }
  });

  // Every translated locale runs the same landing check, with its chrome
  // strings and SEO values read from the fixtures, so a new locale is covered
  // the moment it is registered (the Simplified Chinese sprint case above
  // stays as the historical acceptance record).
  for (const locale of TRANSLATED_LOCALES) {
    test(`keeps ${locale} landing copy within the viewport at release breakpoints`, async ({
      page,
    }, testInfo) => {
      const chrome = LOCALE_CHROME[locale];
      const seo = LOCALE_SEO[locale];
      const home = `/${locale}`;
      for (const viewport of [
        { name: 'mobile-320', width: 320, height: 800 },
        { name: 'tablet-768', width: 768, height: 1024 },
        { name: 'desktop-1440', width: 1440, height: 1000 },
      ]) {
        await page.setViewportSize(viewport);
        await page.goto(home, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await expect(page.getByRole('heading', { level: 1 })).toContainText(chrome.landingText);
        await expect
          .poll(() =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
            ),
          )
          .toBe(true);
        await testInfo.attach(`${locale}-landing-${viewport.name}`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        });

        for (const route of seo.landingPages.filter((entry) => entry.path !== home)) {
          await page.goto(route.path, { waitUntil: 'domcontentloaded' });
          await expect(page.getByRole('heading', { level: 1, name: route.h1 })).toBeVisible();
          await expect
            .poll(() =>
              page.evaluate(
                () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
              ),
            )
            .toBe(true);
        }
      }

      // The landing FAQ JSON-LD must be in the locale too.
      await page.goto(home, { waitUntil: 'domcontentloaded' });
      const scripts = await page.locator('script[type="application/ld+json"]').allInnerTexts();
      const faq = scripts.find((content) => content.includes('"@type":"FAQPage"'));
      expect(faq).toContain(`"inLanguage":"${seo.inLanguage}"`);
      expect(faq).toMatch(chrome.script);
    });
  }

  test('contains no banned lexicon terms in rendered HTML', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const bodyText = (await page.locator('body').innerText()).toLowerCase();

    // "lottery" / "gambling" / "investment" appear only in FAQ denial
    // copy; confirm outside-FAQ text has no OTHER banned terms. We test
    // the most load-bearing ones here.
    const bannedOutsideFAQ = [
      /\bplace\s+a\s+bid\b/,
      /\braffle\b/,
      /\bprize\s+recipient/,
      /\byield\b/,
    ];
    for (const pattern of bannedOutsideFAQ) {
      expect(bodyText).not.toMatch(pattern);
    }
  });

  test('draws no canvas, and holds the art still under reduced motion', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      extraHTTPHeaders: LANDING_HEADERS,
    });
    const page = await context.newPage();
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      // The hero atmosphere is static CSS; there is no WebGL at all.
      await expect(page.locator('canvas')).toHaveCount(0);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      // No rotation and no animation start by themselves.
      await expect(page.getByTestId('hero-art-showcase')).toHaveAttribute('data-rotating', 'false');
      await expect(page.getByRole('button', { name: /pause the artwork rotation/i })).toHaveCount(
        0,
      );
      await expect(page.locator('#art video')).toHaveCount(0);
    } finally {
      await context.close();
    }
  });

  test('requests the animation only once The Art nears the screen', async ({ page }) => {
    // Regression: the 3 MB mp4 downloaded on every desktop load, before the
    // visitor scrolled anywhere near The Art.
    await page.setViewportSize({ width: 1440, height: 900 });
    const videoRequests: string[] = [];
    await page.route('**/*.mp4', (route) => {
      videoRequests.push(route.request().url());
      return route.abort();
    });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');
    expect(videoRequests).toEqual([]);

    await page.locator('#art figure').scrollIntoViewIfNeeded();
    await expect.poll(() => videoRequests.length).toBeGreaterThan(0);
  });

  test('cross-domain links to Protocol Guild and social open in a new tab with rel="noopener"', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const links = await page.locator('footer a[href^="http"]').evaluateAll((anchors) =>
      anchors.map((anchor) => ({
        href: anchor.getAttribute('href') ?? '',
        target: anchor.getAttribute('target'),
        rel: anchor.getAttribute('rel') ?? '',
      })),
    );
    // The footer carries the app's directory too: those links cross to our own
    // app host in the same tab (it is still Cosmic Signature). Every link that
    // leaves Cosmic Signature opens a new tab without an opener.
    const ownHost = (href: string) =>
      /(^|\.)cosmicsignature\.(com|local)$/.test(new URL(href).hostname);
    const thirdParty = links.filter((link) => !ownHost(link.href));
    const appLinks = links.filter((link) => ownHost(link.href));
    expect(thirdParty.map((link) => new URL(link.href).hostname)).toEqual(
      expect.arrayContaining(['protocol-guild.readthedocs.io', 'x.com', 'discord.gg']),
    );
    for (const link of thirdParty) {
      expect(link.target, link.href).toBe('_blank');
      expect(link.rel, link.href).toContain('noopener');
    }
    expect(appLinks.length).toBeGreaterThan(0);
    for (const link of appLinks) expect(link.target, link.href).toBeNull();
  });

  test('reaches the closing band with every plate loaded, none repeated from Anchoring', async ({
    page,
  }) => {
    // Nine Signatures, the three newest anchored; every published image is
    // served from the bundled preview so the check never leaves the machine.
    const tokens = Array.from({ length: 9 }, (_, index) => ({
      TokenId: 60 - index,
      Seed: (60 - index).toString(16).padStart(2, '0').repeat(32),
      RoundNum: 3,
      Staked: index < 3,
      Tx: { TimeStamp: 1_790_000_000 },
    }));
    await page.route('**/api/cosmicgame/cst/list/all/**', (route) =>
      route.fulfill({ json: { CosmicSignatureTokenList: tokens } }),
    );
    await page.route('**/images/new/cosmicsignature/**', (route) =>
      route.fulfill({ path: 'public/images/landing/signature-24.webp', contentType: 'image/webp' }),
    );
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('#landing-closing-heading').scrollIntoViewIfNeeded();

    const band = page.getByTestId('collection-recent');
    const frames = band.getByTestId('art-frame');
    await expect(frames).toHaveCount(6);
    for (const frame of await frames.all()) {
      await expect(frame).toHaveAttribute('data-status', 'loaded', { timeout: 3_000 });
    }
    const hrefs = async (testId: string) =>
      page
        .getByTestId(testId)
        .locator('a[href*="/detail/"]')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    const anchored = await hrefs('collection-anchored');
    const newest = await hrefs('collection-recent');
    expect(anchored).toHaveLength(3);
    expect(newest.filter((href) => anchored.includes(href))).toEqual([]);
  });

  test('footer language directory links every edition of the home at its public URL', async ({
    page,
  }) => {
    // The home renders under the internal `/landing-site` route (rewritten
    // from `/`), and that is what the prerender sees as its pathname — the
    // directory must still link `/`, `/zh`, … and never leak the internal route.
    for (const path of ['/', '/vi']) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const directory = page.locator('footer').getByTestId('language-directory');
      // Every link, folded or not: phones fold the directory behind its heading.
      const hrefs = await directory
        .locator('a[href]')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
      expect(hrefs).toEqual(
        routing.locales.map((locale) => (locale === routing.defaultLocale ? '/' : `/${locale}`)),
      );
    }
  });

  test('hero secondary CTA scrolls to #cycle', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const secondary = page.getByRole('link', { name: /how a cycle works/i });
    await expect(secondary).toHaveAttribute('href', '#cycle');

    await secondary.click();

    const cycleSection = page.locator('#cycle');
    await expect(cycleSection).toBeInViewport({ ratio: 0.01 });
  });

  test('keeps trust claims off the hero and links them to their evidence', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const hero = page.locator('[aria-labelledby="landing-headline"]');
    for (const claim of ['Verified Contracts', 'Audited Contracts', 'Formally Verified']) {
      await expect(hero.getByText(claim)).toHaveCount(0);
    }
    const evidence = page.getByRole('list', { name: 'Check it yourself' });
    for (const [name, path] of [
      ['Contracts', '/contracts'],
      ['Source Code', '/code'],
      ['Audits', '/audits'],
      ['Security', '/security'],
    ] as const) {
      await expect(evidence.getByRole('link', { name })).toHaveAttribute(
        'href',
        new RegExp(`${path}$`),
      );
    }
  });

  test('shows the art in the first screen of a phone, above the primary action', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const plate = page.getByTestId('hero-art-link');
    const primary = page
      .locator('main')
      .getByRole('link', { name: /open the app/i })
      .first();
    await expect(plate).toBeInViewport({ ratio: 1 });
    await expect(primary).toBeInViewport();
    // Drawn above the action, but read (and focused) after it.
    const plateBox = await plate.boundingBox();
    const primaryBox = await primary.boundingBox();
    expect(plateBox!.y).toBeLessThan(primaryBox!.y);
  });

  test('reaches the primary action by keyboard before the exhibit controls', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const hero = page.locator('[aria-labelledby="landing-headline"]');
    const primary = hero.getByRole('link', { name: /open the app/i });
    const firstControl = hero.getByRole('button').first();
    const order = await primary.evaluate(
      (node, other) => node.compareDocumentPosition(other as Node),
      await firstControl.elementHandle(),
    );
    expect(order & 4 /* Node.DOCUMENT_POSITION_FOLLOWING */).toBeTruthy();
  });

  test('opens the FAQ with what a participant does, not with a denial', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const questions = page.locator('#faq summary');
    await expect(questions.first()).toHaveText('What do I actually do as a participant?');
    await expect(questions.nth(1)).toHaveText('What is the art, technically?');
  });

  test('renders every section visibly without JavaScript', async ({ browser }) => {
    // Regression (F056): scroll reveals rendered sections at opacity 0 until
    // hydration; without JavaScript they stayed blank.
    const context = await browser.newContext({
      javaScriptEnabled: false,
      extraHTTPHeaders: LANDING_HEADERS,
    });
    const page = await context.newPage();
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      for (const selector of ['#art ol', '#tracks ul', '#faq details', '#cycle ol']) {
        const element = page.locator(selector).first();
        await element.scrollIntoViewIfNeeded();
        await expect(element).toBeVisible();
        expect(await element.evaluate((node) => getComputedStyle(node).opacity)).toBe('1');
      }
      // The clock's noscript line stands in for the figures.
      await expect(page.locator('main noscript p')).toContainText(
        'The live clock needs JavaScript.',
      );
      // Controls that need JavaScript are not offered; the links still work.
      for (const name of [/next artwork/i, /previous artwork/i, /play the animation/i]) {
        await expect(page.getByRole('button', { name })).toBeHidden();
      }
      await expect(page.getByTestId('hero-art-link')).toBeVisible();
    } finally {
      await context.close();
    }
  });
});
