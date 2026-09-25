'use client';

import { useCallback } from 'react';

import { useDashboardInfo } from '@/hooks/useApiQuery';

/**
 * Where a cycle number in a ledger leads. The cycle in progress has no
 * allocation record yet (its /allocation page only says it is not
 * finalized), so it leads to /current-cycle; a finalized cycle leads to its
 * allocation record. While the live cycle is unknown, every cycle leads to
 * its record, as before.
 */
export function cycleHref(cycle: number, liveCycle: number | null | undefined): string {
  return typeof liveCycle === 'number' && cycle === liveCycle
    ? '/current-cycle'
    : `/allocation/${cycle}`;
}

/**
 * The cycle open now, as the chain counts it: the shared dashboard read's
 * `CurRoundNum`, `null` until it is read. The one definition of the live
 * cycle: cycle links, and the pages that say whether a cycle is still open
 * (`useLiveCycle` in components/winnings/missingCycle), read it. A ledger
 * reads it once rather than polling; a live page on the same screen keeps
 * the shared read fresh.
 */
export function useDashboardLiveCycle(): number | null {
  const { data } = useDashboardInfo(undefined, { poll: false });
  return typeof data?.CurRoundNum === 'number' ? data.CurRoundNum : null;
}

/** `cycleHref` bound to the live cycle (`useDashboardLiveCycle`). */
export function useCycleHref(): (cycle: number) => string {
  const liveCycle = useDashboardLiveCycle();
  return useCallback((cycle: number) => cycleHref(cycle, liveCycle), [liveCycle]);
}
