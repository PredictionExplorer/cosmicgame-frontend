import { test } from '@playwright/test';

import { expectBrandHeldWhole } from './heading-lines';

/**
 * V425: at 390px the Japanese and Korean H1s broke inside the brand and left
 * "Cosmic" alone on the first line ("Cosmic / Signatureよく / ある質問"),
 * because the Japanese word glued to "Signature" gave the line no other place
 * to turn. The brand now holds together wherever a line can fit it.
 */
const ROUTES = [
  '/ja/faq',
  '/ja/gallery',
  '/ja/how-it-works',
  '/ja/contracts',
  '/ko/how-it-works',
  '/zh/how-it-works',
  '/how-it-works',
  '/faq',
];

test.describe('display headings keep the brand whole', () => {
  for (const width of [360, 390]) {
    test(`at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      for (const route of ROUTES) {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await expectBrandHeldWhole(page, `${route} at ${width}px`);
      }
    });
  }
});
