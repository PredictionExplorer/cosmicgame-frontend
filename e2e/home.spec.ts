import { test, expect, type Page } from '@playwright/test';

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

async function openDisclosure(page: Page, testId: string) {
  const disclosure = page.getByTestId(testId);
  await disclosure.locator('summary').click();
  await expect(disclosure).toHaveAttribute('open', '');
  return disclosure;
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
    const clock = page.getByRole('region', { name: 'Cycle Finalization Time' });
    await ensureVisible(clock);
    await expect(clock).toBeVisible();
    await expect(page.getByTestId('home-deck-header').getByText(/Cycle #\d+/)).toBeVisible();
    // Where the cycle is now, beside the chat.
    const guide = page.getByRole('region', { name: 'How this cycle works' });
    await ensureVisible(guide);
    await expect(guide.locator('[aria-current="step"]')).toHaveCount(1);
  });

  test('links to trade CST on Uniswap', async ({ page }) => {
    const story = await openDisclosure(page, 'home-story-section');
    const tradeLink = story.getByRole('link', { name: 'Trade CST on Uniswap' });
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
    await expect(ledger).toBeHidden();
    await openDisclosure(page, 'allocations-disclosure');
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

    const panel = page.locator('[data-testid="gesture-panel"]:visible').first();
    await ensureVisible(panel);
    await expect(panel).toBeVisible();
    // Every method with a live price, in one place.
    await expect(panel.getByTestId('panel-method-eth-cost')).toBeVisible();
    // Disconnected visitors get the connect prompt inside the panel.
    await expect(panel.getByTestId('connect-to-gesture')).toBeVisible();
    await expect(panel.getByText(/Connect a wallet on Arbitrum/i)).toBeVisible();

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

    const ethCost = page.locator('[data-testid="panel-method-eth-cost"]:visible').first();
    await ensureVisible(ethCost);
    await expect(ethCost).toBeVisible({ timeout: 15000 });
    await expect(ethCost).toContainText(/ETH/);
  });

  test('shows main allocation reward', async ({ page }) => {
    const signatureAllocation = page.getByTestId('clock-reserve').getByText('Signature Allocation');
    await ensureVisible(signatureAllocation);
    await expect(signatureAllocation).toBeVisible();
  });

  test('keeps Public Goods compact in the ledger rather than a feature card', async ({ page }) => {
    await expect(page.getByTestId('public-goods-impact-card')).toHaveCount(0);
    await openDisclosure(page, 'allocations-disclosure');
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
    await expect(latest.getByRole('heading', { name: 'Last Gesture' })).toBeVisible();
    await expect(latest.getByText('Paid', { exact: true })).toBeVisible();
    await expect(latest.getByText('Received', { exact: true })).toBeVisible();
    await expect(page.getByTestId('clock-reserve')).toContainText('Signature Allocation');
    await expect(
      latest.getByRole('progressbar', { name: /Progress toward Endurance/ }),
    ).toBeVisible();
  });

  test('sets every standing role in one ledger in the control desk', async ({ page }) => {
    await skipUnlessCycleHasGestures(page);
    const ledger = page.getByTestId('standings-ledger');
    await ensureVisible(ledger);
    await expect(ledger).toBeVisible({ timeout: 15000 });
    await expect(ledger).toHaveAccessibleName('Live standings');
    const rows = ledger.getByRole('listitem');
    await expect(rows).toHaveCount(4);
    await expect(rows.nth(0)).toHaveAttribute('data-testid', 'latest-participant-intel');
    await expect(ledger.getByText('Endurance Champion').first()).toBeVisible();
    await expect(ledger.getByText(/Chrono-Warrior|Chrono Warrior/i).first()).toBeVisible();
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

  test('hangs the newest Signature on the desk with a path to the gallery', async ({ page }) => {
    const artwork = page.getByTestId('latest-signature');
    await expect(artwork).toHaveCount(1);
    await ensureVisible(artwork);
    await expect(artwork).toBeVisible();
    await expect(artwork.getByRole('link', { name: /Gallery/ })).toHaveAttribute(
      'href',
      '/gallery',
    );
    await expect(artwork.getByTestId('latest-signature-link')).toHaveAttribute(
      'href',
      /^\/detail\/\d+$/,
    );
    await expect(page.getByText('Latest NFTs', { exact: true })).toHaveCount(0);
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
    // Holder links read the short address; the full one is their target.
    await expect(chronoRow.locator(`a[href="/user/${data.ChronoWarriorAddress}"]`)).toBeVisible();
    await expect(chronoRow.locator(`a[href="/user/${data.EnduranceChampionAddress}"]`)).toHaveCount(
      0,
    );
    await expect(
      enduranceRow.locator(`a[href="/user/${data.EnduranceChampionAddress}"]`),
    ).toBeVisible();
  });

  test('Recipient History section renders', async ({ page }) => {
    const section = page.getByTestId('cycle-details-link-card');
    await ensureVisible(section);
    await expect(section).toBeVisible();
  });

  test('Distribution of funds section renders', async ({ page }) => {
    await openDisclosure(page, 'allocations-disclosure');
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

  test('navigation links the project site on the landing host, in the same tab', async ({
    page,
  }) => {
    const isMobileViewport = await page.evaluate(() => window.innerWidth < 1024);
    // The production origin in CI; the dev landing host when run against `next dev`.
    const landingHome = /^https?:\/\/cosmicsignature\.(com|local:3000)\/?$/;

    let projectSite;
    if (isMobileViewport) {
      // On phones it closes the drawer's Learn section, after the host divider.
      await page
        .getByRole('banner')
        .getByRole('button', { name: /^Open menu/ })
        .click();
      const drawer = page.getByRole('dialog', { name: 'Navigation' });
      await drawer.locator('summary', { hasText: /^Learn$/ }).click();
      projectSite = drawer.getByRole('link', { name: 'Project Site' });
    } else {
      // On desktop it closes the Learn panel's first column.
      const learn = page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('button', { name: /^Learn$/ });
      await learn.click();
      projectSite = page
        .locator(`[id="${await learn.getAttribute('aria-controls')}"]`)
        .getByRole('link', { name: /^Project Site/ });
    }
    await expect(projectSite).toBeVisible();
    await expect(projectSite).toHaveAttribute('href', landingHome);
    await expect(projectSite).not.toHaveAttribute('target');
  });
});
