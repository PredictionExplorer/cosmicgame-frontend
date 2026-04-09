import { checkA11y, render, screen } from '@/test-utils';

import PrizeClaimedPage from '../PrizeClaimedPage';

const mockUseRoundInfo = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  error: null,
});

jest.mock('../../../../hooks/useApiQuery', () => ({
  useRoundInfo: (...args: unknown[]) => mockUseRoundInfo(...args),
}));

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('round=5'),
}));

jest.mock('@fireworks-js/react', () => ({
  __esModule: true,
  default: () => <div data-testid="fireworks" />,
}));

beforeEach(() => jest.clearAllMocks());

describe('PrizeClaimedPage', () => {
  it('shows loading state while fetching', () => {
    mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<PrizeClaimedPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows no prize info message when data is null', () => {
    mockUseRoundInfo.mockReturnValue({ data: null, isLoading: false, error: null });
    render(<PrizeClaimedPage />);
    expect(screen.getByText('No prize information.')).toBeInTheDocument();
  });

  it('renders prize info when data is loaded', () => {
    mockUseRoundInfo.mockReturnValue({
      data: {
        RoundNum: 5,
        AmountEth: 1.234567,
        TokenId: 99,
        RoundStats: { TotalDonatedNFTs: 3 },
      },
      isLoading: false,
      error: null,
    });
    render(<PrizeClaimedPage />);
    expect(screen.getByText('Congratulations! You won Round 5.')).toBeInTheDocument();
    expect(screen.getByText('1.234567 ETH')).toBeInTheDocument();
  });

  it('passes parsed round number to useRoundInfo', () => {
    mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: false, error: null });
    render(<PrizeClaimedPage />);
    expect(mockUseRoundInfo).toHaveBeenCalledWith(5);
  });

  it('shows donated NFTs count when present', () => {
    mockUseRoundInfo.mockReturnValue({
      data: {
        RoundNum: 5,
        AmountEth: 1.0,
        TokenId: 10,
        RoundStats: { TotalDonatedNFTs: 7 },
      },
      isLoading: false,
      error: null,
    });
    render(<PrizeClaimedPage />);
    expect(screen.getByText(/7 donated tokens/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PrizeClaimedPage />);
    await checkA11y(container);
  });
});
