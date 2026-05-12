import { act, checkA11y, render, screen, waitFor } from '@/test-utils';

import AllocationFinalizedPage from '../AllocationFinalizedPage';

const mockUseRoundInfo = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  error: null,
});

jest.mock('../../../hooks/useApiQuery', () => ({
  useRoundInfo: (...args: unknown[]) => mockUseRoundInfo(...args),
}));

const mockReplace = jest.fn();
const mockGetBlock = jest.fn().mockResolvedValue({ timestamp: 50n });
const mockRoundActivationTime = jest.fn().mockResolvedValue(100n);

jest.mock('wagmi', () => ({
  usePublicClient: () => ({
    getBlock: (...args: unknown[]) => mockGetBlock(...args),
  }),
}));

jest.mock('../../../hooks/useCosmicGameContract', () => ({
  __esModule: true,
  default: () => ({
    read: {
      roundActivationTime: (...args: unknown[]) => mockRoundActivationTime(...args),
    },
  }),
}));

let mockSearchParams = new URLSearchParams('cycle=5');

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

jest.mock('@fireworks-js/react', () => ({
  __esModule: true,
  default: () => <div data-testid="fireworks" />,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams = new URLSearchParams('cycle=5');
  mockGetBlock.mockResolvedValue({ timestamp: 50n });
  mockRoundActivationTime.mockResolvedValue(100n);
});

describe('AllocationFinalizedPage', () => {
  it('shows loading state while fetching', () => {
    mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<AllocationFinalizedPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Loading cycle 5…')).toBeInTheDocument();
  });

  it('shows no allocation info message when data is null and not a success redirect', () => {
    mockUseRoundInfo.mockReturnValue({ data: null, isLoading: false, error: null });
    render(<AllocationFinalizedPage />);
    expect(screen.getByText('No allocation information.')).toBeInTheDocument();
  });

  it('shows success follow-up when message=success and API has no row', () => {
    mockSearchParams = new URLSearchParams('cycle=0&message=success');
    mockUseRoundInfo.mockReturnValue({ data: null, isLoading: false, error: null });
    render(<AllocationFinalizedPage />);
    expect(
      screen.getByRole('heading', { name: /You successfully completed this cycle/i }),
    ).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /View cycle 0 allocation details/i });
    expect(link).toHaveAttribute('href', '/allocation/0');
    expect(screen.getByTestId('fireworks')).toBeInTheDocument();
  });

  it('renders allocation info when data is loaded', () => {
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
    render(<AllocationFinalizedPage />);
    expect(
      screen.getByText('Congratulations! Cycle 5 Signature Allocation received.'),
    ).toBeInTheDocument();
    expect(screen.getByText('1.234567 ETH')).toBeInTheDocument();
  });

  it('passes parsed round number to useRoundInfo', () => {
    mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: false, error: null });
    render(<AllocationFinalizedPage />);
    expect(mockUseRoundInfo).toHaveBeenCalledWith(5);
  });

  it('passes 0 to useRoundInfo for first cycle', () => {
    mockSearchParams = new URLSearchParams('cycle=0');
    mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: false, error: null });
    render(<AllocationFinalizedPage />);
    expect(mockUseRoundInfo).toHaveBeenCalledWith(0);
  });

  it('shows attached NFTs count when present', () => {
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
    render(<AllocationFinalizedPage />);
    expect(screen.getByText(/7 attached tokens/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AllocationFinalizedPage />);
    await checkA11y(container);
  });

  it('redirects to home when message=success and latest block time >= roundActivationTime', async () => {
    mockSearchParams = new URLSearchParams('cycle=3&message=success');
    mockUseRoundInfo.mockReturnValue({ data: null, isLoading: false, error: null });
    mockRoundActivationTime.mockResolvedValue(100n);
    mockGetBlock.mockResolvedValue({ timestamp: 200n });

    render(<AllocationFinalizedPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  it('does not redirect when chain time is still before activation', async () => {
    mockSearchParams = new URLSearchParams('cycle=3&message=success');
    mockUseRoundInfo.mockReturnValue({ data: null, isLoading: false, error: null });
    mockRoundActivationTime.mockResolvedValue(1_000_000n);
    mockGetBlock.mockResolvedValue({ timestamp: 100n });

    render(<AllocationFinalizedPage />);

    await act(async () => {
      await new Promise((r) => {
        setTimeout(r, 50);
      });
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does not redirect when message is not success', async () => {
    mockSearchParams = new URLSearchParams('cycle=3');
    mockRoundActivationTime.mockResolvedValue(1n);
    mockGetBlock.mockResolvedValue({ timestamp: 9_999_999n });

    render(<AllocationFinalizedPage />);

    await act(async () => {
      await new Promise((r) => {
        setTimeout(r, 50);
      });
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
