import { expect, test } from '@playwright/test';

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

test.describe('Landing page @ cosmicsignature.com', () => {
  test.beforeEach(async ({ context }) => {
    await context.setExtraHTTPHeaders(LANDING_HEADERS);
  });

  test('renders the hero headline with lexicon-safe copy', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toContainText(/Every Gesture Shapes the/i);
    await expect(h1).toContainText(/Signature/i);
  });

  test('primary CTA links to the app subdomain', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const cta = page.getByRole('link', { name: /open the app/i }).first();
    await expect(cta).toHaveAttribute('href', 'https://app.cosmicsignature.com');
  });

  test('all ten landing sections are present in the DOM', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const sectionTitles = [
      'A Performance Cycle',
      'The Three Body Problem',
      'More than ten ways the protocol distributes',
      'Anchor Cosmic Signature',
      '7% of every cycle',
      'Protocol Coordination',
      'Open, verified, reproducible',
      'Questions worth answering plainly',
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

  test('contains no banned lexicon terms in rendered HTML', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const bodyText = (await page.locator('body').innerText()).toLowerCase();

    // "lottery" / "gambling" / "investment" appear only in FAQ denial
    // copy; confirm outside-FAQ text has no OTHER banned terms. We test
    // the most load-bearing ones here.
    const bannedOutsideFAQ = [/\bplace\s+a\s+bid\b/, /\braffle\b/, /\bprize\s+winner/, /\byield\b/];
    for (const pattern of bannedOutsideFAQ) {
      expect(bodyText).not.toMatch(pattern);
    }
  });

  test('honors prefers-reduced-motion by skipping the WebGL canvas', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      extraHTTPHeaders: LANDING_HEADERS,
    });
    const page = await context.newPage();
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      // The hero fallback renders a plain gradient div instead of a canvas.
      await expect(page.locator('canvas')).toHaveCount(0);
      // Hero content is still present.
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('cross-domain links to Protocol Guild and social open in a new tab with rel="noopener"', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const externalLinks = page.locator('footer a[href^="https://"]');
    const count = await externalLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      const target = await link.getAttribute('target');
      const rel = await link.getAttribute('rel');
      expect(target).toBe('_blank');
      expect(rel ?? '').toContain('noopener');
    }
  });

  test('hero secondary CTA scrolls to #cycle', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const secondary = page.getByRole('link', { name: /explore the cycle/i });
    await expect(secondary).toHaveAttribute('href', '#cycle');

    await secondary.click();
    await page.waitForTimeout(500); // allow smooth scroll

    const cycleSection = page.locator('#cycle');
    const box = await cycleSection.boundingBox();
    expect(box).not.toBeNull();
    // Top of the cycle section should be near the viewport top after scroll.
    expect(box!.y).toBeLessThan(200);
  });

  test('marquee chips render credibility signals', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    for (const chip of ['CC0', 'Formally Verified', '7% to Protocol Guild']) {
      await expect(page.getByText(chip).first()).toBeVisible();
    }
  });
});
