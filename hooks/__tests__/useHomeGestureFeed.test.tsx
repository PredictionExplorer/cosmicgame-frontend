import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  ChatApiUnavailableError,
  ChatFeedResetError,
  getChatApiBase,
  getChatContext,
  getChatLegacyGestures,
  getChatMessages,
  type ChatMessagePage,
} from '@/services/api/chat';
import type { GestureInfo } from '@/services/api';

import { fetchHomeGestureFeed, useHomeGestureFeed } from '../useHomeGestureFeed';

jest.unmock('@tanstack/react-query');

jest.mock('@/services/api/chat', () => ({
  ...jest.requireActual('@/services/api/chat'),
  getChatApiBase: jest.fn(() => 'https://example.test/api/cosmicgame'),
  getChatContext: jest.fn(),
  getChatLegacyGestures: jest.fn(),
  getChatMessages: jest.fn(),
}));
jest.mock('@/lib/uxCycleScenarios', () => ({ useUxScenarioSnapshot: () => null }));

const messages = jest.mocked(getChatMessages);
const context = jest.mocked(getChatContext);
const legacy = jest.mocked(getChatLegacyGestures);
const base = 'https://example.test/api/cosmicgame';
const options = { base };

function rows(count: number, start = 1, cycle = 7): GestureInfo[] {
  return Array.from({ length: count }, (_, index) => ({
    EvtLogId: start + index,
    BlockNum: 1,
    TxId: start + index,
    TxHash: `0x${start + index}`,
    TimeStamp: 1_700_000_000 + start + index,
    DateTime: '2023-11-14T00:00:00Z',
    RoundNum: cycle,
    BidPosition: start + index,
    BidderAddr: '0x1111111111111111111111111111111111111111',
    GestureType: 0,
    GestureCostEth: 0.1,
    Message: `Signal ${start + index}`,
  }));
}

function page(
  gestures = rows(50, 51).reverse(),
  overrides: Partial<ChatMessagePage['meta']> = {},
): ChatMessagePage {
  return {
    gestures,
    meta: {
      limit: 50,
      nextCursor: 'older-51',
      syncCursor: 'head-100',
      hasMore: false,
      revision: '1',
      ...overrides,
    },
  };
}

const clients: QueryClient[] = [];
function harness() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  clients.push(client);
  return {
    client,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  messages.mockReset().mockResolvedValue(page());
  context.mockReset().mockResolvedValue({
    gestures: rows(100).map(({ Message: _message, ...row }) => row),
    revision: '1',
  });
  legacy.mockReset().mockResolvedValue(rows(1, 100));
  jest.mocked(getChatApiBase).mockReturnValue(base);
});
afterEach(() => {
  clients.splice(0).forEach((client) => client.clear());
});

it('requests a page, complete no-body metadata, and only one full latest detail', async () => {
  const result = await fetchHomeGestureFeed(7, options);
  expect(result.mode).toBe('paged');
  expect(result.gestures).toHaveLength(100);
  expect(result.gestures[0]).not.toHaveProperty('Message');
  expect(result.chatGestures).toHaveLength(50);
  expect(result.latestGesture?.EvtLogId).toBe(100);
  expect(legacy).toHaveBeenCalledTimes(1);
  expect(legacy).toHaveBeenCalledWith(7, options, 1);
});

it('uses current servers and reveals their full history locally in groups of50', async () => {
  messages.mockRejectedValue(new ChatApiUnavailableError());
  legacy.mockResolvedValue(rows(120));
  const { wrapper } = harness();
  const { result } = renderHook(() => useHomeGestureFeed(7), { wrapper });
  await waitFor(() => expect(result.current.chatGestures).toHaveLength(50));
  expect(result.current.chatGestures[0]!.EvtLogId).toBe(120);
  expect(result.current.hasMore).toBe(true);
  await act(() => result.current.loadOlder());
  expect(result.current.chatGestures).toHaveLength(100);
  await act(() => result.current.loadOlder());
  expect(result.current.chatGestures).toHaveLength(120);
  expect(result.current.hasMore).toBe(false);
  expect(legacy).toHaveBeenCalledTimes(1);
  expect(context).not.toHaveBeenCalled();
});

it('does not reinterpret service failures as unsupported servers', async () => {
  const error = new Error('Service unavailable');
  messages.mockRejectedValue(error);
  await expect(fetchHomeGestureFeed(7, options)).rejects.toBe(error);
  expect(legacy).not.toHaveBeenCalled();
});

it('re-probes legacy servers after deployment without requiring a reload', async () => {
  messages.mockRejectedValueOnce(new ChatApiUnavailableError());
  legacy.mockResolvedValueOnce(rows(120));
  const old = await fetchHomeGestureFeed(7, options);
  messages.mockClear();
  await fetchHomeGestureFeed(7, options, old);
  expect(messages).not.toHaveBeenCalled();
  const updated = await fetchHomeGestureFeed(7, options, {
    ...old,
    checkedAt: Date.now() - 300_001,
  });
  expect(updated.mode).toBe('paged');
  expect(updated.chatGestures).toHaveLength(50);
});

it('drains more than50 new messages without re-fetching older pages or skipping entries', async () => {
  const initial = await fetchHomeGestureFeed(7, options);
  messages
    .mockClear()
    .mockResolvedValueOnce(
      page(rows(50, 101), { nextCursor: undefined, syncCursor: 'head-150', hasMore: true }),
    )
    .mockResolvedValueOnce(page(rows(10, 151), { nextCursor: undefined, syncCursor: 'head-160' }));
  const updated = await fetchHomeGestureFeed(7, options, initial);
  expect(updated.chatGestures).toHaveLength(110);
  expect(updated.chatGestures[0]!.EvtLogId).toBe(160);
  expect(updated.chatGestures.at(-1)!.EvtLogId).toBe(51);
  expect(updated.nextCursor).toBe('older-51');
  expect(messages.mock.calls.map(([, opts]) => opts.after)).toEqual(['head-100', 'head-150']);
});

it('merges duplicate event identities and preserves the older continuation while refreshing', async () => {
  const initial = await fetchHomeGestureFeed(7, options);
  messages.mockResolvedValueOnce(
    page(rows(2, 100), { nextCursor: undefined, syncCursor: 'head-101' }),
  );
  const updated = await fetchHomeGestureFeed(7, options, initial);
  expect(updated.chatGestures).toHaveLength(51);
  expect(new Set(updated.chatGestures.map((row) => row.EvtLogId)).size).toBe(51);
  expect(updated.nextCursor).toBe('older-51');
});

it('resets previously cached messages when metadata reports a changed revision', async () => {
  const initial = await fetchHomeGestureFeed(7, options);
  context.mockResolvedValue({ gestures: [], revision: '2' });
  legacy.mockResolvedValue([]);
  messages
    .mockClear()
    .mockResolvedValue(page([], { nextCursor: undefined, syncCursor: 'empty', revision: '2' }));
  const updated = await fetchHomeGestureFeed(7, options, initial);
  expect(updated.chatGestures).toEqual([]);
  expect(updated.latestGesture).toBeNull();
  expect(messages).toHaveBeenCalledTimes(1);
  expect(messages).toHaveBeenCalledWith(7, options);
});

it('loads older pages without adopting their newer synchronization watermark', async () => {
  const { wrapper } = harness();
  const { result } = renderHook(() => useHomeGestureFeed(7), { wrapper });
  await waitFor(() => expect(result.current.chatGestures).toHaveLength(50));
  messages.mockResolvedValueOnce(
    page(rows(50).reverse(), { nextCursor: undefined, syncCursor: 'head-150' }),
  );
  await act(() => result.current.loadOlder());
  expect(result.current.chatGestures).toHaveLength(100);
  expect(result.current.hasMore).toBe(false);
  messages.mockResolvedValueOnce(page([], { nextCursor: undefined, syncCursor: 'head-100' }));
  act(() => result.current.retry());
  await waitFor(() =>
    expect(messages).toHaveBeenLastCalledWith(7, expect.objectContaining({ after: 'head-100' })),
  );
});

it('keeps existing history on an older-page failure and retries the same cursor', async () => {
  const { wrapper } = harness();
  const { result } = renderHook(() => useHomeGestureFeed(7), { wrapper });
  await waitFor(() => expect(result.current.chatGestures).toHaveLength(50));
  const error = new Error('Temporary failure');
  messages.mockRejectedValueOnce(error);
  await act(() => result.current.loadOlder());
  expect(result.current.olderError).toBe(error);
  expect(result.current.chatGestures).toHaveLength(50);
  messages.mockResolvedValueOnce(page(rows(50), { nextCursor: undefined }));
  await act(() => result.current.loadOlder());
  expect(result.current.chatGestures).toHaveLength(100);
  expect(result.current.olderError).toBeNull();
  expect(messages.mock.calls.at(-1)?.[1].cursor).toBe('older-51');
});

it('surfaces failed reset recovery without an unhandled loadOlder rejection', async () => {
  const { wrapper } = harness();
  const { result } = renderHook(() => useHomeGestureFeed(7), { wrapper });
  await waitFor(() => expect(result.current.chatGestures).toHaveLength(50));
  const error = new Error('Recovery unavailable');
  messages.mockRejectedValueOnce(new ChatFeedResetError()).mockRejectedValueOnce(error);
  await act(() => result.current.loadOlder());
  expect(result.current.olderError).toBe(error);
  expect(result.current.isLoadingOlder).toBe(false);
});

it('does not resurrect an obsolete server-rendered latest gesture after an empty snapshot', async () => {
  context.mockResolvedValue({ gestures: [], revision: '1' });
  legacy.mockResolvedValue([]);
  messages.mockResolvedValue(page([], { nextCursor: undefined }));
  const { wrapper } = harness();
  const { result } = renderHook(() => useHomeGestureFeed(7, rows(1)), { wrapper });
  await waitFor(() => expect(result.current.mode).toBe('paged'));
  expect(result.current.latestGesture).toBeNull();
});

it('removes invalidated message bodies even if loading the corrected history fails', async () => {
  const { wrapper } = harness();
  const { result } = renderHook(() => useHomeGestureFeed(7), { wrapper });
  await waitFor(() => expect(result.current.chatGestures).toHaveLength(50));
  context.mockResolvedValue({ gestures: [], revision: '2' });
  messages.mockRejectedValue(new Error('Corrected history unavailable'));
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.chatGestures).toHaveLength(0));
  expect(result.current.latestGesture).toBeNull();
  await waitFor(() => expect(result.current.error).toBeTruthy(), { timeout: 3000 });
  expect(result.current.chatGestures).toEqual([]);
});

it('aborts in-flight older reads on cycle rollover and does not mix their results', async () => {
  const { wrapper } = harness();
  const { result, rerender } = renderHook(({ cycle }) => useHomeGestureFeed(cycle), {
    wrapper,
    initialProps: { cycle: 7 },
  });
  await waitFor(() => expect(result.current.chatGestures).toHaveLength(50));
  let resolveOlder!: (value: ChatMessagePage) => void;
  messages.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveOlder = resolve;
      }),
  );
  let pending!: Promise<void>;
  act(() => {
    pending = result.current.loadOlder();
  });
  await waitFor(() =>
    expect(messages).toHaveBeenLastCalledWith(7, expect.objectContaining({ cursor: 'older-51' })),
  );
  const signal = messages.mock.calls.at(-1)![1].signal!;
  messages.mockResolvedValue(
    page(rows(1, 201, 8), { nextCursor: undefined, syncCursor: 'cycle-8' }),
  );
  context.mockResolvedValue({ gestures: rows(1, 201, 8), revision: '1' });
  legacy.mockResolvedValue(rows(1, 201, 8));
  rerender({ cycle: 8 });
  expect(signal.aborted).toBe(true);
  await act(async () => {
    resolveOlder(page(rows(50)));
    await pending;
  });
  await waitFor(() => expect(result.current.chatGestures[0]?.RoundNum).toBe(8));
  expect(result.current.chatGestures).toHaveLength(1);
});
