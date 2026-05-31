import { convertTimestampToDateTime, shortenHex } from '@/utils';

import type { GestureInfo } from '@/services/api';

import { render, screen, within, checkA11y } from '@/test-utils';

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

    expect(screen.getByRole('heading', { name: 'Gesture Chat' })).toBeInTheDocument();
    expect(screen.getByText('First signal')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open gesture 2' })).not.toBeInTheDocument();
    expect(screen.getByText(/Cycle #7 messages from gestures/)).toBeInTheDocument();
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

  it('renders the address, date, time, and message body', () => {
    const participant = '0x2222222222222222222222222222222222222222';
    const timestamp = 1_700_001_234;
    const [date, time] = convertTimestampToDateTime(timestamp, true).split(', ');

    render(
      <GestureMessageChat
        gestures={[
          makeGesture({
            EvtLogId: 9,
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
    expect(screen.getByRole('link', { name: 'Open gesture 9' })).toHaveAttribute(
      'href',
      '/gesture/9',
    );
    expect(screen.getByText(date!)).toBeInTheDocument();
    expect(screen.getByText(time!)).toBeInTheDocument();
    expect(screen.getByText('A carefully timed gesture.')).toBeInTheDocument();
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

    expect(screen.getByText('No gesture messages yet')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Messages attached to current-cycle gestures will appear here, newest first.',
      ),
    ).toBeInTheDocument();
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

  it('has no accessibility violations', async () => {
    const { container } = render(
      <GestureMessageChat gestures={[makeGesture({ Message: 'Accessible gesture message' })]} />,
    );

    await checkA11y(container);
  });
});
