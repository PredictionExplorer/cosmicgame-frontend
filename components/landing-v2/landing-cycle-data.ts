'use client';

import { getApiBase } from '@/lib/serverRotation';

/**
 * Zod-free, axios-free reads for the landing countdown.
 *
 * The countdown previously imported the services/api barrel, which pulled
 * the axios client plus the full zod schema module (~90 KB gzip — the
 * largest chunk in the landing bundle) onto the marketing host for three
 * display-only reads. These fetch helpers shape-check exactly the handful
 * of fields the countdown consumes and degrade to null on any failure,
 * which the timer renders as its "unavailable" state.
 */

/** Structural subset of the dashboard read the landing timer consumes. */
export interface LandingDashboardSnapshot {
  CurRoundNum: number;
  CurNumBids: number;
  TsRoundStart: number;
  LastBidderAddr: string;
  ActivationTime?: number;
  CurRoundStats?: { ActivationTime?: number } | null;
}

function apiUrl(path: string): string {
  return `${getApiBase().replace(/\/+$/, '')}/${path}`;
}

async function fetchJson(path: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(apiUrl(path), { headers: { Accept: 'application/json' } });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return data !== null && typeof data === 'object' ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function toFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toOptionalFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** Unix seconds when the current cycle can finalize, or null when unknown. */
export async function fetchLandingFinalizationTimeSec(): Promise<number | null> {
  const data = await fetchJson('rounds/current/time');
  return toFiniteNumber(data?.CurRoundPrizeTime);
}

/** Server clock in Unix seconds, or null when unknown. */
export async function fetchLandingCurrentTimeSec(): Promise<number | null> {
  const data = await fetchJson('time/current');
  return toFiniteNumber(data?.CurrentTimeStamp);
}

/** Narrow dashboard snapshot for the landing timer, or null when unusable. */
export async function fetchLandingDashboardSnapshot(): Promise<LandingDashboardSnapshot | null> {
  const data = await fetchJson('statistics/dashboard');
  if (!data) return null;

  const cycleNumber = toFiniteNumber(data.CurRoundNum);
  const gestureCount = toFiniteNumber(data.CurNumBids);
  const cycleStartTs = toFiniteNumber(data.TsRoundStart);
  const lastParticipant = typeof data.LastBidderAddr === 'string' ? data.LastBidderAddr : null;
  if (cycleNumber == null || gestureCount == null || cycleStartTs == null || !lastParticipant) {
    return null;
  }

  const roundStats =
    data.CurRoundStats !== null && typeof data.CurRoundStats === 'object'
      ? (data.CurRoundStats as Record<string, unknown>)
      : null;

  return {
    CurRoundNum: cycleNumber,
    CurNumBids: gestureCount,
    TsRoundStart: cycleStartTs,
    LastBidderAddr: lastParticipant,
    ActivationTime: toOptionalFiniteNumber(data.ActivationTime),
    CurRoundStats: roundStats
      ? { ActivationTime: toOptionalFiniteNumber(roundStats.ActivationTime) }
      : null,
  };
}
