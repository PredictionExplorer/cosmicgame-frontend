'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useAllocationNotification } from '@/hooks/useAllocationNotification';
import { fetchEndgameChainSample } from '@/lib/rpcRace';

export interface UseVerifiedFinalizationAlertArgs {
  /** The finalization deadline the page shows, in epoch ms (0 while unknown). */
  allocationTime: number;
  /** The cycle the deadline belongs to; null while unknown. */
  cycleNumber: number | null;
}

/**
 * The opt-in "finalization soon" alert of a page that shows the live cycle
 * (the bell menu turns it on per browser), with its chain check (F220).
 * Before the alert fires, the time left is re-read from the contract: a
 * Gesture may have moved the deadline while the tab was hidden, and the
 * alert must never fire on a stale one. The fresh deadline and block time
 * are written back to the page's queries; a cycle that already moved on
 * reads as nothing left to warn about.
 */
export function useVerifiedFinalizationAlert({
  allocationTime,
  cycleNumber,
}: UseVerifiedFinalizationAlertArgs): void {
  const t = useTranslations('home');
  const queryClient = useQueryClient();
  const { cosmicGame } = useContractAddresses();

  const verifyRemainingMs = useCallback(async (): Promise<number | null> => {
    if (!cosmicGame) return null;
    const sample = await fetchEndgameChainSample(cosmicGame);
    // Another cycle already: this one finalized, nothing is left to warn about.
    if (cycleNumber == null || sample.roundNum !== cycleNumber) return 0;
    queryClient.setQueryData(['allocationTime'], sample.mainPrizeTimeSec);
    queryClient.setQueryData(['currentTime'], sample.blockTimestampSec);
    return (sample.mainPrizeTimeSec - sample.blockTimestampSec) * 1000;
  }, [cycleNumber, cosmicGame, queryClient]);

  useAllocationNotification({
    allocationTime,
    cycleNumber,
    notificationTitle: t('notifications.finalizationSoonTitle'),
    notificationBody: (minutesLeft) =>
      t('notifications.finalizationSoonBody', { minutes: minutesLeft }),
    verifyRemainingMs,
  });
}
