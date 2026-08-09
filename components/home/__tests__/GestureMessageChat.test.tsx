import userEvent from '@testing-library/user-event';

import { convertTimestampToDateTime, shortenHex } from '@/utils';

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
      screen.getByText('home.chat.cycleNumber(number=7) · home.chat.messageCount(count=1)'),
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
      screen.getByText('home.chat.cycleNumber(number=9) · home.chat.messageCount(count=2)'),
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

  it('renders the address, relative time, and message body', async () => {
    const user = userEvent.setup();
    const participant = '0x2222222222222222222222222222222222222222';
    const timestamp = Math.floor(Date.now() / 1000) - 300;
    const absolute = convertTimestampToDateTime(timestamp, true);

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

    const time = screen.getByText(/^[45] minutes ago$/);
    expect(time).toHaveAttribute('dateTime', new Date(timestamp * 1000).toISOString());
    await user.hover(time);
    expect(await screen.findAllByText(absolute)).not.toHaveLength(0);

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

    expect(screen.getByText('home.chat.empty.title')).toBeInTheDocument();
    expect(screen.getByText('home.chat.empty.description')).toBeInTheDocument();
    expect(
      screen.getByText('home.chat.currentCycle · home.chat.messageCount(count=0)'),
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

  it('exposes spacious desktop scroll and message layout classes', () => {
    const participant = '0x4444444444444444444444444444444444444444';

    render(
      <GestureMessageChat
        gestures={[
          makeGesture({ EvtLogId: 12, BidderAddr: participant, Message: 'Wide rail ready' }),
        ]}
      />,
    );

    const scroll = screen.getByTestId('gesture-message-chat-scroll');
    expect(scroll).toHaveClass('xl:p-5');
    // Below xl the message list scrolls itself. From xl the surrounding rail is
    // pinned and scrollable, so capping the list here would nest a second
    // scroll area inside the first.
    expect(scroll).toHaveClass('lg:max-h-[calc(100vh-13rem)]');
    expect(scroll).toHaveClass('xl:max-h-none', 'xl:overflow-y-visible');
    expect(screen.getByLabelText(`home.chat.messageAria(address=${participant})`)).toHaveClass(
      '2xl:p-5',
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

  it('has no accessibility violations', async () => {
    const { container } = render(
      <GestureMessageChat gestures={[makeGesture({ Message: 'Accessible gesture message' })]} />,
    );

    await checkA11y(container);
  });
});
