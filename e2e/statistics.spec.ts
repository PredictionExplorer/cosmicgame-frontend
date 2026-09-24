import { test, expect, type Page } from '@playwright/test';

/** Scrolls locator into view before interaction/assertion (needed on mobile). */
async function ensureVisible(locator: { scrollIntoViewIfNeeded(): Promise<void> }) {
  await locator.scrollIntoViewIfNeeded();
}

async function expectNoBrokenValues(page: Page) {
  const bodyText = await page.locator('body').innerText();
  expect(bodyText).not.toContain('undefined');
  expect(bodyText).not.toContain('NaN');
}

/** The layout viewport never grows past the device width (a wide child would widen it). */
async function expectNoWidenedViewport(page: Page) {
  const widths = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    inner: window.innerWidth,
  }));
  expect(widths.client).toBe(widths.inner);
}

test.describe('Statistics hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/statistics', { waitUntil: 'networkidle' });
  });

  test('shows the page header and its headline figures', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Protocol statistics' })).toBeVisible({
      timeout: 15000,
    });
    for (const label of [
      'Active Performance Cycle',
      'Allocations distributed',
      'NFTs imprinted',
      'Contract balance',
    ]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('opens on the live cycle and where its reserve goes', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 2, name: /^Cycle \d+ so far$/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open the current cycle' })).toHaveAttribute(
      'href',
      '/current-cycle',
    );
    const split = page.getByRole('heading', { name: 'Where the Cycle Reserve goes' });
    await ensureVisible(split);
    await expect(split).toBeVisible();
  });

  test('shows the protocol economy as three sheets with one Definitions disclosure', async ({
    page,
  }) => {
    const economy = page.getByRole('heading', { level: 2, name: 'Protocol economy' });
    await ensureVisible(economy);
    for (const group of ['Allocation economy', 'Token economy', 'Public Goods & contributions']) {
      await expect(page.getByRole('heading', { level: 3, name: group })).toBeVisible();
    }
    const definitions = page.locator('details').filter({ hasText: 'Definitions' }).first();
    await definitions.locator('summary').click();
    await expect(
      definitions.getByText(/CST sent from the Outreach Reserve to outreach and ecosystem/),
    ).toBeVisible();
  });

  test('renders the sticky sub-navigation with all section links', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Statistics sections' });
    await expect(nav).toBeVisible();
    for (const label of [
      'Overview',
      'Participation',
      'Tokens',
      'Anchoring',
      'Activity',
      'Outcomes',
    ]) {
      await expect(nav.getByRole('link', { name: label })).toBeAttached();
    }
    await expect(nav.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('indexes the section pages', async ({ page }) => {
    const index = page.getByRole('navigation', { name: 'Statistics section pages' });
    await ensureVisible(index);
    await expect(index.locator('a[href="/statistics/participation"]')).toBeVisible();
    await expect(index.locator('a[href="/statistics/performance"]')).toBeVisible();
  });

  test('stats show numeric values, not undefined', async ({ page }) => {
    await expectNoBrokenValues(page);
    await expectNoWidenedViewport(page);
  });
});

test.describe('Statistics section pages', () => {
  test('participation page renders the unique participant tables', async ({ page }) => {
    await page.goto('/statistics/participation', { waitUntil: 'networkidle' });
    await expect(
      page.getByRole('heading', { level: 1, name: 'Participation statistics' }),
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole('heading', { level: 2, name: 'Unique participants' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Unique recipients' })).toBeAttached();
    await expectNoBrokenValues(page);
  });

  test('tokens page renders distribution sections', async ({ page }) => {
    await page.goto('/statistics/tokens', { waitUntil: 'networkidle' });
    await expect(
      page.getByRole('heading', { level: 1, name: 'Token distribution statistics' }),
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole('heading', { level: 2, name: 'CST (ERC-20) balance distribution' }),
    ).toBeAttached();
    await expect(page.getByRole('heading', { level: 2, name: 'Attached assets' })).toBeAttached();
    await expectNoBrokenValues(page);
  });

  test('anchoring page tabs switch between the two collections', async ({ page }) => {
    await page.goto('/statistics/anchoring', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { level: 1, name: 'Anchoring statistics' })).toBeVisible(
      {
        timeout: 15000,
      },
    );

    const cstTab = page.getByRole('tab', { name: 'Cosmic Signature NFT' });
    const rwalkTab = page.getByRole('tab', { name: 'Random Walk NFT' });
    await ensureVisible(cstTab);
    await expect(cstTab).toHaveAttribute('aria-selected', 'true');
    await rwalkTab.click();
    await expect(rwalkTab).toHaveAttribute('aria-selected', 'true');
  });

  test('anchoring page renders anchor/release actions content', async ({ page }) => {
    await page.goto('/statistics/anchoring', { waitUntil: 'networkidle' });
    const actions = page.getByRole('heading', { name: 'Anchor / release actions' }).first();
    await ensureVisible(actions);
    await expect(actions).toBeVisible();

    const actionRows = page.locator('table tbody tr').filter({ hasText: /Anchor|Release/i });
    if ((await actionRows.count()) > 0) {
      const firstRow = actionRows.first();
      await ensureVisible(firstRow);
      await expect(firstRow).toBeVisible();
    } else {
      await expect(page.getByText(/No anchor actions yet/i).first()).toBeVisible();
    }
  });

  test('activity page drives every cycle chart from one cycle picker', async ({ page }) => {
    await page.goto('/statistics/activity', { waitUntil: 'networkidle' });
    await expect(
      page.getByRole('heading', { level: 1, name: 'Gesture activity statistics' }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Gesture frequency over time' })).toBeVisible();
    const cycle = page.getByRole('heading', { level: 2, name: 'One cycle in detail' });
    await ensureVisible(cycle);
    await expect(
      page.getByRole('heading', { level: 3, name: 'Endurance & Chrono timeline' }),
    ).toBeAttached();
    // One picker for the page, not one per chart.
    await expect(page.getByRole('button', { name: 'Previous cycle' })).toHaveCount(1);
    await expectNoBrokenValues(page);
    await expectNoWidenedViewport(page);
  });

  test('outcomes page shows spending beside what was received, and retrievals', async ({
    page,
  }) => {
    await page.goto('/statistics/performance', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { level: 1, name: 'Participant outcomes' })).toBeVisible(
      {
        timeout: 15000,
      },
    );
    await expect(page.getByRole('heading', { level: 2, name: 'Spent and received' })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Retrievals by cycle' }),
    ).toBeAttached();
    await expect(page.getByText(/Biggest Spender|Highest Net/)).toHaveCount(0);
    await expectNoBrokenValues(page);
  });

  test('sub-navigation navigates between section pages', async ({ page }) => {
    await page.goto('/statistics', { waitUntil: 'networkidle' });
    const nav = page.getByRole('navigation', { name: 'Statistics sections' });
    await nav.getByRole('link', { name: 'Participation' }).click();
    await expect(page).toHaveURL(/\/statistics\/participation$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Participation statistics' }),
    ).toBeVisible({ timeout: 15000 });
    await expect(nav.getByRole('link', { name: 'Participation' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
