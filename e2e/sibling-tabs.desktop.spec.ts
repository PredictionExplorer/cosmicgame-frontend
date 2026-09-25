import { expect, test, type Page } from '@playwright/test';

import { mockMobileAuditApi } from './mobile-audit-fixtures';
import { waitForStableLayout } from './mobile-audit-helpers';

/**
 * Sibling pages that share a tab row (the Trust Center, the operator tools)
 * keep that row on one line: the tab just clicked must not jump out from
 * under the pointer because the next page's eyebrow is a link rather than
 * text, its meta line holds a link rather than a stamp, or its lede is a line
 * shorter (PageHeader reserves the family's usual lede from lg).
 */
const FAMILIES = {
  trust: ['/security', '/audits', '/risk-disclosures', '/terms', '/privacy', '/contracts', '/code'],
  operator: ['/admin', '/admin/admin', '/internal/cst-outreach-transfer'],
} as const;

async function tabRowTop(page: Page, path: string): Promise<number | null> {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await waitForStableLayout(page);
  return page.evaluate(() => {
    const current = document.querySelector('main header nav [aria-current="page"]');
    const nav = current?.closest('nav');
    return nav ? Math.round(nav.getBoundingClientRect().top + window.scrollY) : null;
  });
}

test.beforeEach(async ({ page }) => {
  await mockMobileAuditApi(page);
  await page.setViewportSize({ width: 1440, height: 900 });
});

for (const [family, paths] of Object.entries(FAMILIES)) {
  test(`${family}: the tab row sits on one line across its pages`, async ({ page }) => {
    test.slow();
    const tops: Record<string, number | null> = {};
    for (const path of paths) tops[path] = await tabRowTop(page, path);
    const first = tops[paths[0]];
    expect(first, `${paths[0]}: tab row`).not.toBeNull();
    for (const path of paths) {
      expect(tops[path], `${path}: tab row at ${tops[path]}px, ${paths[0]} at ${first}px`).toBe(
        first,
      );
    }
  });
}
