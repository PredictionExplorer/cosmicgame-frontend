import userEvent from '@testing-library/user-event';

import { getRelativeTime, shortenHex } from '@/utils';

import { routing } from '@/i18n/routing';
import type { GestureFeedSystemEvent } from '@/components/home/deck/feedSystemEvents';
import type { GestureInfo } from '@/services/api';

import { render, screen, within, act, checkA11y, fireEvent } from '@/test-utils';

import { GestureMessageChat } from '../GestureMessageChat';

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

beforeEach(() => {
  mockUseBannedGestures.mockReturnValue({ data: [] });
});

describe('GestureMessageChat', () => {
  it('renders only gestures with non-empty messages', () => {
    render(
      <GestureMessageChat
        cycleNumber={7}
        gestures={[
          makeGesture({ EvtLogId: 1, Message: 'First signal' }),
          makeGesture({ EvtLogId: 2, Message: '' }),
          makeGesture({ EvtLogId: 3, Message: '   ' }),
          makeGesture({ EvtLogId: 4, Message: undefined }),
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'home.chat.title' })).toBeInTheDocument();
    expect(screen.getByText('First signal')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open gesture 2' })).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'home.chat.cycleNumber(number=7) · home.chat.messageCount(count=1) · home.chat.eventCount(count=0)',
      ),
    ).toBeInTheDocument();
  });

  it('counts only visible messages in the header subtitle', () => {
    render(
      <GestureMessageChat
        cycleNumber={9}
        gestures={[
          makeGesture({ EvtLogId: 1, Message: 'One' }),
          makeGesture({ EvtLogId: 2, Message: 'Two' }),
          makeGesture({ EvtLogId: 3, Message: '' }),
        ]}
      />,
    );

    expect(
      screen.getByText(
        'home.chat.cycleNumber(number=9) · home.chat.messageCount(count=2) · home.chat.eventCount(count=0)',
      ),
    ).toBeInTheDocument();
  });

  it('shows newest messages first regardless of input order', () => {
    render(
      <GestureMessageChat
        gestures={[
          makeGesture({ EvtLogId: 1, TimeStamp: 100, Message: 'Older message' }),
          makeGesture({ EvtLogId: 2, TimeStamp: 300, Message: 'Newest message' }),
          makeGesture({ EvtLogId: 3, TimeStamp: 200, Message: 'Middle message' }),
        ]}
      />,
    );

    const items = screen.getAllByRole('listitem');
    expect(within(items[0]!).getByText('Newest message')).toBeInTheDocument();
    expect(within(items[1]!).getByText('Middle message')).toBeInTheDocument();
    expect(within(items[2]!).getByText('Older message')).toBeInTheDocument();
  });

  it('explains how to join the chat through a tooltip', async () => {
    const user = userEvent.setup();
    render(<GestureMessageChat gestures={[makeGesture({ Message: 'hello cosmos' })]} />);

    await user.hover(screen.getByRole('button', { name: 'home.chat.joinTooltipAria' }));

    expect(await screen.findAllByText('home.chat.joinTooltip')).not.toHaveLength(0);
  });

  it('renders the address, visible exact UTC time, relative age, and message body', () => {
    const participant = '0x2222222222222222222222222222222222222222';
    const timestamp = Math.floor(Date.now() / 1000) - 300;

    render(
      <GestureMessageChat
        gestures={[
          makeGesture({
            EvtLogId: 9,
            BidPosition: 3,
            BidderAddr: participant,
            TimeStamp: timestamp,
            Message: 'A carefully timed gesture.',
          }),
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: shortenHex(participant, 6) })).toHaveAttribute(
      'href',
      `/user/${participant}`,
    );
    const positionBadge = screen.getByRole('link', {
      name: 'home.chat.openPositionAria(position=3)',
    });
    expect(positionBadge).toHaveAttribute('href', '/gesture/9');
    expect(positionBadge).toHaveTextContent('#3');

    const time = screen.getByText(/^[45] minutes ago$/).closest('time');
    expect(time).toHaveAttribute('dateTime', new Date(timestamp * 1000).toISOString());
    expect(time).toHaveTextContent(/\d{4}, \d{2}:\d{2}:\d{2} UTC/);

    expect(screen.getByText('A carefully timed gesture.')).toBeInTheDocument();
  });

  it('shows a gesture method badge with the gesture cost', () => {
    render(
      <GestureMessageChat
        gestures={[
          makeGesture({ EvtLogId: 1, GestureType: 0, GestureCostEth: 0.1, Message: 'eth' }),
          makeGesture({ EvtLogId: 2, GestureType: 2, CstCost: 20, Message: 'cst' }),
          makeGesture({ EvtLogId: 3, GestureType: 1, GestureCostEth: 0.05, Message: 'rwlk' }),
        ]}
      />,
    );

    const badges = screen.getAllByTestId('gesture-method-badge').map((badge) => badge.textContent);
    expect(badges).toContain('home.chat.badge.eth(amount=0.1)');
    expect(badges).toContain('home.chat.badge.cst(amount=20)');
    expect(badges).toContain('home.chat.badge.ethRwlk(amount=0.05)');
  });

  it('copies the participant address from a message', async () => {
    const originalClipboard = navigator.clipboard;
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    try {
      const participant = '0x5555555555555555555555555555555555555555';
      render(
        <GestureMessageChat
          gestures={[makeGesture({ BidderAddr: participant, Message: 'copy me' })]}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'common.actions.copyAddress' }));

      expect(writeText).toHaveBeenCalledWith(participant);
      expect(
        await screen.findByRole('button', { name: 'common.actions.addressCopied' }),
      ).toBeInTheDocument();
    } finally {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      });
    }
  });

  it('linkifies message URLs behind a leave-site confirmation', async () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    try {
      const user = userEvent.setup();
      render(
        <GestureMessageChat
          gestures={[makeGesture({ Message: 'mint at https://example.com/mint now' })]}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'https://example.com/mint' }));

      expect(await screen.findByRole('dialog')).toHaveTextContent('common.externalLink.title');
      expect(openSpy).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'common.externalLink.open' }));

      expect(openSpy).toHaveBeenCalledWith(
        'https://example.com/mint',
        '_blank',
        'noopener,noreferrer',
      );
    } finally {
      openSpy.mockRestore();
    }
  });

  it('keeps long content as text and exposes the full wallet address', () => {
    const participant = '0x3333333333333333333333333333333333333333';
    const longMessage = 'Signal '.repeat(80).trim();

    render(
      <GestureMessageChat
        gestures={[makeGesture({ EvtLogId: 10, BidderAddr: participant, Message: longMessage })]}
      />,
    );

    expect(screen.getByText(longMessage)).toBeInTheDocument();
    expect(screen.getByTitle(participant)).toBeInTheDocument();
  });

  it('shows an empty state when the current cycle has no messages', () => {
    render(<GestureMessageChat gestures={[makeGesture({ Message: '' })]} />);

    const title = screen.getByText('home.chat.empty.title');
    expect(title).toBeInTheDocument();
    expect(screen.getByText('home.chat.empty.description')).toBeInTheDocument();
    expect(title.parentElement).toHaveClass(
      'min-h-[14rem]',
      'sm:min-h-[16rem]',
      'xl:h-full',
      'xl:min-h-0',
    );
    expect(
      screen.getByText(
        'home.chat.currentCycle · home.chat.messageCount(count=0) · home.chat.eventCount(count=0)',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'home.chat.empty.cta' })).not.toBeInTheDocument();
  });

  it('offers a Make a Gesture call to action in the empty state when wired', async () => {
    const user = userEvent.setup();
    const onJoinCta = jest.fn();

    render(<GestureMessageChat gestures={[]} onJoinCta={onJoinCta} />);

    await user.click(screen.getByRole('button', { name: 'home.chat.empty.cta' }));

    expect(onJoinCta).toHaveBeenCalledTimes(1);
  });

  it('uses compact responsive layout and an accessible scroller at every size', () => {
    const participant = '0x4444444444444444444444444444444444444444';

    render(
      <GestureMessageChat
        gestures={[
          makeGesture({ EvtLogId: 12, BidderAddr: participant, Message: 'Wide rail ready' }),
        ]}
      />,
    );

    const scroll = screen.getByTestId('gesture-message-chat-scroll');
    expect(
      screen.getByRole('region', {
        name: 'home.chat.title',
      }),
    ).toBe(scroll);
    expect(scroll).toHaveAttribute('tabIndex', '0');
    expect(scroll).toHaveClass(
      'min-h-0',
      'max-h-[min(28rem,55svh)]',
      'overflow-y-auto',
      'overscroll-y-contain',
      'lg:max-h-[calc(100vh-13rem)]',
      'xl:max-h-none',
      'xl:p-4',
      'print:max-h-none',
      'print:overflow-visible',
    );

    expect(screen.getByTestId('gesture-message-meta')).toHaveClass(
      'max-sm:flex-col',
      'max-sm:items-start',
    );
    expect(screen.getByTestId('gesture-message-badges')).toHaveClass('max-sm:justify-start');

    expect(screen.getByLabelText(`home.chat.messageAria(address=${participant})`)).toHaveAttribute(
      'data-newest',
      'true',
    );
    expect(screen.getByRole('button', { name: 'common.actions.copyAddress' })).toHaveClass(
      'max-sm:min-h-11',
      'max-sm:min-w-11',
    );
    expect(screen.getByTestId('gesture-message-chat')).toHaveClass(
      'print:h-auto',
      'print:overflow-visible',
    );
  });

  it('excludes messages for banned gestures', () => {
    mockUseBannedGestures.mockReturnValue({ data: [{ bid_id: 2 }] });

    render(
      <GestureMessageChat
        gestures={[
          makeGesture({ EvtLogId: 1, Message: 'Visible message' }),
          makeGesture({ EvtLogId: 2, Message: 'Hidden message' }),
        ]}
      />,
    );

    expect(screen.getByText('Visible message')).toBeInTheDocument();
    expect(screen.queryByText('Hidden message')).not.toBeInTheDocument();
  });

  it('flashes the live pulse when a new gesture event increments the pulse key', () => {
    jest.useFakeTimers();
    try {
      const { rerender } = render(
        <GestureMessageChat gestures={[makeGesture({ Message: 'hello cosmos' })]} pulseKey={0} />,
      );

      const chat = screen.getByTestId('gesture-message-chat');
      expect(chat).not.toHaveClass('animate-live-flash');

      rerender(
        <GestureMessageChat gestures={[makeGesture({ Message: 'hello cosmos' })]} pulseKey={1} />,
      );
      expect(chat).toHaveClass('animate-live-flash');

      act(() => {
        jest.advanceTimersByTime(950);
      });
      expect(chat).not.toHaveClass('animate-live-flash');
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not flash on first render even with a positive pulse key', () => {
    render(
      <GestureMessageChat gestures={[makeGesture({ Message: 'hello cosmos' })]} pulseKey={4} />,
    );

    expect(screen.getByTestId('gesture-message-chat')).not.toHaveClass('animate-live-flash');
  });

  it('interleaves system events into the feed by timestamp, newest first', () => {
    render(
      <GestureMessageChat
        gestures={[
          makeGesture({ EvtLogId: 1, TimeStamp: 1_700_000_100, Message: 'older message' }),
          makeGesture({ EvtLogId: 2, TimeStamp: 1_700_000_500, Message: 'newer message' }),
        ]}
        systemEvents={[
          { id: 'cycle-start-7', timestamp: 1_700_000_000, kind: 'cycleStart', cycleNumber: 7 },
          {
            id: 'endurance-1',
            timestamp: 1_700_000_300,
            kind: 'enduranceRecord',
            address: '0x1111111111111111111111111111111111111111',
            durationSeconds: 200,
          },
        ]}
      />,
    );

    const listItems = screen.getAllByRole('listitem');
    const order = listItems.map((item) =>
      item.querySelector('[data-testid="chat-system-event"]')
        ? (item.querySelector('[data-testid="chat-system-event"]') as HTMLElement).dataset.kind
        : item.textContent?.includes('newer message')
          ? 'newer'
          : 'older',
    );
    expect(order).toEqual(['newer', 'enduranceRecord', 'older', 'cycleStart']);
    expect(screen.getByText(/home\.chat\.system\.enduranceRecord/)).toBeInTheDocument();
    expect(screen.getByText('home.chat.system.cycleStart(number=7)')).toBeInTheDocument();
    // The header count stays messages-only.
    expect(screen.getByText(/home\.chat\.messageCount\(count=2\)/)).toBeInTheDocument();
    expect(screen.getByText(/home\.chat\.eventCount\(count=2\)/)).toBeInTheDocument();
  });

  it('shows pending optimistic messages on top of the feed while confirming', () => {
    render(
      <GestureMessageChat
        gestures={[makeGesture({ EvtLogId: 1, TimeStamp: 1_700_000_100, Message: 'indexed one' })]}
        pendingMessages={[
          {
            id: 'pending-1',
            address: '0x2222222222222222222222222222222222222222',
            message: 'my fresh message',
            timestamp: 1_700_000_200,
          },
        ]}
      />,
    );

    const pendingRow = screen.getByTestId('chat-pending-message');
    expect(pendingRow).toHaveTextContent('my fresh message');
    expect(pendingRow).toHaveTextContent('home.chat.pending.label');
    expect(pendingRow.querySelector('time')).toHaveAttribute(
      'dateTime',
      '2023-11-14T22:16:40.000Z',
    );
    expect(pendingRow.querySelector('time')).toHaveTextContent('Nov 14, 2023, 22:16:40 UTC');
    // Pending rows render before the indexed feed.
    const listItems = screen.getAllByRole('listitem');
    expect(listItems[0]).toContainElement(pendingRow);
    // The header count stays indexed-messages-only.
    expect(screen.getByText(/home\.chat\.messageCount\(count=1\)/)).toBeInTheDocument();
  });

  it('renders pending messages even when the indexed feed is still empty', () => {
    render(
      <GestureMessageChat
        gestures={[]}
        pendingMessages={[
          {
            id: 'pending-1',
            address: '0x2222222222222222222222222222222222222222',
            message: 'first ever message',
            timestamp: 1_700_000_200,
          },
        ]}
      />,
    );

    expect(screen.getByTestId('chat-pending-message')).toHaveTextContent('first ever message');
    expect(screen.queryByText('home.chat.empty.title')).not.toBeInTheDocument();
  });

  it('renders chrono-lead system events with their own styling', () => {
    render(
      <GestureMessageChat
        gestures={[makeGesture({ EvtLogId: 1, TimeStamp: 1_700_000_100, Message: 'a message' })]}
        systemEvents={[
          {
            id: 'chrono-1',
            timestamp: 1_700_000_050,
            kind: 'chronoLead',
            address: '0x3333333333333333333333333333333333333333',
            durationSeconds: 1_300,
          },
        ]}
      />,
    );

    const event = screen.getByTestId('chat-system-event');
    expect(event).toHaveAttribute('data-kind', 'chronoLead');
    expect(event).toHaveTextContent(/home\.chat\.system\.chronoLead/);
  });

  it('shows events and their timestamps alongside a join CTA when no participant messages exist', async () => {
    const user = userEvent.setup();
    const onJoinCta = jest.fn();
    render(
      <GestureMessageChat
        gestures={[makeGesture({ Message: '' })]}
        systemEvents={[
          { id: 'cycle-start-7', timestamp: 1_700_000_000, kind: 'cycleStart', cycleNumber: 7 },
        ]}
        onJoinCta={onJoinCta}
      />,
    );

    expect(screen.queryByText('home.chat.empty.title')).not.toBeInTheDocument();
    const event = screen.getByTestId('chat-system-event');
    expect(event).toHaveTextContent('home.chat.system.cycleStart(number=7)');
    expect(event.querySelector('time')).toHaveAttribute('dateTime', '2023-11-14T22:13:20.000Z');
    expect(event.querySelector('time')).toHaveTextContent('Nov 14, 2023, 22:13:20 UTC');
    expect(event.querySelector('time')).toHaveTextContent(/ago/);
    expect(screen.getByText(/home\.chat\.messageCount\(count=0\)/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'home.chat.empty.cta' }));
    expect(onJoinCta).toHaveBeenCalledTimes(1);
  });

  it.each<GestureFeedSystemEvent['kind']>([
    'cycleOpen',
    'enduranceGrowing',
    'chronoReignEnded',
    'finalCstLeader',
    'newParticipant',
    'gestureMilestone',
    'cstCalibrationReady',
    'finalWindow',
    'clockExtended',
    'clockReopened',
    'finalizationAvailable',
    'cycleFinalized',
  ])('renders %s with its own localized copy and exact event time', (kind) => {
    render(
      <GestureMessageChat
        gestures={[]}
        systemEvents={[
          {
            id: kind,
            kind,
            timestamp: 1_700_000_000,
            address: '0x3333333333333333333333333333333333333333',
            durationSeconds: 1_300,
            cycleNumber: 7,
            count: 10,
          },
        ]}
      />,
    );

    const event = screen.getByTestId('chat-system-event');
    expect(event).toHaveAttribute('data-kind', kind);
    // The event is identifiable from a real heading even without its color.
    expect(
      within(event).getByRole('heading', {
        level: 3,
        name: `home.chat.eventTitles.${kind}`,
      }),
    ).toBeInTheDocument();
    expect(event).toHaveTextContent(`home.chat.system.${kind}(`);
    expect(event.querySelector('time')).toHaveAttribute('dateTime', '2023-11-14T22:13:20.000Z');
    expect(event.querySelector('time')).toHaveTextContent('Nov 14, 2023, 22:13:20 UTC');
    expect(screen.getByText(/home\.chat\.eventCount\(count=1\)/)).toBeInTheDocument();
  });

  it('refreshes relative ages for messages and events while preserving their exact times', () => {
    jest.useFakeTimers();
    const realNow = Date.now();
    const nowSeconds = Math.floor(realNow / 1000);
    const messageTimestamp = nowSeconds - 8 * 3_600;
    const eventTimestamp = nowSeconds - 3 * 86_400;
    try {
      render(
        <GestureMessageChat
          gestures={[makeGesture({ TimeStamp: messageTimestamp })]}
          systemEvents={[
            { id: 'start', timestamp: eventTimestamp, kind: 'cycleStart', cycleNumber: 7 },
          ]}
        />,
      );
      act(() => jest.advanceTimersByTime(30_000));

      const messageTime = screen.getByText('8 hours ago').closest('time');
      const eventTime = screen.getByText('3 days ago').closest('time');
      expect(messageTime).toHaveAttribute(
        'dateTime',
        new Date(messageTimestamp * 1000).toISOString(),
      );
      expect(eventTime).toHaveAttribute('dateTime', new Date(eventTimestamp * 1000).toISOString());

      act(() => {
        jest.setSystemTime(realNow + 86_400_000);
        jest.advanceTimersByTime(30_000);
      });

      expect(messageTime).toHaveTextContent('1 day ago');
      expect(eventTime).toHaveTextContent('4 days ago');
      expect(messageTime).toHaveAttribute(
        'dateTime',
        new Date(messageTimestamp * 1000).toISOString(),
      );
      expect(eventTime).toHaveAttribute('dateTime', new Date(eventTimestamp * 1000).toISOString());
      // Clock ticks must not repeatedly announce every age in the live feed.
      expect(messageTime).toHaveAttribute('aria-live', 'off');
      expect(eventTime).toHaveAttribute('aria-live', 'off');
    } finally {
      act(() => {
        jest.setSystemTime(realNow);
        jest.advanceTimersByTime(30_000);
      });
      jest.useRealTimers();
    }
  });

  it.each(routing.locales)('localizes exact dates and relative ages in %s', (locale) => {
    const nextIntl = jest.requireMock('next-intl') as { useLocale: () => string };
    const localeSpy = jest.spyOn(nextIntl, 'useLocale').mockReturnValue(locale);
    const timestamp = Math.floor(Date.now() / 1000) - 3 * 86_400;
    try {
      render(
        <GestureMessageChat
          gestures={[]}
          systemEvents={[{ id: 'start', timestamp, kind: 'cycleStart', cycleNumber: 7 }]}
        />,
      );
      const time = screen.getByTestId('chat-system-event').querySelector('time');
      expect(time).toHaveTextContent(getRelativeTime(timestamp, timestamp + 3 * 86_400, locale));
      expect(time).toHaveAttribute('dateTime', new Date(timestamp * 1000).toISOString());
      expect(time?.firstElementChild?.textContent).toContain('UTC');
      expect(time?.firstElementChild?.textContent).toContain(
        String(new Date(timestamp * 1000).getUTCFullYear()),
      );
    } finally {
      localeSpy.mockRestore();
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <GestureMessageChat
        gestures={[makeGesture({ Message: 'Accessible gesture message' })]}
        systemEvents={[
          { id: 'start', kind: 'cycleStart', timestamp: 1_700_000_000, cycleNumber: 7 },
          {
            id: 'record',
            kind: 'enduranceGrowing',
            timestamp: 1_700_000_100,
            address: '0x1111111111111111111111111111111111111111',
            durationSeconds: 100,
          },
        ]}
      />,
    );

    await checkA11y(container);
  });
});
