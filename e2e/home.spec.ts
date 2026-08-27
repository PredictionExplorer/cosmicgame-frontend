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
    const isMobile = await page.evaluate(() => window.innerWidth < 1024);
    if (isMobile) {
      const dock = page.getByTestId('dock-open-sheet');
      test.skip(
        !(await dock.isVisible({ timeout: 5000 }).catch(() => false)),
        'no active cycle, so the mobile gesture sheet is unavailable',
      );
      await dock.click();
      const cstMethod = page
        .locator('[data-testid="gesture-panel"][data-variant="sheet"]:visible')
        .getByTestId('panel-method-cst');
      test.skip(
        !(await cstMethod.isVisible({ timeout: 3000 }).catch(() => false)),
        'CST method unlocks after the first Gesture',
      );
      await cstMethod.click();
    }
    const tradeLink = page.getByRole('link', { name: 'Trade CST on Uniswap' }).first();
    await ensureVisible(tradeLink);
    await expect(tradeLink).toBeVisible();
    await expect(tradeLink).toHaveAttribute('href', CST_UNISWAP_SWAP_URL);
  });

  test('leads with the pulse bar and its stable H1', async ({ page }) => {
    await expect(
      page.getByRole('heading', { level: 1, name: 'The Cosmic Signature Observatory' }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('control-desk')).toBeVisible();
    const ledger = page.getByTestId('allocation-ledger');
    await ensureVisible(ledger);
    await expect(ledger).toBeVisible();
    await expect(ledger.getByText('Allocation Tracks')).toBeVisible();
  });

  test('shows the cycle clock at the heart of the stage', async ({ page }) => {
    const clock = page.getByTestId('cycle-clock');
    await expect(clock).toBeVisible({ timeout: 15000 });
    // .first(): in the waiting-first-gesture phase the badge and the status
    // line both carry the phase copy, which is legitimate.
    await expect(
      clock
        .getByText(
          /Next cycle opens in|Cycle is open|Cycle finalizes in|Final hour|Final 10 minutes|Final minute|Cycle ready to finalize/,
        )
        .first(),
    ).toBeVisible();
    await expect(
      clock
        .getByText(
          /Gestures open when this countdown reaches zero|first Gesture starts the finalization clock|Cycle is live|less than one hour|Final minutes|Final minute|Finalization is ready/i,
        )
        .first(),
    ).toBeVisible();
    await expect(clock.getByRole('timer')).toBeVisible();
  });

  test('keeps the one gesture panel in the stage while the cycle is active', async ({ page }) => {
    const clock = page.getByTestId('cycle-clock');
    await expect(clock).toBeVisible({ timeout: 15000 });
    const phase = await clock.getAttribute('data-phase');
    test.skip(
      phase === 'opening-soon' || phase === 'loading' || phase === 'unavailable',
      'the gesture panel is legitimately hidden while no cycle is active',
    );

    const isMobile = await page.evaluate(() => window.innerWidth < 1024);
    if (isMobile) {
      await expect(page.locator('[data-testid="gesture-panel"]:visible')).toHaveCount(0);
      await expect(page.getByTestId('gesture-price-strip')).toBeVisible();
      return;
    }

    const panel = page.locator('[data-testid="gesture-panel"]:visible').first();
    await ensureVisible(panel);
    await expect(panel).toBeVisible();
    // Every method with a live price, in one place.
    await expect(panel.getByTestId('panel-method-eth-cost')).toBeVisible();
    // Disconnected visitors get the connect prompt inside the panel.
    await expect(panel.getByTestId('connect-to-gesture')).toBeVisible();
    await expect(panel.getByText(/Connect to submit your gesture/i)).toBeVisible();

    // The panel sits in the stage, above the message feed.
    const chat = page.locator('[data-testid="gesture-message-chat"]:visible').first();
    const panelBox = await panel.boundingBox();
    const chatBox = await chat.boundingBox();
    expect(panelBox).not.toBeNull();
    expect(chatBox).not.toBeNull();
    expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(chatBox!.y + 2);
  });

  test('shows gesture cost per method in the panel', async ({ page }) => {
    const clock = page.getByTestId('cycle-clock');
    await expect(clock).toBeVisible({ timeout: 15000 });
    const phase = await clock.getAttribute('data-phase');
    test.skip(
      phase === 'opening-soon' || phase === 'loading' || phase === 'unavailable',
      'gesture prices are legitimately hidden while no cycle is active',
    );

    const isMobile = await page.evaluate(() => window.innerWidth < 1024);
    const ethCost = isMobile
      ? page.getByTestId('gesture-price-eth')
      : page.locator('[data-testid="panel-method-eth-cost"]:visible').first();
    await ensureVisible(ethCost);
    await expect(ethCost).toBeVisible({ timeout: 15000 });
    await expect(ethCost).toContainText(/ETH/);
  });

  test('shows main allocation reward', async ({ page }) => {
    const signatureAllocation = page.locator('text=/Signature Allocation/i').first();
    await ensureVisible(signatureAllocation);
    await expect(signatureAllocation).toBeVisible();
  });

  test('keeps Public Goods compact in the ledger rather than a feature card', async ({ page }) => {
    await expect(page.getByTestId('public-goods-impact-card')).toHaveCount(0);
    const track = page.getByTestId('ledger-track-public-goods');
    await ensureVisible(track);
    await expect(track).toBeVisible();
    await expect(track.getByRole('link')).toHaveAttribute('href', '/public-goods-contributions-cg');
  });

  test('shows detailed latest-participant intelligence', async ({ page }) => {
    await skipUnlessCycleHasGestures(page);
    const latest = page.getByTestId('latest-participant-intel').first();
    await ensureVisible(latest);
    await expect(latest).toBeVisible();
    await expect(latest.getByText('Latest Participant')).toBeVisible();
    await expect(latest.getByText('Amount paid')).toBeVisible();
    await expect(latest.getByText('CST received')).toBeVisible();
    await expect(latest.getByText('Currently in line for at finalization')).toBeVisible();
    await expect(
      latest.getByRole('progressbar', { name: /Progress toward Endurance/ }),
    ).toBeVisible();
  });

  test('shows Endurance and Chrono intelligence in the control desk', async ({ page }) => {
    await skipUnlessCycleHasGestures(page);
    const intel = page.getByTestId('chrono-endurance-intel').first();
    await ensureVisible(intel);
    await expect(intel).toBeVisible({ timeout: 15000 });
    await expect(intel.getByText('Endurance & Chrono')).toBeVisible();
    const championLabel = intel.getByText('Endurance Champion').first();
    await expect(championLabel).toBeVisible();
    const chronoLabel = intel.getByText(/Chrono-Warrior|Chrono Warrior/i).first();
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

  test('role intelligence labels exist', async ({ page }) => {
    const section = page.getByText(/Endurance Champion|No endurance record yet/i).first();
    await section.waitFor({ state: 'visible', timeout: 15000 });
    await ensureVisible(section);
    await expect(page.getByText(/Chrono-Warrior|Chrono Warrior/i).first()).toBeVisible();
  });

  test('Chrono-Warrior standing uses its own address when leaders differ', async ({ page }) => {
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

    const chronoRow = page.getByTestId('chrono-role-summary').first();
    const enduranceRow = page.getByTestId('control-desk-endurance').first();
    await ensureVisible(chronoRow);
    await expect(chronoRow.getByRole('link', { name: data.ChronoWarriorAddress })).toHaveAttribute(
      'href',
      `/user/${data.ChronoWarriorAddress}`,
    );
    await expect(chronoRow.getByRole('link', { name: data.EnduranceChampionAddress })).toHaveCount(
      0,
    );
    await expect(
      enduranceRow.getByRole('link', { name: data.EnduranceChampionAddress }),
    ).toHaveAttribute('href', `/user/${data.EnduranceChampionAddress}`);
  });

  test('Recipient History section renders', async ({ page }) => {
    const section = page.getByTestId('cycle-details-link-card');
    await ensureVisible(section);
    await expect(section).toBeVisible();
  });

  test('Distribution of funds section renders', async ({ page }) => {
    const section = page.getByTestId('allocation-ledger');
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
