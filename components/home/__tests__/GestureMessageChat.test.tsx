import userEvent from '@testing-library/user-event';

import type { GestureFeedSystemEvent } from '@/components/home/deck/feedSystemEvents';
import type { GestureInfo } from '@/services/api';

import { render, screen, within, act, checkA11y } from '@/test-utils';

import { GestureMessageChat, buildFeedRows, visibleFeedRows } from '../GestureMessageChat';

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

  it('keeps its freshness stamp quiet while the feed is fresh, with no hand-built live pill', () => {
    const { container } = render(<GestureMessageChat gestures={[makeGesture({})]} />);
    const header = screen.getByRole('heading', { name: 'home.chat.title' }).closest('header')!;
    // Fresh (or still connecting): the page's own indicator speaks; the
    // region's stamp appears only when its feed stops updating.
    expect(header.querySelector('[data-live-state]')).toBeNull();
    expect(container).not.toHaveTextContent('home.chat.liveFeed');
    expect(container.querySelector('.animate-live-dot')).toBeNull();
    expect(header.querySelector('[aria-live]')).toBeNull();
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

  it('holds messages back while the hidden list loads, in the feed’s loading shape', () => {
    // Regression: messages showed while the list that hides them was still
    // loading, and stayed shown when it failed (the read failed open).
    mockUseBannedGestures.mockReturnValue({ data: undefined, isError: false });
    render(<GestureMessageChat gestures={[makeGesture({ EvtLogId: 2, Message: 'Hidden' })]} />);
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    expect(screen.getByTestId('chat-loading')).toBeInTheDocument();
  });

  it('holds messages back behind a notice with a retry when the hidden list fails', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseBannedGestures.mockReturnValue({ data: undefined, isError: true, refetch });
    render(
      <GestureMessageChat
        gestures={[makeGesture({ EvtLogId: 2, Message: 'Hidden' })]}
        systemEvents={[makeEvent(10)]}
        onJoinCta={jest.fn()}
      />,
    );

    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'home.chat.messagesHeld.title' }),
    ).toBeInTheDocument();
    // Never "no messages yet", an empty chat, or a count of zero messages.
    expect(screen.queryByTestId('chat-no-messages')).not.toBeInTheDocument();
    expect(screen.queryByText(/home\.chat\.empty\.title/)).not.toBeInTheDocument();
    expect(screen.queryByText(/home\.chat\.messageCount/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'home.chat.history.retry' }));
    expect(refetch).toHaveBeenCalledTimes(1);

    // The chat is not blank: the cycle's events still read under All activity.
    await user.click(screen.getByRole('button', { name: 'home.chat.view.all' }));
    expect(screen.getByTestId('chat-system-event')).toBeInTheDocument();
  });

  it('holds nothing back where no gesture carries a message', () => {
    mockUseBannedGestures.mockReturnValue({ data: undefined, isError: true, refetch: jest.fn() });
    render(<GestureMessageChat gestures={[makeGesture({ EvtLogId: 2, Message: '' })]} />);
    expect(screen.queryByText('home.chat.messagesHeld.title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chat-loading')).not.toBeInTheDocument();
  });

  it('keeps a hidden list already read in force when a refresh of it fails', () => {
    mockUseBannedGestures.mockReturnValue({ data: [{ bid_id: 2 }], isError: true });
    render(
      <GestureMessageChat
        gestures={[
          makeGesture({ EvtLogId: 2, Message: 'Hidden' }),
          makeGesture({ EvtLogId: 3, Message: 'Shown' }),
        ]}
      />,
    );
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    expect(screen.getByText('Shown')).toBeInTheDocument();
    expect(screen.queryByText('home.chat.messagesHeld.title')).not.toBeInTheDocument();
  });

  it('lists messages only under Messages, and every event under All activity', async () => {
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

    const rowKeys = () =>
      screen
        .getAllByRole('listitem')
        .filter((item) => item.hasAttribute('data-chat-row'))
        .map((row) => row.getAttribute('data-chat-row'));
    // "Messages" means messages: no event rows and no folded groups between them.
    expect(rowKeys()).toEqual(['message:2', 'message:1']);
    expect(screen.queryByTestId('chat-system-event')).not.toBeInTheDocument();

    // "All activity" interleaves every event, newest first.
    await user.click(screen.getByRole('button', { name: 'home.chat.view.all' }));
    expect(rowKeys()).toEqual([
      'message:2',
      'event:event-30',
      'event:event-20',
      'event:event-10',
      'message:1',
    ]);
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

  it('reads an event as one compact row in All activity', async () => {
    const user = userEvent.setup();
    render(
      <GestureMessageChat
        gestures={[makeGesture({ EvtLogId: 1, TimeStamp: 1_700_000_100, Message: 'hi' })]}
        systemEvents={[makeEvent(1, { kind: 'gestureMilestone', count: 1000, address: undefined })]}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'home.chat.view.all' }));
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

  it('invites a message when no participant has written yet, with the events one tap away', async () => {
    const user = userEvent.setup();
    render(
      <GestureMessageChat gestures={[]} systemEvents={[makeEvent(1)]} onJoinCta={jest.fn()} />,
    );
    expect(screen.getByTestId('chat-no-messages')).toHaveTextContent(
      'home.chat.empty.messagesFirst',
    );
    expect(screen.getByRole('button', { name: 'home.chat.empty.cta' })).toBeVisible();
    // Not the "nothing has happened" state: the cycle's events are on record.
    expect(screen.queryByText('home.chat.empty.title')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'home.chat.view.all' }));
    expect(screen.getByTestId('chat-system-event')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-no-messages')).not.toBeInTheDocument();
  });

  it('closes a history read to its end on the message invite, and only while the cycle takes gestures', async () => {
    const user = userEvent.setup();
    const onJoinCta = jest.fn();
    const few = [makeGesture({ EvtLogId: 1, Message: 'only one' })];
    const { rerender } = render(<GestureMessageChat gestures={few} onJoinCta={onJoinCta} />);
    const invite = screen.getByTestId('chat-invite');
    expect(invite).toHaveTextContent('home.chat.invite');
    await user.click(within(invite).getByRole('button', { name: 'home.form.message.add' }));
    expect(onJoinCta).toHaveBeenCalledTimes(1);

    // Between cycles there is nothing to add a message to.
    rerender(<GestureMessageChat gestures={few} />);
    expect(screen.queryByTestId('chat-invite')).not.toBeInTheDocument();

    // More history waits: "Show more" closes the feed, not the invite.
    const many = Array.from({ length: 8 }, (_, index) =>
      makeGesture({ EvtLogId: index + 1, TimeStamp: 1_700_000_000 + index, Message: `m${index}` }),
    );
    rerender(<GestureMessageChat gestures={many} onJoinCta={onJoinCta} />);
    expect(screen.queryByTestId('chat-invite')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'home.chat.history.showMore' }));
    expect(screen.getByTestId('chat-invite')).toBeVisible();
  });

  it('shows loading and a first-read failure without presenting either as an empty chat', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    const { rerender } = render(
      <GestureMessageChat gestures={[]} isLoading onJoinCta={jest.fn()} />,
    );
    expect(screen.getByText('home.chat.history.loading').closest('[role="status"]')).not.toBeNull();
    // The feed's own shape waits in skeleton rows; the words are for screen readers.
    expect(screen.getByText('home.chat.history.loading')).toHaveClass('sr-only');
    expect(
      screen.getByTestId('chat-loading').querySelectorAll('[data-slot="skeleton"]').length,
    ).toBe(9);
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

  it('shows the newest messages and reveals more on demand, never scrolling inside the page', async () => {
    const user = userEvent.setup();
    const gestures = Array.from({ length: 20 }, (_, index) =>
      makeGesture({ EvtLogId: index + 1, TimeStamp: 1_700_000_000 + index, Message: `m${index}` }),
    );
    render(<GestureMessageChat gestures={gestures} />);
    const rows = screen
      .getAllByRole('listitem')
      .filter((item) => item.hasAttribute('data-chat-row'));
    // Six messages lead at every width; the rest wait behind "Show more".
    expect(rows.filter((row) => row.classList.contains('hidden'))).toHaveLength(14);
    // No scroll box anywhere, so the wheel always moves the page, and no
    // extra tab stop for a region that does not scroll.
    const feed = screen.getByTestId('gesture-message-chat-scroll');
    expect(feed.className).not.toMatch(/overflow-y-auto|overscroll/);
    expect(feed).not.toHaveAttribute('tabindex');

    await user.click(screen.getByRole('button', { name: 'home.chat.history.showMore' }));
    const after = screen
      .getAllByRole('listitem')
      .filter((item) => item.hasAttribute('data-chat-row'));
    expect(after.filter((row) => row.classList.contains('hidden'))).toHaveLength(4);
    await user.click(screen.getByRole('button', { name: 'home.chat.history.showMore' }));
    expect(screen.queryByRole('button', { name: 'home.chat.history.showMore' })).toBeNull();
  });

  it('sets a message in two lines: who, how and when, then the message', () => {
    render(
      <GestureMessageChat
        gestures={[makeGesture({ EvtLogId: 42, BidPosition: 7, Message: 'One line' })]}
      />,
    );
    const meta = screen.getByTestId('gesture-message-meta');
    // The method and the position share the author's line.
    expect(meta).toContainElement(screen.getByTestId('gesture-method-badge'));
    expect(within(meta).getByRole('link', { name: /home\.chat\.openPositionAria/ })).toBeVisible();
    // The author links to their page; no copy icon repeats down the feed.
    expect(within(meta).getByRole('link', { name: /0x/ })).toBeVisible();
    expect(
      within(meta).queryByRole('button', { name: 'common.actions.copyAddress' }),
    ).not.toBeInTheDocument();
  });

  it('pages an event-only history and resets its window for corrected history or a new cycle', async () => {
    const user = userEvent.setup();
    const systemEvents = Array.from({ length: 120 }, (_, index) => makeEvent(index));
    const { rerender } = render(
      <GestureMessageChat gestures={[]} systemEvents={systemEvents} resetKey="7:original" />,
    );
    await user.click(screen.getByRole('button', { name: 'home.chat.view.all' }));
    expect(screen.getAllByTestId('chat-system-event')).toHaveLength(50);
    // What is already here shows first; older history once all of it does.
    const loadOlderAfterShowingAll = async () => {
      let showMore = screen.queryByRole('button', { name: 'home.chat.history.showMore' });
      while (showMore) {
        await user.click(showMore);
        showMore = screen.queryByRole('button', { name: 'home.chat.history.showMore' });
      }
      await user.click(screen.getByRole('button', { name: 'home.chat.history.loadOlder' }));
    };
    await loadOlderAfterShowingAll();
    expect(screen.getAllByTestId('chat-system-event')).toHaveLength(100);
    await loadOlderAfterShowingAll();
    expect(screen.getAllByTestId('chat-system-event')).toHaveLength(120);
    expect(screen.queryByRole('button', { name: 'home.chat.history.loadOlder' })).toBeNull();

    rerender(
      <GestureMessageChat gestures={[]} systemEvents={systemEvents} resetKey="7:corrected" />,
    );
    expect(screen.getAllByTestId('chat-system-event')).toHaveLength(50);
  });

  it('offers "Load older" under Messages only when older messages can be fetched', async () => {
    const user = userEvent.setup();
    const onLoadMore = jest.fn().mockResolvedValue(undefined);
    const gestures = [makeGesture({ Message: 'The only message' })];
    const systemEvents = Array.from({ length: 120 }, (_, index) => makeEvent(index));
    const loadOlder = () => screen.queryByRole('button', { name: 'home.chat.history.loadOlder' });
    const { rerender } = render(
      <GestureMessageChat gestures={gestures} systemEvents={systemEvents} resetKey="7" />,
    );
    // Only events are older, and Messages lists none: no dead control, and the
    // header counts every event on record instead of reading as a window.
    expect(loadOlder()).toBeNull();
    expect(screen.queryByText(/home\.chat\.history\.showing/)).toBeNull();
    expect(
      screen.getByText(/home\.chat\.messageCount\(count=1\) · home\.chat\.eventCount\(count=120\)/),
    ).toBeInTheDocument();

    // All activity pages the events it lists.
    await user.click(screen.getByRole('button', { name: 'home.chat.view.all' }));
    expect(
      screen.getByText(/home\.chat\.history\.showing\(messages=1,events=50\)/),
    ).toBeInTheDocument();
    expect(loadOlder()).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'home.chat.view.messages' }));
    expect(loadOlder()).toBeNull();

    // Older messages on the server: the control fetches them and leaves the
    // event window alone.
    rerender(
      <GestureMessageChat
        gestures={gestures}
        systemEvents={systemEvents}
        resetKey="7"
        pagination={{ hasMore: true, isLoading: false, error: false, onLoadMore }}
      />,
    );
    expect(
      screen.getByText(/home\.chat\.history\.showing\(messages=1,events=120\)/),
    ).toBeInTheDocument();
    await user.click(loadOlder()!);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    expect(screen.getAllByTestId('chat-message')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'home.chat.view.all' }));
    expect(screen.getAllByTestId('chat-system-event')).toHaveLength(50);
  });

  it('prints all known events and loaded messages without fetching older messages', async () => {
    const user = userEvent.setup();
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
    await user.click(screen.getByRole('button', { name: 'home.chat.view.all' }));
    expect(screen.getAllByTestId('chat-system-event')).toHaveLength(50);
    act(() => window.dispatchEvent(new Event('beforeprint')));
    expect(screen.getAllByTestId('chat-system-event')).toHaveLength(75);
    expect(screen.getByText('Loaded for print')).toBeInTheDocument();
    expect(onLoadMore).not.toHaveBeenCalled();
    act(() => window.dispatchEvent(new Event('afterprint')));
    expect(screen.getAllByTestId('chat-system-event')).toHaveLength(50);
  });

  it('has no accessibility violations with messages, events and a pending row', async () => {
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

describe('visibleFeedRows', () => {
  const rows = (types: string) =>
    types.split('').map((c) => ({ type: c === 'm' ? 'message' : 'event' }));

  it('shows every row up to the limit-th message, events between them included', () => {
    expect(visibleFeedRows(rows('memeem'), 0, 2)).toBe(3);
    expect(visibleFeedRows(rows('memeem'), 1, 2)).toBe(2);
  });

  it('shows a feed with fewer messages than the limit in full', () => {
    expect(visibleFeedRows(rows('meee'), 0, 6)).toBe(4);
  });

  it('limits an event-only feed by rows', () => {
    expect(visibleFeedRows(rows('e'.repeat(30)), 0, 6)).toBe(8);
    expect(visibleFeedRows(rows('e'.repeat(30)), 0, 16)).toBe(18);
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

  it('lists messages only in the Messages view', () => {
    const rows = buildFeedRows([message(9), event(8), event(7), message(6), event(5)], 'messages');
    expect(rows.map((row) => row.type)).toEqual(['message', 'message']);
  });

  it('lists every event in the All activity view', () => {
    const rows = buildFeedRows([event(8), event(7), message(6)], 'all');
    expect(rows.map((row) => row.type)).toEqual(['event', 'event', 'message']);
  });
});
