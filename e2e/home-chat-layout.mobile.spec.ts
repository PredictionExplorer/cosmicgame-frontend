import { expect, test, type Page } from '@playwright/test';

import { makeLongGestureFeed, mockHomeGestureChatApi } from './home-gesture-chat-fixtures';

const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 768, height: 1024 },
  { width: 844, height: 390 },
] as const;

async function openChat(page: Page, messageCount = 12) {
  await page.unroute('**/api/cosmicgame/**');
  await mockHomeGestureChatApi(page, makeLongGestureFeed(messageCount));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const chat = page.getByTestId('gesture-message-chat');
  await expect(
    chat.getByText(new RegExp(`Cycle #7 · (Latest )?${Math.min(messageCount, 50)} messages`)),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return chat;
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

for (const viewport of VIEWPORTS) {
  test(`keeps the chat in the page flow with older messages one tap away at ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const chat = await openChat(page);
    const scroll = chat.getByTestId('gesture-message-chat-scroll');
    const heading = chat.getByRole('heading', { name: 'Gesture Chat' });
    const guide = page.getByTestId('cycle-phase-guide');
    await chat.scrollIntoViewIfNeeded();

    const chatBox = (await chat.boundingBox())!;
    const guideBox = (await guide.boundingBox())!;
    const metrics = await scroll.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    // Below 1024px the feed never scrolls inside the scrolling page.
    expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.clientHeight + 1);
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(guideBox.y - (chatBox.y + chatBox.height)).toBeGreaterThanOrEqual(-1);
    expect(guideBox.y - (chatBox.y + chatBox.height)).toBeLessThanOrEqual(32);
    await expect(heading).toBeVisible();

    // The newest messages lead; the oldest waits behind "Show more".
    const oldestMessage = chat.getByText(/Scrollable message 12:/);
    await expect(chat.getByText(/Scrollable message 1:/)).toBeVisible();
    await expect(oldestMessage).toBeHidden();
    await chat.getByRole('button', { name: 'Show more', exact: true }).click();
    await expect(oldestMessage).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      'the page must not overflow horizontally',
    ).toBeLessThanOrEqual(viewport.width);
  });
}

test('more history does not push the rest of the mobile page down', async ({ page }) => {
  const chat = await openChat(page);
  const originalChatHeight = (await chat.boundingBox())!.height;
  const originalGuideTop = (await page.getByTestId('cycle-phase-guide').boundingBox())!.y;

  await openChat(page, 120);

  // The same number of newest messages leads, whatever the history holds.
  expect((await chat.boundingBox())!.height).toBeCloseTo(originalChatHeight, -1);
  expect((await page.getByTestId('cycle-phase-guide').boundingBox())!.y).toBeCloseTo(
    originalGuideTop,
    -1,
  );
  await chat.scrollIntoViewIfNeeded();
  await expect(chat.getByTestId('gesture-message-meta')).toHaveCount(50);
  // Reveal what is loaded, then load older history.
  const showMore = chat.getByRole('button', { name: 'Show more', exact: true });
  while (await showMore.isVisible()) await showMore.click();
  await chat.getByRole('button', { name: 'Load older', exact: true }).click();
  await expect(chat.getByTestId('gesture-message-meta')).toHaveCount(100);
});

test('printing exposes the full chat instead of the newest messages only', async ({ page }) => {
  const chat = await openChat(page);
  await expect(chat.getByText(/Scrollable message 12:/)).toBeHidden();

  await page.emulateMedia({ media: 'print' });
  const scroll = chat.getByTestId('gesture-message-chat-scroll');
  const printMetrics = await scroll.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    overflowY: window.getComputedStyle(element).overflowY,
  }));
  expect(printMetrics.overflowY).toBe('visible');
  expect(printMetrics.scrollHeight).toBeLessThanOrEqual(printMetrics.clientHeight + 1);
  const chatBox = (await chat.boundingBox())!;
  const oldestBox = (await chat.getByText(/Scrollable message 12:/).boundingBox())!;
  expect(oldestBox.y + oldestBox.height).toBeLessThanOrEqual(chatBox.y + chatBox.height);
});
