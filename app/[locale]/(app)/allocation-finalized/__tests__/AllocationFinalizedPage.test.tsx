import type { ReactNode } from 'react';
import userEvent from '@testing-library/user-event';

import { ApiReadError } from '@/services/api/readError';

import { act, checkA11y, render, screen, within } from '@/test-utils';

import AllocationFinalizedPage from '../AllocationFinalizedPage';
import { parseFinalizedSearch } from '../finalizedSearch';

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
  useCSTList: (...args: unknown[]) => mockUseCSTList(...args),
  // The live cycle (useLiveCycle); unread here, so the cycle list stands in.
  useDashboardInfo: () => ({ data: undefined, isLoading: false }),
}));

const mockUseCSTList = jest.fn();

let mockAccount: string | null = null;
jest.mock('../../../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount }),
}));

const mockReplace = jest.fn();
const mockGetBlock = jest.fn().mockResolvedValue({ timestamp: 50n });
const mockRoundActivationTime = jest.fn().mockResolvedValue(100n);
/** The chain's cycle count: past 5 means Cycle 5 is finalized. */
const mockRoundNum = jest.fn().mockResolvedValue(6n);

jest.mock('wagmi', () => ({
  usePublicClient: () => ({
    getBlock: (...args: unknown[]) => mockGetBlock(...args),
  }),
}));

// The real hook hands out one contract per address: so does the mock.
const mockContract = {
  read: {
    roundActivationTime: (...args: unknown[]) => mockRoundActivationTime(...args),
    roundNum: (...args: unknown[]) => mockRoundNum(...args),
  },
};
jest.mock('../../../../../hooks/useCosmicGameContract', () => ({
  __esModule: true,
  default: () => mockContract,
}));

/** The page's query; the server reads it (page.tsx) and passes the page its cycle. */
let query = new URLSearchParams('cycle=5');

function Page({ seoSummary }: { seoSummary?: ReactNode }) {
  return (
    <AllocationFinalizedPage
      {...parseFinalizedSearch(Object.fromEntries(query))}
      seoSummary={seoSummary}
    />
  );
}

jest.mock('next/navigation', () => ({
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
  query = new URLSearchParams('cycle=5');
  mockGetBlock.mockResolvedValue({ timestamp: 50n });
  mockRoundActivationTime.mockResolvedValue(100n);
  mockRoundNum.mockResolvedValue(6n);
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
    render(<Page />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'allocation.finalized.result.title(cycle=5)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'allocation.finalized.loading.status' }),
    ).toBeInTheDocument();
  });

  it('keeps the record header, lede included, from loading to loaded, so nothing moves', () => {
    roundInfo(undefined, true);
    const { rerender } = render(<Page />);
    expect(screen.getByText('allocation.finalized.result.lede')).toBeInTheDocument();
    roundInfo(ALLOCATION);
    rerender(<Page />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'allocation.finalized.result.title(cycle=5)' }),
    ).toBeInTheDocument();
    expect(screen.getByText('allocation.finalized.result.lede')).toBeInTheDocument();
  });

  it('opens a finalization on the waiting header once the chain has finalized the cycle', async () => {
    query = new URLSearchParams('cycle=5&message=success');
    roundInfo(undefined, true);
    render(<Page />);
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'allocation.finalized.pending.successTitle(cycle=5)',
      }),
    ).toBeInTheDocument();
  });

  it('never claims a finalization the chain has not made, whatever the link says', async () => {
    // A shared or typed success link for a cycle still open: the chain is on Cycle 5.
    query = new URLSearchParams('cycle=5&message=success');
    mockRoundNum.mockResolvedValue(5n);
    roundInfoFails(400);
    render(<Page />);
    await act(async () => {});
    expect(screen.queryByText(/pending\.successTitle/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/missingCycle/);
  });

  it('reads the cycle as a neutral record for any visitor', () => {
    roundInfo(ALLOCATION);
    render(<Page />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'allocation.finalized.result.title(cycle=5)' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/successTitle/)).not.toBeInTheDocument();
  });

  it('shows every part of the Signature Allocation: ETH, CST, the NFT, attached NFTs, the recipient', () => {
    roundInfo(ALLOCATION);
    render(<Page />);
    const section = screen.getByTestId('finalized-signature');
    // The precision of the cycle's own page, not six decimals.
    expect(section).toHaveTextContent('1.2346');
    expect(section).not.toHaveTextContent('1.234567');
    expect(section).toHaveTextContent('1,000');
    // One "Allocation" row carries both amounts, each unit in its value only.
    expect(section).toHaveTextContent(/allocation\.finalized\.result\.allocation1\.2346.ETH/);
    expect(within(section).getAllByRole('link', { name: /#000099/ })[0]).toHaveAttribute(
      'href',
      '/detail/99',
    );
    // The row's label already says "Attached NFTs": the value is the count alone.
    expect(section).toHaveTextContent('allocation.finalized.result.attached3');
    expect(within(section).getByRole('link', { name: /View Cycle|viewCycle/ })).toHaveAttribute(
      'href',
      '/allocation/5',
    );
  });

  it('congratulates the recipient arriving from their own finalization', () => {
    query = new URLSearchParams('cycle=5&message=success');
    mockAccount = RECIPIENT;
    roundInfo(ALLOCATION);
    render(<Page />);
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

  it('never congratulates a disconnected visitor holding a success link', () => {
    query = new URLSearchParams('cycle=5&message=success');
    mockAccount = null;
    roundInfo(ALLOCATION);
    render(<Page />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'allocation.finalized.result.title(cycle=5)' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/successLede/)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'allocation.finalized.next.title' })).toBeNull();
  });

  it('names the cycle once in the wall label and leaves the date to the spec sheet', () => {
    roundInfo(ALLOCATION);
    render(<Page />);
    const caption = screen.getByTestId('finalized-signature').querySelector('figcaption');
    expect(caption).toHaveTextContent('allocation.formats.cycle(cycle=5)');
    expect(caption?.querySelector('time')).toBeNull();
  });

  it('never congratulates a connected visitor who is not the recipient', () => {
    query = new URLSearchParams('cycle=5&message=success');
    mockAccount = VISITOR;
    roundInfo(ALLOCATION);
    render(<Page />);
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
    render(<Page />);
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
    render(<Page />);
    expect(screen.getByText('allocation.details.error.title')).toBeInTheDocument();
    expect(screen.queryByText(/missingCycle/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('shows a network failure as an error too', () => {
    roundInfoFails(undefined);
    render(<Page />);
    expect(screen.getByText('allocation.details.error.title')).toBeInTheDocument();
  });

  it('keeps asking for the record after a finalization until the indexer has it', async () => {
    jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] });
    try {
      query = new URLSearchParams('cycle=0&message=success');
      roundInfoFails(400);
      render(<Page />);
      await act(async () => {});
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

  it('stops asking after five minutes and reads as the neutral "no record yet"', async () => {
    jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] });
    try {
      query = new URLSearchParams('cycle=0&message=success');
      roundInfoFails(400);
      render(<Page />);
      await act(async () => {});
      act(() => {
        jest.advanceTimersByTime(5 * 60_000 + 10_000);
      });
      const calls = mockRefetch.mock.calls.length;
      act(() => {
        jest.advanceTimersByTime(60_000);
      });
      expect(mockRefetch).toHaveBeenCalledTimes(calls);
      expect(screen.queryByText(/pending\.successTitle/)).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it('steps to the neighbouring cycles’ records', () => {
    mockUseRoundList.mockReturnValue({
      data: [3, 4, 5, 6].map((RoundNum) => ({ RoundNum })),
      isLoading: false,
    });
    roundInfo(ALLOCATION);
    render(<Page />);
    const nav = screen.getByRole('navigation', { name: 'allocation.finalized.links.cycles' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/allocation-finalized?cycle=4',
      '/allocation-finalized?cycle=6',
    ]);
  });

  it('shows the latest finalized cycles by their Signatures when no cycle is named', () => {
    query = new URLSearchParams('');
    mockUseRoundList.mockReturnValue({
      data: [
        { RoundNum: 0, TokenId: 12, AmountEth: 6.17, TimeStamp: 1_600_000_000 },
        { RoundNum: 1, TokenId: 31, AmountEth: 11.06, TimeStamp: 1_700_000_000 },
      ],
      isLoading: false,
    });
    render(<Page seoSummary={<h1>Summary</h1>} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Summary' })).toBeInTheDocument();
    const cards = screen.getAllByRole('figure');
    expect(
      within(cards[0]!).getByRole('link', { name: /formats\.cycle\(cycle=1\)/ }),
    ).toHaveAttribute('href', '/allocation/1');
    expect(mockUseRoundInfo).toHaveBeenCalledWith(-1);
  });

  it('links every cycle once from the index, never twice', () => {
    query = new URLSearchParams('');
    mockUseRoundList.mockReturnValue({
      data: [{ RoundNum: 0, TokenId: 12, AmountEth: 6.17, TimeStamp: 1_600_000_000 }],
      isLoading: false,
    });
    render(<Page seoSummary={<h1>Summary</h1>} />);
    expect(
      screen.getByRole('link', { name: 'allocation.finalized.links.allCycles' }),
    ).toHaveAttribute('href', '/allocation');
  });

  it('says so when no cycle is finalized yet, instead of a heading over an empty grid', () => {
    query = new URLSearchParams('');
    mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
    render(<Page seoSummary={<h1>Summary</h1>} />);
    expect(screen.getByText('allocation.finalized.index.empty.title')).toBeInTheDocument();
    expect(screen.queryAllByRole('figure')).toHaveLength(0);
  });

  it('shows a failed cycle list as an error with a retry', async () => {
    query = new URLSearchParams('');
    const refetch = jest.fn();
    mockUseRoundList.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });
    render(<Page seoSummary={<h1>Summary</h1>} />);
    expect(screen.getByText('allocation.finalized.index.error')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('draws the index from the seeds its cycles carry, without reading the collection', () => {
    query = new URLSearchParams('');
    mockUseRoundList.mockReturnValue({
      data: [
        {
          RoundNum: 1,
          TokenId: 24,
          TokenSeed: '5084a8',
          AmountEth: 11.06,
          TimeStamp: 1_700_000_000,
        },
      ],
      isLoading: false,
    });
    mockUseCSTList.mockReturnValue({ data: undefined, isLoading: false });
    render(<Page seoSummary={<h1>Summary</h1>} />);
    expect(mockUseCSTList).toHaveBeenCalledWith({ enabled: false });
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
    expect(screen.queryByTestId('pending-plate')).not.toBeInTheDocument();
  });

  it('never calls the index art unavailable while the collection index loads', () => {
    query = new URLSearchParams('');
    mockUseRoundList.mockReturnValue({
      data: [{ RoundNum: 1, TokenId: 31, AmountEth: 11.06, TimeStamp: 1_700_000_000 }],
      isLoading: false,
    });
    mockUseCSTList.mockReturnValue({ data: undefined, isLoading: true });
    render(<Page seoSummary={<h1>Summary</h1>} />);
    expect(screen.getByTestId('pending-plate')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('detail.image.artworkUnavailable')).not.toBeInTheDocument();
  });

  it('holds the received Signature on a busy plate while its seed loads', () => {
    roundInfo(ALLOCATION);
    mockUseCSTInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<Page />);
    const section = screen.getByTestId('finalized-signature');
    expect(within(section).getByTestId('pending-plate')).toHaveAttribute('aria-busy', 'true');
    expect(within(section).queryByText('detail.image.artworkUnavailable')).not.toBeInTheDocument();
  });

  it('draws the received Signature from its record while the token read adds the name', () => {
    roundInfo({ ...ALLOCATION, TokenSeed: 'abc' });
    mockUseCSTInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<Page />);
    const section = screen.getByTestId('finalized-signature');
    expect(within(section).getByTestId('art-frame')).toBeInTheDocument();
    expect(within(section).queryByTestId('pending-plate')).not.toBeInTheDocument();
  });

  it('treats a cycle parameter that is not a number as no cycle', () => {
    query = new URLSearchParams('cycle=abc');
    render(<Page />);
    expect(mockUseRoundInfo).toHaveBeenCalledWith(-1);
    expect(
      screen.getByRole('heading', { name: 'allocation.finalized.index.title' }),
    ).toBeInTheDocument();
  });

  it('passes 0 to useRoundInfo for the first cycle', () => {
    query = new URLSearchParams('cycle=0');
    render(<Page />);
    expect(mockUseRoundInfo).toHaveBeenCalledWith(0);
  });

  it('has no accessibility violations', async () => {
    roundInfo(ALLOCATION);
    const { container } = render(<Page />);
    await checkA11y(container);
  });

  it('says quietly that the next cycle is open, and never leaves the page', async () => {
    query = new URLSearchParams('cycle=3&message=success');
    mockAccount = RECIPIENT;
    roundInfo({ ...ALLOCATION, RoundNum: 3 });
    mockRoundActivationTime.mockResolvedValue(100n);
    mockGetBlock.mockResolvedValue({ timestamp: 200n });

    render(<Page />);

    const notice = await screen.findByTestId('next-cycle-notice');
    expect(notice).toHaveAttribute('role', 'status');
    expect(notice).toHaveTextContent('allocation.finalized.nextCycle');
    // The recipient keeps reading the Signature they just received.
    expect(screen.getByTestId('finalized-signature')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('says nothing about the next cycle while it has not opened', async () => {
    query = new URLSearchParams('cycle=3&message=success');
    roundInfoFails(400);
    mockRoundActivationTime.mockResolvedValue(1_000_000n);
    mockGetBlock.mockResolvedValue({ timestamp: 100n });

    render(<Page />);

    await act(async () => {
      await new Promise((r) => {
        setTimeout(r, 50);
      });
    });

    expect(screen.queryByTestId('next-cycle-notice')).not.toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('never watches the next cycle when the page was not opened by a finalization', async () => {
    query = new URLSearchParams('cycle=3');
    roundInfo({ ...ALLOCATION, RoundNum: 3 });
    mockRoundActivationTime.mockResolvedValue(1n);
    mockGetBlock.mockResolvedValue({ timestamp: 9_999_999n });

    render(<Page />);

    await act(async () => {
      await new Promise((r) => {
        setTimeout(r, 50);
      });
    });

    expect(mockRoundActivationTime).not.toHaveBeenCalled();
    expect(screen.queryByTestId('next-cycle-notice')).not.toBeInTheDocument();
  });
});

describe('parseFinalizedSearch', () => {
  it('reads a plain non-negative cycle and the success message', () => {
    expect(parseFinalizedSearch({ cycle: '7', message: 'success' })).toEqual({
      cycle: 7,
      isClaimSuccess: true,
    });
    expect(parseFinalizedSearch({ cycle: '0' })).toEqual({ cycle: 0, isClaimSuccess: false });
  });

  it('treats anything else as no cycle, and a message without a cycle as no success', () => {
    for (const cycle of ['abc', '-1', '1.5', '', '99999999999999999999']) {
      expect(parseFinalizedSearch({ cycle }).cycle).toBeNull();
    }
    expect(parseFinalizedSearch({ message: 'success' })).toEqual({
      cycle: null,
      isClaimSuccess: false,
    });
  });

  it('takes the first of repeated parameters', () => {
    expect(parseFinalizedSearch({ cycle: ['3', '4'] }).cycle).toBe(3);
  });
});
