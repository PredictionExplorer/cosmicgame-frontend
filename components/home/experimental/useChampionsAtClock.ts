'use client';

import { useMemo } from 'react';

import {
  deriveChampionsState,
  type ChampionsState,
  type LatestParticipantEvidence,
} from '@/hooks/useChampions';
import { useSpecialAllocationSnapshot } from '@/hooks/useSpecialAllocationSnapshot';
import type { SpecialRecipients } from '@/services/api/types';

/**
 * The cycle's contested roles (as `useChampions` derives them), measured
 * against the page's own clock instead of the shared ticker. The ticker reads
 * 0 during server rendering and hydration, which painted a confident
 * "Current hold 0s" beside "2 hours ago"; the page clock is the
 * server-sampled time there (the instant the countdown uses) and the live
 * ticker once it runs, so the standings, the clock and the relative times
 * agree. A `nowMs` of 0 means no clock is known, and the ledger renders
 * pending figures for it.
 */
export function useChampionsAtClock({
  initialData,
  latestParticipantEvidence,
  enabled,
  nowMs,
}: {
  initialData?: SpecialRecipients | null;
  latestParticipantEvidence?: LatestParticipantEvidence;
  enabled: boolean;
  nowMs: number;
}): ChampionsState {
  const { snapshot, isLoading } = useSpecialAllocationSnapshot(initialData, enabled);
  return useMemo(
    () =>
      deriveChampionsState({
        data: snapshot,
        isLoading,
        nowMs,
        latestParticipantEvidence,
      }),
    [snapshot, isLoading, nowMs, latestParticipantEvidence],
  );
}
