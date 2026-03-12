import { render, screen, fireEvent, waitFor, checkA11y } from '@/test-utils';

import { AuctionParameters } from '../components/AuctionParameters';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      ...rest
    }: React.HTMLAttributes<HTMLDivElement> & {
      variants?: unknown;
      initial?: unknown;
      animate?: unknown;
    }) => (
      <div className={className} data-testid="motion-div">
        {children}
      </div>
    ),
  },
}));

jest.mock('../../../utils', () => ({
  formatSeconds: (s: number) => (s > 0 ? `${s}s` : '0s'),
}));

const mockWriteText = jest.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: { writeText: mockWriteText },
});

beforeEach(() => {
  mockWriteText.mockClear();
});

const defaultProps = {
  cstDurations: { AuctionDuration: 3600, ElapsedDuration: 1800 },
  ethDurations: { AuctionDuration: 7200, ElapsedDuration: 3600 },
  cstBeginningBidPrice: 100,
  charityAddress: '0xCharity123',
  charityPercentage: 10,
  explorerUrl: 'https://explorer.example.com',
  raffleEthWinners: 5,
  raffleNftWinnersBidding: 3,
  raffleNftWinnersStaking: 2,
};

describe('AuctionParameters', () => {
  it('renders CST and ETH auction cards', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(screen.getByText('CST Dutch Auction')).toBeInTheDocument();
    expect(screen.getByText('ETH Dutch Auction')).toBeInTheDocument();
  });

  it('renders duration and elapsed values', () => {
    render(<AuctionParameters {...defaultProps} />);
    const val3600 = screen.getAllByText('3600s');
    expect(val3600.length).toBe(2);
    expect(screen.getByText('1800s')).toBeInTheDocument();
    expect(screen.getByText('7200s')).toBeInTheDocument();
  });

  it('renders CST beginning bid price', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(screen.getByText('100 CST')).toBeInTheDocument();
  });

  it('renders charity address with copy and explorer link', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(screen.getByText('Charity Address')).toBeInTheDocument();
    expect(screen.getByText('0xCharity123')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy charity address')).toBeInTheDocument();

    const explorerLink = screen.getByLabelText('View charity address on block explorer');
    expect(explorerLink).toHaveAttribute(
      'href',
      'https://explorer.example.com/address/0xCharity123',
    );
  });

  it('copies charity address on copy button click', async () => {
    render(<AuctionParameters {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Copy charity address'));
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('0xCharity123');
    });
  });

  it('renders charity percentage', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('renders raffle stat cards', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(screen.getByText('Raffle ETH Winners')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Raffle NFT Winners (Bidding)')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Raffle NFT Winners (Staking)')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders section title', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(screen.getByText('Auction & Raffle Parameters')).toBeInTheDocument();
  });

  it('shows loading skeletons when loading is true', () => {
    const { container } = render(<AuctionParameters {...defaultProps} loading />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('handles missing raffle data with "--" fallback', () => {
    render(
      <AuctionParameters
        {...defaultProps}
        raffleEthWinners={undefined}
        raffleNftWinnersBidding={undefined}
        raffleNftWinnersStaking={undefined}
      />,
    );
    const dashes = screen.getAllByText('--');
    expect(dashes.length).toBe(3);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AuctionParameters {...defaultProps} />);
    await checkA11y(container);
  });
});
