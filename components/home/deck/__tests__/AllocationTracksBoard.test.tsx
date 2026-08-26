import '@testing-library/jest-dom';

import type { DashboardInfo } from '@/services/api';
import type { ChampionsState } from '@/hooks/useChampions';

import { checkA11y, render, screen, within } from '@/test-utils';

import { AllocationTracksBoard } from '../AllocationTracksBoard';

const mockUseChampions = jest.fn();
jest.mock('../../../../hooks/useChampions', () => ({
  useChampions: () => mockUseChampions(),
}));

const emptyRole = {
  address: null,
  duration: 0,
  lockedDuration: 0,
  isLive: false,
};

function makeChampions(overrides: Partial<ChampionsState> = {}): ChampionsState {
  return {
    isLoading: false,
    hasData: true,
    endurance: { ...emptyRole },
    chrono: { ...emptyRole },
    chronoChallenge: {
      address: null,
      recordToBeat: 0,
      isLive: false,
      isRecordHolder: false,
      hasDetails: false,
    },
    lastCst: { address: null },
    latestGesture: {
      address: null,
      holdDuration: 0,
      latestGestureTime: null,
      isCurrentEnduranceChampion: false,
      isExtendingEnduranceRecord: false,
      durationToBeat: 0,
      secondsUntilEnduranceChampion: 0,
      progressToEnduranceChampion: 0,
    },
    raw: null,
    source: 'api-v1',
    ...overrides,
  } as ChampionsState;
}

const dashboardData = {
  CurRoundNum: 7,
  LastBidderAddr: '0x1111111111111111111111111111111111111111',
  PrizeAmountEth: 1.5,
  RaffleAmountEth: 0.24,
  StakingAmountEth: 0.36,
  CosmicGameBalanceEth: 10,
  ChronoWarriorPercentage: 8,
  CharityPercentage: 7,
  NumRaffleEthWinnersBidding: 3,
  NumRaffleNFTWinnersBidding: 10,
  NumRaffleNFTWinnersStakingRWalk: 10,
} as unknown as DashboardInfo;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseChampions.mockReturnValue(makeChampions());
});

describe('AllocationTracksBoard', () => {
  it('renders every allocation track with live amounts from the dashboard', () => {
    render(<AllocationTracksBoard data={dashboardData} />);

    expect(screen.getByRole('heading', { name: 'home.deck.board.title' })).toBeInTheDocument();

    const signature = screen.getByTestId('track-row-signature');
    expect(signature).toHaveTextContent('home.allocation.cards.signature.name');
    expect(signature).toHaveTextContent('home.allocation.amounts.eth(amount=1.5000)');

    // Chrono ETH derives from the reserve balance and the live percentage.
    expect(screen.getByTestId('track-row-chrono')).toHaveTextContent(
      'home.allocation.amounts.eth(amount=0.8000)',
    );
    // Public goods likewise.
    expect(screen.getByTestId('track-row-public-goods')).toHaveTextContent(
      'home.allocation.amounts.eth(amount=0.7000)',
    );
    expect(screen.getByTestId('track-row-cosmic-anchor')).toHaveTextContent(
      'home.allocation.amounts.eth(amount=0.3600)',
    );
    expect(screen.getByTestId('track-row-stellar-eth')).toHaveTextContent(
      'home.allocation.recipientCount(count=3)',
    );
    expect(screen.getByTestId('track-row-stellar-nft')).toHaveTextContent(
      'home.allocation.recipientCount(count=10)',
    );
    expect(screen.getByTestId('track-row-endurance')).toHaveTextContent(
      'home.deck.board.cstPlusNft',
    );
    expect(screen.getByTestId('track-row-final-cst')).toHaveTextContent(
      'home.deck.board.cstPlusNft',
    );
  });

  it('shows current leaders with live chips and a YOU badge for the connected wallet', () => {
    mockUseChampions.mockReturnValue(
      makeChampions({
        latestGesture: {
          address: '0x1111111111111111111111111111111111111111',
          holdDuration: 120,
          latestGestureTime: 1700000000,
          isCurrentEnduranceChampion: false,
          isExtendingEnduranceRecord: false,
          durationToBeat: 500,
          secondsUntilEnduranceChampion: 380,
          progressToEnduranceChampion: 24,
        },
        chrono: {
          address: '0x2222222222222222222222222222222222222222',
          duration: 4200,
          lockedDuration: 4200,
          isLive: true,
        },
        endurance: {
          address: '0x3333333333333333333333333333333333333333',
          duration: 4800,
          lockedDuration: 4800,
          isLive: false,
        },
        lastCst: { address: '0x4444444444444444444444444444444444444444' },
      }),
    );

    render(
      <AllocationTracksBoard
        data={dashboardData}
        account="0x1111111111111111111111111111111111111111"
      />,
    );

    const signature = screen.getByTestId('track-row-signature');
    expect(within(signature).getByText('tables.status.youBadge')).toBeInTheDocument();

    const chrono = screen.getByTestId('track-row-chrono');
    expect(within(chrono).getByText('tables.specialAllocation.liveGrowing')).toBeInTheDocument();

    const endurance = screen.getByTestId('track-row-endurance');
    expect(
      within(endurance).queryByText('tables.specialAllocation.liveGrowing'),
    ).not.toBeInTheDocument();
  });

  it('renders awaiting placeholders before any gesture or record exists', () => {
    mockUseChampions.mockReturnValue(makeChampions());
    render(
      <AllocationTracksBoard
        data={
          {
            ...(dashboardData as unknown as Record<string, unknown>),
            LastBidderAddr: '0x0000000000000000000000000000000000000000',
          } as unknown as DashboardInfo
        }
      />,
    );

    expect(screen.getByTestId('track-row-signature')).toHaveTextContent(
      'home.deck.board.awaitingGesture',
    );
    expect(screen.getByTestId('track-row-chrono')).toHaveTextContent(
      'home.deck.board.awaitingRecord',
    );
    expect(screen.getByTestId('track-row-final-cst')).toHaveTextContent(
      'tables.specialAllocation.awaitingCstGesture',
    );
  });

  it('links track rows to their deep pages and anchors the full breakdown', () => {
    render(<AllocationTracksBoard data={dashboardData} />);

    expect(within(screen.getByTestId('track-row-signature')).getByRole('link')).toHaveAttribute(
      'href',
      '/current-cycle',
    );
    expect(within(screen.getByTestId('track-row-cosmic-anchor')).getByRole('link')).toHaveAttribute(
      'href',
      '/anchoring',
    );
    expect(within(screen.getByTestId('track-row-public-goods')).getByRole('link')).toHaveAttribute(
      'href',
      '/public-goods-contributions-cg',
    );
    expect(screen.getByRole('link', { name: /home\.deck\.board\.fullBreakdown/ })).toHaveAttribute(
      'href',
      '#allocation-breakdown',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AllocationTracksBoard data={dashboardData} />);
    await checkA11y(container);
  });
});
