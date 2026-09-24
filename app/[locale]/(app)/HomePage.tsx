'use client';

import { memo, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { zeroAddress } from 'viem';
import { ArrowRight } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { LazyMotion, domAnimation } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { reportError } from '@/utils/errors';
import { useNotify } from '@/hooks/useNotify';
import { ErrorState } from '@/components/ui/error-state';
import { AttentionMenu } from '@/components/ui/attention-menu';
import { PageShell } from '@/components/ui/page-shell';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useActiveWeb3React } from '@/hooks/web3';
import { CyclePhaseGuide, PHASE_GUIDE_LINK_CLASS } from '@/components/home/CyclePhaseGuide';
import { GestureMessageChat } from '@/components/home/GestureMessageChat';
import { deriveFeedSystemEvents } from '@/components/home/deck/feedSystemEvents';
import { ActionDock } from '@/components/home/observatory/ActionDock';
import { AllocationLedger } from '@/components/home/observatory/AllocationLedger';
import {
  AllocationsDisclosure,
  ControlDesk,
  DESK_REGION,
} from '@/components/home/observatory/ControlDesk';
import { HomeStory } from '@/components/home/observatory/HomeStory';
import { CycleClock } from '@/components/home/observatory/CycleClock';
import { CalibrationStatus } from '@/components/home/observatory/CalibrationStatus';
import { CycleStanding, CycleStandingPreview } from '@/components/home/observatory/CycleStanding';
import { GesturePanel } from '@/components/home/observatory/GesturePanel';
import { LatestSignature } from '@/components/home/observatory/LatestSignature';
import { PulseBar } from '@/components/home/observatory/PulseBar';
import { StandingsLedger } from '@/components/home/observatory/StandingsLedger';
import { getGestureSubmitParts } from '@/components/home/observatory/gestureSubmitLabel';
import { AttachedNFTAllocationShowcase } from '@/components/attachments/DonatedNFTPrizeShowcase';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useGestureForm } from '@/hooks/useGestureForm';
import { useHomeGestureFeed } from '@/hooks/useHomeGestureFeed';
import { useChampions } from '@/hooks/useChampions';
import { useAllocationFinalize } from '@/hooks/useAllocationFinalize';
import { useCycleParticipation, useRetrieveStatus } from '@/hooks/useCycleParticipation';
import { useEndgameChainSync } from '@/hooks/useEndgameChainSync';
import { useAllocationNotification } from '@/hooks/useAllocationNotification';
import { useAttentionPreferences } from '@/hooks/useAttentionPreferences';
import { useBackgroundDeadlineRefresh, useReturnResync } from '@/hooks/useDeadlineWatch';
import { useLiveFreshness } from '@/hooks/useLiveFreshness';
import { useGestureChime } from '@/hooks/useGestureChime';
import { useHomeAnnouncer } from '@/hooks/useHomeAnnouncer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { invalidateLiveGameQueries } from '@/hooks/useLiveGameDataRefresh';
import { useNow } from '@/hooks/useNow';
import { useOwnGestureOverlay } from '@/hooks/useOwnGestureOverlay';
import { usePendingChatMessages } from '@/hooks/usePendingChatMessages';
import { usePositionMoment } from '@/hooks/usePositionMoment';
import { useLatestSignatures } from '@/hooks/useLatestSignatures';
import { useTabTitleCountdown } from '@/hooks/useTabTitleCountdown';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import {
  trackChatJoinCtaClicked,
  trackFinalizeSubmitted,
  trackGestureSheetOpened,
  trackGestureSubmitted,
  type GestureSurface,
} from '@/lib/gameAnalytics';
import {
  useDashboardInfo,
  useCurrentTime,
  useDonationsNFTByRound,
  useDonationsERC20ByRound,
} from '@/hooks/useApiQuery';
import { deriveAllocationTrackAmounts } from '@/lib/allocationTracks';
import { getCycleState, getDashboardActivationTime } from '@/lib/cycleState';
import { resolveLatestGesture, type LatestParticipantEvidence } from '@/lib/latestGesture';
import { fetchEndgameChainSample, type EndgameChainSample } from '@/lib/rpcRace';
import { cn } from '@/lib/utils';
import { getStableClientTargetTime, type ServerTimingSample } from '@/utils/time';
import { sameAddress } from '@/utils/format';
import {
  UX_SCENARIO_DEMO_ACCOUNT,
  simulateUxScenarioGesture,
  useUxScenarioSnapshot,
} from '@/lib/uxCycleScenarios';
import type { CSTTokenInfo, DashboardInfo, GestureInfo, SpecialRecipients } from '@/services/api';
import { deriveLiveCstGestureData } from '@/utils/cstGesture';

// This page re-renders every second (useNow keeps countdown-derived CTA
// state honest). These sections never consume the tick, so memo boundaries
// stop the per-second reconciliation of the heaviest subtrees — the chat
// feed alone renders dozens of rows — which directly reduces main-thread
// churn (INP) on mid-range phones. Their props are kept referentially
// stable below (useMemo'd arrays, useCallback handlers).
const MemoGestureMessageChat = memo(GestureMessageChat);
const MemoAttachedNFTAllocationShowcase = memo(AttachedNFTAllocationShowcase);
const MemoLatestSignature = memo(LatestSignature);

/** The deadline's own read: the tab title trusts it while it keeps arriving. */
const DEADLINE_FRESHNESS_KEYS = [['allocationTime']] as const;

/** How long the sheet shows its confirmed state before it closes by itself. */
const SHEET_SUCCESS_CLOSE_MS = 1_600;

/** Where the page lists the NFTs and tokens attached to this cycle's Gestures. */
const ATTACHED_ASSETS_ID = 'home-attached-assets';

export function resolveHomeNow(
  tickingNow: number,
  timingSample?: Pick<ServerTimingSample, 'sampledAtMs'> | null,
  initialRenderAtMs = 0,
): number {
  return tickingNow || timingSample?.sampledAtMs || initialRenderAtMs;
}

interface HomePageProps {
  initialDashboardData?: DashboardInfo | null;
  /** The newest imprinted Signatures, so the plate ships in the SSR HTML. */
  initialLatestSignatures?: CSTTokenInfo[] | null;
  /** Server-seeded latest gesture so participant intelligence is complete on first paint. */
  initialLatestGesture?: GestureInfo | null;
  /** Server-seeded role snapshot; direct-chain fallback still takes over when required. */
  initialSpecialRecipients?: SpecialRecipients | null;
  /** Server clock + finalization sample keeps ISR and hydration on the same phase. */
  initialTimingSample?: ServerTimingSample | null;
  /** Unconditional SSR/hydration clock fallback when timing APIs are unavailable. */
  initialRenderAtMs?: number;
}

const HomePage = ({
  initialDashboardData = null,
  initialLatestSignatures = null,
  initialLatestGesture = null,
  initialSpecialRecipients = null,
  initialTimingSample = null,
  initialRenderAtMs = 0,
}: HomePageProps) => {
  const t = useTranslations('home');
  const tToast = useTranslations('toasts');
  const locale = useLocale();
  const { account } = useActiveWeb3React();
  const { cosmicGame } = useContractAddresses();
  const queryClient = useQueryClient();
  const { notify } = useNotify();
  const uxScenario = useUxScenarioSnapshot();
  const coherentInitialTimingSample =
    initialTimingSample &&
    (initialTimingSample.cycleNumber === undefined ||
      initialTimingSample.cycleNumber === initialDashboardData?.CurRoundNum)
      ? initialTimingSample
      : null;

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    isError: dashboardFailed,
    refetch: refetchDashboard,
  } = useDashboardInfo(initialDashboardData);
  const { data: currentTimeData, dataUpdatedAt: currentTimeUpdatedAt } = useCurrentTime(
    coherentInitialTimingSample?.currentServerTimeSec,
    coherentInitialTimingSample ? 0 : undefined,
  );

  // The wallet's own confirmed Gesture until the index includes it (F221):
  // every surface reads the dashboard through this overlay, so the count, the
  // Last Gesture, the hold, the dock and the standing agree the moment the
  // receipt arrives, and stay so while the chain still names the wallet.
  const readChain = useMemo(
    () => (cosmicGame ? () => fetchEndgameChainSample(cosmicGame) : null),
    [cosmicGame],
  );
  const storeChainSample = useCallback(
    (sample: EndgameChainSample) => {
      queryClient.setQueryData(['allocationTime'], sample.mainPrizeTimeSec);
      queryClient.setQueryData(['currentTime'], sample.blockTimestampSec);
    },
    [queryClient],
  );
  const {
    data,
    own: ownGesture,
    pending: ownGesturePending,
    record: recordOwnGesture,
  } = useOwnGestureOverlay({
    dashboard: dashboardData ?? null,
    readChain,
    onChainSample: storeChainSample,
    // The wallet's own history now includes the Gesture.
    onIndexed: (address) => void queryClient.invalidateQueries({ queryKey: ['userInfo', address] }),
    onError: reportError,
  });

  const round = data?.CurRoundNum ?? -1;
  const initialGestureList = useMemo(
    () =>
      initialLatestGesture && initialLatestGesture.RoundNum === round
        ? [initialLatestGesture]
        : undefined,
    [initialLatestGesture, round],
  );
  const feed = useHomeGestureFeed(round, initialGestureList);
  const { data: nftDonationsData } = useDonationsNFTByRound(round);
  const { data: erc20DonationsData } = useDonationsERC20ByRound(round);

  const loading = dashboardLoading;
  // Stable fallbacks: a bare `?? []` would mint a new array identity every
  // second (this page ticks via useNow) and defeat the memo boundaries.
  const curGestureList = feed.gestures;
  const chatGestures = feed.chatGestures;
  const chatPagination = useMemo(
    () => ({
      hasMore: feed.hasMore,
      isLoading: feed.isLoadingOlder,
      error: Boolean(feed.olderError),
      onLoadMore: feed.loadOlder,
    }),
    [feed.hasMore, feed.isLoadingOlder, feed.olderError, feed.loadOlder],
  );
  const donatedNFTs = useMemo(() => nftDonationsData ?? [], [nftDonationsData]);
  const donatedERC20Tokens = useMemo(() => erc20DonationsData ?? [], [erc20DonationsData]);

  // Re-renders every second so countdown comparisons (allocationTime > now,
  // claimWait > now, activationTime check) update without bare Date.now().
  const tickingNow = useNow(1000);
  // useNow intentionally returns 0 for the hydration snapshot. Reuse the
  // serialized timing sample for both SSR and the first client render so an
  // active cycle does not prerender as "opening soon" and then reshape the
  // control desk after hydration.
  const now = resolveHomeNow(tickingNow, coherentInitialTimingSample, initialRenderAtMs);
  const [clientClockAnchorMs, setClientClockAnchorMs] = useState(
    () => coherentInitialTimingSample?.sampledAtMs || initialRenderAtMs || Date.now(),
  );
  useEffect(() => {
    if (!coherentInitialTimingSample || currentTimeUpdatedAt > 0) return;
    setClientClockAnchorMs((current) =>
      current === coherentInitialTimingSample.sampledAtMs ? Date.now() : current,
    );
    // Re-anchor once after hydration. Keeping this out of render preserves
    // byte-identical SSR while avoiding persistent server/browser clock skew
    // when the immediate timing refetch fails.
  }, [coherentInitialTimingSample, currentTimeUpdatedAt]);
  const currentTimeAnchorMs = currentTimeUpdatedAt || clientClockAnchorMs;
  const latestResolution = useMemo(
    () =>
      resolveLatestGesture({
        dashboardLastAddress: data?.LastBidderAddr,
        gestures: feed.latestGesture ? [feed.latestGesture] : [],
      }),
    [feed.latestGesture, data?.LastBidderAddr],
  );
  const latestGesture = latestResolution.gesture;
  // Until the wallet's own Gesture is indexed, its block time is the evidence
  // for the hold, so the Last Gesture never reads "held 0s" after it lands.
  const latestEvidence = useMemo<LatestParticipantEvidence | undefined>(() => {
    if (
      ownGesture &&
      !latestResolution.gesture &&
      sameAddress(latestResolution.address, ownGesture.address)
    ) {
      return { address: ownGesture.address, timestamp: ownGesture.timestampSec };
    }
    return latestResolution.evidence;
  }, [latestResolution, ownGesture]);

  const offset = useMemo(() => {
    if (currentTimeData == null) return 0;
    return currentTimeData * 1000 - currentTimeAnchorMs;
  }, [currentTimeAnchorMs, currentTimeData]);

  const [gesturePulseKey, setGesturePulseKey] = useState(0);
  const imprintedTokenCount = dashboardData?.MainStats?.NumCSTokenMints ?? null;
  // The art is the newest imprints, newest first (F089): the server seeds the
  // list so the plate is in the HTML, and a finalization that imprints new
  // Signatures refetches it through the dashboard's imprint count.
  const latestSignatures = useLatestSignatures(imprintedTokenCount, initialLatestSignatures);

  const gestureForm = useGestureForm();
  const hasCurrentGesture = !!data && data.LastBidderAddr !== zeroAddress;
  // The page clock seeds the standings, so server rendering and hydration
  // measure holds against the same instant as the countdown (F007).
  const champions = useChampions(initialSpecialRecipients, latestEvidence, hasCurrentGesture, now);
  const allocationFinalize = useAllocationFinalize({
    data,
    offset,
    initialTimingSample: coherentInitialTimingSample,
  });
  const ethUsdPrice = useTokenPrice();

  // Attention settings (chime, alert before finalization, tab-title
  // countdown) are opt-in per browser: nothing sounds or notifies until the
  // viewer turns it on in the bell menu (useAttentionPreferences). The alert
  // re-reads the time left from the chain before it fires (F220).
  const alertCycle = dashboardData?.CurRoundNum ?? null;
  const verifyRemainingMs = useCallback(async (): Promise<number | null> => {
    if (!cosmicGame) return null;
    const sample = await fetchEndgameChainSample(cosmicGame);
    // Another cycle already: this one finalized, nothing is left to warn about.
    if (alertCycle == null || sample.roundNum !== alertCycle) return 0;
    queryClient.setQueryData(['allocationTime'], sample.mainPrizeTimeSec);
    queryClient.setQueryData(['currentTime'], sample.blockTimestampSec);
    return (sample.mainPrizeTimeSec - sample.blockTimestampSec) * 1000;
  }, [alertCycle, cosmicGame, queryClient]);
  useAllocationNotification({
    allocationTime: allocationFinalize.allocationTime,
    cycleNumber: alertCycle,
    notificationTitle: t('notifications.finalizationSoonTitle'),
    notificationBody: (minutesLeft) =>
      t('notifications.finalizationSoonBody', { minutes: minutesLeft }),
    verifyRemainingMs,
  });

  // Chime only for a connected viewer who opted in, when their Gesture was
  // just followed by someone else's.
  useGestureChime({
    account,
    lastGestureAddress: dashboardData?.LastBidderAddr,
    gestureCount: dashboardData?.CurNumBids,
  });

  const {
    gestureType,
    ethGestureInfo,
    cstGestureData,
    isGesturing,
    gestureTxStage,
    rwlkId,
    onGesture,
    onGestureWithCST,
    getLastGestureHash,
    setBidType,
    setMessage,
    setRwlkId,
  } = gestureForm;
  const cstDisplayNow =
    now > 0 && (!cstGestureData.updatedAtMs || now > cstGestureData.updatedAtMs) ? now : Date.now();
  const liveCstGestureData = useMemo(
    () => deriveLiveCstGestureData(cstGestureData, { nowMs: cstDisplayNow }),
    [cstDisplayNow, cstGestureData],
  );
  const {
    fetchActivationTime,
    allocationTime,
    timeoutFinalize,
    isClaiming,
    activationTime: chainActivationTime,
    onFinalize,
  } = allocationFinalize;
  const projectedDashboardActivationTime = useMemo(() => {
    const rawActivationTime = getDashboardActivationTime(data);
    if (rawActivationTime == null) return 0;
    const projectedTargetMs = getStableClientTargetTime({
      targetServerTimeSec: rawActivationTime,
      currentServerTimeSec: currentTimeData,
      currentServerTimeUpdatedAtMs: currentTimeUpdatedAt,
      fallbackNowMs: currentTimeAnchorMs,
    });
    return projectedTargetMs > 0 ? projectedTargetMs / 1000 : 0;
  }, [currentTimeAnchorMs, currentTimeData, currentTimeUpdatedAt, data]);
  // Keep phase inputs on the same cycle snapshot. Around finalization the
  // direct chain read can already be on cycle N+1 while the indexed dashboard
  // still describes cycle N; preferring that read produced an impossible
  // "opening soon" clock beside the previous cycle's participant/finalize
  // data. The chain value remains the fallback when an older API omits the
  // dashboard activation field.
  const activationTime =
    projectedDashboardActivationTime > 0 ? projectedDashboardActivationTime : chainActivationTime;

  // Final-minute synchronizer: 1s direct-chain reads (racing both RPC nodes,
  // ETL/backend bypassed) that keep the countdown target, last bidder, and
  // claim state within ~1-2s of on-chain reality around the zero-cross.
  const endgame = useEndgameChainSync({ targetMs: allocationTime });
  // A tab that returns with a stale deadline holds "ready" until a fresh
  // reading lands: a Gesture may have moved it while the tab was hidden.
  const returnResync = useReturnResync();
  const finalizationConfirmed = !endgame.isConfirmationPending && !returnResync;

  const withPostTxRefresh = useCallback(
    (retryMs = 1500, activationMs = 3000, includeCurrentSpecialRecipients = true) => {
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

  /**
   * The receipt is in: the wallet holds the Last Gesture. Record it for every
   * surface at once (the overlay above), which also reads the chain directly
   * so the clock extends from the contract's own deadline instead of waiting
   * for the next indexed poll.
   */
  const recordConfirmedGesture = useCallback(() => {
    setGesturePulseKey((value) => value + 1);
    if (account) recordOwnGesture(account, offset);
  }, [account, offset, recordOwnGesture]);

  // Optimistic chat rows until the indexer echoes them (F221).
  const { pending: pendingMessages, record: recordPendingMessage } =
    usePendingChatMessages(chatGestures);

  // Mobile bottom sheet: hosts the same gesture panel, opened from the dock,
  // so phones can act from anywhere on the page.
  const [gestureSheetOpen, setGestureSheetOpen] = useState(false);
  const sheetCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (sheetCloseTimerRef.current) clearTimeout(sheetCloseTimerRef.current);
    },
    [],
  );
  const openGestureSheet = useCallback(() => {
    trackGestureSheetOpened();
    setGestureSheetOpen(true);
  }, []);

  const handleGesture = useCallback(
    async (source: GestureSurface = 'panel') => {
      const trimmedMessage = gestureForm.message.trim();
      if (uxScenario) {
        const nextScenario = simulateUxScenarioGesture({
          bidder: account ?? UX_SCENARIO_DEMO_ACCOUNT,
          gestureType: gestureType as 'ETH' | 'RandomWalk' | 'CST',
          message: gestureForm.message,
        });
        if (nextScenario) {
          setMessage('');
          setGesturePulseKey((value) => value + 1);
          notify(
            'success',
            tToast('gesture.simulated', { seconds: nextScenario.extensionSeconds }),
          );
        }
        return;
      }
      // The sheet stays open through signing and pending, so its commit
      // button shows the transaction stage; it closes only after success.
      if (await (gestureType === 'CST' ? onGestureWithCST() : onGesture())) {
        trackGestureSubmitted({ source, method: gestureType, hasMessage: trimmedMessage !== '' });
        if (trimmedMessage && account) {
          recordPendingMessage(account, trimmedMessage, getLastGestureHash());
        }
        recordConfirmedGesture();
        withPostTxRefresh();
        if (source === 'sheet') {
          if (sheetCloseTimerRef.current) clearTimeout(sheetCloseTimerRef.current);
          sheetCloseTimerRef.current = setTimeout(
            () => setGestureSheetOpen(false),
            SHEET_SUCCESS_CLOSE_MS,
          );
        }
      }
    },
    [
      account,
      gestureForm.message,
      getLastGestureHash,
      gestureType,
      notify,
      onGesture,
      onGestureWithCST,
      recordConfirmedGesture,
      recordPendingMessage,
      setMessage,
      tToast,
      uxScenario,
      withPostTxRefresh,
    ],
  );
  const handleFinalize = useCallback(
    async (source: GestureSurface = 'clock') => {
      if (await onFinalize()) {
        trackFinalizeSubmitted(source);
        withPostTxRefresh(1000, 3000, false);
      }
    },
    [onFinalize, withPostTxRefresh],
  );

  // Deep link from the RandomWalk collection (?randomwalk=1&tokenId=N).
  // Read via window.location in an effect, NOT the next/navigation
  // search-params hook: on this statically generated route that hook forces
  // a bailout to client-side rendering, which threw away the entire
  // server-rendered HTML (the exact LCP/CLS regression the ISR work exists
  // to prevent). Guarded by home-rendering-policy and the no-JS e2e.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('randomwalk')) {
      setRwlkId(Number(params.get('tokenId')));
      setBidType('RandomWalk');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a one-time read of the landing URL
  }, []);

  useEffect(() => {
    const handleGesturePlaced = () => setGesturePulseKey((value) => value + 1);
    window.addEventListener('cosmic:gesture-placed', handleGesturePlaced);
    return () => window.removeEventListener('cosmic:gesture-placed', handleGesturePlaced);
  }, []);

  const cycleState = getCycleState({
    data,
    loading,
    allocationTime,
    activationTime,
    now,
    finalizationConfirmed,
  });
  const canGesture = allocationTime > now || data?.LastBidderAddr !== account;
  // The claim CTA additionally waits for the on-chain zero-cross confirmation
  // so a last-second gesture can't leave users clicking into a revert.
  const canClaim =
    !(allocationTime > now || data?.LastBidderAddr === zeroAddress || loading) &&
    finalizationConfirmed;
  const claimWait = allocationTime + timeoutFinalize * 1000;
  const isRoundActive =
    cycleState.isGestureOpen || cycleState.isReadyToFinalize || cycleState.isConfirmingFinalization;
  // A non-zero latest participant means a Gesture exists in this cycle even
  // if activation-time/indexer fields momentarily disagree about the phase.
  // Never let that cross-source race hide Last Gesture.
  const showLastGesture = hasCurrentGesture;
  const cycleTimerEnded = cycleState.isReadyToFinalize || cycleState.isConfirmingFinalization;
  const isFinalWindow =
    cycleState.phase === 'final-hour' ||
    cycleState.phase === 'final-ten' ||
    cycleState.phase === 'final-minute';
  const showPanel = loading || isRoundActive;

  // The opt-in tab-title countdown during the final window. An armed alert
  // or countdown keeps the deadline fresh while the tab is hidden, and the
  // title never counts toward a deadline that stopped updating.
  const { preferences: attention } = useAttentionPreferences();
  useBackgroundDeadlineRefresh(
    attention.finalizationAlert || (attention.tabTitle && isFinalWindow),
  );
  const deadlineFreshness = useLiveFreshness({
    queryKeys: DEADLINE_FRESHNESS_KEYS,
    pollIntervalMs: 60_000,
  });
  useTabTitleCountdown({
    enabled: isFinalWindow,
    targetMs: allocationTime,
    stale: deadlineFreshness.state === 'delayed' || deadlineFreshness.state === 'offline',
  });

  // One shared label for the gesture panel and the action dock, so the
  // displayed cost can never drift between them.
  const submit = getGestureSubmitParts({
    t,
    locale,
    gestureType,
    ethPrice: ethGestureInfo?.ETHPrice,
    rwlkId,
    cstGestureData: liveCstGestureData,
  });

  const trackAmounts = useMemo(() => deriveAllocationTrackAmounts(data), [data]);

  // The wallet's place in this cycle: its own moment when the Last Gesture
  // changes hands, what it has spent, and what waits to be retrieved.
  const position = usePositionMoment({
    account,
    latestAddress: loading ? undefined : data?.LastBidderAddr,
    cycle: data?.CurRoundNum,
    gestureCount: data?.CurNumBids,
    nowMs: now,
  });
  const announcement = useHomeAnnouncer({
    phase: cycleState.phase,
    latestAddress: loading ? undefined : data?.LastBidderAddr,
    gestureCount: data?.CurNumBids ?? null,
    account,
    moment: position.moment,
  });
  const participation = useCycleParticipation(account, data?.CurRoundNum);
  const retrieve = useRetrieveStatus(account);
  const cycleSpend = !account
    ? null
    : ownGesturePending || participation.status === 'loading'
      ? ({ status: 'loading' } as const)
      : participation.status === 'error'
        ? ({ status: 'unknown' } as const)
        : ({ status: 'ready', eth: participation.spentEth, cst: participation.spentCst } as const);

  const scrollToElement = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el || typeof el.scrollIntoView !== 'function') return;
    el.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
    });
    el.focus({ preventScroll: true });
  }, []);
  const scrollToGesturePanel = useCallback(
    () => scrollToElement('make-gesture'),
    [scrollToElement],
  );
  const scrollToClock = useCallback(() => scrollToElement('cycle-clock'), [scrollToElement]);

  // Method switches reset any picked RandomWalk token so a stale token can't
  // ride along silently.
  const handleSelectGestureType = useCallback(
    (value: string) => {
      setRwlkId(-1);
      setBidType(value);
    },
    [setBidType, setRwlkId],
  );

  // The dock is the way to act while the form's own action is off screen,
  // and it never duplicates that action. Below 1024px it therefore stays
  // until the form's action row (the commit or connect button) is on screen:
  // a phone that opens on the clock has an action in its first viewport even
  // though the form's heading already shows at the bottom edge. From 1024px,
  // where the dock would lie over the form's own method selector, it steps
  // aside while any of the form is on screen. Until the observers report it
  // stays aside, so the server HTML never paints a dock over the desk; jsdom
  // has no IntersectionObserver.
  const [formInView, setFormInView] = useState(true);
  const [actionInView, setActionInView] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 64rem)');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const form = document.getElementById('make-gesture');
    // While the form loads it has no action row yet: the form stands in.
    const action = form?.querySelector('[data-testid="gesture-panel-action"]') ?? form;
    // The sticky header covers the top; a sliver behind it is not "in view".
    const options: IntersectionObserverInit = { rootMargin: '-72px 0px 0px 0px' };
    const formObserver = new IntersectionObserver(
      ([entry]) => setFormInView(entry ? entry.isIntersecting : false),
      options,
    );
    const actionObserver = new IntersectionObserver(
      ([entry]) => setActionInView(entry ? entry.isIntersecting : false),
      options,
    );
    if (form) formObserver.observe(form);
    else setFormInView(false);
    if (action) actionObserver.observe(action);
    else setActionInView(false);
    return () => {
      formObserver.disconnect();
      actionObserver.disconnect();
    };
  }, [showPanel, loading]);
  const dockAside = gestureSheetOpen || (isDesktop ? formInView : actionInView);

  // The source-aligned clock discovers milestones even between Gestures.
  // A 30-second bucket keeps this larger timeline out of the one-second
  // countdown render path; event timestamps still retain their exact second.
  const feedNowSeconds = Math.floor((now + offset) / 30_000) * 30;
  const feedActivationTs = getDashboardActivationTime(data) ?? 0;
  const feedSystemEvents = useMemo(
    () =>
      deriveFeedSystemEvents({
        gestures: curGestureList,
        cycleNumber: round >= 0 ? round : undefined,
        roundStartTs: data?.TsRoundStart ?? 0,
        activationTs: feedActivationTs,
        nowSeconds: feedNowSeconds,
        expectedGestureCount: data?.CurNumBids,
      }),
    [curGestureList, round, data?.TsRoundStart, data?.CurNumBids, feedActivationTs, feedNowSeconds],
  );

  // Chat empty-state CTA: bring the one gesture panel into view, open its
  // message editor and focus it (messages ride on gestures).
  const panelMessageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [messageFocusRequest, setMessageFocusRequest] = useState(0);
  const handleJoinChatCta = useCallback(() => {
    trackChatJoinCtaClicked();
    scrollToGesturePanel();
    setMessageFocusRequest((value) => value + 1);
  }, [scrollToGesturePanel]);

  // Relative age of the dashboard/list-reconciled latest gesture.
  const lastGestureAge = useMemo(() => {
    const timestamp = Number(latestGesture?.TimeStamp);
    if (!Number.isFinite(timestamp) || timestamp <= 0) return null;
    const elapsedSeconds = Math.max(0, Math.floor((now - timestamp * 1000) / 1000));
    if (elapsedSeconds < 60) return t('ticker.age.seconds', { count: String(elapsedSeconds) });
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    if (elapsedMinutes < 60) return t('ticker.age.minutes', { count: String(elapsedMinutes) });
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) return t('ticker.age.hours', { count: String(elapsedHours) });
    return t('ticker.age.days', { count: String(Math.floor(elapsedHours / 24)) });
  }, [latestGesture?.TimeStamp, now, t]);

  const attachedAssetCount = donatedNFTs.length + donatedERC20Tokens.length;
  const hasAttachedAssets = attachedAssetCount > 0;
  const cycleNumber = data?.CurRoundNum;
  // Cycles count from 0, so while Cycle 1 runs, Cycle 0 is the one before it.
  const previousCycle = cycleNumber != null ? cycleNumber - 1 : -1;
  const hasPreviousCycle = previousCycle >= 0;

  const holdSeconds =
    champions.latestGesture.isTimeKnown === false ? null : champions.latestGesture.holdDuration;
  const exclusiveWindowOpen = claimWait > now;
  const standing = account ? (
    <CycleStanding
      isLatest={position.isLatest}
      isReadyToFinalize={cycleState.isReadyToFinalize}
      isConfirmingFinalization={cycleState.isConfirmingFinalization}
      exclusiveWindowOpen={exclusiveWindowOpen}
      holdSeconds={holdSeconds}
      moment={position.moment}
      onDismissMoment={position.dismiss}
      nowMs={now}
      participation={participation}
      participationUpdating={ownGesturePending}
      totalGestures={data?.CurNumBids ?? null}
      retrieve={retrieve}
      onGoToFinalize={scrollToClock}
    />
  ) : (
    <CycleStandingPreview />
  );

  // Without the dashboard read there is no cycle number, countdown, or
  // allocation pool — rendering the page would show an idle cycle that does
  // not exist, so say the read failed and offer a retry instead.
  if (dashboardFailed && !dashboardData) {
    return (
      <PageShell variant="data" backdrop="subtle">
        <ErrorState
          title={t('error.title')}
          message={t('error.message')}
          onRetry={() => void refetchDashboard()}
          surface
          headingLevel={2}
        />
      </PageShell>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <PageShell
        variant="data"
        backdrop="hero"
        // The site's one content edge (site-container: the gutter, capped at
        // 80rem), so the desk lines up with the header and footer at every
        // width instead of overhanging them on wide screens.
        className="home-control-shell w-[min(100%-2*var(--gutter),80rem)] max-w-none px-0 pb-16 pt-[calc(var(--header-height)+1.5rem)] max-sm:pt-[calc(var(--header-height)+1rem)] sm:px-0"
      >
        {uxScenario && (
          <div className="mb-3 rounded-control bg-attention-surface px-3 py-1.5 type-caption text-attention">
            <span className="font-semibold">UX scenario: {uxScenario.name}</span>
            <span className="ms-2">
              Cycle data and gesture placement are simulated for local UI testing.
            </span>
          </div>
        )}

        {/* The page's one polite voice: the wallet's own moment, a new Last
            Gesture and the clock's phase changes; never every chat update. */}
        <p role="status" aria-live="polite" className="sr-only" data-testid="home-announcer">
          {announcement.text ? <span key={announcement.id}>{announcement.text}</span> : null}
        </p>

        <ControlDesk
          header={
            <PulseBar
              cycleNumber={cycleNumber ?? null}
              phase={cycleState.phase}
              gestureCount={data?.CurNumBids ?? null}
              lastGestureAge={lastGestureAge}
              youHoldLatest={position.isLatest}
            />
          }
          clock={
            <CycleClock
              data={data}
              loading={loading}
              allocationTime={allocationTime}
              activationTime={activationTime}
              now={now}
              finalizationConfirmed={finalizationConfirmed}
              account={account}
              canClaim={canClaim}
              isClaiming={isClaiming}
              claimWait={claimWait}
              onFinalize={() => void handleFinalize('clock')}
              ethUsdPrice={ethUsdPrice}
              attachedAssetCount={attachedAssetCount}
              attachedAssetsHref={`#${ATTACHED_ASSETS_ID}`}
              // The alerts are about the clock reaching zero: they sit beside it.
              headingAction={<AttentionMenu className="-my-2.5" />}
            />
          }
          calibration={
            <CalibrationStatus
              data={data}
              ethGestureInfo={ethGestureInfo}
              cstGestureData={liveCstGestureData}
            />
          }
          standings={
            <StandingsLedger
              champions={champions}
              latestGesture={latestGesture}
              gestureDetailsPending={latestResolution.isSyncing}
              showLastGesture={showLastGesture}
              account={account}
              chronoEth={data ? trackAmounts.chronoEth : null}
              moment={position.moment}
            />
          }
          gestureConsole={
            showPanel ? (
              <GesturePanel
                data={data}
                loading={loading}
                isRoundActive={isRoundActive}
                account={account}
                form={gestureForm}
                cstGestureData={liveCstGestureData}
                submit={submit}
                canGesture={canGesture}
                isGesturing={isGesturing}
                txStage={gestureTxStage}
                cycleTimerEnded={cycleTimerEnded}
                onSubmit={() => void handleGesture('panel')}
                onSelectGestureType={handleSelectGestureType}
                variant="card"
                cycleSpend={cycleSpend}
                onGoToFinalize={scrollToClock}
                messageFocusRequest={messageFocusRequest}
                messageInputRef={panelMessageInputRef}
              />
            ) : undefined
          }
          standing={standing}
          standingOnPhones={!!account}
          art={
            <MemoLatestSignature
              signatures={latestSignatures.signatures}
              loading={latestSignatures.isLoading}
            />
          }
        />

        {/* Row 3: the conversation beside where the cycle is now (F169, F296).
            Messages lead the chat; the guide explains the loop as the six
            steps with the current one marked, and carries the cycle links.
            Both open on a hairline, like the desk above. */}
        <div
          data-testid="home-feed-layout"
          className="mt-10 grid min-w-0 gap-y-7 lg:grid-cols-12 lg:items-stretch lg:gap-x-6"
        >
          <div data-testid="home-feed-column" className="min-w-0 lg:col-span-7">
            <MemoGestureMessageChat
              gestures={chatGestures}
              pagination={chatPagination}
              serverModerated={feed.mode === 'paged'}
              isLoading={feed.isLoading}
              error={Boolean(feed.error)}
              onRetry={feed.retry}
              account={account}
              resetKey={feed.resetKey}
              cycleNumber={round >= 0 ? round : undefined}
              pulseKey={gesturePulseKey}
              onJoinCta={!loading && isRoundActive ? handleJoinChatCta : undefined}
              systemEvents={feedSystemEvents}
              pendingMessages={pendingMessages}
              className="lg:h-full print:h-auto"
            />
          </div>
          <CyclePhaseGuide
            phase={cycleState.phase}
            className={cn(DESK_REGION, 'lg:col-span-5')}
            cycleLinks={
              <>
                <li data-testid="home-feed-actions">
                  <Link
                    href="/current-cycle"
                    data-testid="cycle-details-link-card"
                    className={PHASE_GUIDE_LINK_CLASS}
                  >
                    {t('cycleDetails.title')}
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </li>
                {hasPreviousCycle && (
                  <li>
                    <Link
                      href={`/allocation/${previousCycle}`}
                      data-testid="previous-cycle-link-card"
                      className={PHASE_GUIDE_LINK_CLASS}
                    >
                      {t('hero.console.previousAllocations', { number: String(previousCycle) })}
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  </li>
                )}
              </>
            }
          />
        </div>

        {/* Receipts use the full content width. */}
        {hasAttachedAssets && (
          <div
            id={ATTACHED_ASSETS_ID}
            data-testid="home-attached-assets"
            className="mt-10 scroll-mt-24"
          >
            <MemoAttachedNFTAllocationShowcase
              nfts={donatedNFTs}
              erc20Tokens={donatedERC20Tokens}
              cycleNumber={round >= 0 ? round : undefined}
              className="my-0"
            />
          </div>
        )}

        {/* The page's two disclosures read as one list of hairline rows. */}
        <AllocationsDisclosure className="mt-10">
          <AllocationLedger data={data} />
        </AllocationsDisclosure>
        <HomeStory />
      </PageShell>

      {/* The one persistent quick-action surface: routes to the gesture
          panel (bottom sheet on phones, scroll from tablets up). */}
      <ActionDock
        stepAside={dockAside}
        data={data}
        loading={loading}
        allocationTime={allocationTime}
        activationTime={activationTime}
        now={now}
        finalizationConfirmed={finalizationConfirmed}
        submit={submit}
        isGesturing={isGesturing}
        txStage={gestureTxStage}
        account={account}
        canClaim={canClaim}
        isClaiming={isClaiming}
        claimWait={claimWait}
        onFinalize={() => void handleFinalize('dock')}
        moment={position.moment}
        onOpenSheet={openGestureSheet}
        onJumpToPanel={scrollToGesturePanel}
      />

      {/* Mobile bottom sheet: the same gesture panel, same shared form
          state, so drafts follow the participant between mounts. It stays
          open through signing and pending, and closes after success. */}
      <Sheet open={gestureSheetOpen} onOpenChange={setGestureSheetOpen}>
        <SheetContent
          side="bottom"
          // The panel speaks for itself; there is no separate description.
          aria-describedby={undefined}
          className="max-h-[88dvh] overflow-y-auto rounded-t-surface border-rule bg-surface-raised px-4 pb-0 pt-5 md:hidden"
        >
          <SheetTitle className="sr-only">{t('observatory.panel.sheetTitle')}</SheetTitle>
          <GesturePanel
            data={data}
            loading={loading}
            isRoundActive={isRoundActive}
            account={account}
            form={gestureForm}
            cstGestureData={liveCstGestureData}
            submit={submit}
            canGesture={canGesture}
            isGesturing={isGesturing}
            txStage={gestureTxStage}
            cycleTimerEnded={cycleTimerEnded}
            onSubmit={() => void handleGesture('sheet')}
            onSelectGestureType={handleSelectGestureType}
            cycleSpend={cycleSpend}
            variant="sheet"
          />
        </SheetContent>
      </Sheet>
    </LazyMotion>
  );
};

export default HomePage;
