'use client';

import { useCallback, useEffect, useState } from 'react';

import { sameAddress } from '@/utils/format';

/** How long the "your Gesture landed" moment stays on the surfaces that show it. */
export const LANDED_MOMENT_MS = 8_000;

/**
 * The connected wallet's latest change of position within a cycle: its
 * Gesture landed and it now holds the Last Gesture, or another participant's
 * Gesture took that place from it.
 */
export interface PositionMoment {
  kind: 'landed' | 'taken';
  /** Who took the place (for `taken`). */
  by: string | null;
  /** When the change was seen, in the page's clock (epoch ms). */
  atMs: number;
}

interface Baseline {
  account: string | null;
  cycle: number | null;
  /** Whether the wallet held the Last Gesture at the last observation; null before one. */
  isLatest: boolean | null;
  /** The highest Gesture count seen this cycle; null before one. */
  peakCount: number | null;
}

export interface UsePositionMomentArgs {
  account: string | null | undefined;
  /** The dashboard's latest participant; undefined while it is unknown. */
  latestAddress: string | null | undefined;
  cycle: number | null | undefined;
  /**
   * This cycle's Gesture count; undefined or null while unknown. A change of
   * holder is a moment only when the count rose past anything seen before,
   * so an index that falls back or catches up never reads as one.
   */
  gestureCount: number | null | undefined;
  /** The page's clock, which stamps the moment. */
  nowMs: number;
}

export interface UsePositionMomentResult {
  isLatest: boolean;
  moment: PositionMoment | null;
  /** Clears the moment (the person read the "place taken" notice). */
  dismiss: () => void;
}

/**
 * Watches the Last Gesture for the connected wallet and reports the two
 * moments that matter to it: its own Gesture landing, and someone taking its
 * place. Only a change seen while the page is open counts — loading the page,
 * connecting a wallet or a new cycle sets a fresh baseline without a moment —
 * so a returning participant is never told their place "was just taken".
 * And only a new Gesture moves a place: a holder that changes while the
 * cycle's count does not rise past its highest reading (an overlay giving way
 * to a lagging index, the index catching up) is a correction, not a moment.
 * `landed` fades after LANDED_MOMENT_MS; `taken` stays until dismissed or
 * until the wallet takes the place back.
 */
export function usePositionMoment({
  account,
  latestAddress,
  cycle,
  gestureCount,
  nowMs,
}: UsePositionMomentArgs): UsePositionMomentResult {
  const wallet = account ?? null;
  const cycleNumber = cycle ?? null;
  const known = latestAddress !== undefined && latestAddress !== null && latestAddress !== '';
  const isLatest = !!wallet && sameAddress(wallet, latestAddress);
  const count =
    typeof gestureCount === 'number' && Number.isFinite(gestureCount) ? gestureCount : null;
  // The holder and the count are observed together, so a count that arrives
  // before its holder cannot use up the rise that makes the change a moment.
  const observedCount = known ? count : null;

  const [baseline, setBaseline] = useState<Baseline>({
    account: wallet,
    cycle: cycleNumber,
    isLatest: known ? isLatest : null,
    peakCount: observedCount,
  });
  const [moment, setMoment] = useState<PositionMoment | null>(null);

  const rose =
    observedCount !== null && (baseline.peakCount === null || observedCount > baseline.peakCount);

  // Render-time state adjustment: compare with the last observation and
  // record at most one transition per change of the Last Gesture.
  if (baseline.account !== wallet || baseline.cycle !== cycleNumber) {
    setBaseline({
      account: wallet,
      cycle: cycleNumber,
      isLatest: known ? isLatest : null,
      peakCount: observedCount,
    });
    if (moment) setMoment(null);
  } else if (known && (baseline.isLatest !== isLatest || rose)) {
    setBaseline({
      ...baseline,
      isLatest,
      peakCount: rose ? observedCount : baseline.peakCount,
    });
    const newGesture = rose && baseline.peakCount !== null;
    if (wallet && baseline.isLatest !== null && baseline.isLatest !== isLatest && newGesture) {
      setMoment(
        isLatest
          ? { kind: 'landed', by: null, atMs: nowMs }
          : { kind: 'taken', by: latestAddress ?? null, atMs: nowMs },
      );
    }
  }

  useEffect(() => {
    if (moment?.kind !== 'landed') return undefined;
    const id = window.setTimeout(() => setMoment(null), LANDED_MOMENT_MS);
    return () => window.clearTimeout(id);
  }, [moment]);

  const dismiss = useCallback(() => setMoment(null), []);

  return { isLatest, moment, dismiss };
}
