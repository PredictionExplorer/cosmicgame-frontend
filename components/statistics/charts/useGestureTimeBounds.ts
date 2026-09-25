'use client';

import { useState } from 'react';

// lexicon-allow-start: the hook name mirrors the backend route statistics/bidding/time_bounds
import { useBidTimeBounds as useTimeBoundsQuery } from '@/hooks/useApiQuery';
// lexicon-allow-end

/** How far back the all-time charts look when the indexed history cannot be read. */
export const FALLBACK_LOOKBACK_SECS = 365 * 86_400;

export interface GestureTimeBounds {
  /** The first indexed gesture, Unix seconds. */
  firstTs: number;
  /** The latest indexed gesture, Unix seconds. */
  lastTs: number;
  /**
   * False while the bounds are being read. The all-time charts wait for
   * them, so they never query a placeholder range whose answer is thrown
   * away the moment the real one arrives.
   */
  settled: boolean;
}

/**
 * The span of the indexed gesture history that the all-time activity charts
 * (frequency, spikes, active periods) query. When the bounds cannot be read,
 * or report nothing, it falls back to the `FALLBACK_LOOKBACK_SECS` before the
 * moment the page mounted: a frozen "now", so the charts' query keys hold
 * still instead of moving, and the charts reloading, every minute.
 */
export function useGestureTimeBounds(enabled = true): GestureTimeBounds {
  const { data, isPending } = useTimeBoundsQuery(enabled);
  const [mountedAt] = useState(() => Math.floor(Date.now() / 1000));
  const lastTs = data?.MaxTs && data.MaxTs > 0 ? data.MaxTs : mountedAt;
  const firstTs = data?.MinTs && data.MinTs > 0 ? data.MinTs : lastTs - FALLBACK_LOOKBACK_SECS;
  return { firstTs, lastTs, settled: enabled && !isPending };
}
