import type { DashboardInfo } from '@/services/api';

import { getCycleState, getDashboardActivationTime, ZERO_ADDRESS } from '../cycleState';

const NOW = 1_700_000_000_000;

function dashboard(overrides: Partial<DashboardInfo> = {}): DashboardInfo {
  return {
    CurRoundNum: 9,
    CurNumBids: 12,
    CurPrizeAmountEth: 1,
    PrizeClaimTs: 0,
    TsRoundStart: Math.floor(NOW / 1000) - 3600,
    LastBidderAddr: '0x1111111111111111111111111111111111111111',
    GestureCostEth: 0.01,
    StakingAmountEth: 0,
    MainStats: { NumCSTokenMints: 100 },
    NumRaffleNFTWinnersBidding: 0,
    NumRaffleNFTWinnersStakingRWalk: 0,
    ...overrides,
  } as DashboardInfo;
}

const baseInput = {
  data: dashboard(),
  loading: false,
  allocationTime: NOW + 13 * 60 * 60_000,
  activationTime: 0,
  now: NOW,
};

describe('getDashboardActivationTime', () => {
  it('reads nested dashboard activation timestamp before top-level fallback', () => {
    expect(
      getDashboardActivationTime(
        dashboard({
          ActivationTime: 1234,
          CurRoundStats: { TotalBids: 0, ActivationTime: 5678 },
        }),
      ),
    ).toBe(5678);
  });

  it('reads a positive top-level dashboard activation timestamp as a fallback', () => {
    expect(getDashboardActivationTime(dashboard({ ActivationTime: 1234 }))).toBe(1234);
  });

  it('normalizes millisecond activation timestamps to seconds', () => {
    expect(
      getDashboardActivationTime(
        dashboard({ CurRoundStats: { TotalBids: 0, ActivationTime: 1_700_000_123_000 } }),
      ),
    ).toBe(1_700_000_123);
  });

  it('ignores absent, zero, and invalid activation timestamps', () => {
    expect(getDashboardActivationTime(dashboard())).toBeNull();
    expect(getDashboardActivationTime(dashboard({ ActivationTime: 0 }))).toBeNull();
    expect(getDashboardActivationTime(dashboard({ ActivationTime: Number.NaN }))).toBeNull();
  });
});

describe('getCycleState', () => {
  it.each([
    ['loading', { loading: true }],
    ['unavailable', { data: null }],
    ['opening-soon', { activationTime: NOW / 1000 + 60 }],
    [
      'waiting-first-gesture',
      { data: dashboard({ TsRoundStart: 0, LastBidderAddr: ZERO_ADDRESS }) },
    ],
    ['live', { allocationTime: NOW + 13 * 60 * 60_000 }],
    ['approach', { allocationTime: NOW + 12 * 60 * 60_000 }],
    ['final-hour', { allocationTime: NOW + 60 * 60_000 }],
    ['final-ten', { allocationTime: NOW + 10 * 60_000 }],
    ['final-minute', { allocationTime: NOW + 60_000 }],
    ['ready-to-finalize', { allocationTime: NOW - 1 }],
  ] as const)('returns %s phase', (phase, overrides) => {
    expect(getCycleState({ ...baseInput, ...overrides }).phase).toBe(phase);
  });

  it('uses dashboard ActivationTime when no contract activation time is available', () => {
    const state = getCycleState({
      ...baseInput,
      data: dashboard({ CurRoundStats: { TotalBids: 0, ActivationTime: NOW / 1000 + 120 } }),
      activationTime: 0,
    });

    expect(state.phase).toBe('opening-soon');
    expect(state.activationTime).toBe(NOW / 1000 + 120);
  });

  it('does not treat activationTime 0 as an opening-soon or live signal by itself', () => {
    const state = getCycleState({
      ...baseInput,
      data: dashboard({ TsRoundStart: 0, LastBidderAddr: ZERO_ADDRESS }),
      activationTime: 0,
    });

    expect(state.phase).toBe('waiting-first-gesture');
    expect(state.isGestureOpen).toBe(true);
  });

  it('keeps legacy instant-ready behavior when finalizationConfirmed is omitted', () => {
    const state = getCycleState({ ...baseInput, allocationTime: NOW - 1 });
    expect(state.phase).toBe('ready-to-finalize');
    expect(state.isConfirmingFinalization).toBe(false);
  });

  it('holds in confirming while the zero-cross is unverified on-chain', () => {
    const state = getCycleState({
      ...baseInput,
      allocationTime: NOW - 1,
      finalizationConfirmed: false,
    });
    expect(state.phase).toBe('confirming');
    expect(state.isConfirmingFinalization).toBe(true);
    expect(state.isReadyToFinalize).toBe(false);
  });

  it('shows ready-to-finalize once the zero-cross is confirmed on-chain', () => {
    const state = getCycleState({
      ...baseInput,
      allocationTime: NOW - 1,
      finalizationConfirmed: true,
    });
    expect(state.phase).toBe('ready-to-finalize');
    expect(state.isReadyToFinalize).toBe(true);
  });

  it('ignores finalizationConfirmed while the countdown is still running', () => {
    const state = getCycleState({
      ...baseInput,
      allocationTime: NOW + 60_000,
      finalizationConfirmed: false,
    });
    expect(state.phase).toBe('final-minute');
  });

  it('marks only countdown phases as finalization countdown active', () => {
    expect(getCycleState(baseInput).isFinalizationCountdownActive).toBe(true);
    expect(
      getCycleState({
        ...baseInput,
        data: dashboard({ TsRoundStart: 0, LastBidderAddr: ZERO_ADDRESS }),
      }).isFinalizationCountdownActive,
    ).toBe(false);
    expect(getCycleState({ ...baseInput, allocationTime: NOW - 1 }).isReadyToFinalize).toBe(true);
  });
});
