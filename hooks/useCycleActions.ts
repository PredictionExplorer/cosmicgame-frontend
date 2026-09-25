'use client';

import { useCallback, useEffect, useState } from 'react';
import { zeroAddress } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { readRandomWalkLink } from '@/components/home/gestureInput';
import type { useAllocationFinalize } from '@/hooks/useAllocationFinalize';
import { useReturnResync } from '@/hooks/useDeadlineWatch';
import { useEndgameChainSync } from '@/hooks/useEndgameChainSync';
import type { useGestureForm } from '@/hooks/useGestureForm';
import { invalidateLiveGameQueries } from '@/hooks/useLiveGameDataRefresh';
import { useNotify } from '@/hooks/useNotify';
import { usePendingChatMessages } from '@/hooks/usePendingChatMessages';
import {
  trackFinalizeSubmitted,
  trackGestureSubmitted,
  type GestureSurface,
} from '@/lib/gameAnalytics';
import {
  UX_SCENARIO_DEMO_ACCOUNT,
  simulateUxScenarioGesture,
  useUxScenarioSnapshot,
} from '@/lib/uxCycleScenarios';
import type { DashboardInfo, GestureInfo } from '@/services/api';
import { reportError } from '@/utils/errors';
import { sameAddress } from '@/utils/format';

export interface UseCycleActionsOptions {
  /** The dashboard as every surface reads it (with the wallet's own confirmed Gesture applied). */
  data: DashboardInfo | null | undefined;
  loading: boolean;
  /** The page clock, in epoch ms. */
  now: number;
  /** Server clock minus client clock, in ms. */
  offset: number;
  account: string | null | undefined;
  gestureForm: ReturnType<typeof useGestureForm>;
  allocationFinalize: ReturnType<typeof useAllocationFinalize>;
  /** The chat's indexed rows, which retire an optimistic message once they include it. */
  chatGestures: GestureInfo[];
  /** Records the wallet's confirmed Gesture for every surface (useOwnGestureOverlay). */
  recordOwnGesture: (address: string, offsetMs: number) => void;
  /** Called after a confirmed Gesture and the shared refresh (the page closes its sheet). */
  onGestureConfirmed?: (source: GestureSurface) => void;
}

export interface CycleActions {
  /** The zero-cross is verified on-chain and the tab's deadline is fresh. */
  finalizationConfirmed: boolean;
  /** A Gesture can be made now (the clock runs, or this wallet is not the Last Gesture). */
  canGesture: boolean;
  /** The cycle can be finalized now, verified on-chain. */
  canClaim: boolean;
  /** Epoch ms after which any wallet, not only the Last Gesture holder, may finalize. */
  claimWait: number;
  /** Changes whenever a Gesture lands (this wallet's or, through the feed, anyone's). */
  gesturePulseKey: number;
  /** This wallet's messages until the indexer echoes them. */
  pendingMessages: ReturnType<typeof usePendingChatMessages>['pending'];
  handleGesture: (source?: GestureSurface) => Promise<void>;
  handleFinalize: (source?: GestureSurface) => Promise<void>;
}

/**
 * The cycle's transaction path in one place, for every page that lets a
 * participant act on the live cycle: when a Gesture or Finalize may be sent,
 * sending them, and everything that must follow a confirmed one (the
 * wallet's own Gesture on every surface, its optimistic chat row with the
 * transaction hash, the live-data refresh, and, after finalizing, clearing
 * the recipients read the backend refuses during rollover). It also applies
 * the Random Walk collection's deep link once. Two pages that wire this by
 * hand drift apart; a fix to the money-moving path lands here once.
 */
export function useCycleActions({
  data,
  loading,
  now,
  offset,
  account,
  gestureForm,
  allocationFinalize,
  chatGestures,
  recordOwnGesture,
  onGestureConfirmed,
}: UseCycleActionsOptions): CycleActions {
  const tToast = useTranslations('toasts');
  const queryClient = useQueryClient();
  const { notify } = useNotify();
  const uxScenario = useUxScenarioSnapshot();
  const {
    gestureType,
    message,
    onGesture,
    onGestureWithCST,
    getLastGestureHash,
    setBidType,
    setMessage,
    setRwlkId,
  } = gestureForm;
  const { allocationTime, timeoutFinalize, fetchActivationTime, onFinalize } = allocationFinalize;

  // Final-minute synchronizer: 1s direct-chain reads (racing both RPC nodes,
  // ETL/backend bypassed) that keep the countdown target, last bidder, and
  // claim state within ~1-2s of on-chain reality around the zero-cross.
  const endgame = useEndgameChainSync({ targetMs: allocationTime });
  // A tab that returns with a stale deadline holds "ready" until a fresh
  // reading lands: a Gesture may have moved it while the tab was hidden, and
  // a Finalize sent from the stale reading would revert and still cost gas.
  const returnResync = useReturnResync();
  const finalizationConfirmed = !endgame.isConfirmationPending && !returnResync;

  // Addresses compare case-insensitively (utils/address): a wallet may
  // report lowercase where the API returns the checksummed form.
  const canGesture = allocationTime > now || !sameAddress(data?.LastBidderAddr, account);
  // The claim action additionally waits for the on-chain zero-cross
  // confirmation, so a last-second Gesture can't leave anyone clicking into
  // a revert.
  const canClaim =
    !(allocationTime > now || data?.LastBidderAddr === zeroAddress || loading) &&
    finalizationConfirmed;
  const claimWait = allocationTime + timeoutFinalize * 1000;

  const [gesturePulseKey, setGesturePulseKey] = useState(0);
  const pulse = useCallback(() => setGesturePulseKey((value) => value + 1), []);
  useEffect(() => {
    window.addEventListener('cosmic:gesture-placed', pulse);
    return () => window.removeEventListener('cosmic:gesture-placed', pulse);
  }, [pulse]);

  const withPostTxRefresh = useCallback(
    (retryMs = 1500, activationMs = 3000, includeCurrentSpecialRecipients = true) => {
      // During rollover the backend answers the current recipients read with
      // a 400: after finalizing it is cleared, never refetched into an error.
      if (!includeCurrentSpecialRecipients) {
        void queryClient.cancelQueries({ queryKey: ['currentSpecialWinners'] });
        queryClient.setQueryData(['currentSpecialWinners'], null);
      }
      void invalidateLiveGameQueries(queryClient, { includeCurrentSpecialRecipients }).catch((e) =>
        reportError(e, 'refresh live data'),
      );
      setMessage('');
      setTimeout(() => {
        void invalidateLiveGameQueries(queryClient, { includeCurrentSpecialRecipients }).catch(
          (e) => reportError(e, 'retry live data'),
        );
      }, retryMs);
      setTimeout(() => {
        fetchActivationTime().catch((e) => reportError(e, 'fetchActivationTime'));
      }, activationMs);
    },
    [fetchActivationTime, queryClient, setMessage],
  );

  // Optimistic chat rows until the indexer echoes them (F221).
  const { pending: pendingMessages, record: recordPendingMessage } =
    usePendingChatMessages(chatGestures);

  const handleGesture = useCallback(
    async (source: GestureSurface = 'panel') => {
      const trimmedMessage = message.trim();
      if (uxScenario) {
        const nextScenario = simulateUxScenarioGesture({
          bidder: account ?? UX_SCENARIO_DEMO_ACCOUNT,
          gestureType: gestureType as 'ETH' | 'RandomWalk' | 'CST',
          message,
        });
        if (nextScenario) {
          setMessage('');
          pulse();
          notify(
            'success',
            tToast('gesture.simulated', { seconds: nextScenario.extensionSeconds }),
          );
        }
        return;
      }
      if (!(await (gestureType === 'CST' ? onGestureWithCST() : onGesture()))) return;
      trackGestureSubmitted({ source, method: gestureType, hasMessage: trimmedMessage !== '' });
      if (trimmedMessage && account) {
        recordPendingMessage(account, trimmedMessage, getLastGestureHash());
      }
      // The receipt is in: the wallet holds the Last Gesture. Record it for
      // every surface at once, which also reads the chain directly so the
      // clock extends from the contract's own deadline instead of waiting for
      // the next indexed poll.
      pulse();
      if (account) recordOwnGesture(account, offset);
      withPostTxRefresh();
      onGestureConfirmed?.(source);
    },
    [
      account,
      getLastGestureHash,
      gestureType,
      message,
      notify,
      offset,
      onGesture,
      onGestureConfirmed,
      onGestureWithCST,
      pulse,
      recordOwnGesture,
      recordPendingMessage,
      setMessage,
      tToast,
      uxScenario,
      withPostTxRefresh,
    ],
  );

  const handleFinalize = useCallback(
    async (source: GestureSurface = 'clock') => {
      if (!(await onFinalize())) return;
      trackFinalizeSubmitted(source);
      withPostTxRefresh(1000, 3000, false);
    },
    [onFinalize, withPostTxRefresh],
  );

  // Deep link from the Random Walk collection (?randomwalk=1&tokenId=N).
  // Read via window.location in an effect, NOT the next/navigation
  // search-params hook: on a statically generated route that hook forces a
  // bailout to client-side rendering, which throws away the server-rendered
  // HTML (guarded by home-rendering-policy and the no-JS e2e). A token id
  // that is not a whole number is ignored, and the form keeps a linked token
  // only while it is one of the wallet's unused Random Walk NFTs.
  useEffect(() => {
    const link = readRandomWalkLink(window.location.search);
    if (!link) return;
    setBidType('RandomWalk');
    if (link.tokenId != null) setRwlkId(link.tokenId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a one-time read of the landing URL
  }, []);

  return {
    finalizationConfirmed,
    canGesture,
    canClaim,
    claimWait,
    gesturePulseKey,
    pendingMessages,
    handleGesture,
    handleFinalize,
  };
}
