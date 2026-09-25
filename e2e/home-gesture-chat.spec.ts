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
  const panel = page.locator('[data-testid="gesture-panel"][data-variant="card"]');
  // The page exists for one action: the clock, the Calibration Window that
  // prices CST, the methods and the form's own action share the first
  // viewport at every desktop size, from 1280×720 up.
  const critical = [
    ['clock', page.getByTestId('cycle-clock')],
    ['Calibration Window', page.getByTestId('control-desk-calibration')],
    ['gesture methods', panel.getByTestId('panel-method-tabs')],
    ['commit action', panel.getByTestId('connect-to-gesture').getByRole('button')],
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
  // The standings are decision inputs: always open, never behind a disclosure.
  for (const testId of [
    'latest-participant-intel',
    'control-desk-endurance',
    'chrono-role-summary',
    'chrono-active-challenge',
  ]) {
    await expect(page.getByTestId(testId)).toBeVisible();
    expect(
      await page.getByTestId(testId).evaluate((element) => element.closest('details') === null),
    ).toBe(true);
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
    'the page must not overflow horizontally',
  ).toBeLessThanOrEqual(viewport.width);
}

/**
 * The desk reads in DOM order: within each column of the two-column desk,
 * keyboard focus never moves up (WCAG 1.3.2, 2.4.3). Focus may cross back to
 * the other column (the wallet's standing is read after the form beside it).
 * A stop belongs to the column its desk cell starts in, so a link at the far
 * edge of the wide standings cell still reads with the standings.
 */
async function expectDeskFocusOrderReadsDown(page: Page) {
  const stops = await page.getByTestId('control-desk-grid').evaluate((grid) => {
    const selector =
      'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
    const form = grid
      .querySelector('[data-testid="control-desk-gesture"]')!
      .getBoundingClientRect();
    return Array.from(grid.querySelectorAll<HTMLElement>(selector))
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
          rect.width > 0 &&
          rect.height > 0
        );
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const cell = element.closest('[data-testid="control-desk-grid"] > *') ?? element;
        return {
          name: (element.getAttribute('aria-label') ?? element.textContent ?? '')
            .trim()
            .slice(0, 40),
          column: cell.getBoundingClientRect().left >= form.left - 1 ? 'right' : 'left',
          // The middle of the control: controls of different heights on one
          // line (an ⓘ beside a 44px menu button) read as one line.
          middle: rect.top + rect.height / 2 + window.scrollY,
        };
      });
  });
  expect(stops.length).toBeGreaterThan(5);
  for (const column of ['left', 'right'] as const) {
    const inColumn = stops.filter((stop) => stop.column === column);
    for (let index = 1; index < inColumn.length; index += 1) {
      expect(
        inColumn[index]!.middle,
        `${column} column: "${inColumn[index]!.name}" after "${inColumn[index - 1]!.name}"`,
      ).toBeGreaterThanOrEqual(inColumn[index - 1]!.middle - 12);
    }
  }
}

/** Opens the optional message editor, which recedes behind one control until wanted. */
async function openMessageEditor(panel: Locator) {
  const toggle = panel.getByTestId('gesture-message-toggle');
  // A click that lands before hydration only focuses the toggle; try again.
  await expect(async () => {
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true', { timeout: 2000 });
  }).toPass();
}

/** Folds the message editor back behind its toggle, as the form loads. */
async function closeMessageEditor(panel: Locator) {
  const toggle = panel.getByTestId('gesture-message-toggle');
  if ((await toggle.getAttribute('aria-expanded')) === 'true') await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
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
 * Row 1 is the Cycle column (the clock over the Calibration Window, 5 of 12)
 * beside the gesture form (7 of 12), so the form's action is in the first
 * viewport. Row 2 is the Standings Ledger beside the newest Signature. The
 * three methods sit side by side.
 */
async function expectEfficientDesktopLayout(page: Page) {
  const grid = page.getByTestId('control-desk-grid');
  const clock = page.getByTestId('control-desk-clock');
  const calibration = page.getByTestId('control-desk-calibration');
  const standings = page.getByTestId('control-desk-standings');
  const form = page.getByTestId('control-desk-gesture');
  const methods = page.getByTestId('panel-method-tabs');
  const art = page.getByTestId('control-desk-art');
  const [gridBox, clockBox, calibrationBox, standingsBox, formBox, methodsBox, artBox] =
    await Promise.all([
      grid.boundingBox(),
      clock.boundingBox(),
      calibration.boundingBox(),
      standings.boundingBox(),
      form.boundingBox(),
      methods.boundingBox(),
      art.boundingBox(),
    ]);
  for (const box of [
    gridBox,
    clockBox,
    calibrationBox,
    standingsBox,
    formBox,
    methodsBox,
    artBox,
  ]) {
    expect(box).not.toBeNull();
  }

  // The Cycle column and the form share the first row; the Calibration
  // Window continues the Cycle column under the clock.
  expect(Math.abs(clockBox!.y - formBox!.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(clockBox!.x - gridBox!.x)).toBeLessThanOrEqual(1);
  expect(clockBox!.x + clockBox!.width).toBeLessThanOrEqual(formBox!.x);
  expect(Math.abs(calibrationBox!.x - clockBox!.x)).toBeLessThanOrEqual(1);
  expect(calibrationBox!.y).toBeGreaterThanOrEqual(clockBox!.y + clockBox!.height - 1);
  expect(Math.abs(formBox!.x + formBox!.width - (gridBox!.x + gridBox!.width))).toBeLessThanOrEqual(
    1,
  );
  expect(formBox!.width).toBeGreaterThan(gridBox!.width * 0.5);

  // Row 2 starts under both: the standings at the desk's edge, the art beside them.
  const gap = await grid.evaluate((element) => Number.parseFloat(getComputedStyle(element).rowGap));
  const rowBottom = Math.max(
    calibrationBox!.y + calibrationBox!.height,
    formBox!.y + formBox!.height,
  );
  const rowGap = standingsBox!.y - rowBottom;
  expect(rowGap).toBeGreaterThanOrEqual(-1);
  expect(rowGap).toBeLessThanOrEqual(gap + 2);
  expect(Math.abs(standingsBox!.x - gridBox!.x)).toBeLessThanOrEqual(1);
  expect(standingsBox!.x + standingsBox!.width).toBeLessThanOrEqual(artBox!.x);
  expect(Math.abs(artBox!.y - standingsBox!.y)).toBeLessThanOrEqual(1);
  expect(methodsBox!.width).toBeGreaterThanOrEqual(formBox!.width * 0.8);

  // Every method on one line, each with its price.
  const tops = await methods
    .getByRole('radio')
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
    await expect(chat.getByText('Cycle 7 · 2 messages')).toBeVisible();
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
      latest.locator('a[href="/user/0x3333333333333333333333333333333333333333"]'),
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

    // The Endurance Champion's current reign against the Chrono record, in
    // neutral words, under the Chrono-Warrior row it can change: the holder
    // is named once, on the Endurance row, and the record once, as the
    // Chrono-Warrior's time held.
    const chrono = page.getByTestId('chrono-role-summary');
    // Every duration in the ledger reads as a clock, the record included.
    await expect(chrono).toContainText(/00:30:00/);
    const challenge = chrono.getByTestId('chrono-active-challenge');
    await expect(challenge).toBeVisible();
    // The reign keeps growing while the page is open, so the time left ticks
    // down; both read in the fixed grammar, whose width holds while they tick.
    await expect(challenge.getByTestId('chrono-challenge-segment')).toContainText(
      new RegExp(`${home.observatory.ledger.challenge.reign}\\s*(20|21)m\\s\\d\\ds`),
    );
    await expect(challenge.getByTestId('chrono-challenge-next-change')).toContainText(
      new RegExp(`${home.observatory.ledger.challenge.passesIn}\\s*(10m\\s0[01]s|9m\\s\\d\\ds)`),
    );
    await expect(
      challenge.getByRole('progressbar', { name: home.observatory.ledger.challenge.progressAria }),
    ).toBeVisible();
    await expect(challenge.getByRole('link')).toHaveCount(0);
    await expect(
      page
        .getByTestId('control-desk-endurance')
        .locator('a[href="/user/0x1111111111111111111111111111111111111111"]'),
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
      latest.locator('a[href="/user/0x3333333333333333333333333333333333333333"]'),
    ).toBeVisible();
    await expect(
      latest.locator('a[href="/user/0x9999999999999999999999999999999999999999"]'),
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
      await expectDeskFocusOrderReadsDown(page);
      await expect(page.getByTestId('standings-disclosure')).toHaveCount(0);
      await expect(page.getByTestId('allocation-ledger')).toBeHidden();
      await expect(page.getByTestId('control-desk-calibration').getByRole('region')).toHaveCount(1);
      await expectCommentFormReachable(page);
      // The editor, opened above, may extend the form; choosing CST must not.
      await closeMessageEditor(page.locator('[data-testid="gesture-panel"][data-variant="card"]'));
      if (viewport.width === 1280 || viewport.width === 1440) {
        const screenshotPath = testInfo.outputPath(`home-dashboard-${viewport.width}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' });
        await testInfo.attach(`home-dashboard-${viewport.width}`, {
          path: screenshotPath,
          contentType: 'image/png',
        });
      }

      await page.getByTestId('panel-method-cst').click();
      await expect(page.getByTestId('panel-method-cst')).toHaveAttribute('aria-checked', 'true');
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
      await expect(page.getByTestId('panel-method-cst')).toHaveAttribute('aria-checked', 'true');
      await expectEfficientDesktopLayout(page);
      await expectTextWithoutOverlap(page.getByTestId('panel-method-tabs'));
      await expectTextWithoutOverlap(page.getByTestId('control-desk-calibration'));
      for (const key of ['reward', 'cost', 'net']) {
        await expectTextWithoutOverlap(page.getByTestId(`panel-cst-metric-${key}`));
      }
      await expectCommentFormReachable(page);
    });
  }

  test('keeps an inline form on phones, with the dock offering the form’s own connect action', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'Desktop Chrome', 'mobile action-path guard');
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // From the first paint on a phone, before anything is measured, the dock
    // offers the one action: here, without a wallet, "Connect wallet".
    const dock = page.locator('[data-action-dock]');
    await expect(dock).not.toHaveAttribute('aria-hidden', 'true');
    await expect(page.getByTestId('dock-connect')).toBeVisible();
    await expect(page.getByTestId('dock-open-sheet')).toHaveCount(0);

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

    // The dock never lies over a field being filled: it steps aside while
    // someone works in the form (or its own action is on screen) and returns
    // once the form has scrolled away.
    // Aside, the dock slides away and leaves the accessibility tree and the
    // tab order (aria-hidden and inert); Playwright counts a faded element
    // as visible, so the attributes are the contract.
    await expect(dock).toHaveAttribute('aria-hidden', 'true');
    await page.getByTestId('home-feed-layout').scrollIntoViewIfNeeded();
    await expect(dock).not.toHaveAttribute('aria-hidden', 'true');

    // Its connect action opens the wallet list directly, never a sheet that
    // only asks for a wallet; the draft waits in the form.
    const dockConnect = page.getByTestId('dock-connect');
    await expect(dockConnect).toBeVisible();
    await dockConnect.click();
    const wallets = page.getByRole('dialog', { name: /connect a wallet/i }).first();
    await expect(wallets).toBeVisible({ timeout: 10_000 });
    await page.keyboard.press('Escape');
    await expect(wallets).toBeHidden();
    await expect(page.locator('[data-testid="gesture-panel"][data-variant="sheet"]')).toHaveCount(
      0,
    );
    await expect(inlineMessage).toHaveValue(draft);
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

  test('keeps long chat history readable in the page at every width, never in a scroll box', async ({
    page,
  }) => {
    await page.unroute('**/api/cosmicgame/**');
    await mockHomeGestureChatApi(page, makeLongGestureFeed());
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const chat = page.locator('[data-testid="gesture-message-chat"]:visible').first();
    const feed = chat.getByTestId('gesture-message-chat-scroll');
    await expect(chat.getByText('Cycle 7 · 12 messages')).toBeVisible();
    await chat.scrollIntoViewIfNeeded();
    const oldest = chat.getByText(/Scrollable message 12:/);

    // The newest messages, then "Show more": the wheel always moves the
    // page, never a box inside it.
    const metrics = await feed.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      overflowY: window.getComputedStyle(element).overflowY,
    }));
    expect(metrics.overflowY).toBe('visible');
    expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.clientHeight + 1);
    await expect(oldest).toBeHidden();
    const pageScroll = await page.evaluate(() => window.scrollY);
    await feed.hover();
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(pageScroll);
    await chat.getByRole('button', { name: 'Show more', exact: true }).click();
    await expect(oldest).toBeVisible();
  });

  test('positions the chat appropriately for the current viewport', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const chat = page.locator('[data-testid="gesture-message-chat"]:visible').first();
    const panel = page.locator('[data-testid="gesture-panel"][data-variant="card"]');
    const clock = page.locator('[data-testid="cycle-clock"]:visible').first();
    const latest = page.getByTestId('latest-participant-intel');
    const chrono = page.getByTestId('standings-ledger');
    const ledger = page.getByTestId('allocation-ledger');
    const guide = page.getByTestId('cycle-phase-guide');
    const cycleDetails = page.locator('[data-testid="cycle-details-link-card"]:visible').first();
    const artwork = page.locator('[data-testid="latest-signature"]:visible').first();
    await expect(chat.getByText('Cycle 7 · 2 messages')).toBeVisible();
    await expect(chat).toBeVisible();
    await expect(latest).toBeVisible();
    await expect(chrono).toBeVisible();
    await expect(ledger).toBeHidden();
    await expect(panel).toBeVisible();
    await expect(guide).toBeVisible();
    await expect(cycleDetails).toBeVisible();
    await expect(artwork).toBeVisible();
    await expect(page.getByTestId('public-goods-impact-card')).toHaveCount(0);

    const viewport = page.viewportSize();
    const clockBox = await clock.boundingBox();
    const artworkBox = await artwork.boundingBox();
    const panelBox = await panel.boundingBox();
    const guideBox = await guide.boundingBox();
    const box = await chat.boundingBox();
    for (const measured of [viewport, clockBox, artworkBox, panelBox, guideBox, box]) {
      expect(measured).not.toBeNull();
    }
    // The cycle links live in the guide beside the chat, never floating above it.
    await expect(guide).toContainText('View full cycle details');
    expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(box!.y + 2);

    if (testInfo.project.name !== 'Desktop Chrome') {
      expect(box!.width).toBeLessThanOrEqual(viewport!.width);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      // Decision information first; then the art, then the conversation.
      expect(clockBox!.y + clockBox!.height).toBeLessThanOrEqual(panelBox!.y + 2);
      expect(artworkBox!.y + artworkBox!.height).toBeLessThanOrEqual(box!.y + 2);
      expect(box!.y + box!.height).toBeLessThanOrEqual(guideBox!.y + 2);

      // Who, how the Gesture was made and when share one line over the message.
      const meta = chat.getByTestId('gesture-message-meta').first();
      await expect(meta.getByTestId('gesture-method-badge')).toBeVisible();
      return;
    }

    // Desktop: the form beside the Cycle column; the standings and the art
    // below; then the chat and the guide.
    expect(clockBox!.x + clockBox!.width).toBeLessThanOrEqual(panelBox!.x + 2);
    await expectEfficientDesktopLayout(page);
    expect(artworkBox!.y).toBeGreaterThanOrEqual(panelBox!.y + panelBox!.height);
    expect(box!.x + box!.width).toBeLessThanOrEqual(guideBox!.x + 2);
    expect(Math.abs(box!.y - guideBox!.y)).toBeLessThanOrEqual(1);
    expect(box!.x).toBeLessThan(viewport!.width / 2);
    expect(box!.width).toBeGreaterThan(320);
  });

  test("gives the art the form's place between cycles and the standings the whole row under it", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome', 'The two-column desk starts at 1024px.');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?uxScenario=opening-soon', { waitUntil: 'domcontentloaded' });

    const grid = page.getByTestId('control-desk-grid');
    await expect(grid).toHaveAttribute('data-layout', 'between-cycles');
    const [gridBox, clockBox, artBox, standingsBox] = await Promise.all([
      grid.boundingBox(),
      page.getByTestId('control-desk-clock').boundingBox(),
      page.getByTestId('control-desk-art').boundingBox(),
      page.getByTestId('control-desk-standings').boundingBox(),
    ]);
    for (const box of [gridBox, clockBox, artBox, standingsBox]) expect(box).not.toBeNull();

    // The art beside the Cycle column, out to the desk's right edge.
    expect(clockBox!.x + clockBox!.width).toBeLessThanOrEqual(artBox!.x);
    expect(Math.abs(artBox!.y - clockBox!.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(artBox!.x + artBox!.width - (gridBox!.x + gridBox!.width))).toBeLessThanOrEqual(
      1,
    );
    // The standings under it across the whole desk, so no empty cell sits beside them.
    expect(standingsBox!.y).toBeGreaterThanOrEqual(artBox!.y + artBox!.height - 1);
    expect(Math.abs(standingsBox!.x - gridBox!.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(standingsBox!.width - gridBox!.width)).toBeLessThanOrEqual(1);
  });
});
