import userEvent from '@testing-library/user-event';

import { ApiReadError } from '@/services/api/readError';

import { act, checkA11y, render, screen, waitFor, within } from '@/test-utils';

import AllocationFinalizedPage from '../AllocationFinalizedPage';

const RECIPIENT = '0x1234567890123456789012345678901234567890';
const VISITOR = '0x9999999999999999999999999999999999999999';

const mockRefetch = jest.fn();
const mockUseRoundInfo = jest.fn();
const mockUseCSTInfo = jest.fn();
const mockUseRoundList = jest.fn();

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useRoundInfo: (...args: unknown[]) => mockUseRoundInfo(...args),
  useCSTInfo: (...args: unknown[]) => mockUseCSTInfo(...args),
  useRoundList: (...args: unknown[]) => mockUseRoundList(...args),
  useCSTList: () => mockUseCSTList(),
}));

const mockUseCSTList = jest.fn();

let mockAccount: string | null = null;
jest.mock('../../../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount }),
}));

const mockReplace = jest.fn();
const mockGetBlock = jest.fn().mockResolvedValue({ timestamp: 50n });
const mockRoundActivationTime = jest.fn().mockResolvedValue(100n);

jest.mock('wagmi', () => ({
  usePublicClient: () => ({
    getBlock: (...args: unknown[]) => mockGetBlock(...args),
  }),
}));

jest.mock('../../../../../hooks/useCosmicGameContract', () => ({
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

const ALLOCATION = {
  RoundNum: 5,
  WinnerAddr: RECIPIENT,
  AmountEth: 1.234567,
  CSTAmountEth: 1000,
  TokenId: 99,
  TxHash: '0xfeed',
  TimeStamp: 1_700_000_000,
  RoundStats: { TotalDonatedNFTs: 3 },
};

function roundInfo(data: unknown, isLoading = false) {
  mockUseRoundInfo.mockReturnValue({ data, isLoading, refetch: mockRefetch });
}

/** A failed read: `status` 400 is the API's "record not found" for a cycle it does not hold. */
function roundInfoFails(status?: number) {
  mockUseRoundInfo.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: true,
    error: new ApiReadError('Network response was not OK', status),
    refetch: mockRefetch,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount = null;
  mockSearchParams = new URLSearchParams('cycle=5');
  mockGetBlock.mockResolvedValue({ timestamp: 50n });
  mockRoundActivationTime.mockResolvedValue(100n);
  roundInfo(undefined);
  mockUseCSTInfo.mockReturnValue({ data: { TokenId: 99, Seed: 'abc', TokenName: '' } });
  mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
  mockUseCSTList.mockReturnValue({
    data: [{ TokenId: 31, Seed: 'aa', TokenName: '' }],
    isLoading: false,
  });
});

describe('AllocationFinalizedPage', () => {
  it('holds the layout with a pending plate while the cycle loads', () => {
    roundInfo(undefined, true);
    render(<AllocationFinalizedPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'allocation.finalized.result.title(cycle=5)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'allocation.finalized.loading.status' }),
    ).toBeInTheDocument();
  });

  it('reads the cycle as a neutral record for any visitor', () => {
    roundInfo(ALLOCATION);
    render(<AllocationFinalizedPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'allocation.finalized.result.title(cycle=5)' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/successTitle/)).not.toBeInTheDocument();
  });

  it('shows every part of the Signature Allocation: ETH, CST, the NFT, attached NFTs, the recipient', () => {
    roundInfo(ALLOCATION);
    render(<AllocationFinalizedPage />);
    const section = screen.getByTestId('finalized-signature');
    expect(section).toHaveTextContent('1.234567');
    expect(section).toHaveTextContent('1,000');
    expect(within(section).getAllByRole('link', { name: /#000099/ })[0]).toHaveAttribute(
      'href',
      '/detail/99',
    );
    expect(section).toHaveTextContent('allocation.finalized.result.attachedTokens(count=3)');
    expect(within(section).getByRole('link', { name: /View Cycle|viewCycle/ })).toHaveAttribute(
      'href',
      '/allocation/5',
    );
  });

  it('congratulates the recipient arriving from their own finalization', () => {
    mockSearchParams = new URLSearchParams('cycle=5&message=success');
    mockAccount = RECIPIENT;
    roundInfo(ALLOCATION);
    render(<AllocationFinalizedPage />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'allocation.finalized.result.successTitle(cycle=5)',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'allocation.finalized.next.title' }),
    ).toBeInTheDocument();
  });

  it('never congratulates a connected visitor who is not the recipient', () => {
    mockSearchParams = new URLSearchParams('cycle=5&message=success');
    mockAccount = VISITOR;
    roundInfo(ALLOCATION);
    render(<AllocationFinalizedPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'allocation.finalized.result.title(cycle=5)' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'allocation.finalized.next.title' })).toBeNull();
  });

  it('says a cycle the API holds no record of is still open, and links the current cycle', () => {
    // Cycles 0–4 are finalized: Cycle 5 is the one open now.
    mockUseRoundList.mockReturnValue({
      data: [0, 1, 2, 3, 4].map((RoundNum) => ({ RoundNum })),
      isLoading: false,
    });
    roundInfoFails(400);
    render(<AllocationFinalizedPage />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'allocation.missingCycle.open.title(cycle=5)',
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('current-cycle-link')).toHaveAttribute('href', '/current-cycle');
    expect(screen.queryByText('allocation.details.error.title')).not.toBeInTheDocument();
  });

  it('shows a failed read as an error with a retry, never as a missing record', async () => {
    roundInfoFails(503);
    render(<AllocationFinalizedPage />);
    expect(screen.getByText('allocation.details.error.title')).toBeInTheDocument();
    expect(screen.queryByText(/missingCycle/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('shows a network failure as an error too', () => {
    roundInfoFails(undefined);
    render(<AllocationFinalizedPage />);
    expect(screen.getByText('allocation.details.error.title')).toBeInTheDocument();
  });

  it('keeps asking for the record after a finalization until the indexer has it', () => {
    jest.useFakeTimers();
    try {
      mockSearchParams = new URLSearchParams('cycle=0&message=success');
      roundInfoFails(400);
      render(<AllocationFinalizedPage />);
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'allocation.finalized.pending.successTitle(cycle=0)',
        }),
      ).toBeInTheDocument();
      act(() => {
        jest.advanceTimersByTime(5_000);
      });
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('shows the latest finalized cycles by their Signatures when no cycle is named', () => {
    mockSearchParams = new URLSearchParams('');
    mockUseRoundList.mockReturnValue({
      data: [
        { RoundNum: 0, TokenId: 12, AmountEth: 6.17, TimeStamp: 1_600_000_000 },
        { RoundNum: 1, TokenId: 31, AmountEth: 11.06, TimeStamp: 1_700_000_000 },
      ],
      isLoading: false,
    });
    render(<AllocationFinalizedPage seoSummary={<h1>Summary</h1>} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Summary' })).toBeInTheDocument();
    const cards = screen.getAllByRole('figure');
    expect(within(cards[0]!).getByRole('link', { name: /cycleHash\(cycle=1\)/ })).toHaveAttribute(
      'href',
      '/allocation/1',
    );
    expect(mockUseRoundInfo).toHaveBeenCalledWith(-1);
  });

  it('links every cycle once from the index, never twice', () => {
    mockSearchParams = new URLSearchParams('');
    mockUseRoundList.mockReturnValue({
      data: [{ RoundNum: 0, TokenId: 12, AmountEth: 6.17, TimeStamp: 1_600_000_000 }],
      isLoading: false,
    });
    render(<AllocationFinalizedPage seoSummary={<h1>Summary</h1>} />);
    expect(
      screen.getByRole('link', { name: 'allocation.finalized.links.allCycles' }),
    ).toHaveAttribute('href', '/allocation');
  });

  it('says so when no cycle is finalized yet, instead of a heading over an empty grid', () => {
    mockSearchParams = new URLSearchParams('');
    mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
    render(<AllocationFinalizedPage seoSummary={<h1>Summary</h1>} />);
    expect(screen.getByText('allocation.finalized.index.empty.title')).toBeInTheDocument();
    expect(screen.queryAllByRole('figure')).toHaveLength(0);
  });

  it('shows a failed cycle list as an error with a retry', async () => {
    mockSearchParams = new URLSearchParams('');
    const refetch = jest.fn();
    mockUseRoundList.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });
    render(<AllocationFinalizedPage seoSummary={<h1>Summary</h1>} />);
    expect(screen.getByText('allocation.finalized.index.error')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('never calls the index art unavailable while the collection index loads', () => {
    mockSearchParams = new URLSearchParams('');
    mockUseRoundList.mockReturnValue({
      data: [{ RoundNum: 1, TokenId: 31, AmountEth: 11.06, TimeStamp: 1_700_000_000 }],
      isLoading: false,
    });
    mockUseCSTList.mockReturnValue({ data: undefined, isLoading: true });
    render(<AllocationFinalizedPage seoSummary={<h1>Summary</h1>} />);
    expect(screen.getByTestId('pending-plate')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('detail.image.artworkUnavailable')).not.toBeInTheDocument();
  });

  it('holds the received Signature on a busy plate while its seed loads', () => {
    roundInfo(ALLOCATION);
    mockUseCSTInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<AllocationFinalizedPage />);
    const section = screen.getByTestId('finalized-signature');
    expect(within(section).getByTestId('pending-plate')).toHaveAttribute('aria-busy', 'true');
    expect(within(section).queryByText('detail.image.artworkUnavailable')).not.toBeInTheDocument();
  });

  it('treats a cycle parameter that is not a number as no cycle', () => {
    mockSearchParams = new URLSearchParams('cycle=abc');
    render(<AllocationFinalizedPage />);
    expect(mockUseRoundInfo).toHaveBeenCalledWith(-1);
    expect(
      screen.getByRole('heading', { name: 'allocation.finalized.index.title' }),
    ).toBeInTheDocument();
  });

  it('passes 0 to useRoundInfo for the first cycle', () => {
    mockSearchParams = new URLSearchParams('cycle=0');
    render(<AllocationFinalizedPage />);
    expect(mockUseRoundInfo).toHaveBeenCalledWith(0);
  });

  it('has no accessibility violations', async () => {
    roundInfo(ALLOCATION);
    const { container } = render(<AllocationFinalizedPage />);
    await checkA11y(container);
  });

  it('redirects home when message=success and the next cycle has opened', async () => {
    mockSearchParams = new URLSearchParams('cycle=3&message=success');
    roundInfo(null);
    mockRoundActivationTime.mockResolvedValue(100n);
    mockGetBlock.mockResolvedValue({ timestamp: 200n });

    render(<AllocationFinalizedPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  it('does not redirect while the next cycle has not opened', async () => {
    mockSearchParams = new URLSearchParams('cycle=3&message=success');
    roundInfo(null);
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

  it('does not redirect when the page was not opened by a finalization', async () => {
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
