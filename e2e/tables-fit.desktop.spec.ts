import { expect, test, type Locator } from '@playwright/test';

import { MOBILE_AUDIT_SAMPLE_TEXT, mockMobileAuditApi } from './mobile-audit-fixtures';

/**
 * Wide-screen guards for the ledgers, against the dense fixtures (full
 * addresses, unbroken messages, attached assets). A table wider than its
 * column scrolls inside its own container; these ledgers must never need to,
 * whatever a participant writes.
 */

async function overflowOf(scroller: Locator) {
  return scroller.evaluate((element) => element.scrollWidth - element.clientWidth);
}

test.use({ viewport: { width: 1440, height: 900 } });

test('the moderation list keeps an unbroken message inside its column', async ({ page }) => {
  await mockMobileAuditApi(page);
  await page.goto('/admin');
  const message = page.getByText(MOBILE_AUDIT_SAMPLE_TEXT.longMessage).first();
  await expect(message).toBeVisible({ timeout: 15_000 });

  const scroller = page.locator('.cs-table-scroll').filter({ has: message });
  expect(await overflowOf(scroller)).toBeLessThanOrEqual(1);
  // No header wraps because the table was squeezed by one long word.
  const typeHeader = scroller.getByRole('columnheader', { name: 'Gesture type' });
  const box = await typeHeader.boundingBox();
  expect(box?.height ?? 0).toBeLessThan(48);
});

test('gesture info names its Random Walk NFT as a link, with no image to break', async ({
  page,
}) => {
  await mockMobileAuditApi(page);
  await page.goto('/current-cycle');
  const walk = page.getByRole('link', { name: /Random Walk #987654/ });
  await walk.scrollIntoViewIfNeeded({ timeout: 15_000 });
  // The one Random Walk host every link uses (utils/urls randomWalkTokenUrl).
  await expect(walk).toHaveAttribute('href', 'https://www.randomwalknft.com/detail/987654');

  const history = page.locator('table').filter({ has: walk });
  await expect(history.locator('img')).toHaveCount(0);

  // Each row link's name starts with the date it shows (WCAG 2.5.3).
  const firstLink = history.locator('tbody tr').first().getByRole('link').first();
  const shown = (await firstLink.locator('time').innerText()).trim();
  await expect(firstLink).toHaveAccessibleName(new RegExp(`^${shown}`));
  await expect(firstLink).not.toHaveAttribute('aria-label', /.+/);
});
