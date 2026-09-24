'use client';

import { useCallback, useEffect, useState } from 'react';

/** The query parameter that holds the page's cycle scope. */
export const CYCLE_PARAM = 'cycle';

/**
 * Parses `?cycle=N` into a cycle number, or null for the live cycle (absent,
 * malformed, negative, or not before the live one).
 */
export function parseCycleParam(search: string, liveCycle: number): number | null {
  const raw = new URLSearchParams(search).get(CYCLE_PARAM);
  if (raw === null || !/^\d+$/.test(raw)) return null;
  const cycle = Number(raw);
  return liveCycle >= 0 && cycle >= liveCycle ? null : cycle;
}

export interface CycleScope {
  /** The cycle the page's cycle charts show; -1 while the live cycle is unknown. */
  cycle: number;
  /** Whether that is the live cycle, which stays open at "now". */
  isLive: boolean;
  /** The live cycle, the newest selectable. */
  liveCycle: number;
  /** Shows `cycle`; the live cycle (or anything newer) follows the live cycle again. */
  setCycle: (cycle: number) => void;
}

/**
 * The one cycle scope of a statistics page, shared by every chart that shows
 * a single cycle, kept in `?cycle=` so a link opens the same view. Until the
 * reader picks a finished cycle it follows the live one, so a cycle that opens
 * while the page is open is picked up. The URL is read after hydration and
 * written with `history.replaceState`, which keeps the page statically
 * rendered and adds no history entries.
 */
export function useCycleScope(liveCycle: number): CycleScope {
  const [pinned, setPinned] = useState<number | null>(null);

  useEffect(() => {
    if (liveCycle < 0) return;
    // A link's ?cycle= is known only in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the URL once the live cycle is known.
    setPinned(parseCycleParam(window.location.search, liveCycle));
  }, [liveCycle]);

  const setCycle = useCallback(
    (next: number) => {
      const target = Math.max(0, Math.floor(next));
      const followLive = liveCycle >= 0 && target >= liveCycle;
      setPinned(followLive ? null : target);
      const url = new URL(window.location.href);
      if (followLive) url.searchParams.delete(CYCLE_PARAM);
      else url.searchParams.set(CYCLE_PARAM, String(target));
      window.history.replaceState(window.history.state, '', url);
    },
    [liveCycle],
  );

  const cycle = pinned ?? liveCycle;
  return { cycle, isLive: pinned === null, liveCycle, setCycle };
}
