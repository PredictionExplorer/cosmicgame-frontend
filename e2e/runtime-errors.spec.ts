import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';

/**
 * Collects console errors and uncaught exceptions during page load and
 * initial data fetch cycle. Catches runtime issues like BigInt mixing,
 * undefined property access, and failed contract calls that TypeScript
 * can't detect at compile time due to `any`/`unknown` return types.
 */

const routes = [
  '/',
  '/gallery',
  '/statistics',
  '/faq',
  '/contracts',
  '/anchoring',
  '/allocation',
  '/eth-contribution',
  '/named-nfts',
  '/attached-nfts',
  '/recipient-history',
  '/public-goods-retrievals',
  '/my-tokens',
  '/my-anchors',
  '/my-allocations',
  '/my-statistics',
  '/gesture/1',
  '/allocation/1',
  '/detail/1',
];

interface PageError {
  type: 'console' | 'exception';
  message: string;
}

async function collectErrors(page: Page, url: string): Promise<PageError[]> {
  const errors: PageError[] = [];

  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (
        text.includes('favicon') ||
        text.includes('Failed to fetch usage') ||
        text.includes('net::ERR_')
      ) {
        return;
      }
      errors.push({ type: 'console', message: text });
    }
  });

  page.on('pageerror', (err) => {
    errors.push({ type: 'exception', message: err.message });
  });

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  return errors;
}

test.describe('Runtime error detection', () => {
  test('home page server-rendered shell responds and hydrates', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

    expect(response?.status()).toBe(200);
    await expect(page.locator('text=/Cycle #/').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });

  for (const route of routes) {
    test(`${route} has no runtime errors`, async ({ page }) => {
      const errors = await collectErrors(page, route);

      const criticalErrors = errors.filter(
        (e) =>
          e.message.includes('BigInt') ||
          e.message.includes('is not a function') ||
          e.message.includes('Cannot read properties of') ||
          e.message.includes('is not defined') ||
          e.message.includes('Unhandled Runtime Error'),
      );

      if (criticalErrors.length > 0) {
        const summary = criticalErrors.map((e) => `[${e.type}] ${e.message}`).join('\n');
        expect.soft(criticalErrors, `Critical errors on ${route}:\n${summary}`).toHaveLength(0);
      }
    });
  }
});

test.describe('BigInt safety', () => {
  test("home page contract reads don't mix BigInt with Number", async ({ page }) => {
    const bigintErrors: string[] = [];

    page.on('pageerror', (err) => {
      if (err.message.includes('BigInt')) {
        bigintErrors.push(err.message);
      }
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('BigInt')) {
        bigintErrors.push(msg.text());
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    expect(bigintErrors, `BigInt mixing errors detected:\n${bigintErrors.join('\n')}`).toHaveLength(
      0,
    );
  });

  test('contract detail pages handle BigInt returns correctly', async ({ page }) => {
    const bigintErrors: string[] = [];

    page.on('pageerror', (err) => {
      if (err.message.includes('BigInt')) {
        bigintErrors.push(err.message);
      }
    });

    await page.goto('/contracts', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    expect(
      bigintErrors,
      `BigInt mixing errors on /contracts:\n${bigintErrors.join('\n')}`,
    ).toHaveLength(0);
  });
});
