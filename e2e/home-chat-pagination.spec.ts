import { expect, test, type Locator } from '@playwright/test';

import { mockPagedHomeGestureChatApi } from './home-gesture-chat-fixtures';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

/** The feed shows its newest messages first at every width; reveal what is loaded. */
async function revealLoadedMessages(chat: Locator) {
  const showMore = chat.getByRole('button', { name: 'Show more', exact: true });
  while (await showMore.isVisible()) await showMore.click();
}

test('loads older message pages only on request and keeps the current reading position', async ({
  page,
}) => {
  const api = await mockPagedHomeGestureChatApi(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const chat = page.getByTestId('gesture-message-chat');
  await expect(chat.getByTestId('gesture-message-meta')).toHaveCount(50);
  expect(api.requests.filter((url) => url.searchParams.has('cursor'))).toHaveLength(0);
  await expect(chat.getByText(/Scrollable message 51:/)).toHaveCount(0);
  await revealLoadedMessages(chat);

  // Older history comes on request, under what is already read: the row being
  // read stays where it is on screen.
  const older = chat.getByRole('button', { name: 'Load older', exact: true });
  await older.scrollIntoViewIfNeeded();
  const readingRow = chat.locator('[data-chat-row]').last();
  const readingKey = await readingRow.getAttribute('data-chat-row');
  const reading = chat.locator(`[data-chat-row="${readingKey}"]`);
  const before = (await reading.boundingBox())!.y;
  await older.click();
  await expect(chat.getByTestId('gesture-message-meta')).toHaveCount(100);
  expect((await reading.boundingBox())!.y).toBeCloseTo(before, 0);
  expect(api.requests.filter((url) => url.searchParams.get('cursor') === 'older-50')).toHaveLength(
    1,
  );

  await revealLoadedMessages(chat);
  await chat.getByText(/Scrollable message 100:/).scrollIntoViewIfNeeded();
  await expect(chat.getByText(/Scrollable message 100:/)).toBeInViewport();
});

test('keeps existing messages visible when loading older history fails and allows retry', async ({
  page,
}) => {
  const api = await mockPagedHomeGestureChatApi(page, { olderFailures: 1 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const chat = page.getByTestId('gesture-message-chat');
  await expect(chat.getByTestId('gesture-message-meta')).toHaveCount(50);
  await revealLoadedMessages(chat);
  await chat.getByRole('button', { name: 'Load older', exact: true }).click();
  // A status, not an alert: the loaded history is still on screen.
  await expect(chat.getByText('Could not load older messages.')).toBeVisible();
  await expect(chat.getByTestId('gesture-message-meta')).toHaveCount(50);
  await chat.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(chat.getByTestId('gesture-message-meta')).toHaveCount(100);
  await expect(chat.getByText('Could not load older messages.')).toHaveCount(0);
  expect(api.requests.filter((url) => url.searchParams.get('cursor') === 'older-50')).toHaveLength(
    2,
  );
});

test('offers retry when the first page fails instead of showing an empty chat', async ({
  page,
}) => {
  await mockPagedHomeGestureChatApi(page, { initialFailures: 2 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const chat = page.getByTestId('gesture-message-chat');
  await expect(chat.getByText('Could not load chat.')).toBeVisible();
  await expect(chat.getByText('No messages or events yet')).toHaveCount(0);
  await chat.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(chat.getByTestId('gesture-message-meta')).toHaveCount(50);
});

test('polls only new messages, preserves older reading position, and resets corrected history', async ({
  page,
}, testInfo) => {
  // The page's own scroll anchoring keeps the row being read in place; this
  // pins Chromium's behaviour, where the check is exact.
  test.skip(testInfo.project.name !== 'Desktop Chrome', 'scroll anchoring pinned in Chromium');
  const api = await mockPagedHomeGestureChatApi(page);
  const legacyRequests: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    // lexicon-allow-start: legacy backend path is a sealed API contract.
    if (path.includes('/bid/list/by_round/')) legacyRequests.push(path);
    // lexicon-allow-end
  });
  await page.clock.install();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const chat = page.getByTestId('gesture-message-chat');
  await expect(chat.getByTestId('gesture-message-meta')).toHaveCount(50);
  await revealLoadedMessages(chat);
  await chat.scrollIntoViewIfNeeded();
  const reading = chat.locator('[data-chat-row="message:220"]');
  await reading.scrollIntoViewIfNeeded();
  const before = (await reading.boundingBox())!.y;
  api.addLiveMessage();
  await page.clock.runFor(10_100);
  await expect(chat.getByTestId('gesture-message-meta')).toHaveCount(51);
  await expect(chat.getByText('New live message')).toHaveCount(1);
  expect((await reading.boundingBox())!.y).toBeCloseTo(before, 0);
  expect(api.requests.some((url) => url.searchParams.has('after'))).toBe(true);
  expect(legacyRequests.length).toBeGreaterThan(0);
  expect(legacyRequests.every((path) => path.endsWith('/0/1'))).toBe(true);

  api.correctHistory();
  await page.clock.runFor(10_100);
  await expect(chat.getByText('Corrected history message')).toHaveCount(1);
  await expect(chat.getByTestId('gesture-message-meta')).toHaveCount(50);
  await expect(chat.getByText('New live message')).toHaveCount(0);
  // A corrected history starts again at its newest rows.
  await expect(chat.getByRole('button', { name: 'Show more', exact: true })).toBeVisible();
});
