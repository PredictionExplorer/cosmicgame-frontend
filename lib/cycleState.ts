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
  | 'ready-to-finalize';

export interface CycleStateInput {
  data: DashboardInfo | null;
  loading: boolean;
  allocationTime: number;
  activationTime?: number | null;
  now: number;
}

export interface CycleState {
  phase: CyclePhase;
  activationTime: number | null;
  finalizationTime: number;
  isOpeningSoon: boolean;
  isWaitingForFirstGesture: boolean;
  isFinalizationCountdownActive: boolean;
  isGestureOpen: boolean;
  isReadyToFinalize: boolean;
}

function getFinitePositiveSeconds(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function getDashboardActivationTime(data: DashboardInfo | null): number | null {
  if (!data) return null;
  return getFinitePositiveSeconds(data.ActivationTime);
}

export function getCycleState({
  data,
  loading,
  allocationTime,
  activationTime,
  now,
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
    if (remainingMs <= 0) phase = 'ready-to-finalize';
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
    isReadyToFinalize: phase === 'ready-to-finalize',
  };
}
