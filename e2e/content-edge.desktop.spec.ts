import { expect, test } from '@playwright/test';

import { mockMobileAuditApi } from './mobile-audit-fixtures';
import { waitForStableLayout } from './mobile-audit-helpers';

/**
 * One content edge (docs/design-system.md, "Layout rhythm"): a page's H1
 * starts on the header's content edge at every width (under the wordmark on
 * desktop, under the menu button below lg), because PageShell, the header
 * and the footer all draw their edge from --gutter. PageShell used a fixed
 * 16/24px padding while the header used the gutter (clamp(1rem, 4vw,
 * 5rem)), so the two only met at 390, 1440 and 1920px and sat 9-27px apart
 * in between.
 */
const WIDTHS = [820, 1280, 1366, 1600] as const;
const ROUTES = ['/gallery', '/allocation', '/anchoring', '/current-cycle', '/contracts'] as const;

test.beforeEach(async ({ page }) => {
  await mockMobileAuditApi(page);
});

for (const width of WIDTHS) {
  test(`page content starts on the header's edge at ${width}px`, async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width, height: 900 });
    for (const path of ROUTES) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await waitForStableLayout(page);
      const edges = await page.evaluate(() => {
        const header = document.querySelector('header .site-container');
        const heading = document.querySelector('main h1');
        return {
          header: header?.getBoundingClientRect().left ?? null,
          heading: heading?.getBoundingClientRect().left ?? null,
        };
      });
      expect(edges.header, `${path}: header content edge`).not.toBeNull();
      expect(edges.heading, `${path}: page H1`).not.toBeNull();
      expect(
        Math.abs((edges.heading ?? 0) - (edges.header ?? 0)),
        `${path} at ${width}px: H1 at ${edges.heading}px, header edge at ${edges.header}px`,
      ).toBeLessThanOrEqual(1);
    }
  });
}
