'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import api from '@/services/api';
import type { GestureInfo, UserInfoWithLists } from '@/services/api';
import { useApiData } from '@/contexts/ApiDataContext';
import { useNotifyRedBox } from '@/hooks/useApiQuery';
import { summarizePendingRetrievals } from '@/lib/pendingRetrievals';
import { getCstGestureCost, getEthGestureCost, resolveGestureType } from '@/utils/gesturePayment';

/** One wallet's Gestures in one cycle and what they cost, never adding ETH and CST together. */
export interface CycleParticipationSummary {
  gestures: number;
  spentEth: number;
  spentCst: number;
}

export type CycleParticipation =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | ({ status: 'ready' } & CycleParticipationSummary);

/** Sums a wallet's Gestures of `cycle` from its indexed history. */
export function summarizeCycleParticipation(
  gestures: readonly GestureInfo[] | null | undefined,
  cycle: number,
): CycleParticipationSummary {
  let count = 0;
  let spentEth = 0;
  let spentCst = 0;
  for (const gesture of gestures ?? []) {
    if (gesture.RoundNum !== cycle) continue;
    count += 1;
    if (resolveGestureType(gesture) === 2) spentCst += getCstGestureCost(gesture) ?? 0;
    else spentEth += getEthGestureCost(gesture) ?? 0;
  }
  return { gestures: count, spentEth, spentCst };
}

/**
 * The connected wallet's Gestures this cycle and what they spent, from its
 * indexed history (`user/info`). The read is large for long histories, so it
 * is taken once per wallet and refreshed only when asked (after the wallet's
 * own Gesture is indexed), never polled. While it loads or after it fails the
 * figures are unknown, never a confident zero.
 */
export function useCycleParticipation(
  account: string | null | undefined,
  cycle: number | null | undefined,
): CycleParticipation & { refetch: () => void } {
  const query = useQuery<UserInfoWithLists | null>({
    queryKey: ['userInfo', account],
    queryFn: ({ signal }) => api.get_user_info(account!, { signal }),
    enabled: !!account,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const { data, isError, refetch } = query;

  return useMemo(() => {
    const retry = () => void refetch();
    if (data && cycle != null && cycle >= 0) {
      return {
        status: 'ready' as const,
        ...summarizeCycleParticipation(data.Gestures, cycle),
        refetch: retry,
      };
    }
    if (isError) return { status: 'error' as const, retry, refetch: retry };
    return { status: 'loading' as const, refetch: retry };
  }, [cycle, data, isError, refetch]);
}

/** What the wallet can retrieve now. `unknown` covers a failed read: never "nothing". */
export type RetrieveStatus =
  | { state: 'loading' }
  | { state: 'unknown'; retry: () => void }
  | { state: 'none' }
  | { state: 'waiting'; eth: number; nfts: number };

/**
 * Whether anything waits for the wallet to retrieve, from the same query the
 * header's indicator reads. Before the first successful read it is loading;
 * a failed or unreadable response is unknown, so a participant with
 * allocations waiting is never told there is nothing.
 */
export function useRetrieveStatus(account: string | null | undefined): RetrieveStatus {
  const { data, isPending, isError, refetch } = useNotifyRedBox(account);
  // The same read, with the retrievable anchor actions the header also uses.
  const { apiData } = useApiData();
  const claimableActionIds = apiData.claimableActionIds;

  return useMemo<RetrieveStatus>(() => {
    const retry = () => void refetch();
    if (data) {
      const pending = summarizePendingRetrievals({ ...data, claimableActionIds });
      return pending.hasAny
        ? { state: 'waiting', eth: pending.eth + pending.anchorEth, nfts: pending.nfts }
        : { state: 'none' };
    }
    if (isPending && !isError) return { state: 'loading' };
    return { state: 'unknown', retry };
  }, [claimableActionIds, data, isError, isPending, refetch]);
}
