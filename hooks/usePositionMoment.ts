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
}

export interface UsePositionMomentArgs {
  account: string | null | undefined;
  /** The dashboard's latest participant; undefined while it is unknown. */
  latestAddress: string | null | undefined;
  cycle: number | null | undefined;
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
 * `landed` fades after LANDED_MOMENT_MS; `taken` stays until dismissed or
 * until the wallet takes the place back.
 */
export function usePositionMoment({
  account,
  latestAddress,
  cycle,
  nowMs,
}: UsePositionMomentArgs): UsePositionMomentResult {
  const wallet = account ?? null;
  const cycleNumber = cycle ?? null;
  const known = latestAddress !== undefined && latestAddress !== null && latestAddress !== '';
  const isLatest = !!wallet && sameAddress(wallet, latestAddress);

  const [baseline, setBaseline] = useState<Baseline>({
    account: wallet,
    cycle: cycleNumber,
    isLatest: known ? isLatest : null,
  });
  const [moment, setMoment] = useState<PositionMoment | null>(null);

  // Render-time state adjustment: compare with the last observation and
  // record at most one transition per change of the Last Gesture.
  if (baseline.account !== wallet || baseline.cycle !== cycleNumber) {
    setBaseline({ account: wallet, cycle: cycleNumber, isLatest: known ? isLatest : null });
    if (moment) setMoment(null);
  } else if (known && baseline.isLatest !== isLatest) {
    setBaseline({ ...baseline, isLatest });
    if (wallet && baseline.isLatest !== null) {
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
