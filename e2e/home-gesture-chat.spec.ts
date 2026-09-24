import { expect, test, type Locator, type Page } from '@playwright/test';

import { TRANSLATED_LOCALES } from '../i18n/routing';
import home from '../messages/en/home.json';

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

/** Opens the optional message editor, which recedes behind one control until wanted. */
async function openMessageEditor(panel: Locator) {
  const toggle = panel.getByTestId('gesture-message-toggle');
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
}

/** The expanded editor can extend the form, but every control must remain reachable. */
async function expectCommentFormReachable(page: Page) {
  const panel = page.locator('[data-testid="gesture-panel"][data-variant="card"]');
  const message = panel.getByTestId('gesture-message-input');
  const connect = panel.getByTestId('connect-to-gesture');
  await openMessageEditor(panel);
  await expect(message).toBeVisible();
  await expect(message).toBeEditable();
  await expect(message).toHaveAccessibleName(/\S/);
  expect(await message.evaluate((element) => element.closest('details') !== null)).toBe(false);
  const messageBox = await message.boundingBox();
  const connectBox = await connect.boundingBox();
  expect(messageBox).not.toBeNull();
  expect(connectBox).not.toBeNull();
  expect(messageBox!.height).toBeGreaterThanOrEqual(96);
  expect(messageBox!.y + messageBox!.height).toBeLessThanOrEqual(connectBox!.y);
  await expectTextWithoutOverlap(panel.getByTestId('gesture-panel-message'));
  // Center each control so fractional scroll alignment at the viewport edge
  // cannot turn a reachable field into a false clipping failure.
  await message.evaluate((element) =>
    element.scrollIntoView({ block: 'center', behavior: 'instant' }),
  );
  await expect(message).toBeInViewport({ ratio: 1 });
  const connectButton = connect.getByRole('button');
  await connectButton.evaluate((element) =>
    element.scrollIntoView({ block: 'center', behavior: 'instant' }),
  );
  await expect(connectButton).toBeInViewport({ ratio: 1 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
}

/**
 * The form spans the whole desk row under the clock and the standings, with
 * the wallet standing beside its main column rather than a narrow stacked
 * form and an empty sidebar band. The three methods sit side by side.
 */
async function expectEfficientDesktopLayout(page: Page) {
  const grid = page.getByTestId('control-desk-grid');
  const cycle = page.getByTestId('control-desk-cycle');
  const standings = page.getByTestId('control-desk-standings');
  const form = page.getByTestId('control-desk-gesture');
  const methods = page.getByTestId('panel-method-tabs');
  const standing = form.getByTestId('gesture-panel-standing');
  const [gridBox, cycleBox, standingsBox, formBox, methodsBox, standingBox] = await Promise.all([
    grid.boundingBox(),
    cycle.boundingBox(),
    standings.boundingBox(),
    form.boundingBox(),
    methods.boundingBox(),
    standing.boundingBox(),
  ]);
  for (const box of [gridBox, cycleBox, standingsBox, formBox, methodsBox, standingBox]) {
    expect(box).not.toBeNull();
  }

  // The clock column and the standings share the first row.
  expect(Math.abs(cycleBox!.y - standingsBox!.y)).toBeLessThanOrEqual(1);
  expect(cycleBox!.x + cycleBox!.width).toBeLessThanOrEqual(standingsBox!.x);

  // The form spans the row beneath them.
  expect(Math.abs(formBox!.x - gridBox!.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(formBox!.width - gridBox!.width)).toBeLessThanOrEqual(1);
  const gap = await grid.evaluate((element) => Number.parseFloat(getComputedStyle(element).rowGap));
  const rowBottom = Math.max(
    cycleBox!.y + cycleBox!.height,
    standingsBox!.y + standingsBox!.height,
  );
  const formGap = formBox!.y - rowBottom;
  expect(formGap).toBeGreaterThanOrEqual(0);
  expect(formGap).toBeLessThanOrEqual(gap + 2);

  // The standing column sits beside the methods, in the same band.
  expect(methodsBox!.x + methodsBox!.width).toBeLessThanOrEqual(standingBox!.x);
  expect(standingBox!.y).toBeLessThan(methodsBox!.y + methodsBox!.height);
  expect(methodsBox!.width).toBeGreaterThanOrEqual(formBox!.width * 0.45);

  // Every method on one line, each with its price.
  const tops = await methods
    .locator('button[aria-pressed]')
    .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().top));
  expect(tops.length).toBeGreaterThanOrEqual(1);
  for (const top of tops) expect(Math.abs(top - tops[0]!)).toBeLessThanOrEqual(1);

  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
    'the page must not overflow horizontally',
  ).toBeLessThanOrEqual(page.viewportSize()!.width);
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
    await expect(page.getByTestId('latest-participant-paid-amount')).toContainText('20 CST');
    await expect(page.getByTestId('latest-participant-cst-received')).toContainText('100 CST');
    await expect(page.getByTestId('latest-participant-gesture-id')).toContainText('#4');
    await expect(page.getByTestId('latest-participant-message')).toContainText(
      'Newest message from a gesture',
    );
    await expect(
      latest.getByRole('progressbar', { name: 'Progress toward Endurance Champion' }),
    ).toBeVisible();
    await expect(page.getByTestId('clock-reserve')).toContainText('2.5000 ETH');

    // The Endurance hold against the Chrono record, in neutral words; the
    // holder is named once, on the Endurance row.
    const challenge = page.getByTestId('chrono-active-challenge');
    await expect(challenge).toBeVisible();
    await expect(challenge).toContainText(home.observatory.ledger.challenge.title);
    await expect(challenge).toContainText(/Held\s*20m/);
    await expect(challenge).toContainText(/Chrono record\s*30m/);
    await expect(challenge).toContainText(/Passes it in\s*10m 1s/);
    await expect(challenge.getByRole('link')).toHaveCount(0);
    await expect(
      page
        .getByTestId('control-desk-endurance')
        .getByRole('link', { name: '0x1111111111111111111111111111111111111111' }),
    ).toBeVisible();
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
    await expect(page.getByTestId('latest-participant-paid-amount')).toContainText('20 CST');
    await expect(page.getByTestId('latest-participant-cst-received')).toContainText('100 CST');
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
    test(`keeps standings above the fold and uses the full form width at ${viewport.width}×${viewport.height} with ETH and CST selected`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'Desktop Chrome', 'desktop density guard');
      await page.setViewportSize(viewport);
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.getByTestId('panel-method-cst-cost')).toContainText('20 CST');
      await page.evaluate(() => document.fonts.ready);

      await expectDecisionDashboardInViewport(page);
      await expectEfficientDesktopLayout(page);
      await expect(page.getByTestId('standings-disclosure')).toHaveCount(0);
      await expect(page.getByTestId('allocation-ledger')).toBeHidden();
      await expect(page.getByTestId('control-desk-calibration').getByRole('region')).toHaveCount(1);
      await expectCommentFormReachable(page);
      if (viewport.width === 1280 || viewport.width === 1440) {
        const screenshotPath = testInfo.outputPath(`home-dashboard-${viewport.width}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' });
        await testInfo.attach(`home-dashboard-${viewport.width}`, {
          path: screenshotPath,
          contentType: 'image/png',
        });
      }

      await page.getByTestId('panel-method-cst').click();
      await expect(page.getByTestId('panel-method-cst')).toHaveAttribute('aria-pressed', 'true');
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await expectDecisionDashboardInViewport(page);
      await expectEfficientDesktopLayout(page);
      await expect(page.getByTestId('panel-cst-reward')).toBeVisible();
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
      await expectCommentFormReachable(page);
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
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

      await expectDecisionDashboardInViewport(page);
      await expectEfficientDesktopLayout(page);
      await expectTextWithoutOverlap(page.getByTestId('panel-method-tabs'));
      await expectTextWithoutOverlap(page.getByTestId('panel-cst-reward'));
      for (const key of ['reward', 'cost', 'net']) {
        await expectTextWithoutOverlap(page.getByTestId(`panel-cst-metric-${key}`));
      }
      await expectCommentFormReachable(page);
    });
  }

  for (const locale of TRANSLATED_LOCALES) {
    test(`${locale} keeps the expanded composer usable across the desktop row`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'Desktop Chrome', 'translated desktop layout guard');
      await page.setViewportSize(DESKTOP_VIEWPORTS[0]);
      await page.goto(`/${locale}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.getByTestId('panel-method-cst-cost')).toContainText('20');
      await page.evaluate(() => document.fonts.ready);

      await expectEfficientDesktopLayout(page);
      await expectCommentFormReachable(page);
      await page.getByTestId('panel-method-cst').click();
      await expect(page.getByTestId('panel-method-cst')).toHaveAttribute('aria-pressed', 'true');
      await expectEfficientDesktopLayout(page);
      await expectTextWithoutOverlap(page.getByTestId('panel-method-tabs'));
      await expectTextWithoutOverlap(page.getByTestId('control-desk-calibration'));
      for (const key of ['reward', 'cost', 'net']) {
        await expectTextWithoutOverlap(page.getByTestId(`panel-cst-metric-${key}`));
      }
      await expectCommentFormReachable(page);
    });
  }

  test('keeps an inline form on phones and offers the same controls in the quick-action sheet', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'Desktop Chrome', 'mobile action-path guard');
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const inlinePanel = page.locator('[data-testid="gesture-panel"][data-variant="card"]');
    await expect(inlinePanel).toBeVisible();
    await expect(inlinePanel.getByTestId('panel-method-eth-cost')).toBeVisible();
    const inlineMessage = inlinePanel.getByRole('textbox', {
      name: new RegExp(`^${home.form.advanced.messageLabel}`),
    });
    await expect(inlineMessage).toBeHidden();
    await openMessageEditor(inlinePanel);
    await expect(inlineMessage).toBeVisible();
    await expect(inlineMessage).toBeEditable();
    const draft = 'A comment started before connecting.';
    await inlineMessage.fill(draft);

    // The dock never covers the form: it steps aside while the form is on
    // screen and returns once it has scrolled away.
    const dockAction = page.getByTestId('dock-open-sheet');
    await expect(dockAction).toBeHidden();
    await page.getByTestId('home-feed-layout').scrollIntoViewIfNeeded();
    await expect(dockAction).toBeVisible();
    await dockAction.click();

    const sheetPanel = page.locator('[data-testid="gesture-panel"][data-variant="sheet"]:visible');
    await expect(sheetPanel).toHaveCount(1);
    await expect(sheetPanel.getByTestId('panel-method-eth-cost')).toBeVisible();
    const sheetMessage = sheetPanel.getByRole('textbox', {
      name: new RegExp(`^${home.form.advanced.messageLabel}`),
    });
    await expect(sheetMessage).toBeVisible();
    await expect(sheetMessage).toBeEditable();
    await expect(sheetMessage).toHaveValue(draft);
    const revisedDraft = `${draft} Finished in the quick-action sheet.`;
    await sheetMessage.fill(revisedDraft);
    await expect(sheetPanel.getByTestId('connect-to-gesture')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sheetPanel).toHaveCount(0);
    await expect(inlinePanel).toBeVisible();
    await expect(inlineMessage).toHaveValue(revisedDraft);
    await page.evaluate(() => document.fonts.ready);
    const screenshotPath = testInfo.outputPath('home-dashboard-mobile-320.png');
    await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' });
    await testInfo.attach('home-dashboard-mobile-320', {
      path: screenshotPath,
      contentType: 'image/png',
    });
  });

  test('opens optional allocations from the keyboard while decision information stays visible', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const allocations = page.getByTestId('allocations-disclosure');
    await expect(page.getByTestId('latest-participant-intel')).toBeVisible();
    await expect(page.getByTestId('standings-ledger')).toBeVisible();
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
    await expect(page.getByTestId('standings-ledger')).toBeVisible();
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
    const chrono = page.getByTestId('standings-ledger');
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

    // The full-width form follows the clock and the standings; the feed follows the desk.
    expect(clockBox!.y + clockBox!.height).toBeLessThanOrEqual(panelBox!.y + 2);
    await expectEfficientDesktopLayout(page);
    expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(artworkBox!.y + 2);
    expect(box!.x + box!.width).toBeLessThanOrEqual(artworkBox!.x + 2);
    // Without attachments, the feed uses the available page width.
    expect(box!.x).toBeLessThan(viewport!.width / 2);
    expect(box!.width).toBeGreaterThan(320);
  });
});
