import { expect, test } from '@playwright/test';

import { mockPagedHomeGestureChatApi } from './home-gesture-chat-fixtures';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('loads older message pages only on request and keeps the current reading position', async ({
  page,
}) => {
  const api = await mockPagedHomeGestureChatApi(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const chat = page.getByTestId('gesture-message-chat');
  const scroll = chat.getByTestId('gesture-message-chat-scroll');
  await expect(chat.getByTestId('gesture-message-meta')).toHaveCount(50);
  expect(api.requests.filter((url) => url.searchParams.has('cursor'))).toHaveLength(0);
  await expect(chat.getByText(/Scrollable message 51:/)).toHaveCount(0);
  await chat.scrollIntoViewIfNeeded();

  const older = chat.getByRole('button', { name: 'Load older', exact: true });
  await older.scrollIntoViewIfNeeded();
  const readingKey = await scroll.evaluate((element) => {
    const top = element.getBoundingClientRect().top;
    return Array.from(element.querySelectorAll<HTMLElement>('[data-chat-row]')).find(
      (row) => row.getBoundingClientRect().bottom > top,
    )!.dataset.chatRow!;
  });
  const readingRow = chat.locator(`[data-chat-row="${readingKey}"]`);
  const before = (await readingRow.boundingBox())!.y - (await scroll.boundingBox())!.y;
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  await older.click();
  await expect(chat.getByTestId('gesture-message-meta')).toHaveCount(100);
  expect((await readingRow.boundingBox())!.y - (await scroll.boundingBox())!.y).toBeCloseTo(
    before,
    0,
  );
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(pageHeight);
  expect(api.requests.filter((url) => url.searchParams.get('cursor') === 'older-50')).toHaveLength(
    1,
  );

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
  await chat.getByRole('button', { name: 'Load older', exact: true }).click();
  await expect(chat.getByRole('alert')).toHaveText('Could not load older messages.');
  await expect(chat.getByTestId('gesture-message-meta')).toHaveCount(50);
  await chat.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(chat.getByTestId('gesture-message-meta')).toHaveCount(100);
  await expect(chat.getByRole('alert')).toHaveCount(0);
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
  await expect(chat.getByRole('alert')).toHaveText('Could not load chat.');
  await expect(chat.getByText('No messages or events yet')).toHaveCount(0);
  await chat.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(chat.getByTestId('gesture-message-meta')).toHaveCount(50);
});

test('polls only new messages, preserves older reading position, and resets corrected history', async ({
  page,
}) => {
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
  const scroll = chat.getByTestId('gesture-message-chat-scroll');
  await expect(chat.getByTestId('gesture-message-meta')).toHaveCount(50);
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
  await expect.poll(() => scroll.evaluate((element) => element.scrollTop)).toBe(0);
});
