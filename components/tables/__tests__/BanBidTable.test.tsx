import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { act, checkA11y, render, screen, waitFor } from '@/test-utils';

const mockSetNotification = jest.fn();
const mockBanBid = jest.fn().mockResolvedValue(undefined);
const mockUnbanBid = jest.fn().mockResolvedValue(undefined);
const mockGetBannedBids = jest.fn().mockResolvedValue([]);

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: jest.fn(() => ({ account: '0xadmin' })),
}));
jest.mock('../../../contexts/NotificationContext', () => ({
  useNotification: jest.fn(() => ({ setNotification: mockSetNotification })),
}));
jest.mock('../../../services/api', () => ({
  __esModule: true,
  default: {
    ban_bid: (...args: unknown[]) => mockBanBid(...args),
    unban_bid: (...args: unknown[]) => mockUnbanBid(...args),
    get_banned_bids: (...args: unknown[]) => mockGetBannedBids(...args),
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
import BanBidTable from '@/components/tables/BanBidTable';

const createBidHistory = (overrides = {}) => ({
  EvtLogId: 1,
  TxHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  TimeStamp: 1701346718,
  RoundNum: 5,
  BidType: 0,
  BidderAddr: '0x1111111111111111111111111111111111111111',
  Message: 'Hello world',
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGetBannedBids.mockResolvedValue([]);
});

describe('BanBidTable', () => {
  it('renders empty state when no gestures', async () => {
    await act(async () => {
      render(<BanBidTable biddingHistory={[]} />);
    });
    expect(screen.getByText('No gesture history yet.')).toBeInTheDocument();
  });

  it('renders bid type "ETH Bid" for BidType 0', async () => {
    await act(async () => {
      render(<BanBidTable biddingHistory={[createBidHistory({ BidType: 0 })]} />);
    });
    expect(screen.getAllByText('ETH Gesture').length).toBeGreaterThanOrEqual(1);
  });

  it('renders bid type "RWLK Token Bid" for BidType 1', async () => {
    await act(async () => {
      render(<BanBidTable biddingHistory={[createBidHistory({ BidType: 1 })]} />);
    });
    expect(screen.getAllByText('RWLK Token Gesture').length).toBeGreaterThanOrEqual(1);
  });

  it('renders bid type "CST Bid" for BidType 2', async () => {
    await act(async () => {
      render(<BanBidTable biddingHistory={[createBidHistory({ BidType: 2 })]} />);
    });
    expect(screen.getAllByText('CST Gesture').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Ban button for non-banned bids', async () => {
    await act(async () => {
      render(<BanBidTable biddingHistory={[createBidHistory()]} />);
    });
    expect(screen.getAllByText('Ban').length).toBeGreaterThanOrEqual(1);
  });

  it('renders round number as link', async () => {
    await act(async () => {
      render(<BanBidTable biddingHistory={[createBidHistory({ RoundNum: 5 })]} />);
    });
    const links = screen.getAllByRole('link');
    const prizeLink = links.find((l) => l.getAttribute('href') === '/allocation/5');
    expect(prizeLink).toBeInTheDocument();
  });

  it('sets rel="noopener noreferrer" on target="_blank" links', async () => {
    await act(async () => {
      render(<BanBidTable biddingHistory={[createBidHistory()]} />);
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
      render(<BanBidTable biddingHistory={[createBidHistory({ Message: 'Test message' })]} />);
    });
    expect(screen.getAllByText('Test message').length).toBeGreaterThanOrEqual(1);
  });

  it('calls get_banned_bids on mount', async () => {
    await act(async () => {
      render(<BanBidTable biddingHistory={[createBidHistory()]} />);
    });
    expect(mockGetBannedBids).toHaveBeenCalled();
  });

  it('Ban click calls api.ban_bid with EvtLogId and account', async () => {
    const user = userEvent.setup();
    render(<BanBidTable biddingHistory={[createBidHistory({ EvtLogId: 42 })]} />);

    const banButton = await screen.findByRole('button', { name: 'Ban' });
    await user.click(banButton);

    await waitFor(() => {
      expect(mockBanBid).toHaveBeenCalledWith(42, '0xadmin');
    });
  });

  it('shows success notification after banning', async () => {
    const user = userEvent.setup();
    mockBanBid.mockResolvedValueOnce(undefined);
    render(<BanBidTable biddingHistory={[createBidHistory()]} />);

    const banButton = await screen.findByRole('button', { name: 'Ban' });
    await user.click(banButton);

    await waitFor(() => {
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success', text: 'Gesture was banned successfully!' }),
      );
    });
  });

  it('shows Unban button for banned bids', async () => {
    mockGetBannedBids.mockResolvedValue([{ bid_id: 1 }]);
    render(<BanBidTable biddingHistory={[createBidHistory({ EvtLogId: 1 })]} />);

    expect(await screen.findByRole('button', { name: 'Unban' })).toBeInTheDocument();
  });

  it('Unban click calls api.unban_bid with EvtLogId', async () => {
    const user = userEvent.setup();
    mockGetBannedBids.mockResolvedValue([{ bid_id: 1 }]);
    render(<BanBidTable biddingHistory={[createBidHistory({ EvtLogId: 1 })]} />);

    const unbanButton = await screen.findByRole('button', { name: 'Unban' });
    await user.click(unbanButton);

    await waitFor(() => {
      expect(mockUnbanBid).toHaveBeenCalledWith(1);
    });
  });

  it('shows success notification after unbanning', async () => {
    const user = userEvent.setup();
    mockGetBannedBids.mockResolvedValue([{ bid_id: 1 }]);
    mockUnbanBid.mockResolvedValueOnce(undefined);
    render(<BanBidTable biddingHistory={[createBidHistory({ EvtLogId: 1 })]} />);

    const unbanButton = await screen.findByRole('button', { name: 'Unban' });
    await user.click(unbanButton);

    await waitFor(() => {
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success', text: 'Gesture was unbanned successfully!' }),
      );
    });
  });

  it('shows error notification when ban fails', async () => {
    const user = userEvent.setup();
    mockBanBid.mockRejectedValueOnce(new Error('Server error'));
    const { getEthErrorMessage } = jest.requireMock('../../../utils/errors');
    getEthErrorMessage.mockReturnValueOnce('Server error details');
    render(<BanBidTable biddingHistory={[createBidHistory()]} />);

    const banButton = await screen.findByRole('button', { name: 'Ban' });
    await user.click(banButton);

    await waitFor(() => {
      expect(mockSetNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });
  });

  it('has no accessibility violations', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<BanBidTable biddingHistory={[]} />);
      container = result.container;
    });
    await checkA11y(container!);
  });
});
