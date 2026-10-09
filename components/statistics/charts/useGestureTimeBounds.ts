'use client';

import { useState } from 'react';

// lexicon-allow-start: the hook name mirrors the backend route statistics/bidding/time_bounds
import { useBidTimeBounds as useTimeBoundsQuery } from '@/hooks/useApiQuery';
// lexicon-allow-end

import { gestureSpan, type GestureSpan } from './activityRanges';

export interface GestureTimeBounds extends GestureSpan {
  /**
   * False while the bounds are being read. The all-time charts wait for
   * them, so they never query a placeholder range whose answer is thrown
   * away the moment the real one arrives.
   */
  settled: boolean;
}

/**
 * The span of the indexed gesture history that the all-time activity charts
 * (frequency, spikes, active periods) query (`gestureSpan`). When the bounds
 * cannot be read, or report nothing, it falls back to the year before the
 * moment the page mounted: a frozen "now", so the charts' query keys hold
 * still instead of moving, and the charts reloading, every minute.
 */
export function useGestureTimeBounds(enabled = true): GestureTimeBounds {
  const { data, isPending } = useTimeBoundsQuery(enabled);
  const [mountedAt] = useState(() => Math.floor(Date.now() / 1000));
  return { ...gestureSpan(data, mountedAt), settled: enabled && !isPending };
}
