'use client';

import { useEffect, useState } from 'react';

const PULSE_DURATION_MS = 950;

/**
 * One-shot UI pulse: returns true for ~950ms whenever `pulseKey` changes to a
 * new positive value (e.g. a BidPlaced event counter). Uses the render-time
 * state-adjustment idiom instead of setState-in-effect.
 */
export function useLivePulse(pulseKey: number): boolean {
  const [lastPulseKey, setLastPulseKey] = useState(pulseKey);
  const [isPulsing, setIsPulsing] = useState(false);

  if (pulseKey !== lastPulseKey) {
    setLastPulseKey(pulseKey);
    if (pulseKey > 0) setIsPulsing(true);
  }

  useEffect(() => {
    if (!isPulsing) return undefined;
    const timeoutId = window.setTimeout(() => setIsPulsing(false), PULSE_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isPulsing]);

  return isPulsing;
}
