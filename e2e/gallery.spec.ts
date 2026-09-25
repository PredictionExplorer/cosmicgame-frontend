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

  // The header's button from `sm`; on a phone, the row in "About the collection".
  test('links to the Cosmic Signature marketplace', async ({ page }) => {
    const marketplaceLink = page
      .getByRole('link', { name: /^Buy or sell on Axiom Zero/ })
      .filter({ visible: true })
      .first();
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
    // Leave through the header, not a card: the live backend decides whether
    // any Signature is named, and the Back check must run either way.
    await page
      .getByRole('banner')
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Observatory' })
      .click();
    await expect(page).not.toHaveURL(/\/gallery/);
    await page.goBack();
    await expect(page).toHaveURL(/[?&]show=named(&|$)/);
    await expect(page.getByRole('radio', { name: 'Named' }).first()).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  test('pagination moves to the next page', async ({ page }) => {
    const next = page.getByRole('button', { name: 'Next', exact: true });
    if (await next.isVisible()) {
      await ensureVisible(next);
      await next.click();
      await expect(page).toHaveURL(/[?&]page=2(&|$)/);
    }
  });

  test('clicking a card navigates to its detail page', async ({ page }) => {
    const firstCard = page.locator('a[href^="/detail/"]').first();
    const empty = page.getByRole('heading', { name: 'No Signatures yet' });
    // Wait for either state: isVisible() answers at once, which raced the wall.
    await expect(firstCard.or(empty)).toBeVisible();

    if (await empty.isVisible()) return;
    await ensureVisible(firstCard);
    await firstCard.click();
    await expect(page).toHaveURL(/detail/);
  });
});

test.describe('Gallery on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  // The art arrives almost at once: a one-sentence lede, a one-line fact row,
  // no marketplace button and a caption-sized result count put the first
  // plates in the top half of the screen.
  test('starts the first row of plates in the top half of the first screen', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });
    const firstPlate = page.getByTestId('signature-card').first();
    await expect(firstPlate).toBeVisible();
    const box = await firstPlate.boundingBox();
    expect(box?.y ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(380);
    const facts = await page.getByTestId('gallery-facts').boundingBox();
    // One line of facts ("Imprinted 48 · Anchored 33 · Named 3").
    expect(facts?.height ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(24);
  });

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

test.describe('Gallery on a laptop', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('focus moved back up stops below the sticky toolbar (WCAG 2.4.11)', async ({
    page,
    isMobile,
  }) => {
    // A phone emulated at laptop width scrolls its visual viewport instead.
    test.skip(isMobile, 'A keyboard laptop check');
    await page.goto('/gallery', { waitUntil: 'networkidle' });
    const cards = page.getByTestId('signature-card');
    const columns = await cards.evaluateAll((elements) => {
      const top = elements[0]?.getBoundingClientRect().top ?? 0;
      return elements.filter((element) => Math.abs(element.getBoundingClientRect().top - top) < 2)
        .length;
    });
    test.skip((await cards.count()) <= columns * 2, 'Needs three rows of Signatures');

    // The first link of the third row, scrolled to sit just under the header:
    // the focusable before it (in the row above) is then out of view.
    const start = cards
      .nth(columns * 2)
      .getByRole('link')
      .first();
    await start.focus();
    await start.evaluate((element) => {
      window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 90 });
    });
    const toolbar = page.getByTestId('gallery-toolbar');
    await expect(toolbar).toHaveCSS('position', 'sticky');
    // The toolbar publishes its reach once hydrated; scroll-padding adds it.
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.documentElement.style.getPropertyValue('--sticky-bar-clearance'),
        ),
      )
      .toMatch(/^\d+px$/);

    await page.keyboard.press('Shift+Tab');
    const focusedTop = await page.evaluate(
      () => document.activeElement?.getBoundingClientRect().top ?? Number.NaN,
    );
    const toolbarBox = await toolbar.boundingBox();
    expect(toolbarBox).not.toBeNull();
    expect(focusedTop).toBeGreaterThanOrEqual(toolbarBox!.y + toolbarBox!.height - 1);
  });
});
