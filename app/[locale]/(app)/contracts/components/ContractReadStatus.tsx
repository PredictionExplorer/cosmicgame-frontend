'use client';

import { getLiveFreshness } from '@/lib/liveFreshness';
import { useNow } from '@/hooks/useNow';
import { LiveStatusView } from '@/components/ui/live-status-view';

/** What a polled contract read last did. */
export interface ContractReadHealth {
  /** When the read last succeeded (epoch ms); `null` before the first success. */
  lastSuccessAtMs: number | null;
  /** The latest attempt failed. */
  lastAttemptFailed: boolean;
}

/**
 * The freshness stamp of values this page polls from the contracts
 * directly (not through the query cache that `LiveStatus` reads): "Live"
 * while the reads succeed, "Updated 2 min ago" once they stall, reconnecting
 * after a failure. It uses the shared freshness model, and its dot holds
 * still: nothing on /contracts is the page's one breathing live signal.
 */
export function ContractReadStatus({
  health,
  pollIntervalMs,
}: {
  health: ContractReadHealth;
  pollIntervalMs: number;
}) {
  const nowMs = useNow(1_000);
  const online = typeof navigator === 'undefined' ? true : navigator.onLine;
  const state =
    nowMs > 0
      ? getLiveFreshness({
          lastSuccessAtMs: health.lastSuccessAtMs,
          lastAttemptFailed: health.lastAttemptFailed,
          online,
          pollIntervalMs,
          nowMs,
        })
      : 'connecting';
  const ageMs = health.lastSuccessAtMs && nowMs > 0 ? nowMs - health.lastSuccessAtMs : 0;
  // Still, but the page's one stamp: it still speaks its changes.
  return <LiveStatusView state={state} ageMs={ageMs} variant="inline" still announce />;
}
