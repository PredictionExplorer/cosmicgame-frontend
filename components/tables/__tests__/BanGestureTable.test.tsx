import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { act, checkA11y, render, screen, waitFor } from '@/test-utils';

const mockSetNotification = jest.fn();
const mockBanGesture = jest.fn().mockResolvedValue(undefined);
const mockUnbanGesture = jest.fn().mockResolvedValue(undefined);
const mockGetBannedGestures = jest.fn().mockResolvedValue([]);

jest.mock('../../../contexts/NotificationContext', () => ({
  useNotification: jest.fn(() => ({ setNotification: mockSetNotification })),
}));
jest.mock('../../../services/api', () => ({
  __esModule: true,
  default: {
    ban_bid: (...args: unknown[]) => mockBanGesture(...args),
    unban_gesture: (...args: unknown[]) => mockUnbanGesture(...args),
    get_banned_bids: (...args: unknown[]) => mockGetBannedGestures(...args),
  },
}));
jest.mock('../../../utils/errors', () => ({
  reportError: jest.fn(),
}));

// eslint-disable-next-line import/order
import BanGestureTable from '@/components/tables/BanGestureTable';

const MODERATOR = '0x9999999999999999999999999999999999999999';

const createGestureHistory = (overrides = {}) => ({
  EvtLogId: 1,
  TxHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  TimeStamp: 1701346718,
  RoundNum: 5,
  GestureType: 0,
  BidderAddr: '0x1111111111111111111111111111111111111111',
  Message: 'Hello world',
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGetBannedGestures.mockResolvedValue([]);
});

describe('BanGestureTable', () => {
  it('renders empty state when no gestures', async () => {
    await act(async () => {
      render(<BanGestureTable gestureHistory={[]} />);
    });
    expect(screen.getByText('tables.empty.gestureHistory')).toBeInTheDocument();
  });

  it('renders gesture type ETH for GestureType 0', async () => {
    await act(async () => {
      render(<BanGestureTable gestureHistory={[createGestureHistory({ GestureType: 0 })]} />);
    });
    expect(screen.getAllByText('ETH').length).toBeGreaterThanOrEqual(1);
  });

  it('renders gesture type ETH + RWLK for GestureType 1', async () => {
    await act(async () => {
      render(<BanGestureTable gestureHistory={[createGestureHistory({ GestureType: 1 })]} />);
    });
    expect(screen.getAllByText('ETH + RWLK').length).toBeGreaterThanOrEqual(1);
  });

  it('renders gesture type CST for GestureType 2', async () => {
    await act(async () => {
      render(<BanGestureTable gestureHistory={[createGestureHistory({ GestureType: 2 })]} />);
    });
    expect(screen.getAllByText('CST').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Ban button for non-banned gestures', async () => {
    await act(async () => {
      render(
        <BanGestureTable gestureHistory={[createGestureHistory()]} moderatorAddress={MODERATOR} />,
      );
    });
    expect(screen.getAllByText('tables.banGesture.ban').length).toBeGreaterThanOrEqual(1);
  });

  it('renders round number as link', async () => {
    await act(async () => {
      render(<BanGestureTable gestureHistory={[createGestureHistory({ RoundNum: 5 })]} />);
    });
    const links = screen.getAllByRole('link');
    const allocationLink = links.find((l) => l.getAttribute('href') === '/allocation/5');
    expect(allocationLink).toBeInTheDocument();
  });

  it('sets rel="noopener noreferrer" on target="_blank" links', async () => {
    await act(async () => {
      render(<BanGestureTable gestureHistory={[createGestureHistory()]} />);
    });
    const links = screen.getAllByRole('link');
    for (const link of links) {
      if (link.getAttribute('target') === '_blank') {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  it('renders message text', async () => {
    await act(async () => {
      render(
        <BanGestureTable gestureHistory={[createGestureHistory({ Message: 'Test message' })]} />,
      );
    });
    expect(screen.getAllByText('Test message').length).toBeGreaterThanOrEqual(1);
  });

  it('keeps a long unbroken message within its record', async () => {
    // Regression: as a start-aligned flex item the message sized itself to
    // one unbroken word and ran 680px past a 320px phone record.
    const message = 'ThisIsAnIntentionallyUnbrokenGestureMessage'.repeat(4);
    await act(async () => {
      render(<BanGestureTable gestureHistory={[createGestureHistory({ Message: message })]} />);
    });
    expect(screen.getAllByText(message)[0]).toHaveClass('max-w-full', 'break-words');
  });

  it('calls get_banned_bids on mount', async () => {
    await act(async () => {
      render(<BanGestureTable gestureHistory={[createGestureHistory()]} />);
    });
    expect(mockGetBannedGestures).toHaveBeenCalled();
  });

  it('Ban click calls api.ban_bid with EvtLogId and account', async () => {
    const user = userEvent.setup();
    render(
      <BanGestureTable
        gestureHistory={[createGestureHistory({ EvtLogId: 42 })]}
        moderatorAddress={MODERATOR}
      />,
    );

    const banButton = await screen.findByRole('button', { name: 'tables.banGesture.ban' });
    await user.click(banButton);

    await waitFor(() => {
      expect(mockBanGesture).toHaveBeenCalledWith(42, MODERATOR);
    });
  });

  it('shows success notification after banning', async () => {
    const user = userEvent.setup();
    mockBanGesture.mockResolvedValueOnce(undefined);
    render(
      <BanGestureTable gestureHistory={[createGestureHistory()]} moderatorAddress={MODERATOR} />,
    );

    const banButton = await screen.findByRole('button', { name: 'tables.banGesture.ban' });
    await user.click(banButton);

    await waitFor(() => {
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          text: 'tables.banGesture.banned',
        }),
      );
    });
  });

  it('shows Unban button for banned gestures', async () => {
    mockGetBannedGestures.mockResolvedValue([{ bid_id: 1 }]);
    render(
      <BanGestureTable
        gestureHistory={[createGestureHistory({ EvtLogId: 1 })]}
        moderatorAddress={MODERATOR}
      />,
    );

    expect(
      await screen.findByRole('button', { name: 'tables.banGesture.unban' }),
    ).toBeInTheDocument();
  });

  it('Unban click calls api.unban_gesture with EvtLogId', async () => {
    const user = userEvent.setup();
    mockGetBannedGestures.mockResolvedValue([{ bid_id: 1 }]);
    render(
      <BanGestureTable
        gestureHistory={[createGestureHistory({ EvtLogId: 1 })]}
        moderatorAddress={MODERATOR}
      />,
    );

    const unbanButton = await screen.findByRole('button', { name: 'tables.banGesture.unban' });
    await user.click(unbanButton);

    await waitFor(() => {
      expect(mockUnbanGesture).toHaveBeenCalledWith(1);
    });
  });

  it('shows success notification after unbanning', async () => {
    const user = userEvent.setup();
    mockGetBannedGestures.mockResolvedValue([{ bid_id: 1 }]);
    mockUnbanGesture.mockResolvedValueOnce(undefined);
    render(
      <BanGestureTable
        gestureHistory={[createGestureHistory({ EvtLogId: 1 })]}
        moderatorAddress={MODERATOR}
      />,
    );

    const unbanButton = await screen.findByRole('button', { name: 'tables.banGesture.unban' });
    await user.click(unbanButton);

    await waitFor(() => {
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          text: 'tables.banGesture.unbanned',
        }),
      );
    });
  });

  it('reports a failed request and says the message could not be updated', async () => {
    const user = userEvent.setup();
    const error = new Error('Server error');
    mockBanGesture.mockRejectedValueOnce(error);
    const { reportError } = jest.requireMock('../../../utils/errors');
    render(
      <BanGestureTable gestureHistory={[createGestureHistory()]} moderatorAddress={MODERATOR} />,
    );

    await user.click(await screen.findByRole('button', { name: 'tables.banGesture.ban' }));

    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith({
        visible: true,
        text: 'tables.banGesture.error',
        type: 'error',
      }),
    );
    expect(reportError).toHaveBeenCalledWith(error, 'ban gesture');
  });

  it('keeps the button busy, with its label, while the request runs', async () => {
    const user = userEvent.setup();
    let settle: () => void = () => undefined;
    mockBanGesture.mockReturnValueOnce(new Promise<void>((resolve) => (settle = resolve)));
    render(
      <BanGestureTable gestureHistory={[createGestureHistory()]} moderatorAddress={MODERATOR} />,
    );

    const button = await screen.findByRole('button', { name: 'tables.banGesture.ban' });
    await user.click(button);
    expect(button).toHaveAttribute('aria-busy', 'true');
    await user.click(button);
    expect(mockBanGesture).toHaveBeenCalledTimes(1);

    await act(async () => settle());
    await waitFor(() => expect(button).not.toHaveAttribute('aria-busy', 'true'));
  });

  it('offers no moderation controls without a moderator wallet', async () => {
    await act(async () => {
      render(<BanGestureTable gestureHistory={[createGestureHistory()]} />);
    });
    expect(screen.queryByRole('button', { name: 'tables.banGesture.ban' })).not.toBeInTheDocument();
    expect(screen.queryByText('tables.columns.actions')).not.toBeInTheDocument();
    // The list itself stays readable.
    expect(screen.getAllByText('Hello world').length).toBeGreaterThanOrEqual(1);
  });

  it('reviews 25 messages a page instead of all of them at once', async () => {
    const list = Array.from({ length: 60 }, (_, i) =>
      createGestureHistory({ EvtLogId: i + 1, Message: `Message ${i + 1}` }),
    );
    let container: HTMLElement;
    await act(async () => {
      container = render(<BanGestureTable gestureHistory={list} />).container;
    });
    expect(container!.querySelectorAll('tbody tr')).toHaveLength(25);
    expect(screen.getByText('tables.pagination.range(from=1,to=25,total=60)')).toBeInTheDocument();
  });

  it('filters to hidden messages and marks them', async () => {
    const user = userEvent.setup();
    mockGetBannedGestures.mockResolvedValue([{ bid_id: 2 }]);
    const list = [
      createGestureHistory({ EvtLogId: 1, Message: 'Kept' }),
      createGestureHistory({ EvtLogId: 2, Message: 'Hidden one' }),
    ];
    render(<BanGestureTable gestureHistory={list} moderatorAddress={MODERATOR} />);
    await screen.findByRole('button', { name: 'tables.banGesture.unban' });

    await user.click(screen.getByRole('button', { name: /tables\.banGesture\.filters\.hidden/ }));

    expect(screen.queryByText('Kept')).not.toBeInTheDocument();
    expect(screen.getAllByText('Hidden one').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('tables.banGesture.hiddenTag')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /tables\.banGesture\.filters\.hidden/ }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('searches message text and says when nothing matches', async () => {
    const user = userEvent.setup();
    const list = [
      createGestureHistory({ EvtLogId: 1, Message: 'Hello world' }),
      createGestureHistory({ EvtLogId: 2, Message: 'Something else' }),
    ];
    render(<BanGestureTable gestureHistory={list} />);
    const search = screen.getByRole('searchbox', { name: 'tables.banGesture.search' });

    await user.type(search, 'hello');
    expect(screen.queryByText('Something else')).not.toBeInTheDocument();
    expect(screen.getAllByText('Hello world').length).toBeGreaterThanOrEqual(1);

    await user.clear(search);
    await user.type(search, 'nothing like this');
    expect(screen.getByText('tables.banGesture.noMatches')).toBeInTheDocument();
    // The filters stay, so the moderator can clear them.
    expect(screen.getByRole('searchbox', { name: 'tables.banGesture.search' })).toBeInTheDocument();
  });

  it('shows the moderation list without row tints', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(
        <BanGestureTable gestureHistory={[createGestureHistory({ GestureType: 2 })]} />,
      ).container;
    });
    const row = container!.querySelector('tbody tr');
    expect(row?.className).not.toMatch(/bg-(teal|gray|black)/);
  });

  it('has no accessibility violations', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<BanGestureTable gestureHistory={[]} />);
      container = result.container;
    });
    await checkA11y(container!);
  });
});
