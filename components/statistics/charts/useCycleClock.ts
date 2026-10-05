'use client';

import { useCurrentTime, useRoundInfo } from '@/hooks/useApiQuery';
import { useHydrated } from '@/hooks/useHydrated';
import { useNow } from '@/hooks/useNow';
import { toFiniteNumber } from '@/utils/finiteNumber';

/** Whether a cycle's end (a finalized cycle) or "now" (the live one) is known yet. */
export type CycleClockStatus = 'ready' | 'loading' | 'error';

export interface CycleClock {
  /**
   * When a finalized cycle ended (its finalization, Unix seconds). 0 for the
   * live cycle, which stays open at `nowTs`, and until the end is known.
   */
  endTs: number;
  /**
   * "Now" for the live cycle, Unix seconds, in whole minutes so a chart
   * redraws at most once a minute rather than on every poll. 0 for a
   * finalized cycle, and on the server and during hydration.
   */
  nowTs: number;
  /**
   * `loading` until the end of a finalized cycle is read (or, for the live
   * cycle, until the page has hydrated); `error` when that read failed. A
   * chart shows its skeleton or its error for these, never a reading built
   * without the cycle's last stint.
   */
  status: CycleClockStatus;
  /** Reads the cycle's end again after a failure. */
  retry: () => void;
}

/**
 * The time bounds every one-cycle chart shares: a finalized cycle ends at its
 * finalization (read from the cycle's record), the live one at "now" (the
 * server's clock, the browser's until it answers). One hook, so the
 * Endurance, Calibration Window and method-mix charts end a cycle at the
 * same moment and none of them draws before that moment is known.
 */
export function useCycleClock(round: number, isLive: boolean): CycleClock {
  const hydrated = useHydrated();
  const finalized = round >= 0 && !isLive;
  const info = useRoundInfo(finalized ? round : -1);
  const { data: serverNow } = useCurrentTime();
  const clientNow = Math.floor(useNow(60_000) / 1000);
  const retry = () => void info.refetch();

  if (!finalized) {
    const now = !hydrated ? 0 : serverNow && serverNow > 0 ? serverNow : clientNow;
    return {
      endTs: 0,
      nowTs: isLive ? Math.floor(now / 60) * 60 : 0,
      status: isLive && !hydrated ? 'loading' : 'ready',
      retry,
    };
  }

  const endTs = toFiniteNumber(info.data?.TimeStamp) ?? 0;
  const status: CycleClockStatus = info.isLoading
    ? 'loading'
    : info.isError || endTs <= 0
      ? 'error'
      : 'ready';
  return { endTs: status === 'ready' ? endTs : 0, nowTs: 0, status, retry };
}
