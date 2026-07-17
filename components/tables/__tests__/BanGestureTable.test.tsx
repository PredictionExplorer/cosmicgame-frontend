import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { act, checkA11y, render, screen, waitFor } from '@/test-utils';

const mockSetNotification = jest.fn();
const mockBanGesture = jest.fn().mockResolvedValue(undefined);
const mockUnbanGesture = jest.fn().mockResolvedValue(undefined);
const mockGetBannedGestures = jest.fn().mockResolvedValue([]);

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: jest.fn(() => ({ account: '0xadmin' })),
}));
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
  getEthErrorMessage: jest.fn(() => 'An error occurred'),
}));
jest.mock('../../../utils/alert', () => ({
  __esModule: true,
  default: jest.fn((msg: string) => msg),
}));

// eslint-disable-next-line import/order
import BanGestureTable from '@/components/tables/BanGestureTable';

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

  it('renders gesture type RWLK for GestureType 1', async () => {
    await act(async () => {
      render(<BanGestureTable gestureHistory={[createGestureHistory({ GestureType: 1 })]} />);
    });
    expect(screen.getAllByText('RWLK').length).toBeGreaterThanOrEqual(1);
  });

  it('renders gesture type CST for GestureType 2', async () => {
    await act(async () => {
      render(<BanGestureTable gestureHistory={[createGestureHistory({ GestureType: 2 })]} />);
    });
    expect(screen.getAllByText('CST').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Ban button for non-banned gestures', async () => {
    await act(async () => {
      render(<BanGestureTable gestureHistory={[createGestureHistory()]} />);
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

  it('calls get_banned_bids on mount', async () => {
    await act(async () => {
      render(<BanGestureTable gestureHistory={[createGestureHistory()]} />);
    });
    expect(mockGetBannedGestures).toHaveBeenCalled();
  });

  it('Ban click calls api.ban_bid with EvtLogId and account', async () => {
    const user = userEvent.setup();
    render(<BanGestureTable gestureHistory={[createGestureHistory({ EvtLogId: 42 })]} />);

    const banButton = await screen.findByRole('button', { name: 'tables.banGesture.ban' });
    await user.click(banButton);

    await waitFor(() => {
      expect(mockBanGesture).toHaveBeenCalledWith(42, '0xadmin');
    });
  });

  it('shows success notification after banning', async () => {
    const user = userEvent.setup();
    mockBanGesture.mockResolvedValueOnce(undefined);
    render(<BanGestureTable gestureHistory={[createGestureHistory()]} />);

    const banButton = await screen.findByRole('button', { name: 'tables.banGesture.ban' });
    await user.click(banButton);

    await waitFor(() => {
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success', text: 'tables.banGesture.banned' }),
      );
    });
  });

  it('shows Unban button for banned gestures', async () => {
    mockGetBannedGestures.mockResolvedValue([{ bid_id: 1 }]);
    render(<BanGestureTable gestureHistory={[createGestureHistory({ EvtLogId: 1 })]} />);

    expect(
      await screen.findByRole('button', { name: 'tables.banGesture.unban' }),
    ).toBeInTheDocument();
  });

  it('Unban click calls api.unban_gesture with EvtLogId', async () => {
    const user = userEvent.setup();
    mockGetBannedGestures.mockResolvedValue([{ bid_id: 1 }]);
    render(<BanGestureTable gestureHistory={[createGestureHistory({ EvtLogId: 1 })]} />);

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
    render(<BanGestureTable gestureHistory={[createGestureHistory({ EvtLogId: 1 })]} />);

    const unbanButton = await screen.findByRole('button', { name: 'tables.banGesture.unban' });
    await user.click(unbanButton);

    await waitFor(() => {
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success', text: 'tables.banGesture.unbanned' }),
      );
    });
  });

  it('shows error notification when ban fails', async () => {
    const user = userEvent.setup();
    mockBanGesture.mockRejectedValueOnce(new Error('Server error'));
    const { getEthErrorMessage } = jest.requireMock('../../../utils/errors');
    getEthErrorMessage.mockReturnValueOnce('Server error details');
    render(<BanGestureTable gestureHistory={[createGestureHistory()]} />);

    const banButton = await screen.findByRole('button', { name: 'tables.banGesture.ban' });
    await user.click(banButton);

    await waitFor(() => {
      expect(mockSetNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });
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
