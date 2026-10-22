import { expect, test } from '@playwright/test';

import { TRANSLATED_LOCALES } from './locale-fixtures';
import { mockHomeGestureChatApi } from './home-gesture-chat-fixtures';

const LANDING_HEADERS = { 'X-Forwarded-Host': 'cosmicsignature.com' };
const V3_IMPLEMENTATION = '0xc1b97E1b0baC86248653B18706dbC5c8898c5c06';

test.describe('V3 launch documentation', () => {
  test.beforeEach(async ({ context }) => {
    await context.setExtraHTTPHeaders(LANDING_HEADERS);
  });

  test('English 1.3 identifies deployed V3 and its own allocation chart', async ({ page }) => {
    await page.goto('/white-paper', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Version 1.3', { exact: true })).toBeVisible();
    await expect(page.getByTestId('historical-paper-notice')).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: 'Download PDF', exact: true }).first(),
    ).toHaveAttribute('href', '/white-paper/cosmic-signature-white-paper-v1.3.pdf');
    await expect(page.locator('main')).toContainText(V3_IMPLEMENTATION);
    await expect(page.locator('main')).toContainText(
      'Finalization does not settle additional Participation CST',
    );

    const segments = page.getByTestId('allocation-bar').locator('[data-share]');
    expect(
      await segments.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-share'))),
    ).toEqual(['20', '15', '5', '5', '5', '50']);
    expect(await segments.allTextContents()).toEqual(['20%', '15%', '5%', '5%', '5%', '~50%']);

    const article = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((nodes) =>
        nodes
          .flatMap((node) => JSON.parse(node.textContent ?? '[]'))
          .find((entry: { '@type'?: string }) => entry['@type'] === 'ScholarlyArticle'),
      );
    expect(article).toMatchObject({ version: '1.3', datePublished: '2026-10-21' });
    expect(article.encoding.contentUrl).toMatch(
      /\/white-paper\/cosmic-signature-white-paper-v1\.3\.pdf$/,
    );

    const pdf = await page.request.get('/white-paper/cosmic-signature-white-paper-v1.3.pdf');
    expect(pdf.ok()).toBe(true);
    expect(pdf.headers()['content-type']).toContain('application/pdf');
    expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  });

  for (const locale of TRANSLATED_LOCALES) {
    test(`${locale}: historical edition stays labelled and points to current English`, async ({
      page,
    }) => {
      await page.goto(`/${locale}/white-paper`, { waitUntil: 'domcontentloaded' });
      const notice = page.getByTestId('historical-paper-notice');
      await expect(notice).toBeVisible();
      await expect(notice).toContainText('1.0');
      await expect(notice).toContainText('1.3');
      await expect(notice.getByRole('link')).toHaveAttribute(
        'href',
        'https://cosmicsignature.com/white-paper',
      );
      await expect(
        page
          .locator(`a[href="/white-paper/cosmic-signature-white-paper-v1.0-${locale}.pdf"]`)
          .first(),
      ).toBeVisible();

      const segments = page.getByTestId('allocation-bar').locator('[data-share]');
      expect(
        await segments.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-share'))),
      ).toEqual(['25', '8', '4', '6', '7', '50']);
    });
  }
});

test('V3 app clock shows three main NFTs with one CST allocation', async ({ page }) => {
  await mockHomeGestureChatApi(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const clock = page.locator('#cycle-clock');
  await expect(clock).toBeVisible();
  await expect(clock).toContainText('3 Cosmic Signature NFTs');
  await expect(clock).toContainText('1,000');
  await expect(clock).not.toContainText('1 Cosmic Signature NFT');
});
