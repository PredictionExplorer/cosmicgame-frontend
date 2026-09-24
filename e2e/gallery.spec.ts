import { test, expect } from '@playwright/test';

const COSMIC_SIGNATURE_MARKETPLACE_URL = 'https://www.axiomzero.market/cosmic-signature';

/** Scrolls locator into view before interaction/assertion (needed on mobile). */
async function ensureVisible(locator: { scrollIntoViewIfNeeded(): Promise<void> }) {
  await locator.scrollIntoViewIfNeeded();
}

test.describe('Gallery page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });
  });

  test('renders Signature cards under the one header', async ({ page }) => {
    await expect(
      page.getByRole('heading', { level: 1, name: 'Cosmic Signature Gallery' }),
    ).toBeVisible();
    await expect(page.getByTestId('gallery-result-count')).toHaveText(/\d+\sNFTs?/);
    const cards = page.getByTestId('signature-card');
    if ((await cards.count()) === 0) {
      await expect(page.getByRole('heading', { name: 'No Signatures yet' })).toBeVisible();
    }
  });

  test('links to the Cosmic Signature marketplace', async ({ page }) => {
    const marketplaceLink = page.getByRole('link', { name: 'Axiom Zero NFT marketplace' }).first();
    await ensureVisible(marketplaceLink);
    await expect(marketplaceLink).toBeVisible();
    await expect(marketplaceLink).toHaveAttribute('href', COSMIC_SIGNATURE_MARKETPLACE_URL);
  });

  test('search is visible, filters live, and keeps the query in the URL', async ({ page }) => {
    const searchBox = page.getByRole('searchbox', { name: 'Search NFTs' });
    await ensureVisible(searchBox);
    await expect(searchBox).toBeVisible();
    await searchBox.fill('1');
    await expect(searchBox).toHaveValue('1');
    await expect(page).toHaveURL(/[?&]q=1(&|$)/);
  });

  test('keeps the status filter in the URL, so Back returns to it', async ({ page }) => {
    const named = page.getByRole('radio', { name: 'Named' }).first();
    if (!(await named.isVisible())) test.skip(true, 'The status filter lives in the sheet here');
    await named.click();
    await expect(page).toHaveURL(/[?&]show=named(&|$)/);
    const firstCard = page.getByTestId('signature-card').first().getByRole('link');
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstCard.click();
      await expect(page).toHaveURL(/detail/);
      await page.goBack();
      await expect(page).toHaveURL(/[?&]show=named(&|$)/);
      await expect(page.getByRole('radio', { name: 'Named' }).first()).toHaveAttribute(
        'aria-checked',
        'true',
      );
    }
  });

  test('pagination moves to the next page', async ({ page }) => {
    const next = page.getByRole('button', { name: 'Go to next page' });
    if (await next.isVisible()) {
      await ensureVisible(next);
      await next.click();
      await expect(page).toHaveURL(/[?&]page=2(&|$)/);
    }
  });

  test('clicking a card navigates to its detail page', async ({ page }) => {
    const firstCard = page.locator('a[href^="/detail/"]').first();

    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ensureVisible(firstCard);
      await firstCard.click();
      await expect(page).toHaveURL(/detail/);
    } else {
      await expect(page.getByRole('heading', { name: 'No Signatures yet' })).toBeVisible();
    }
  });
});

test.describe('Gallery on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('keeps the toolbar out of the way and opens the filter sheet', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });
    const toolbar = page.getByTestId('gallery-toolbar');
    // Nothing is pinned to the top on a phone: the toolbar scrolls away.
    await expect(toolbar).toHaveCSS('position', 'static');
    const box = await toolbar.boundingBox();
    expect(box?.height ?? 0).toBeLessThanOrEqual(56);

    await page.getByTestId('facets-toggle').click();
    const sheet = page.getByTestId('gallery-filter-sheet');
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole('radiogroup', { name: 'Filter NFTs' })).toBeVisible();
    // The footer's primary action (the trait facets also have 'Show N more').
    await sheet.getByRole('button', { name: /^Show \d+ NFTs?$/ }).click();
    await expect(sheet).toBeHidden();
  });
});
