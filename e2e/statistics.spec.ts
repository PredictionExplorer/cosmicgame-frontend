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

test.describe('Statistics hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/statistics', { waitUntil: 'networkidle' });
  });

  test('shows the SEO summary and headline stats', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Cosmic Signature Protocol Statistics' }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Total Cycles/i).first()).toBeVisible();
    await expect(page.getByText(/Contract Balance/i).first()).toBeVisible();
  });

  test('shows the protocol economy groups', async ({ page }) => {
    const overallStats = page.getByText(/Protocol Economy/i).first();
    await ensureVisible(overallStats);
    await expect(overallStats).toBeVisible();
    await expect(page.getByText(/Allocation Economy/i).first()).toBeVisible();
    await expect(page.getByText(/Token Economy/i).first()).toBeVisible();
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
      'Performance',
    ]) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible();
    }
    await expect(nav.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('renders explore cards linking to the section pages', async ({ page }) => {
    const explore = page.getByRole('navigation', { name: 'Statistics section pages' });
    await ensureVisible(explore);
    await expect(explore.locator('a[href="/statistics/participation"]')).toBeVisible();
    await expect(explore.locator('a[href="/statistics/performance"]')).toBeVisible();
  });

  test('stats show numeric values, not undefined', async ({ page }) => {
    await expectNoBrokenValues(page);
  });
});

test.describe('Statistics section pages', () => {
  test('participation page renders the unique participant tables', async ({ page }) => {
    await page.goto('/statistics/participation', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Participation Statistics' })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(/Unique Participants/i).first()).toBeVisible();
    await expect(page.getByText(/Unique Recipients/i).first()).toBeVisible();
    await expectNoBrokenValues(page);
  });

  test('tokens page renders distribution sections', async ({ page }) => {
    await page.goto('/statistics/tokens', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Token Distribution Statistics' })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(/CST \(ERC-20\) Balance Distribution/i).first()).toBeVisible();
    await expect(page.getByText(/Attached Assets/i).first()).toBeVisible();
    await expectNoBrokenValues(page);
  });

  test('anchoring page tabs switch between CST and RandomWalk', async ({ page }) => {
    await page.goto('/statistics/anchoring', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Anchoring Statistics' })).toBeVisible({
      timeout: 15000,
    });

    const cstTab = page.getByRole('tab', { name: 'Cosmic Signature NFT' });
    const rwalkTab = page.getByRole('tab', { name: 'RandomWalk NFT' });
    await ensureVisible(cstTab);
    await expect(cstTab).toHaveAttribute('aria-selected', 'true');
    await rwalkTab.click();
    await expect(rwalkTab).toHaveAttribute('aria-selected', 'true');
  });

  test('anchoring page renders anchor/release actions content', async ({ page }) => {
    await page.goto('/statistics/anchoring', { waitUntil: 'networkidle' });
    const actionsToggle = page.getByRole('button', { name: /Anchor \/ Release Actions/i }).first();
    await ensureVisible(actionsToggle);
    await expect(actionsToggle).toBeVisible();
    if ((await actionsToggle.getAttribute('aria-expanded')) === 'false') {
      await actionsToggle.click();
    }

    const actionRows = page.locator('table tbody tr').filter({ hasText: /Anchor|Release/i });
    if ((await actionRows.count()) > 0) {
      const firstRow = actionRows.first();
      await ensureVisible(firstRow);
      await expect(firstRow).toBeVisible();
    } else {
      await expect(page.getByText(/No anchor actions yet/i).first()).toBeVisible();
    }
  });

  test('activity page renders gesture activity sections', async ({ page }) => {
    await page.goto('/statistics/activity', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Gesture Activity Statistics' })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(/Gesture Frequency Over Time/i).first()).toBeVisible();
    await expect(page.getByText(/Endurance & Chrono Timeline/i).first()).toBeVisible();
    await expectNoBrokenValues(page);
  });

  test('performance page renders leaderboard and claims', async ({ page }) => {
    await page.goto('/statistics/performance', { waitUntil: 'networkidle' });
    await expect(
      page.getByRole('heading', { name: 'Participant Performance Statistics' }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Allocation Claims by Cycle/i).first()).toBeVisible();
    await expectNoBrokenValues(page);
  });

  test('sub-navigation navigates between section pages', async ({ page }) => {
    await page.goto('/statistics', { waitUntil: 'networkidle' });
    const nav = page.getByRole('navigation', { name: 'Statistics sections' });
    await nav.getByRole('link', { name: 'Participation' }).click();
    await expect(page).toHaveURL(/\/statistics\/participation$/);
    await expect(page.getByRole('heading', { name: 'Participation Statistics' })).toBeVisible({
      timeout: 15000,
    });
    await expect(nav.getByRole('link', { name: 'Participation' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
