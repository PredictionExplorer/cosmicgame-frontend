import '@testing-library/jest-dom';

import type { DashboardInfo, GestureInfo } from '@/services/api';
import type { ChampionsState } from '@/hooks/useChampions';

import { checkA11y, render, screen } from '@/test-utils';

import { DeckPersonalStrip } from '../DeckPersonalStrip';

const mockUseChampions = jest.fn();
jest.mock('../../../../hooks/useChampions', () => ({
  useChampions: () => mockUseChampions(),
}));

const mockUseApiData = jest.fn();
jest.mock('../../../../contexts/ApiDataContext', () => ({
  useApiData: () => mockUseApiData(),
}));

const ACCOUNT = '0x1111111111111111111111111111111111111111';

function makeChampions(
  latestGesture: Partial<ChampionsState['latestGesture']> = {},
): ChampionsState {
  return {
    isLoading: false,
    hasData: true,
    endurance: { address: null, duration: 0, lockedDuration: 0, isLive: false },
    chrono: { address: null, duration: 0, lockedDuration: 0, isLive: false },
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
      ...latestGesture,
    },
    raw: null,
    source: 'api-v1',
  } as ChampionsState;
}

function makeApiData(overrides: Partial<Record<string, number>> = {}) {
  return {
    apiData: {
      ETHRaffleToClaim: 0,
      ETHRaffleToClaimWei: 0,
      NumDonatedNFTToClaim: 0,
      UnretrievedAnchorDistribution: 0,
      releasableActionIds: [],
      ...overrides,
    },
  };
}

const data = { LastBidderAddr: ACCOUNT } as unknown as DashboardInfo;
const otherLeaderData = {
  LastBidderAddr: '0x2222222222222222222222222222222222222222',
} as unknown as DashboardInfo;

const gestures = [
  { EvtLogId: 1, TimeStamp: 1, BidderAddr: ACCOUNT },
  { EvtLogId: 2, TimeStamp: 2, BidderAddr: '0x2222222222222222222222222222222222222222' },
  { EvtLogId: 3, TimeStamp: 3, BidderAddr: ACCOUNT.toLowerCase() },
] as unknown as GestureInfo[];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseChampions.mockReturnValue(makeChampions());
  mockUseApiData.mockReturnValue(makeApiData());
});

describe('DeckPersonalStrip', () => {
  it('shows the leader standing with hold time and the countdown to the Endurance record', () => {
    mockUseChampions.mockReturnValue(
      makeChampions({
        address: ACCOUNT,
        holdDuration: 120,
        durationToBeat: 500,
        secondsUntilEnduranceChampion: 380,
      }),
    );

    render(<DeckPersonalStrip account={ACCOUNT} data={data} gestures={gestures} />);

    expect(screen.getByTestId('personal-standing')).toHaveTextContent('home.deck.personal.leader');
    expect(screen.getByTestId('personal-endurance')).toHaveTextContent(
      /home\.deck\.personal\.enduranceIn/,
    );
  });

  it('marks a live record extension distinctly', () => {
    mockUseChampions.mockReturnValue(
      makeChampions({
        address: ACCOUNT,
        holdDuration: 700,
        durationToBeat: 500,
        isExtendingEnduranceRecord: true,
      }),
    );

    render(<DeckPersonalStrip account={ACCOUNT} data={data} gestures={gestures} />);

    expect(screen.getByTestId('personal-endurance')).toHaveTextContent(
      'home.deck.personal.extending',
    );
  });

  it('shows the not-leader standing without an endurance line', () => {
    render(<DeckPersonalStrip account={ACCOUNT} data={otherLeaderData} gestures={gestures} />);

    expect(screen.getByTestId('personal-standing')).toHaveTextContent(
      'home.deck.personal.notLeader',
    );
    expect(screen.queryByTestId('personal-endurance')).not.toBeInTheDocument();
  });

  it('counts only the connected wallet gestures, case-insensitively', () => {
    render(<DeckPersonalStrip account={ACCOUNT} data={otherLeaderData} gestures={gestures} />);

    expect(screen.getByTestId('personal-gesture-count')).toHaveTextContent(
      'home.deck.personal.gestures(count=2)',
    );
  });

  it('offers a retrieve link with the waiting ETH amount when allocations wait', () => {
    mockUseApiData.mockReturnValue(makeApiData({ ETHRaffleToClaim: 0.39 }));

    render(<DeckPersonalStrip account={ACCOUNT} data={otherLeaderData} gestures={gestures} />);

    const retrieve = screen.getByTestId('personal-retrieve');
    expect(retrieve).toHaveAttribute('href', '/my-allocations');
    expect(retrieve).toHaveTextContent('home.deck.personal.retrieve');
    expect(retrieve).toHaveTextContent('home.allocation.amounts.eth(amount=0.3900)');
  });

  it('offers a retrieve link without an amount for non-ETH waiting items', () => {
    mockUseApiData.mockReturnValue(makeApiData({ NumDonatedNFTToClaim: 2 }));

    render(<DeckPersonalStrip account={ACCOUNT} data={otherLeaderData} gestures={gestures} />);

    const retrieve = screen.getByTestId('personal-retrieve');
    expect(retrieve).toHaveTextContent('home.deck.personal.retrieve');
    expect(retrieve).not.toHaveTextContent(/amounts\.eth/);
  });

  it('links quietly to allocations when nothing waits', () => {
    render(<DeckPersonalStrip account={ACCOUNT} data={otherLeaderData} gestures={gestures} />);

    expect(screen.queryByTestId('personal-retrieve')).not.toBeInTheDocument();
    expect(screen.getByTestId('personal-allocations-link')).toHaveAttribute(
      'href',
      '/my-allocations',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <DeckPersonalStrip account={ACCOUNT} data={data} gestures={gestures} />,
    );
    await checkA11y(container);
  });
});
