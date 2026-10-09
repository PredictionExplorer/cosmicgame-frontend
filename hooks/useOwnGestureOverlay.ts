'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { EndgameChainSample } from '@/lib/rpcRace';
import type { DashboardInfo } from '@/services/api';
import { sameAddress } from '@/utils/format';

/**
 * How long the wallet's own confirmed Gesture stands in for an index that
 * lags before the chain is asked again whether the wallet still holds it.
 */
export const OWN_GESTURE_OVERLAY_MS = 120_000;

/**
 * The connected wallet's Gesture, confirmed on-chain but not yet in the
 * indexed dashboard.
 */
export interface OwnGesture {
  address: string;
  cycle: number;
  /** The Gesture count once this Gesture is included. */
  count: number;
  /** Unix seconds: the block time from a chain sample, or the page clock. */
  timestampSec: number;
  /** When the overlay was recorded or last confirmed by the chain (epoch ms). */
  confirmedAtMs: number;
}

/**
 * The dashboard as every surface should read it: the wallet's own Gesture
 * counted and holding the Last Gesture until the index includes it.
 */
export function overlayOwnGesture(
  dashboard: DashboardInfo | null,
  own: OwnGesture | null,
): DashboardInfo | null {
  if (!dashboard || !own) return dashboard;
  if (dashboard.CurRoundNum !== own.cycle) return dashboard;
  if ((dashboard.CurNumBids ?? 0) >= own.count) return dashboard;
  return { ...dashboard, CurNumBids: own.count, LastBidderAddr: own.address };
}

export interface UseOwnGestureOverlayArgs {
  dashboard: DashboardInfo | null;
  /** A direct chain read; null when no contract address is known yet. */
  readChain: (() => Promise<EndgameChainSample>) | null;
  /** Every chain sample for the overlay's cycle (the deadline, the block time). */
  onChainSample?: (sample: EndgameChainSample) => void;
  /** The index caught up with the wallet's Gesture. */
  onIndexed?: (address: string) => void;
  /** Reports a failed chain read. */
  onError?: (error: unknown, context: string) => void;
}

export interface UseOwnGestureOverlayResult {
  /** The dashboard with the wallet's own Gesture overlaid while the index lags. */
  data: DashboardInfo | null;
  own: OwnGesture | null;
  /** The overlay is standing in for the index. */
  pending: boolean;
  /** The receipt is in: count the Gesture now. `offsetMs` maps the page clock to the chain's. */
  record: (address: string, offsetMs: number) => void;
}

/**
 * The wallet's own confirmed Gesture, shown on every surface the moment its
 * receipt arrives and kept until the index counts it (F221).
 *
 * An index that lags longer than OWN_GESTURE_OVERLAY_MS is not taken as
 * proof the Gesture was displaced: the chain is read again, and the overlay
 * stays while the contract still names the wallet as the Last Gesture. It
 * goes only when the chain names someone else, the cycle moved on, or the
 * chain cannot be read, so the page never falls back to the previous holder
 * (and tells the wallet its place was taken) while it still holds it.
 */
export function useOwnGestureOverlay({
  dashboard,
  readChain,
  onChainSample,
  onIndexed,
  onError,
}: UseOwnGestureOverlayArgs): UseOwnGestureOverlayResult {
  const [own, setOwn] = useState<OwnGesture | null>(null);
  const [indexed, setIndexed] = useState<{ address: string } | null>(null);
  // Render-time adjustment: the index caught up (or a new cycle began), so
  // the overlay has nothing left to stand in for.
  if (own && dashboard && overlayOwnGesture(dashboard, own) === dashboard) {
    setOwn(null);
    setIndexed({ address: own.address });
  }
  const data = useMemo(() => overlayOwnGesture(dashboard, own), [dashboard, own]);
  const pending = data !== dashboard;

  // Read by `record`, so a second Gesture before the index catches up counts
  // on top of the first rather than on the stale indexed count.
  const dataRef = useRef(data);
  const callbacks = useRef({ readChain, onChainSample, onIndexed, onError });
  useEffect(() => {
    dataRef.current = data;
    callbacks.current = { readChain, onChainSample, onIndexed, onError };
  });

  useEffect(() => {
    if (indexed) callbacks.current.onIndexed?.(indexed.address);
  }, [indexed]);

  useEffect(() => {
    if (!own) return undefined;
    let cancelled = false;
    const drop = () => {
      if (!cancelled) setOwn((current) => (current === own ? null : current));
    };
    const expiresIn = own.confirmedAtMs + OWN_GESTURE_OVERLAY_MS - Date.now();
    const id = window.setTimeout(
      () => {
        const read = callbacks.current.readChain;
        if (!read) {
          drop();
          return;
        }
        read()
          .then((sample) => {
            if (cancelled) return;
            if (sample.roundNum !== own.cycle) {
              drop();
              return;
            }
            callbacks.current.onChainSample?.(sample);
            if (sameAddress(sample.lastBidderAddress, own.address)) {
              // Still the Last Gesture on-chain: keep standing in for the index.
              setOwn((current) =>
                current === own ? { ...own, confirmedAtMs: Date.now() } : current,
              );
            } else {
              drop();
            }
          })
          .catch((error: unknown) => {
            callbacks.current.onError?.(error, 'own gesture overlay check');
            drop();
          });
      },
      Math.max(0, expiresIn),
    );
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [own]);

  const record = useCallback((address: string, offsetMs: number) => {
    const base = dataRef.current;
    if (!base) return;
    const confirmedAtMs = Date.now();
    const next: OwnGesture = {
      address,
      cycle: base.CurRoundNum,
      count: (base.CurNumBids ?? 0) + 1,
      timestampSec: Math.floor((confirmedAtMs + offsetMs) / 1000),
      confirmedAtMs,
    };
    setOwn(next);
    const read = callbacks.current.readChain;
    if (!read) return;
    // Read the chain directly so the clock extends from the contract's own
    // deadline and the hold starts at the block time.
    read()
      .then((sample) => {
        if (sample.roundNum !== next.cycle) return;
        callbacks.current.onChainSample?.(sample);
        if (sameAddress(sample.lastBidderAddress, next.address)) {
          setOwn((current) =>
            current === next ? { ...next, timestampSec: sample.blockTimestampSec } : current,
          );
        }
      })
      .catch((error: unknown) => callbacks.current.onError?.(error, 'post-gesture chain sample'));
  }, []);

  return { data, own, pending, record };
}
