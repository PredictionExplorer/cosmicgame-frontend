import { expect, test, type Locator, type Page } from '@playwright/test';

import {
  gestures,
  makeLongGestureFeed,
  mockHomeGestureChatApi,
  specialRecipients,
} from './home-gesture-chat-fixtures';

const DESKTOP_VIEWPORTS = [
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

async function expectDecisionDashboardInViewport(page: Page) {
  const viewport = page.viewportSize()!;
  const critical = [
    ['clock', page.getByTestId('cycle-clock')],
    ['Last Gesture', page.getByTestId('latest-participant-intel')],
    ['Endurance Champion', page.getByTestId('control-desk-endurance')],
    ['Chrono Warrior', page.getByTestId('chrono-role-summary')],
    ['active challenge', page.getByTestId('chrono-active-challenge')],
    ['Calibration Window', page.getByTestId('control-desk-calibration')],
    ['ETH price', page.getByTestId('panel-method-eth-cost')],
    ['RandomWalk price', page.getByTestId('panel-method-randomWalk-cost')],
    ['CST price', page.getByTestId('panel-method-cst-cost')],
    ['connect action', page.getByTestId('connect-to-gesture')],
  ] as const;

  // Visibility alone does not mean that a participant can see the content
  // without scrolling. Assert each required surface's actual viewport bounds.
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  for (const [name, locator] of critical) {
    await expect(locator).toBeVisible();
    const box = await locator.boundingBox();
    expect(box, name).not.toBeNull();
    expect(box!.y, `${name} top`).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height, `${name} bottom`).toBeLessThanOrEqual(viewport.height);
    expect(box!.x, `${name} left`).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width, `${name} right`).toBeLessThanOrEqual(viewport.width);
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
    'the page must not overflow horizontally',
  ).toBeLessThanOrEqual(viewport.width);
}

/** Check rendered glyph bounds, which catch overlapping labels even when their cards fit. */
async function expectTextWithoutOverlap(surface: Locator) {
  const failures = await surface.evaluate((root) => {
    const bounds = root.getBoundingClientRect();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textRects: { text: string; rect: DOMRect }[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || !node.textContent?.trim()) continue;
      if (parent.closest('.sr-only, [hidden], [aria-hidden="true"]')) continue;
      const style = window.getComputedStyle(parent);
      if (style.visibility !== 'visible' || style.display === 'none') continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (rect.width > 0 && rect.height > 0) {
          textRects.push({ text: node.textContent.trim(), rect });
        }
      }
    }

    const errors: string[] = [];
    for (const [index, current] of textRects.entries()) {
      if (
        current.rect.left < bounds.left - 1 ||
        current.rect.right > bounds.right + 1 ||
        current.rect.top < bounds.top - 1 ||
        current.rect.bottom > bounds.bottom + 1
      ) {
        errors.push(`Text escapes its surface: ${current.text}`);
      }
      for (const other of textRects.slice(index + 1)) {
        const overlapX =
          Math.min(current.rect.right, other.rect.right) -
          Math.max(current.rect.left, other.rect.left);
        const overlapY =
          Math.min(current.rect.bottom, other.rect.bottom) -
          Math.max(current.rect.top, other.rect.top);
        if (overlapX > 1 && overlapY > 1) {
          errors.push(`Text overlaps: ${current.text} / ${other.text}`);
        }
      }
    }
    return errors;
  });
  expect(failures).toEqual([]);
}

test.describe('home gesture chat', () => {
  test.beforeEach(async ({ page }) => {
    await mockHomeGestureChatApi(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('shows current-cycle gesture messages newest first', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const chat = page.locator('[data-testid="gesture-message-chat"]:visible').first();
    await expect(chat.getByText('Cycle #7 · 2 messages')).toBeVisible();
    await chat.scrollIntoViewIfNeeded();

    await expect(chat).toBeVisible();
    await expect(chat.getByRole('heading', { name: 'Gesture Chat' })).toBeVisible();
    await expect(chat.getByText('Newest message from a gesture')).toBeVisible();
    await expect(chat.getByText('Older message from a gesture')).toBeVisible();
    await expect(chat.getByRole('link', { name: 'Open gesture position 4' })).toHaveAttribute(
      'href',
      '/gesture/103',
    );
    await expect(chat.getByRole('link', { name: 'Open gesture position 102' })).toHaveCount(0);

    const participantMessages = chat
      .getByRole('listitem')
      .filter({ has: page.getByTestId('gesture-message-meta') });
    await expect(participantMessages).toHaveCount(2);
    await expect(participantMessages.nth(0)).toContainText('Newest message from a gesture');
    await expect(participantMessages.nth(1)).toContainText('Older message from a gesture');
  });

  test('shows complete latest-participant and active Chrono challenge intelligence', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const latest = page.getByTestId('latest-participant-intel');
    await expect(latest).toBeVisible();
    await expect(
      latest.getByRole('link', { name: '0x3333333333333333333333333333333333333333' }),
    ).toBeVisible();
    await expect(page.getByTestId('latest-participant-paid-amount')).toContainText('20.0000 CST');
    await expect(page.getByTestId('latest-participant-cst-received')).toContainText('100.00 CST');
    await expect(page.getByTestId('latest-participant-gesture-id')).toContainText('#4');
    await expect(page.getByTestId('latest-participant-message')).toContainText(
      'Newest message from a gesture',
    );
    await expect(
      latest.getByRole('progressbar', { name: 'Progress toward Endurance Champion' }),
    ).toBeVisible();
    await expect(page.getByTestId('clock-reserve')).toContainText('2.5000 ETH');

    const challenge = page.getByTestId('chrono-active-challenge');
    await expect(challenge).toBeVisible();
    await expect(challenge).toContainText('Active Endurance Challenge');
    await expect(challenge).toContainText('0x111111....111111');
    await expect(
      challenge.getByRole('link', {
        name: '0x1111111111111111111111111111111111111111',
      }),
    ).toBeVisible();
    await expect(page.getByTestId('chrono-challenge-segment')).toContainText('20m');
    await expect(page.getByTestId('chrono-challenge-record-to-beat')).toContainText('30m');
    await expect(page.getByTestId('chrono-challenge-next-change')).toContainText('10m 1s');
  });

  test('keeps Last Gesture visible while the special-recipient endpoint is stale', async ({
    page,
  }) => {
    await page.unroute('**/api/cosmicgame/**');
    await mockHomeGestureChatApi(page, gestures, {
      ...specialRecipients,
      LastBidderAddress: '0x9999999999999999999999999999999999999999',
      LastBidderLastBidTime: Math.floor(Date.now() / 1000) - 500,
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const latest = page.getByTestId('latest-participant-intel');
    await expect(
      latest.getByRole('link', { name: '0x3333333333333333333333333333333333333333' }),
    ).toBeVisible();
    await expect(
      latest.getByRole('link', { name: '0x9999999999999999999999999999999999999999' }),
    ).toHaveCount(0);
    await expect(page.getByTestId('latest-participant-gesture-details')).toBeVisible();
    await expect(page.getByTestId('latest-participant-paid-amount')).toContainText('20.0000 CST');
    await expect(page.getByTestId('latest-participant-cst-received')).toContainText('100.00 CST');
  });

  test('keeps a syncing Last Gesture panel when the gesture list trails the dashboard', async ({
    page,
  }) => {
    await page.unroute('**/api/cosmicgame/**');
    await mockHomeGestureChatApi(
      page,
      gestures.filter(
        (gesture) => gesture.BidderAddr !== '0x3333333333333333333333333333333333333333',
      ),
      {
        ...specialRecipients,
        LastBidderAddress: '0x9999999999999999999999999999999999999999',
      },
    );
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('latest-participant-gesture-details')).toBeVisible();
    await expect(page.getByTestId('latest-participant-gesture-syncing')).toContainText(
      'Last Gesture details are syncing from the indexer.',
    );
    await expect(page.getByTestId('latest-participant-intel')).not.toContainText(
      'Older message from a gesture',
    );
  });

  for (const viewport of DESKTOP_VIEWPORTS) {
    test(`keeps every decision surface above the fold at ${viewport.width}×${viewport.height} with ETH and CST selected`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'Desktop Chrome', 'desktop density guard');
      await page.setViewportSize(viewport);
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.getByTestId('panel-method-cst-cost')).toContainText('20 CST');

      await expectDecisionDashboardInViewport(page);
      await expect(page.getByTestId('standings-disclosure')).toHaveCount(0);
      await expect(page.getByTestId('allocation-ledger')).toBeHidden();
      await expect(page.getByTestId('control-desk-calibration').getByRole('region')).toHaveCount(1);

      await page.getByTestId('panel-method-cst').click();
      await expect(page.getByTestId('panel-method-cst')).toHaveAttribute('aria-pressed', 'true');
      await expectDecisionDashboardInViewport(page);
      await expect(page.getByTestId('panel-cst-economics')).toBeVisible();
      await expectTextWithoutOverlap(page.getByTestId('panel-method-tabs'));
      await expectTextWithoutOverlap(page.getByTestId('panel-cst-reward'));
      await expectTextWithoutOverlap(page.getByTestId('control-desk-calibration'));
      for (const testId of [
        'latest-participant-intel',
        'control-desk-endurance',
        'chrono-role-summary',
      ]) {
        const profiles = page.getByTestId(testId).getByRole('link', { name: /^0x/ });
        for (const profile of await profiles.all()) {
          // Full accessible identities remain available, and the displayed
          // address glyphs must fit their own link instead of being clipped.
          await expect(profile).toHaveAttribute('title', /^0x/);
          await expectTextWithoutOverlap(profile);
        }
      }
      for (const key of ['reward', 'cost', 'net']) {
        await expectTextWithoutOverlap(page.getByTestId(`panel-cst-metric-${key}`));
      }
    });
  }

  for (const viewport of [DESKTOP_VIEWPORTS[0], DESKTOP_VIEWPORTS[3]]) {
    test(`wraps long CST amounts without overlapping at ${viewport.width}×${viewport.height}`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'Desktop Chrome', 'desktop amount-width guard');
      await page.unroute('**/api/cosmicgame/**');
      await mockHomeGestureChatApi(
        page,
        gestures,
        specialRecipients,
        '987654321012345678901234567',
      );
      await page.setViewportSize(viewport);
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.getByTestId('panel-method-cst-cost')).toContainText('987');
      await page.getByTestId('panel-method-cst').click();

      await expectDecisionDashboardInViewport(page);
      await expectTextWithoutOverlap(page.getByTestId('panel-method-tabs'));
      await expectTextWithoutOverlap(page.getByTestId('panel-cst-reward'));
      for (const key of ['reward', 'cost', 'net']) {
        await expectTextWithoutOverlap(page.getByTestId(`panel-cst-metric-${key}`));
      }
    });
  }

  test('keeps an inline form on phones and offers the same controls in the quick-action sheet', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'Desktop Chrome', 'mobile action-path guard');
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const inlinePanel = page.locator('[data-testid="gesture-panel"][data-variant="card"]');
    await expect(inlinePanel).toBeVisible();
    await expect(inlinePanel.getByTestId('panel-method-eth-cost')).toBeVisible();
    await expect(page.getByTestId('gesture-price-strip')).toHaveCount(0);
    const dockAction = page.getByTestId('dock-open-sheet');
    await expect(dockAction).toBeVisible();
    await dockAction.click();

    const sheetPanel = page.locator('[data-testid="gesture-panel"][data-variant="sheet"]:visible');
    await expect(sheetPanel).toHaveCount(1);
    await expect(sheetPanel.getByTestId('panel-method-eth-cost')).toBeVisible();
    // This mocked production project has no connected wallet; the same sheet
    // exposes the message input after connect (covered by HomePage unit flow).
    await expect(sheetPanel.getByTestId('connect-to-gesture')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sheetPanel).toHaveCount(0);
    await expect(inlinePanel).toBeVisible();
  });

  test('opens optional allocations from the keyboard while decision information stays visible', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const allocations = page.getByTestId('allocations-disclosure');
    await expect(page.getByTestId('latest-participant-intel')).toBeVisible();
    await expect(page.getByTestId('chrono-endurance-intel')).toBeVisible();
    await expect(page.getByTestId('control-desk-calibration')).toBeVisible();
    await expect(page.getByTestId('allocation-ledger')).toBeHidden();

    await allocations.locator('summary').focus();
    await page.keyboard.press('Space');
    await expect(allocations).toHaveAttribute('open', '');
    await expect(page.getByTestId('allocation-ledger')).toBeVisible();

    await allocations.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('allocation-ledger')).toBeHidden();
    await expect(page.getByTestId('latest-participant-intel')).toBeVisible();
    await expect(page.getByTestId('chrono-endurance-intel')).toBeVisible();
    await expect(page.getByTestId('control-desk-calibration')).toBeVisible();
  });

  test('keeps long chat history within a scrollable reading area', async ({ page }, testInfo) => {
    await page.unroute('**/api/cosmicgame/**');
    await mockHomeGestureChatApi(page, makeLongGestureFeed());
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const chat = page.locator('[data-testid="gesture-message-chat"]:visible').first();
    const scroll = chat.getByTestId('gesture-message-chat-scroll');
    const heading = chat.getByRole('heading', { name: 'Gesture Chat' });
    await expect(chat.getByText('Cycle #7 · 12 messages')).toBeVisible();
    await chat.scrollIntoViewIfNeeded();

    const viewport = page.viewportSize()!;
    const chatBox = await chat.boundingBox();
    const metrics = await scroll.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      overflowY: window.getComputedStyle(element).overflowY,
    }));
    expect(chatBox).not.toBeNull();
    expect(metrics.overflowY).toBe('auto');
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight + 20);
    if (testInfo.project.name === 'Desktop Chrome') {
      expect(chatBox!.height).toBeLessThanOrEqual(viewport.height * 0.75);
    } else {
      expect(metrics.clientHeight).toBeLessThanOrEqual(Math.min(448, viewport.height * 0.55) + 1);
    }

    const headingBox = await heading.boundingBox();
    const pageScroll = await page.evaluate(() => window.scrollY);
    await expect(chat.getByText(/Scrollable message 12:/)).not.toBeInViewport();
    if (testInfo.project.name === 'Desktop Chrome') {
      await scroll.focus();
      await page.keyboard.press('PageDown');
      await expect.poll(() => scroll.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
      expect(await page.evaluate(() => window.scrollY)).toBe(pageScroll);
    }
    await scroll.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    expect(await scroll.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await expect(chat.getByText(/Scrollable message 12:/)).toBeInViewport();
    await expect(heading).toBeInViewport();
    expect((await heading.boundingBox())!.y).toBeCloseTo(headingBox!.y, 0);
    expect(await page.evaluate(() => window.scrollY)).toBe(pageScroll);
  });

  test('positions the chat appropriately for the current viewport', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const chat = page.locator('[data-testid="gesture-message-chat"]:visible').first();
    const panel = page.locator('[data-testid="gesture-panel"][data-variant="card"]');
    const clock = page.locator('[data-testid="cycle-clock"]:visible').first();
    const latest = page.getByTestId('latest-participant-intel');
    const chrono = page.getByTestId('chrono-endurance-intel');
    const ledger = page.getByTestId('allocation-ledger');
    const cycleDetails = page.locator('[data-testid="cycle-details-link-card"]:visible').first();
    const artwork = page.locator('[data-testid="deck-art-card"]:visible').first();
    await expect(chat.getByText('Cycle #7 · 2 messages')).toBeVisible();
    await expect(chat).toBeVisible();
    await expect(latest).toBeVisible();
    await expect(chrono).toBeVisible();
    await expect(ledger).toBeHidden();
    await expect(panel).toBeVisible();
    await expect(cycleDetails).toBeVisible();
    await expect(artwork).toBeVisible();
    await expect(page.getByTestId('public-goods-impact-card')).toHaveCount(0);

    const viewport = page.viewportSize();
    const clockBox = await clock.boundingBox();
    const cycleDetailsBox = await cycleDetails.boundingBox();
    const artworkBox = await artwork.boundingBox();
    const panelBox = await panel.boundingBox();
    const box = await chat.boundingBox();
    expect(viewport).not.toBeNull();
    expect(clockBox).not.toBeNull();
    expect(box).not.toBeNull();
    expect(cycleDetailsBox).not.toBeNull();
    expect(artworkBox).not.toBeNull();
    expect(panelBox).not.toBeNull();
    expect(cycleDetailsBox!.y + cycleDetailsBox!.height).toBeLessThanOrEqual(box!.y + 2);
    expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(box!.y + 2);

    if (testInfo.project.name !== 'Desktop Chrome') {
      expect(box!.width).toBeLessThanOrEqual(viewport!.width);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      // Decision information precedes the artwork on phones as well.
      expect(clockBox!.y + clockBox!.height).toBeLessThanOrEqual(panelBox!.y + 2);
      expect(box!.y + box!.height).toBeLessThanOrEqual(artworkBox!.y + 2);

      const participantBox = await chat
        .getByTestId('gesture-message-participant')
        .first()
        .boundingBox();
      const badgesBox = await chat.getByTestId('gesture-message-badges').first().boundingBox();
      expect(participantBox).not.toBeNull();
      expect(badgesBox).not.toBeNull();
      expect(badgesBox!.y).toBeGreaterThanOrEqual(participantBox!.y + participantBox!.height - 1);
      return;
    }

    // Desktop control desk: the panel flanks the clock's right in the same band.
    expect(clockBox!.x + clockBox!.width).toBeLessThanOrEqual(panelBox!.x + 2);
    expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(artworkBox!.y + 2);
    expect(box!.x + box!.width).toBeLessThanOrEqual(artworkBox!.x + 2);
    // Without attachments, the feed uses the available page width.
    expect(box!.x).toBeLessThan(viewport!.width / 2);
    expect(box!.width).toBeGreaterThan(320);
  });
});
