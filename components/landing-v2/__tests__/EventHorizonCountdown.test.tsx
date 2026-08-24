import { render, screen, waitFor } from '@testing-library/react';

import { CST_GECKOTERMINAL_POOL_URL } from '@/config/geckoterminal';

import type { DashboardInfo } from '../../../services/api';
import api from '../../../services/api';
import { EventHorizonCountdown, getLandingCycleTimerSnapshot } from '../EventHorizonCountdown';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

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

  it('builds a live countdown snapshot from the same server target and server clock shape used by the app', () => {
    const snapshot = getLandingCycleTimerSnapshot({
      sample: activeSample,
      nowMs: sampledAtMs,
    });

    expect(snapshot.phase).toBe('approach');
    expect(snapshot.targetMs).toBe(sampledAtMs + 7_200_000);
    expect(snapshot.finalizationTargetMs).toBe(sampledAtMs + 7_200_000);
    expect(snapshot.showCountdown).toBe(true);
    expect(snapshot.shards).toEqual([
      { unit: 'days', value: 0 },
      { unit: 'hours', value: 2 },
      { unit: 'minutes', value: 0 },
      { unit: 'seconds', value: 0 },
    ]);
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
    ).toBe('final-ten');
    expect(
      getLandingCycleTimerSnapshot({
        sample: activeSample,
        nowMs: activeSample.sampledAtMs + 119 * 60 * 1000 + 10_000,
      }).phase,
    ).toBe('final-minute');
  });

  it('counts down to cycle opening when dashboard activation time is in the future', () => {
    const activationTime = sampledAtMs / 1000 + 900;
    const snapshot = getLandingCycleTimerSnapshot({
      sample: {
        ...activeSample,
        dashboard: dashboard({
          CurRoundStats: { TotalBids: 0, ActivationTime: activationTime },
          TsRoundStart: 0,
        }),
      },
      nowMs: sampledAtMs,
    });

    expect(snapshot.phase).toBe('opening-soon');
    expect(snapshot.targetMs).toBe(activationTime * 1000);
    expect(snapshot.finalizationTargetMs).toBe(sampledAtMs + 7_200_000);
    expect(snapshot.showCountdown).toBe(true);
  });

  it('shows ready-to-finalize when the backend target has passed', () => {
    const snapshot = getLandingCycleTimerSnapshot({
      sample: activeSample,
      nowMs: activeSample.sampledAtMs + 7_300_000,
    });

    expect(snapshot.phase).toBe('ready-to-finalize');
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

    expect(snapshot.phase).toBe('waiting-first-gesture');
    expect(snapshot.remainingMs).toBe(0);
    expect(snapshot.showCountdown).toBe(false);
  });

  it('uses a loading snapshot before live data arrives', () => {
    const snapshot = getLandingCycleTimerSnapshot({ sample: null, nowMs: sampledAtMs });

    expect(snapshot.phase).toBe('loading');
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
      expect(
        screen.getByRole('heading', {
          name: /landing\.timer\.phases\.approach\.title/,
        }),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('timer')).toHaveAccessibleName(/landing\.timer\.countdownAria/);
    expect(screen.getByText(/landing\.timer\.gestureCount\(count=55\)/)).toBeInTheDocument();
    expect(screen.getByText('landing.timer.sameClock')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /landing\.timer\.openLiveCycle/i })).toHaveAttribute(
      'href',
      'https://app.cosmicsignature.com',
    );

    const poolLink = screen.getByRole('link', { name: 'landing.timer.viewCstPool' });
    expect(poolLink).toHaveAttribute('href', CST_GECKOTERMINAL_POOL_URL);
    expect(poolLink).toHaveAttribute('target', '_blank');
    expect(poolLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(poolLink.querySelector('img')).toHaveAttribute(
      'src',
      '/images/brands/geckoterminal-symbol.svg',
    );
  });

  it('renders an unavailable state when the protocol clock cannot be reached', async () => {
    mockApi.get_prize_time.mockRejectedValue(new Error('network down'));

    render(<EventHorizonCountdown />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'landing.timer.phases.unavailable.title' }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText('landing.timer.phases.unavailable.body')).toBeInTheDocument();
  });

  it('renders waiting state without a ticking countdown', async () => {
    mockApi.get_dashboard_info.mockResolvedValue(
      dashboard({
        CurRoundNum: 21,
        CurNumBids: 0,
        TsRoundStart: 0,
        LastBidderAddr: '0x0000000000000000000000000000000000000000',
      }),
    );

    render(<EventHorizonCountdown />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: /landing\.timer\.phases\.waitingFirstGesture\.title/,
        }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText('landing.timer.staticClock.waitingFirstGesture')).toBeInTheDocument();
    expect(screen.queryByText('landing.timer.status.synchronized')).not.toBeInTheDocument();
  });
});
