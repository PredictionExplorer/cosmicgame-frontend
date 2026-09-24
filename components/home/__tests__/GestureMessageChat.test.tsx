import userEvent from '@testing-library/user-event';

import type { GestureFeedSystemEvent } from '@/components/home/deck/feedSystemEvents';
import type { GestureInfo } from '@/services/api';

import { render, screen, within, act, checkA11y, fireEvent } from '@/test-utils';

import { GestureMessageChat, buildFeedRows, phoneVisibleRows } from '../GestureMessageChat';

const mockUseBannedGestures = jest.fn().mockReturnValue({ data: [] });

jest.mock('../../../hooks/useApiQuery', () => ({
  useBannedGestures: () => mockUseBannedGestures(),
}));

function makeGesture(overrides: Partial<GestureInfo>): GestureInfo {
  return {
    EvtLogId: 1,
    BlockNum: 1,
    TxId: 1,
    TxHash: '0xhash',
    TimeStamp: 1_700_000_000,
    DateTime: '2023-11-14T22:13:20Z',
    RoundNum: 7,
    BidderAddr: '0x1111111111111111111111111111111111111111',
    Message: 'hello cosmos',
    GestureType: 0,
    GestureCostEth: 0.1,
    ...overrides,
  };
}

function makeEvent(index: number, overrides: Partial<GestureFeedSystemEvent> = {}) {
  return {
    id: `event-${index}`,
    kind: 'newParticipant',
    timestamp: 1_700_000_000 + index,
    address: `0x${String(index).padStart(40, '0')}`,
    ...overrides,
  } as GestureFeedSystemEvent;
}

beforeEach(() => {
  mockUseBannedGestures.mockReturnValue({ data: [] });
});

describe('GestureMessageChat', () => {
  it('shows only gestures with a message, newest first, with counts in the header', () => {
    render(
      <GestureMessageChat
        cycleNumber={7}
        gestures={[
          makeGesture({ EvtLogId: 1, TimeStamp: 100, Message: 'Older signal' }),
          makeGesture({ EvtLogId: 2, Message: '' }),
          makeGesture({ EvtLogId: 3, Message: '   ' }),
          makeGesture({ EvtLogId: 4, TimeStamp: 200, Message: 'Newer signal' }),
        ]}
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'home.chat.title' })).toBeVisible();
    const messages = screen.getAllByTestId('chat-message');
    expect(messages).toHaveLength(2);
    expect(messages[0]).toHaveTextContent('Newer signal');
    expect(messages[1]).toHaveTextContent('Older signal');
    expect(
      screen.getByText(
        'home.chat.cycleNumber(number=7) · home.chat.messageCount(count=2) · home.chat.eventCount(count=0)',
      ),
    ).toBeInTheDocument();
  });

  it('carries its freshness stamp instead of a hand-built live pill', () => {
    const { container } = render(<GestureMessageChat gestures={[makeGesture({})]} />);
    const header = screen.getByRole('heading', { name: 'home.chat.title' }).closest('header')!;
    expect(header.querySelector('[data-live-state]')).not.toBeNull();
    expect(container).not.toHaveTextContent('home.chat.liveFeed');
    // The stamp holds still: the page's one breathing dot is the Cycle pill.
    expect(container.querySelector('.animate-live-dot')).toBeNull();
  });

  it('explains how to join the chat once, beside its title', () => {
    render(<GestureMessageChat gestures={[]} />);
    expect(screen.getByRole('button', { name: /home\.chat\.title/ })).toBeInTheDocument();
  });

  it('reads each message as the address, method and cost, position link, age and body', () => {
    render(
      <GestureMessageChat
        gestures={[
          makeGesture({ EvtLogId: 42, BidPosition: 12, GestureCostEth: 0.1021, Message: 'gm' }),
        ]}
      />,
    );
    const message = screen.getByTestId('chat-message');
    expect(within(message).getByRole('link', { name: /0x1111/ })).toHaveAttribute(
      'href',
      '/user/0x1111111111111111111111111111111111111111',
    );
    expect(within(message).getByTestId('gesture-method-badge')).toHaveTextContent(
      'home.chat.badge.eth(amount=0.1021)',
    );
    expect(
      within(message).getByRole('link', { name: 'home.chat.openPositionAria(position=12)' }),
    ).toHaveAttribute('href', '/gesture/42');
    expect(message.querySelector('time')).toHaveAttribute('dateTime');
    expect(message).toHaveTextContent('gm');
  });

  it.each([
    [{ GestureType: 2, CstCost: 250.75 }, 'home.chat.badge.cst(amount=250.75)'],
    [{ GestureType: 1, GestureCostEth: 0.05 }, 'home.chat.badge.ethRwlk(amount=0.0500)'],
    [{ GestureType: 2, CstCost: undefined }, 'home.chat.badge.cstFallback'],
  ])('names the method of %o', (overrides, expected) => {
    render(<GestureMessageChat gestures={[makeGesture(overrides as Partial<GestureInfo>)]} />);
    expect(screen.getByTestId('gesture-method-badge')).toHaveTextContent(expected);
  });

  it('marks the connected wallet’s own messages', () => {
    render(
      <GestureMessageChat
        gestures={[
          makeGesture({ EvtLogId: 1, Message: 'mine' }),
          makeGesture({
            EvtLogId: 2,
            BidderAddr: '0x2222222222222222222222222222222222222222',
            Message: 'theirs',
          }),
        ]}
        account="0x1111111111111111111111111111111111111111"
      />,
    );
    const mine = screen.getByText('mine').closest('article')!;
    const theirs = screen.getByText('theirs').closest('article')!;
    expect(within(mine).getByText('home.chat.you')).toBeVisible();
    expect(within(theirs).queryByText('home.chat.you')).not.toBeInTheDocument();
  });

  it('linkifies message URLs behind a leave-site confirmation', async () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    try {
      const user = userEvent.setup();
      render(
        <GestureMessageChat
          gestures={[makeGesture({ Message: 'see https://example.com/art now' })]}
        />,
      );
      await user.click(screen.getByRole('button', { name: 'https://example.com/art' }));
      expect(await screen.findByRole('dialog')).toHaveTextContent('common.externalLink.title');
      expect(openSpy).not.toHaveBeenCalled();
    } finally {
      openSpy.mockRestore();
    }
  });

  it('keeps long content as text and never overflows the row', () => {
    const longMessage = 'Signal '.repeat(80).trim();
    render(<GestureMessageChat gestures={[makeGesture({ Message: longMessage })]} />);
    const body = screen.getByText(longMessage);
    expect(body.closest('p')).toHaveClass('[overflow-wrap:anywhere]');
  });

  it('excludes messages for banned gestures unless the server moderated the page', () => {
    mockUseBannedGestures.mockReturnValue({ data: [{ bid_id: 2 }] });
    const { rerender } = render(
      <GestureMessageChat gestures={[makeGesture({ EvtLogId: 2, Message: 'Hidden' })]} />,
    );
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();

    rerender(
      <GestureMessageChat
        gestures={[makeGesture({ EvtLogId: 2, Message: 'Hidden' })]}
        serverModerated
      />,
    );
    expect(screen.getByText('Hidden')).toBeInTheDocument();
  });

  it('lets messages lead and folds the events between two messages into one line', async () => {
    const user = userEvent.setup();
    render(
      <GestureMessageChat
        gestures={[
          makeGesture({ EvtLogId: 1, TimeStamp: 1_700_000_000, Message: 'first' }),
          makeGesture({ EvtLogId: 2, TimeStamp: 1_700_000_100, Message: 'second' }),
        ]}
        systemEvents={[makeEvent(10), makeEvent(20), makeEvent(30)]}
      />,
    );

    const rows = screen
      .getAllByRole('listitem')
      .filter((item) => item.hasAttribute('data-chat-row'));
    expect(rows.map((row) => row.getAttribute('data-chat-row'))).toEqual([
      'message:2',
      'events:event-30',
      'message:1',
    ]);
    const group = screen.getByTestId('chat-event-group');
    expect(group).toHaveAttribute('data-count', '3');
    expect(group).not.toHaveAttribute('open');
    expect(within(group).getByText('home.chat.eventGroup(count=3)')).toBeVisible();

    await user.click(within(group).getByText('home.chat.eventGroup(count=3)'));
    expect(group).toHaveAttribute('open');
    expect(within(group).getAllByTestId('chat-system-event')).toHaveLength(3);
  });

  it('lists every event in the All activity view, as compact rows that are not headings', async () => {
    const user = userEvent.setup();
    render(
      <GestureMessageChat
        gestures={[makeGesture({ EvtLogId: 1, TimeStamp: 1_700_000_100, Message: 'hi' })]}
        systemEvents={[
          makeEvent(1, { kind: 'enduranceRecord', durationSeconds: 100 }),
          makeEvent(2, { kind: 'chronoReignEnded', durationSeconds: 200 }),
        ]}
      />,
    );
    const all = screen.getByRole('button', { name: 'home.chat.view.all' });
    expect(all).toHaveAttribute('aria-pressed', 'false');
    await user.click(all);
    expect(all).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByTestId('chat-event-group')).not.toBeInTheDocument();
    const events = screen.getAllByTestId('chat-system-event');
    expect(events.map((event) => event.dataset.kind)).toEqual([
      'chronoReignEnded',
      'enduranceRecord',
    ]);
    // Heading navigation reaches the chat, not forty event titles (F207).
    expect(screen.getAllByRole('heading').map((heading) => heading.textContent)).toEqual([
      'home.chat.title',
    ]);
  });

  it('keeps a lone event as a compact row', () => {
    render(
      <GestureMessageChat
        gestures={[makeGesture({ EvtLogId: 1, TimeStamp: 1_700_000_100, Message: 'hi' })]}
        systemEvents={[makeEvent(1, { kind: 'gestureMilestone', count: 1000, address: undefined })]}
      />,
    );
    expect(screen.queryByTestId('chat-event-group')).not.toBeInTheDocument();
    expect(screen.getByTestId('chat-system-event')).toHaveTextContent(
      'home.chat.system.gestureMilestone(count=1,000)',
    );
  });

  it('does not read every chat update aloud', () => {
    render(<GestureMessageChat gestures={[makeGesture({})]} systemEvents={[makeEvent(1)]} />);
    const list = screen.getByTestId('gesture-message-chat-scroll').querySelector('ol')!;
    expect(list).not.toHaveAttribute('aria-live');
  });

  it('settles the newest message in with the live rule when a Gesture lands', () => {
    const gestures = [makeGesture({ EvtLogId: 1, Message: 'latest' })];
    const { rerender } = render(<GestureMessageChat gestures={gestures} pulseKey={1} />);
    expect(screen.getByTestId('chat-message')).not.toHaveAttribute('data-settling');
    rerender(<GestureMessageChat gestures={gestures} pulseKey={2} />);
    expect(screen.getByTestId('chat-message')).toHaveAttribute('data-settling', 'true');
  });

  it('shows a just-sent message as indexing, then with its transaction when indexing is slow', () => {
    const pending = {
      id: 'p1',
      address: '0x1111111111111111111111111111111111111111',
      message: 'on its way',
      timestamp: 1_700_000_500,
      txHash: '0xabc',
    };
    const { rerender } = render(<GestureMessageChat gestures={[]} pendingMessages={[pending]} />);
    const row = screen.getByTestId('chat-pending-message');
    expect(row).toHaveTextContent('home.chat.pending.label');
    expect(row).toHaveTextContent('on its way');

    rerender(<GestureMessageChat gestures={[]} pendingMessages={[{ ...pending, stale: true }]} />);
    const stale = screen.getByTestId('chat-pending-message');
    expect(stale).toHaveAttribute('data-stale', 'true');
    expect(stale).toHaveTextContent('home.chat.pending.stillIndexing');
    expect(
      within(stale).getByRole('link', { name: /home\.chat\.pending\.viewTransaction/ }),
    ).toHaveAttribute('href', expect.stringContaining('0xabc'));
  });

  it('offers the empty state and its call to action when nothing has happened yet', async () => {
    const user = userEvent.setup();
    const onJoinCta = jest.fn();
    render(<GestureMessageChat gestures={[]} onJoinCta={onJoinCta} />);
    expect(screen.getByText('home.chat.empty.title')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'home.chat.empty.cta' }));
    expect(onJoinCta).toHaveBeenCalledTimes(1);
  });

  it('invites a message above cycle events when no participant has written yet', () => {
    render(
      <GestureMessageChat gestures={[]} systemEvents={[makeEvent(1)]} onJoinCta={jest.fn()} />,
    );
    expect(screen.getByText('home.chat.empty.messagesFirst')).toBeVisible();
    expect(screen.getByRole('button', { name: 'home.chat.empty.cta' })).toBeVisible();
    expect(screen.getByTestId('chat-system-event')).toBeInTheDocument();
  });

  it('shows loading and a first-read failure without presenting either as an empty chat', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    const { rerender } = render(
      <GestureMessageChat gestures={[]} isLoading onJoinCta={jest.fn()} />,
    );
    expect(screen.getByText('home.chat.history.loading').closest('[role="status"]')).not.toBeNull();
    expect(screen.queryByText('home.chat.empty.title')).not.toBeInTheDocument();
    expect(screen.queryByText(/home\.chat\.messageCount/)).not.toBeInTheDocument();

    rerender(<GestureMessageChat gestures={[]} error onRetry={onRetry} />);
    // A status, not an alert: nothing on screen is contradicted (F288).
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('home.chat.history.error')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'home.chat.history.retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('keeps loaded messages readable while older history loads or needs a retry', async () => {
    const user = userEvent.setup();
    const onLoadMore = jest.fn().mockResolvedValue(undefined);
    const props = {
      gestures: [makeGesture({ Message: 'Already loaded' })],
      pagination: { hasMore: true, isLoading: false, error: false, onLoadMore },
    };
    const { rerender } = render(<GestureMessageChat {...props} />);
    expect(
      screen.getByText(/home\.chat\.history\.showing\(messages=1,events=0\)/),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'home.chat.history.loadOlder' }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    rerender(
      <GestureMessageChat {...props} pagination={{ ...props.pagination, isLoading: true }} />,
    );
    expect(screen.getByRole('button', { name: /home.chat.history.loadingOlder/ })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByText('Already loaded')).toBeInTheDocument();

    rerender(<GestureMessageChat {...props} pagination={{ ...props.pagination, error: true }} />);
    expect(screen.getByText('home.chat.history.olderError')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'home.chat.history.retry' }));
    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it('shows the newest messages on phones and reveals more on demand, never scrolling inside the page', async () => {
    const user = userEvent.setup();
    const gestures = Array.from({ length: 20 }, (_, index) =>
      makeGesture({ EvtLogId: index + 1, TimeStamp: 1_700_000_000 + index, Message: `m${index}` }),
    );
    render(<GestureMessageChat gestures={gestures} />);
    const rows = screen
      .getAllByRole('listitem')
      .filter((item) => item.hasAttribute('data-chat-row'));
    // Six messages lead on a phone; the rest wait behind "Show more".
    expect(rows.filter((row) => row.classList.contains('max-lg:hidden'))).toHaveLength(14);
    // The inner scroller exists only from 1024px.
    const scroll = screen.getByTestId('gesture-message-chat-scroll');
    expect(scroll.className).toMatch(/lg:overflow-y-auto/);
    expect(scroll.className).not.toMatch(/(?:^|\s)overflow-y-auto/);

    await user.click(screen.getByRole('button', { name: 'home.chat.history.showMore' }));
    const after = screen
      .getAllByRole('listitem')
      .filter((item) => item.hasAttribute('data-chat-row'));
    expect(after.filter((row) => row.classList.contains('max-lg:hidden'))).toHaveLength(4);
    await user.click(screen.getByRole('button', { name: 'home.chat.history.showMore' }));
    expect(screen.queryByRole('button', { name: 'home.chat.history.showMore' })).toBeNull();
  });

  it('fades the desktop feed at an edge only while there is more to scroll that way', () => {
    const gestures = Array.from({ length: 12 }, (_, index) =>
      makeGesture({ EvtLogId: index + 1, TimeStamp: 1_700_000_000 + index, Message: `m${index}` }),
    );
    render(<GestureMessageChat gestures={gestures} />);
    const scroll = screen.getByTestId('gesture-message-chat-scroll');
    // jsdom lays nothing out: a feed that fits shows no fade.
    expect(scroll.style.maskImage).toBe('');

    Object.defineProperty(scroll, 'scrollHeight', { configurable: true, value: 1200 });
    Object.defineProperty(scroll, 'clientHeight', { configurable: true, value: 500 });
    fireEvent.scroll(scroll);
    expect(scroll).toHaveAttribute('data-overflow-bottom', 'true');
    expect(scroll).not.toHaveAttribute('data-overflow-top');
    expect(scroll.style.maskImage).toContain('calc(100% - 3rem)');

    scroll.scrollTop = 700;
    fireEvent.scroll(scroll);
    expect(scroll).toHaveAttribute('data-overflow-top', 'true');
    expect(scroll).not.toHaveAttribute('data-overflow-bottom');
  });

  it('pages an event-only history and resets its window for corrected history or a new cycle', async () => {
    const user = userEvent.setup();
    const systemEvents = Array.from({ length: 120 }, (_, index) => makeEvent(index));
    const { rerender } = render(
      <GestureMessageChat gestures={[]} systemEvents={systemEvents} resetKey="7:original" />,
    );
    expect(screen.getAllByTestId('chat-system-event')).toHaveLength(50);
    await user.click(screen.getByRole('button', { name: 'home.chat.history.loadOlder' }));
    expect(screen.getAllByTestId('chat-system-event')).toHaveLength(100);
    await user.click(screen.getByRole('button', { name: 'home.chat.history.loadOlder' }));
    expect(screen.getAllByTestId('chat-system-event')).toHaveLength(120);
    expect(screen.queryByRole('button', { name: 'home.chat.history.loadOlder' })).toBeNull();

    rerender(
      <GestureMessageChat gestures={[]} systemEvents={systemEvents} resetKey="7:corrected" />,
    );
    expect(screen.getAllByTestId('chat-system-event')).toHaveLength(50);
  });

  it('prints all known events and loaded messages without fetching older messages', () => {
    const onLoadMore = jest.fn().mockResolvedValue(undefined);
    const systemEvents = Array.from({ length: 75 }, (_, index) =>
      makeEvent(index, { kind: 'cycleStart', cycleNumber: index, address: undefined }),
    );
    render(
      <GestureMessageChat
        gestures={[makeGesture({ Message: 'Loaded for print' })]}
        systemEvents={systemEvents}
        pagination={{ hasMore: true, isLoading: false, error: false, onLoadMore }}
      />,
    );
    expect(screen.getAllByTestId('chat-system-event')).toHaveLength(50);
    act(() => window.dispatchEvent(new Event('beforeprint')));
    expect(screen.getAllByTestId('chat-system-event')).toHaveLength(75);
    expect(screen.getByText('Loaded for print')).toBeInTheDocument();
    expect(onLoadMore).not.toHaveBeenCalled();
    act(() => window.dispatchEvent(new Event('afterprint')));
    expect(screen.getAllByTestId('chat-system-event')).toHaveLength(50);
  });

  it('has no accessibility violations with messages, folded events and a pending row', async () => {
    const { container } = render(
      <GestureMessageChat
        cycleNumber={7}
        gestures={[makeGesture({ EvtLogId: 1, Message: 'first' })]}
        systemEvents={[makeEvent(1), makeEvent(2)]}
        pendingMessages={[
          {
            id: 'p',
            address: '0x1111111111111111111111111111111111111111',
            message: 'pending',
            timestamp: 1,
            txHash: '0xabc',
            stale: true,
          },
        ]}
        onJoinCta={jest.fn()}
      />,
    );
    await checkA11y(container);
  });
});

describe('phoneVisibleRows', () => {
  const rows = (types: string) =>
    types.split('').map((c) => ({ type: c === 'm' ? 'message' : 'event' }));

  it('shows every row up to the limit-th message, events between them included', () => {
    expect(phoneVisibleRows(rows('memeem'), 0, 2)).toBe(3);
    expect(phoneVisibleRows(rows('memeem'), 1, 2)).toBe(2);
  });

  it('shows a feed with fewer messages than the limit in full', () => {
    expect(phoneVisibleRows(rows('meee'), 0, 6)).toBe(4);
  });

  it('limits an event-only feed by rows', () => {
    expect(phoneVisibleRows(rows('e'.repeat(30)), 0, 6)).toBe(8);
    expect(phoneVisibleRows(rows('e'.repeat(30)), 0, 16)).toBe(18);
  });
});

describe('buildFeedRows', () => {
  const message = (id: number) =>
    ({
      type: 'message',
      timestamp: id,
      entry: { gesture: makeGesture({ EvtLogId: id }), message: 'm' },
    }) as const;
  const event = (id: number) => ({ type: 'system', timestamp: id, event: makeEvent(id) }) as const;

  it('folds runs of two or more events and keeps a lone one as a row', () => {
    const rows = buildFeedRows([message(9), event(8), event(7), message(6), event(5)], 'messages');
    expect(rows.map((row) => row.type)).toEqual(['message', 'events', 'message', 'event']);
  });

  it('lists every event in the All activity view', () => {
    const rows = buildFeedRows([event(8), event(7), message(6)], 'all');
    expect(rows.map((row) => row.type)).toEqual(['event', 'event', 'message']);
  });
});
