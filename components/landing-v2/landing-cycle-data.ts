'use client';

import { toFiniteNumber } from '@/utils/finiteNumber';
import { getApiBase } from '@/lib/serverRotation';

/**
 * Zod-free, axios-free reads for the landing countdown.
 *
 * The countdown previously imported the services/api barrel, which pulled
 * the axios client plus the full zod schema module (~90 KB gzip — the
 * largest chunk in the landing bundle) onto the marketing host for three
 * display-only reads. These fetch helpers shape-check exactly the handful
 * of fields the countdown consumes and degrade to null on any failure; the
 * clock keeps its last good value of each read (landing-cycle-clock.ts).
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

/**
 * How long one landing read may wait before it counts as failed, so a stalled
 * request never holds a skeleton, a busy state or the clock's poll loop.
 */
export const LANDING_FETCH_TIMEOUT_MS = 8_000;

/**
 * An API path on the server the rotation picks right now (lib/serverRotation:
 * the hourly rotation, skipping servers marked down), the one base every
 * landing read uses.
 */
export function landingApiUrl(path: string): string {
  const base = getApiBase().replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return base ? `${base}/${cleanPath}` : `/${cleanPath}`;
}

/** An abort signal that fires after `ms`, where the browser has `AbortSignal.timeout`. */
export function timeoutSignal(ms: number): AbortSignal | undefined {
  return typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
    ? AbortSignal.timeout(ms)
    : undefined;
}

async function fetchJson(
  path: string,
  timeoutMs: number = LANDING_FETCH_TIMEOUT_MS,
): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(landingApiUrl(path), {
      headers: { Accept: 'application/json' },
      signal: timeoutSignal(timeoutMs),
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return data !== null && typeof data === 'object' ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function toOptionalFiniteNumber(value: unknown): number | undefined {
  return toFiniteNumber(value) ?? undefined;
}

/** Unix seconds when the current cycle can finalize, or null when unknown. */
export async function fetchLandingFinalizationTimeSec(timeoutMs?: number): Promise<number | null> {
  const data = await fetchJson('rounds/current/time', timeoutMs);
  return toFiniteNumber(data?.CurRoundPrizeTime);
}

/** Server clock in Unix seconds, or null when unknown. */
export async function fetchLandingCurrentTimeSec(timeoutMs?: number): Promise<number | null> {
  const data = await fetchJson('time/current', timeoutMs);
  return toFiniteNumber(data?.CurrentTimeStamp);
}

/** Narrow dashboard snapshot for the landing timer, or null when unusable. */
export async function fetchLandingDashboardSnapshot(
  timeoutMs?: number,
): Promise<LandingDashboardSnapshot | null> {
  const data = await fetchJson('statistics/dashboard', timeoutMs);
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
