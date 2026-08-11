import type { DashboardInfo } from '@/services/api';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export type CyclePhase =
  | 'loading'
  | 'unavailable'
  | 'opening-soon'
  | 'waiting-first-gesture'
  | 'live'
  | 'approach'
  | 'final-hour'
  | 'final-ten'
  | 'final-minute'
  | 'confirming'
  | 'ready-to-finalize';

export interface CycleStateInput {
  data: DashboardInfo | null;
  loading: boolean;
  allocationTime: number;
  activationTime?: number | null;
  now: number;
  /**
   * On-chain verification of the zero-cross (see useEndgameChainSync). While
   * `false`, the local countdown has reached zero but fresh chain state has
   * not yet confirmed the deadline passed, so the phase is 'confirming'
   * instead of 'ready-to-finalize'. Omit (undefined) to keep the legacy
   * behavior of flipping to ready purely on the local clock.
   */
  finalizationConfirmed?: boolean;
}

export interface CycleState {
  phase: CyclePhase;
  activationTime: number | null;
  finalizationTime: number;
  isOpeningSoon: boolean;
  isWaitingForFirstGesture: boolean;
  isFinalizationCountdownActive: boolean;
  isGestureOpen: boolean;
  isConfirmingFinalization: boolean;
  isReadyToFinalize: boolean;
}

function getFinitePositiveSeconds(value: unknown): number | null {
  const n =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  return n > 1e12 ? n / 1000 : n;
}

export function getDashboardActivationTime(data: DashboardInfo | null): number | null {
  if (!data) return null;
  return (
    getFinitePositiveSeconds(data.CurRoundStats?.ActivationTime) ??
    getFinitePositiveSeconds(data.ActivationTime)
  );
}

export function getCycleState({
  data,
  loading,
  allocationTime,
  activationTime,
  now,
  finalizationConfirmed,
}: CycleStateInput): CycleState {
  const explicitActivationTime = getFinitePositiveSeconds(activationTime);
  const dashboardActivationTime = getDashboardActivationTime(data);
  const effectiveActivationTime = explicitActivationTime ?? dashboardActivationTime;
  const nowSeconds = now / 1000;

  let phase: CyclePhase;
  if (loading) {
    phase = 'loading';
  } else if (!data) {
    phase = 'unavailable';
  } else if (effectiveActivationTime != null && effectiveActivationTime > nowSeconds) {
    phase = 'opening-soon';
  } else if (data.TsRoundStart === 0 || data.LastBidderAddr === ZERO_ADDRESS) {
    phase = 'waiting-first-gesture';
  } else {
    const remainingMs = allocationTime - now;
    if (remainingMs <= 0)
      phase = finalizationConfirmed === false ? 'confirming' : 'ready-to-finalize';
    else if (remainingMs <= 60_000) phase = 'final-minute';
    else if (remainingMs <= 10 * 60_000) phase = 'final-ten';
    else if (remainingMs <= 60 * 60_000) phase = 'final-hour';
    else if (remainingMs <= 12 * 60 * 60_000) phase = 'approach';
    else phase = 'live';
  }

  const isFinalizationCountdownActive =
    phase === 'live' ||
    phase === 'approach' ||
    phase === 'final-hour' ||
    phase === 'final-ten' ||
    phase === 'final-minute';

  return {
    phase,
    activationTime: effectiveActivationTime,
    finalizationTime: allocationTime,
    isOpeningSoon: phase === 'opening-soon',
    isWaitingForFirstGesture: phase === 'waiting-first-gesture',
    isFinalizationCountdownActive,
    isGestureOpen: phase === 'waiting-first-gesture' || isFinalizationCountdownActive,
    isConfirmingFinalization: phase === 'confirming',
    isReadyToFinalize: phase === 'ready-to-finalize',
  };
}
