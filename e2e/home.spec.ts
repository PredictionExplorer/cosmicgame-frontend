import { test, expect } from '@playwright/test';

const CST_UNISWAP_SWAP_URL =
  'https://app.uniswap.org/swap?chain=arbitrum&inputCurrency=NATIVE&outputCurrency=0xAD91843e6A58Ba560F577E676986AFb1dba6FBA0';

/**
 * End-to-end tests for the dApp home at app.cosmicsignature.com.
 *
 * Localhost intentionally serves the dApp by default. Avoid forcing
 * `X-Forwarded-Host` here: Playwright applies extra headers to browser fetches
 * too, which can break API CORS preflights against the remote dev API.
 */

/** Scrolls locator into view before interaction/assertion (needed on mobile). */
async function ensureVisible(locator: { scrollIntoViewIfNeeded(): Promise<void> }) {
  await locator.scrollIntoViewIfNeeded();
}

/**
 * Live-state probe: re-reads the dashboard from the same API URL the page
 * itself used (self-configuring — no hardcoded backend host in the spec).
 */
async function fetchLiveDashboard(
  page: import('@playwright/test').Page,
): Promise<{ CurNumBids?: number; TsRoundStart?: number } | null> {
  const dashboardUrl = await page.evaluate(
    () =>
      performance
        .getEntriesByType('resource')
        .map((entry) => entry.name)
        .find((name) => name.includes('/api/cosmicgame/statistics/dashboard')) ?? null,
  );
  if (!dashboardUrl) return null;
  return page.evaluate(async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      return (await response.json()) as { CurNumBids?: number; TsRoundStart?: number };
    } catch {
      return null;
    }
  }, dashboardUrl);
}

/**
 * Participant-derived surfaces (ticker, special-allocation leaders) only
 * exist once the live cycle has its first Gesture. Between cycles the
 * backend legitimately reports zero gestures and these tests would assert
 * on UI that is correctly absent — skip with a clear reason instead.
 */
async function skipUnlessCycleHasGestures(page: import('@playwright/test').Page) {
  const dashboard = await fetchLiveDashboard(page);
  test.skip(
    !dashboard || !dashboard.TsRoundStart || (dashboard.CurNumBids ?? 0) === 0,
    'live cycle has no gestures yet — participant surfaces are legitimately hidden',
  );
}

test.describe('dApp home page @ app.cosmicsignature.com', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('shows cycle info', async ({ page }) => {
    const cycleInfo = page.getByRole('region', { name: 'Current cycle observatory' });
    await ensureVisible(cycleInfo);
    await expect(cycleInfo).toBeVisible();
    await expect(cycleInfo.getByRole('heading', { name: /Cycle #/ })).toBeVisible();
  });

  test('links to trade CST on Uniswap', async ({ page }) => {
    const tradeLink = page.getByRole('link', { name: 'Trade CST on Uniswap' }).first();
    await ensureVisible(tradeLink);
    await expect(tradeLink).toBeVisible();
    await expect(tradeLink).toHaveAttribute('href', CST_UNISWAP_SWAP_URL);
  });

  test('shows the Chrono Core timer at the top of the game page', async ({ page }) => {
    const chronoCore = page.getByTestId('chrono-core-timer');
    await expect(chronoCore).toBeVisible({ timeout: 15000 });
    // .first(): in the waiting-first-gesture phase the badge and the status
    // line both carry the phase copy, which is legitimate.
    await expect(
      chronoCore
        .getByText(
          /Next cycle opens in|Cycle is open|Cycle finalizes in|Final hour|Final 10 minutes|Final minute|Cycle ready to finalize/,
        )
        .first(),
    ).toBeVisible();
    await expect(
      chronoCore
        .getByText(
          /Gestures open when this countdown reaches zero|first Gesture starts the finalization clock|Cycle is live|less than one hour|Final minutes|Final minute|Finalization is ready/i,
        )
        .first(),
    ).toBeVisible();
    await expect(chronoCore.getByRole('timer')).toBeVisible();
  });

  test('shows gesture cost', async ({ page }) => {
    const gestureCost = page.locator('text=/ETH Gesture/i').first();
    await ensureVisible(gestureCost);
    await expect(gestureCost).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=/ETH/').first()).toBeVisible();
  });

  test('shows main allocation reward', async ({ page }) => {
    const signatureAllocation = page.locator('text=/Signature Allocation/i').first();
    await ensureVisible(signatureAllocation);
    await expect(signatureAllocation).toBeVisible();
  });

  test('shows public-goods impact card', async ({ page }) => {
    const impactCardHeading = page.getByRole('heading', {
      name: "Funding Ethereum's core contributors.",
    });
    await ensureVisible(impactCardHeading);
    await expect(impactCardHeading).toBeVisible();
    await expect(
      page.getByRole('link', { name: /View public-goods contributions/i }),
    ).toHaveAttribute('href', '/public-goods-contributions-cg');
  });

  test('shows latest participant card', async ({ page }) => {
    await skipUnlessCycleHasGestures(page);
    const latestParticipant = page.locator('text=/Latest Participant/i').first();
    await ensureVisible(latestParticipant);
    await expect(latestParticipant).toBeVisible();
  });

  test('shows special allocation recipients section', async ({ page }) => {
    await skipUnlessCycleHasGestures(page);
    const specialAllocations = page.getByText('Special Allocation Leaders').first();
    await ensureVisible(specialAllocations);
    await expect(specialAllocations).toBeVisible({ timeout: 15000 });
    const championLabel = page.getByText('Endurance Champion').first();
    await ensureVisible(championLabel);
    await expect(championLabel).toBeVisible();
    const chronoLabel = page.getByText(/Chrono-Warrior|Chrono Warrior/i).first();
    await ensureVisible(chronoLabel);
    await expect(chronoLabel).toBeVisible();
  });

  test('ERC721/ERC20 contribution tabs work', async ({ page }) => {
    const erc721Tab = page.locator('role=tab', { hasText: 'ERC721 Tokens' });
    const erc20Tab = page.locator('role=tab', { hasText: 'ERC20 Tokens' });
    if (await erc721Tab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ensureVisible(erc721Tab);
      await expect(erc721Tab).toHaveAttribute('aria-selected', 'true');
      await erc20Tab.click();
      await expect(erc20Tab).toHaveAttribute('aria-selected', 'true');
      await erc721Tab.click();
      await expect(erc721Tab).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('gesture history pagination works', async ({ page }) => {
    const nextPageBtn = page.locator('role=button', { hasText: 'Go to page 2' }).first();
    if (await nextPageBtn.isVisible()) {
      await ensureVisible(nextPageBtn);
      await nextPageBtn.click();
      await page.waitForTimeout(1000);
      const currentPage = page.locator('role=button[name="page 2"]').first();
      await expect(currentPage).toBeVisible();
    }
  });

  test('NFT grid shows items', async ({ page }) => {
    const latestNfts = page.locator('text=/Latest NFTs/i').first();
    await ensureVisible(latestNfts);
    await expect(latestNfts).toBeVisible();
  });

  test('special allocation leader labels exist', async ({ page }) => {
    const section = page.getByText(/Endurance Champion|No holder yet/i).first();
    await section.waitFor({ state: 'visible', timeout: 15000 });
    await ensureVisible(section);
    await expect(page.getByText(/Chrono-Warrior|Chrono Warrior/i).first()).toBeVisible();
  });

  test('Chrono-Warrior card uses its own address when leaders differ', async ({ page }) => {
    // The whole leaders section is gated on the DASHBOARD read
    // (TsRoundStart !== 0), so mocking current_special_winners below cannot
    // conjure it during an idle cycle.
    await skipUnlessCycleHasGestures(page);
    const data = {
      ChronoWarriorAddress: '0x2222222222222222222222222222222222222222',
      ChronoWarriorDuration: 7200,
      EnduranceChampionAddress: '0x1111111111111111111111111111111111111111',
      EnduranceChampionDuration: 3600,
      LastBidderAddress: '0x3333333333333333333333333333333333333333',
      LastBidderLastBidTime: Math.floor(Date.now() / 1000) - 60,
      LastCstBidderAddress: '0x4444444444444444444444444444444444444444',
    };

    await page.route(/\/api\/cosmicgame\/bid\/current_special_winners(?:\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    });
    await page.reload({ waitUntil: 'networkidle' });

    const chronoCard = page.getByTestId('special-allocation-card-chrono-warrior').first();
    const enduranceCard = page.getByTestId('special-allocation-card-endurance-champion').first();
    await ensureVisible(chronoCard);
    await expect(chronoCard).toContainText(data.ChronoWarriorAddress);
    await expect(chronoCard).not.toContainText(data.EnduranceChampionAddress);
    await expect(enduranceCard).toContainText(data.EnduranceChampionAddress);
  });

  test('Recipient History section renders', async ({ page }) => {
    const section = page.getByText(/Gesture history, leaderboards/i).first();
    await ensureVisible(section);
    await expect(section).toBeVisible();
  });

  test('Distribution of funds section renders', async ({ page }) => {
    const section = page.locator('text=/Allocation Breakdown|Distribution of funds/').first();
    await ensureVisible(section);
    await expect(section).toBeVisible();
  });

  test('home page metadata description uses lexicon-safe copy', async ({ page }) => {
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!).toContain('procedural on-chain art protocol');
    expect(description!).not.toMatch(/strategy bidding game/i);
  });

  test('navigation hosts a cross-host Discover link to the marketing site', async ({ page }) => {
    const isMobileViewport = await page.evaluate(() => window.innerWidth < 1024);

    if (isMobileViewport) {
      // On mobile the featured Discover card lives inside the drawer.
      await page.getByRole('button', { name: 'menu' }).click();
      const discover = page
        .getByRole('dialog')
        .locator('a[href="https://cosmicsignature.com"]')
        .first();
      await expect(discover).toBeVisible();
    } else {
      // On desktop it is the featured card at the bottom of the Help panel.
      await page.getByRole('button', { name: /^Help$/ }).click();
      const discover = page.locator('[role="menu"] a[href="https://cosmicsignature.com"]').first();
      await expect(discover).toBeVisible();
      await expect(discover).toContainText(/Discover/i);
    }
  });
});
