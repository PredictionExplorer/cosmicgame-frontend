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
  await expect(chat.getByText(`Cycle #7 · ${messageCount} messages`)).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return chat;
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

for (const viewport of VIEWPORTS) {
  test(`keeps chat compact and older messages reachable at ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const chat = await openChat(page);
    const scroll = chat.getByTestId('gesture-message-chat-scroll');
    const heading = chat.getByRole('heading', { name: 'Gesture Chat' });
    const artwork = page.getByTestId('deck-art-card');
    await chat.scrollIntoViewIfNeeded();

    const chatBox = (await chat.boundingBox())!;
    const artworkBox = (await artwork.boundingBox())!;
    const metrics = await scroll.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(metrics.clientHeight).toBeLessThanOrEqual(Math.min(448, viewport.height * 0.55) + 1);
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight + 20);
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(artworkBox.y - (chatBox.y + chatBox.height)).toBeGreaterThanOrEqual(-1);
    expect(artworkBox.y - (chatBox.y + chatBox.height)).toBeLessThanOrEqual(32);

    const oldestMessage = chat.getByText(/Scrollable message 12:/);
    await expect(oldestMessage).not.toBeInViewport();
    const headingTop = (await heading.boundingBox())!.y;
    const pageScroll = await page.evaluate(() => window.scrollY);
    await scroll.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await expect(oldestMessage).toBeInViewport();
    await expect(heading).toBeInViewport();
    expect((await heading.boundingBox())!.y).toBeCloseTo(headingTop, 0);
    expect(await page.evaluate(() => window.scrollY)).toBe(pageScroll);
  });
}

test('more history does not push the rest of the mobile page down', async ({ page }) => {
  const chat = await openChat(page);
  const originalChatHeight = (await chat.boundingBox())!.height;
  const originalArtworkTop = (await page.getByTestId('deck-art-card').boundingBox())!.y;
  const originalPageHeight = await page.evaluate(() => document.documentElement.scrollHeight);

  await openChat(page, 120);

  expect((await chat.boundingBox())!.height).toBeCloseTo(originalChatHeight, 0);
  expect((await page.getByTestId('deck-art-card').boundingBox())!.y).toBeCloseTo(
    originalArtworkTop,
    0,
  );
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(
    originalPageHeight + 2,
  );
  const scroll = chat.getByTestId('gesture-message-chat-scroll');
  await chat.scrollIntoViewIfNeeded();
  await scroll.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(chat.getByText(/Scrollable message 120:/)).toBeInViewport();
});

test('printing exposes the full chat instead of clipping older messages', async ({ page }) => {
  const chat = await openChat(page);
  const scroll = chat.getByTestId('gesture-message-chat-scroll');
  const screenHeight = (await chat.boundingBox())!.height;

  await page.emulateMedia({ media: 'print' });

  const printMetrics = await scroll.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    overflowY: window.getComputedStyle(element).overflowY,
  }));
  expect(printMetrics.overflowY).toBe('visible');
  expect(printMetrics.scrollHeight).toBeLessThanOrEqual(printMetrics.clientHeight + 1);
  const chatBox = (await chat.boundingBox())!;
  const oldestBox = (await chat.getByText(/Scrollable message 12:/).boundingBox())!;
  expect(chatBox.height).toBeGreaterThan(screenHeight * 2);
  expect(oldestBox.y + oldestBox.height).toBeLessThanOrEqual(chatBox.y + chatBox.height);
});
