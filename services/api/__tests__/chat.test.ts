// lexicon-allow-start: fixtures use the sealed backend message/context field names.
import { apiGet } from '../client';
import {
  ChatApiUnavailableError,
  ChatFeedResetError,
  getChatApiUrl,
  getChatContext,
  getChatMessages,
} from '../chat';

jest.mock('../client', () => ({ ...jest.requireActual('../client'), apiGet: jest.fn() }));
jest.mock('@/lib/serverRotation', () => ({
  ...jest.requireActual('@/lib/serverRotation'),
  markServerDown: jest.fn(),
}));

const get = jest.mocked(apiGet);
const base = 'https://example.test/prefix/api/cosmicgame';
const options = { base };
const message = {
  eventLogId: 100,
  round: 7,
  position: 12,
  bidderAddress: '0x1111111111111111111111111111111111111111',
  occurredAt: '2026-09-08T07:00:00Z',
  message: 'A signal',
  bidType: 'cst',
  cstPriceWei: '25000000000000000000',
  transactionHash: '0x123',
};
const page = (data = [message], meta = {}) => ({
  data,
  meta: { limit: 50, revision: '1', syncCursor: 'head-100', hasMore: false, ...meta },
});
const respond = (data: unknown) =>
  get.mockResolvedValueOnce({ data } as Awaited<ReturnType<typeof apiGet>>);
const failure = (status: number, type?: string) =>
  Object.assign(new Error(`HTTP ${status}`), {
    isAxiosError: true,
    response: { status, data: { type } },
  });

beforeEach(() => jest.clearAllMocks());

it('maps a slim message and uses exactly 50 rows on the pinned backend', async () => {
  const signal = new AbortController().signal;
  respond(page([message], { nextCursor: 'older+100=' }));
  const result = await getChatMessages(7, { base, cursor: 'older+200=', signal });
  expect(get).toHaveBeenCalledWith(
    `${base.replace('/api/cosmicgame', '/api/v2/cosmicgame')}/rounds/7/messages?limit=50&cursor=older%2B200%3D`,
    { base, cursor: 'older+200=', signal },
  );
  expect(result.gestures[0]).toMatchObject({
    EvtLogId: 100,
    BidPosition: 12,
    Message: 'A signal',
    GestureType: 2,
    CstCost: 25,
    TxHash: '0x123',
  });
  expect(result.meta.nextCursor).toBe('older+100=');
});

it('supports a same-origin proxy and a deployment prefix', () => {
  expect(getChatApiUrl('/api/cosmicgame', 7, 'messages')).toBe(
    '/api/v2/cosmicgame/rounds/7/messages',
  );
  expect(getChatApiUrl(base, 7, 'chat-context')).toBe(
    'https://example.test/prefix/api/v2/cosmicgame/rounds/7/chat-context',
  );
});

it('maps no-body context without fabricating a message or price', async () => {
  respond({
    data: [{ ...message, prizeAt: '2026-09-08T08:00:00Z', cstDutchAuctionDurationSeconds: 1800 }],
    meta: { revision: '2' },
  });
  const context = await getChatContext(7, options);
  expect(context.revision).toBe('2');
  expect(context.gestures[0]).toMatchObject({
    EvtLogId: 100,
    GestureType: 2,
    CstDutchAuctionDurationInt: 1800,
    GestureCostEth: -1,
  });
  expect(context.gestures[0]).not.toHaveProperty('Message');
});

it.each([404, 501])(
  'marks only unsupported HTTP %s as eligible for legacy fallback',
  async (status) => {
    get.mockRejectedValueOnce(failure(status));
    await expect(getChatMessages(7, options)).rejects.toBeInstanceOf(ChatApiUnavailableError);
  },
);

it.each([400, 401, 403, 429, 500, 503])('preserves HTTP %s as a real failure', async (status) => {
  const error = failure(status);
  get.mockRejectedValueOnce(error);
  await expect(getChatMessages(7, options)).rejects.toBe(error);
});

it('recognizes the revision reset problem but not arbitrary conflicts', async () => {
  get.mockRejectedValueOnce(failure(409, 'https://example.test/problems/feed-reset-required'));
  await expect(getChatMessages(7, options)).rejects.toBeInstanceOf(ChatFeedResetError);
  const error = failure(409, 'https://example.test/problems/something-else');
  get.mockRejectedValueOnce(error);
  await expect(getChatMessages(7, options)).rejects.toBe(error);
});

it.each([
  {},
  page([{ ...message, round: 8 }]),
  page([{ ...message, message: '\t\n\u00a0' }]),
  page(Array.from({ length: 51 }, () => message)),
  page([message], { syncCursor: '' }),
  page([message], { revision: 1 }),
])('rejects malformed, oversize, or cross-cycle responses', async (raw) => {
  respond(raw);
  await expect(getChatMessages(7, options)).rejects.toThrow();
});

it('rejects nonadvancing older and live cursors', async () => {
  respond(page([message], { nextCursor: 'stuck' }));
  await expect(getChatMessages(7, { base, cursor: 'stuck' })).rejects.toThrow('did not advance');
  respond(page([message], { hasMore: true, syncCursor: 'stuck' }));
  await expect(getChatMessages(7, { base, after: 'stuck' })).rejects.toThrow('did not advance');
});

it('accepts an empty cycle with a usable initial synchronization cursor', async () => {
  respond(page([], { syncCursor: 'empty-epoch' }));
  expect((await getChatMessages(7, options)).gestures).toEqual([]);
});
// lexicon-allow-end
