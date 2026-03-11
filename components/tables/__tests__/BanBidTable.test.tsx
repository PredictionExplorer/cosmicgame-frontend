import '@testing-library/jest-dom';

import { render, screen } from '@/test-utils';

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: jest.fn(() => ({ account: '0xadmin' })),
}));
jest.mock('../../../contexts/NotificationContext', () => ({
  useNotification: jest.fn(() => ({ setNotification: jest.fn() })),
}));
jest.mock('../../../services/api', () => ({
  __esModule: true,
  default: {
    ban_bid: jest.fn().mockResolvedValue(undefined),
    unban_bid: jest.fn().mockResolvedValue(undefined),
    get_banned_bids: jest.fn().mockResolvedValue([]),
  },
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

describe('BanBidTable', () => {
  it('renders empty state when no bids', () => {
    render(<BanBidTable biddingHistory={[]} />);
    expect(screen.getByText('No bid history yet.')).toBeInTheDocument();
  });

  it('renders bid type "ETH Bid" for BidType 0', () => {
    render(<BanBidTable biddingHistory={[createBidHistory({ BidType: 0 })]} />);
    expect(screen.getAllByText('ETH Bid').length).toBeGreaterThanOrEqual(1);
  });

  it('renders bid type "RWLK Token Bid" for BidType 1', () => {
    render(<BanBidTable biddingHistory={[createBidHistory({ BidType: 1 })]} />);
    expect(screen.getAllByText('RWLK Token Bid').length).toBeGreaterThanOrEqual(1);
  });

  it('renders bid type "CST Bid" for BidType 2', () => {
    render(<BanBidTable biddingHistory={[createBidHistory({ BidType: 2 })]} />);
    expect(screen.getAllByText('CST Bid').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Ban button for non-banned bids', () => {
    render(<BanBidTable biddingHistory={[createBidHistory()]} />);
    expect(screen.getAllByText('Ban').length).toBeGreaterThanOrEqual(1);
  });

  it('renders round number as link', () => {
    render(<BanBidTable biddingHistory={[createBidHistory({ RoundNum: 5 })]} />);
    const links = screen.getAllByRole('link');
    const prizeLink = links.find((l) => l.getAttribute('href') === '/prize/5');
    expect(prizeLink).toBeInTheDocument();
  });

  it('sets rel="noopener noreferrer" on target="_blank" links', () => {
    render(<BanBidTable biddingHistory={[createBidHistory()]} />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      if (link.getAttribute('target') === '_blank') {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  it('renders message text', () => {
    render(<BanBidTable biddingHistory={[createBidHistory({ Message: 'Test message' })]} />);
    expect(screen.getAllByText('Test message').length).toBeGreaterThanOrEqual(1);
  });
});
