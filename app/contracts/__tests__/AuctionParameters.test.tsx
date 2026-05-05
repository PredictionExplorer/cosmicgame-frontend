import { render, screen, fireEvent, waitFor, checkA11y } from '@/test-utils';

import { AuctionParameters } from '../components/AuctionParameters';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      ..._rest
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
  charityPercentage: 7,
  explorerUrl: 'https://explorer.example.com',
  raffleEthWinners: 3,
  raffleNftWinnersBidding: 10,
  raffleNftWinnersStaking: 10,
};

describe('AuctionParameters', () => {
  it('renders CST and ETH calibration cards', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(screen.getByText('CST Calibration Window')).toBeInTheDocument();
    expect(screen.getByText('ETH Calibration Window')).toBeInTheDocument();
  });

  it('renders duration and elapsed values', () => {
    render(<AuctionParameters {...defaultProps} />);
    const val3600 = screen.getAllByText('3600s');
    expect(val3600.length).toBe(2);
    expect(screen.getByText('1800s')).toBeInTheDocument();
    expect(screen.getByText('7200s')).toBeInTheDocument();
  });

  it('renders CST beginning gesture cost', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(screen.getByText('100 CST')).toBeInTheDocument();
  });

  it('renders public goods address with copy and explorer link', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(screen.getByText('Public Goods Address')).toBeInTheDocument();
    expect(screen.getByText('0xCharity123')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy Public Goods address')).toBeInTheDocument();

    const explorerLink = screen.getByLabelText('View Public Goods address on block explorer');
    expect(explorerLink).toHaveAttribute(
      'href',
      'https://explorer.example.com/address/0xCharity123',
    );
  });

  it('copies public goods address on copy button click', async () => {
    render(<AuctionParameters {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Copy Public Goods address'));
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('0xCharity123');
    });
  });

  it('renders public goods percentage', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(screen.getByText('7%')).toBeInTheDocument();
  });

  it('renders Stellar Selection stat cards', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(screen.getByText('ETH Stellar Selection Recipients')).toBeInTheDocument();
    expect(screen.getByText('NFT Stellar Selection (Participants)')).toBeInTheDocument();
    expect(screen.getByText('NFT Stellar Selection (Anchored RWLK)')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(2);
  });

  it('renders section title', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(
      screen.getByText('Calibration Window & Stellar Selection Parameters'),
    ).toBeInTheDocument();
  });

  it('shows loading skeletons when loading is true', () => {
    const { container } = render(<AuctionParameters {...defaultProps} loading />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('handles missing stellar selection data with "--" fallback', () => {
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
