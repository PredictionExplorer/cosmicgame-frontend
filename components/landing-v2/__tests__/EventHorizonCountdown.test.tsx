import { render, screen, waitFor } from '@testing-library/react';

import type { DashboardInfo } from '../../../services/api';
import api from '../../../services/api';
import { EventHorizonCountdown, getLandingCycleTimerSnapshot } from '../EventHorizonCountdown';

jest.mock('../../../services/api', () => ({
  __esModule: true,
  default: {
    get_prize_time: jest.fn(),
    get_current_time: jest.fn(),
    get_dashboard_info: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

function dashboard(overrides: Partial<DashboardInfo> = {}): DashboardInfo {
  return {
    CurRoundNum: 12,
    CurNumBids: 34,
    CurPrizeAmountEth: 1.25,
    PrizeClaimTs: 0,
    TsRoundStart: 1,
    LastBidderAddr: '0x1111111111111111111111111111111111111111',
    GestureCostEth: 0.01,
    StakingAmountEth: 0,
    MainStats: { NumCSTokenMints: 100 },
    NumRaffleNFTWinnersBidding: 0,
    NumRaffleNFTWinnersStakingRWalk: 0,
    ...overrides,
  } as DashboardInfo;
}

describe('getLandingCycleTimerSnapshot', () => {
  const sampledAtMs = 1_000_000;
  const activeSample = {
    targetServerTimeSec: 8_200,
    currentServerTimeSec: 1_000,
    dashboard: dashboard(),
    sampledAtMs,
  };

  it('builds an active snapshot from the same server target and server clock shape used by the app', () => {
    const snapshot = getLandingCycleTimerSnapshot({
      sample: activeSample,
      nowMs: sampledAtMs,
    });

    expect(snapshot.phase).toBe('active');
    expect(snapshot.targetMs).toBe(sampledAtMs + 7_200_000);
    expect(snapshot.shards).toEqual([
      { label: 'Days', value: 0 },
      { label: 'Hours', value: 2 },
      { label: 'Min', value: 0 },
      { label: 'Sec', value: 0 },
    ]);
    expect(snapshot.title).toBe('Cycle #12 finalizes in');
    expect(snapshot.gestureCount).toBe(34);
  });

  it('moves through urgency phases as Cycle Finalization Time approaches', () => {
    expect(
      getLandingCycleTimerSnapshot({
        sample: activeSample,
        nowMs: activeSample.sampledAtMs + 61 * 60 * 1000,
      }).phase,
    ).toBe('final-hour');
    expect(
      getLandingCycleTimerSnapshot({
        sample: activeSample,
        nowMs: activeSample.sampledAtMs + 116 * 60 * 1000,
      }).phase,
    ).toBe('final-minutes');
  });

  it('shows ready-to-finalize when the backend target has passed', () => {
    const snapshot = getLandingCycleTimerSnapshot({
      sample: activeSample,
      nowMs: activeSample.sampledAtMs + 7_300_000,
    });

    expect(snapshot.phase).toBe('ready');
    expect(snapshot.title).toBe('Cycle #12 is ready to finalize');
  });

  it('shows a waiting state before the first Gesture starts the horizon', () => {
    const snapshot = getLandingCycleTimerSnapshot({
      sample: {
        ...activeSample,
        dashboard: dashboard({
          TsRoundStart: 0,
          LastBidderAddr: '0x0000000000000000000000000000000000000000',
        }),
      },
      nowMs: sampledAtMs,
    });

    expect(snapshot.phase).toBe('waiting');
    expect(snapshot.title).toBe('Cycle #12 is waiting for its first Gesture');
  });

  it('uses a loading snapshot before live data arrives', () => {
    const snapshot = getLandingCycleTimerSnapshot({ sample: null, nowMs: sampledAtMs });

    expect(snapshot.phase).toBe('loading');
    expect(snapshot.title).toBe('Synchronizing the cycle horizon');
  });
});

describe('<EventHorizonCountdown />', () => {
  const nowMs = 1_700_000_000_000;

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(nowMs);
    mockApi.get_prize_time.mockResolvedValue(1_700_007_200);
    mockApi.get_current_time.mockResolvedValue(1_700_000_000);
    mockApi.get_dashboard_info.mockResolvedValue(dashboard({ CurRoundNum: 21, CurNumBids: 55 }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the live Event Horizon timer with cycle context from the backend', async () => {
    render(<EventHorizonCountdown />);

    expect(screen.getByTestId('event-horizon-countdown')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Cycle #21 finalizes in' })).toBeInTheDocument();
    });

    expect(screen.getByRole('timer')).toHaveAccessibleName(/Cycle #21 finalizes in/i);
    expect(screen.getByText('55 Gestures')).toBeInTheDocument();
    expect(screen.getByText('Same clock as the app')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open live cycle/i })).toHaveAttribute(
      'href',
      'https://app.cosmicsignature.com',
    );
  });

  it('renders an unavailable state when the protocol clock cannot be reached', async () => {
    mockApi.get_prize_time.mockRejectedValue(new Error('network down'));

    render(<EventHorizonCountdown />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Live cycle clock unavailable' }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/could not reach the protocol clock/i)).toBeInTheDocument();
  });
});
