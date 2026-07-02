// lexicon-allow-start: sort ids and fixture fields mirror the sealed backend contract
import userEvent from '@testing-library/user-event';

import type { RoiLeaderboardEntry } from '@/services/api/types';

import { render, screen, checkA11y } from '@/test-utils';

import { RoiLeaderboardSection } from '../RoiLeaderboardSection';

const mockUseRoiLeaderboard = jest.fn();
jest.mock('../../../hooks/useApiQuery', () => ({
  useRoiLeaderboard: (...args: unknown[]) => mockUseRoiLeaderboard(...args),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

function createEntry(overrides: Partial<RoiLeaderboardEntry> = {}): RoiLeaderboardEntry {
  return {
    BidderAid: 1,
    BidderAddr: '0x1234567890abcdef1234567890abcdef12345678',
    NumBids: 12,
    RoundsParticipated: 2,
    RoundsWon: 0,
    WinRate: 0,
    TotalEthSpentEth: 0.5,
    TotalCstSpentEth: 0,
    EthWonEth: 0,
    NetPlEth: -0.5,
    Roi: -1,
    PrizesCount: 0,
    NftPrizesCount: 0,
    CstPrizesCount: 0,
    ...overrides,
  } as RoiLeaderboardEntry;
}

function okQuery<T>(data: T) {
  return { data, isLoading: false, isError: false, refetch: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseRoiLeaderboard.mockReturnValue(okQuery([createEntry()]));
});

describe('RoiLeaderboardSection', () => {
  it('mutes a total-loss net % instead of painting it red', () => {
    render(<RoiLeaderboardSection />);
    const cell = screen.getByText('−100%');
    expect(cell).toHaveClass('text-muted-foreground');
    expect(cell).not.toHaveClass('text-red-400');
    expect(cell).toHaveAttribute('title', expect.stringMatching(/no eth received back yet/i));
  });

  it('keeps positive and partial-loss percentages colored', () => {
    mockUseRoiLeaderboard.mockReturnValue(
      okQuery([
        createEntry({ BidderAid: 1, Roi: 0.5, EthWonEth: 0.75, NetPlEth: 0.25 }),
        createEntry({
          BidderAid: 2,
          BidderAddr: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          Roi: -0.4,
          EthWonEth: 0.3,
          NetPlEth: -0.2,
        }),
      ]),
    );
    render(<RoiLeaderboardSection />);
    expect(screen.getByText('+50%')).toHaveClass('text-emerald-400');
    expect(screen.getByText('-40%')).toHaveClass('text-red-400');
  });

  it('shows an em dash for CST-only participants', () => {
    mockUseRoiLeaderboard.mockReturnValue(
      okQuery([createEntry({ TotalEthSpentEth: 0, TotalCstSpentEth: 100 })]),
    );
    render(<RoiLeaderboardSection />);
    expect(screen.getByText('(CST-only)')).toBeInTheDocument();
  });

  it('marks the active sort pill with aria-pressed', async () => {
    const user = userEvent.setup();
    render(<RoiLeaderboardSection />);
    const netEth = screen.getByRole('button', { name: 'Highest Net ETH' });
    const netPct = screen.getByRole('button', { name: 'Highest Net %' });
    expect(netEth).toHaveAttribute('aria-pressed', 'true');
    expect(netPct).toHaveAttribute('aria-pressed', 'false');

    await user.click(netPct);
    expect(netPct).toHaveAttribute('aria-pressed', 'true');
    expect(mockUseRoiLeaderboard).toHaveBeenLastCalledWith('roi', 5);
  });

  it('shows an error state with retry when the leaderboard fails', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseRoiLeaderboard.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<RoiLeaderboardSection />);
    expect(screen.getByText(/failed to load the performance leaderboard/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows an empty state when no participants match the filter', () => {
    mockUseRoiLeaderboard.mockReturnValue(okQuery([]));
    render(<RoiLeaderboardSection />);
    expect(screen.getByText(/no participants match this filter yet/i)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RoiLeaderboardSection />);
    await checkA11y(container);
  });
});
// lexicon-allow-end
