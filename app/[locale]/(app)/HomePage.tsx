'use client';

import { memo, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { zeroAddress } from 'viem';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { LazyMotion, domAnimation } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { reportError } from '@/utils/errors';
import { useNotify } from '@/hooks/useNotify';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useActiveWeb3React } from '@/hooks/web3';
import { CyclePhaseGuide } from '@/components/home/CyclePhaseGuide';
import { GestureMessageChat, type PendingChatMessage } from '@/components/home/GestureMessageChat';
import { HomeObservatoryHero } from '@/components/home/HomeObservatoryHero';
import { DeckArtCard } from '@/components/home/deck/DeckArtCard';
import { DeckPersonalStrip } from '@/components/home/deck/DeckPersonalStrip';
import { deriveFeedSystemEvents } from '@/components/home/deck/feedSystemEvents';
import { ActionDock } from '@/components/home/observatory/ActionDock';
import { AllocationLedger } from '@/components/home/observatory/AllocationLedger';
import { ChronoEnduranceIntel } from '@/components/home/observatory/ChronoEnduranceIntel';
import { ControlDesk } from '@/components/home/observatory/ControlDesk';
import { CycleClock } from '@/components/home/observatory/CycleClock';
import { CalibrationStatus } from '@/components/home/observatory/CalibrationStatus';
import { GesturePanel } from '@/components/home/observatory/GesturePanel';
import { ParticipationGuide } from '@/components/home/observatory/ParticipationGuide';
import { LatestParticipantIntel } from '@/components/home/observatory/LatestParticipantIntel';
import { PulseBar } from '@/components/home/observatory/PulseBar';
import { getGestureSubmitLabel } from '@/components/home/observatory/gestureSubmitLabel';
import { AttachedNFTAllocationShowcase } from '@/components/attachments/DonatedNFTPrizeShowcase';
import { useGestureForm } from '@/hooks/useGestureForm';
import { useChampions } from '@/hooks/useChampions';
import { useAllocationFinalize } from '@/hooks/useAllocationFinalize';
import { useEndgameChainSync } from '@/hooks/useEndgameChainSync';
import { useAllocationNotification } from '@/hooks/useAllocationNotification';
import { invalidateLiveGameQueries } from '@/hooks/useLiveGameDataRefresh';
import { useNow } from '@/hooks/useNow';
import { useRotatingIndex } from '@/hooks/useRotatingIndex';
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
  useGestureListByCycle,
  useCurrentTime,
  useCSTInfo,
  useDonationsNFTByRound,
  useDonationsERC20ByRound,
} from '@/hooks/useApiQuery';
import { deriveAllocationTrackAmounts } from '@/lib/allocationTracks';
import { getCycleState, getDashboardActivationTime } from '@/lib/cycleState';
import { resolveLatestGesture } from '@/lib/latestGesture';
import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
import { getStableClientTargetTime, type ServerTimingSample } from '@/utils/time';
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
const MemoHomeObservatoryHero = memo(HomeObservatoryHero);
const MemoGestureMessageChat = memo(GestureMessageChat);
const MemoAttachedNFTAllocationShowcase = memo(AttachedNFTAllocationShowcase);
const MemoDeckArtCard = memo(DeckArtCard);

/** Chosen "notify me before finalization" threshold, in minutes. */
const NOTIFY_THRESHOLD_STORAGE_KEY = 'cosmic-notify-threshold-min';
const DEFAULT_NOTIFY_THRESHOLD_MIN = 5;

/** Pending optimistic chat rows expire if the indexer never echoes them. */
const PENDING_MESSAGE_EXPIRY_MS = 90_000;

export function resolveHomeNow(
  tickingNow: number,
  timingSample?: Pick<ServerTimingSample, 'sampledAtMs'> | null,
  initialRenderAtMs = 0,
): number {
  return tickingNow || timingSample?.sampledAtMs || initialRenderAtMs;
}

interface HomePageProps {
  initialDashboardData?: DashboardInfo | null;
  /** Server-picked story artwork so its URL ships in the SSR HTML. */
  initialBannerToken?: { id: number; info: CSTTokenInfo } | null;
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
  initialBannerToken = null,
  initialLatestGesture = null,
  initialSpecialRecipients = null,
  initialTimingSample = null,
  initialRenderAtMs = 0,
}: HomePageProps) => {
  const t = useTranslations('home');
  const tToast = useTranslations('toasts');
  const { account } = useActiveWeb3React();
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

  const round = dashboardData?.CurRoundNum ?? -1;
  const initialGestureList = useMemo(
    () =>
      initialLatestGesture && initialLatestGesture.RoundNum === round
        ? [initialLatestGesture]
        : undefined,
    [initialLatestGesture, round],
  );
  const { data: bidListData } = useGestureListByCycle(round, 'desc', initialGestureList);
  const { data: nftDonationsData } = useDonationsNFTByRound(round);
  const { data: erc20DonationsData } = useDonationsERC20ByRound(round);

  const data = dashboardData ?? null;
  const loading = dashboardLoading;
  // Stable fallbacks: a bare `?? []` would mint a new array identity every
  // second (this page ticks via useNow) and defeat the memo boundaries.
  const curGestureList = useMemo(() => bidListData ?? [], [bidListData]);
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
        gestures: curGestureList,
      }),
    [curGestureList, data?.LastBidderAddr],
  );
  const latestGesture = latestResolution.gesture;

  const offset = useMemo(() => {
    if (currentTimeData == null) return 0;
    return currentTimeData * 1000 - currentTimeAnchorMs;
  }, [currentTimeAnchorMs, currentTimeData]);

  const [gesturePulseKey, setGesturePulseKey] = useState(0);
  const imprintedTokenCount = dashboardData?.MainStats.NumCSTokenMints ?? 0;
  // The server picks the first artwork (initialBannerToken) so its URL is
  // discoverable in the prerendered HTML; the client rotation starts from
  // that index and the seeded query below keeps the first client render
  // byte-identical with the SSR output.
  const bannerTokenId = useRotatingIndex({
    count: imprintedTokenCount,
    intervalMs: 15_000,
    enabled: imprintedTokenCount > 1,
    randomStart: true,
    initialIndex: initialBannerToken?.id ?? null,
  });

  const { data: bannerCSTInfo } = useCSTInfo(
    bannerTokenId,
    bannerTokenId != null && bannerTokenId === initialBannerToken?.id
      ? initialBannerToken.info
      : undefined,
  );

  const bannerToken = useMemo(() => {
    if (bannerTokenId != null && bannerCSTInfo)
      return { seed: `0x${bannerCSTInfo.Seed}`, id: bannerTokenId };
    if (initialBannerToken?.info.Seed)
      return { seed: `0x${initialBannerToken.info.Seed}`, id: initialBannerToken.id };
    return null;
  }, [bannerTokenId, bannerCSTInfo, initialBannerToken]);

  const gestureForm = useGestureForm();
  const hasCurrentGesture = !!data && data.LastBidderAddr !== zeroAddress;
  const champions = useChampions(
    initialSpecialRecipients,
    latestResolution.evidence,
    hasCurrentGesture,
  );
  const allocationFinalize = useAllocationFinalize({
    data,
    offset,
    initialTimingSample: coherentInitialTimingSample,
  });
  const ethUsdPrice = useTokenPrice();

  // "Notify me before finalization" threshold, persisted per browser. Starts
  // at the default for hydration consistency; the effect restores the choice.
  const [notifyThresholdMin, setNotifyThresholdMin] = useState(DEFAULT_NOTIFY_THRESHOLD_MIN);
  useEffect(() => {
    const stored = Number(window.localStorage.getItem(NOTIFY_THRESHOLD_STORAGE_KEY));
    if (Number.isFinite(stored) && stored > 0) setNotifyThresholdMin(stored);
  }, []);

  const { playAudio, requestNotificationPermission } = useAllocationNotification({
    allocationTime: allocationFinalize.allocationTime,
    notificationTitle: t('notifications.finalizationSoonTitle'),
    notificationBody: t('notifications.finalizationSoonBody', {
      minutes: String(notifyThresholdMin),
    }),
    thresholdMs: notifyThresholdMin * 60 * 1000,
  });

  const handleNotifyThresholdChange = useCallback(
    (minutes: number) => {
      setNotifyThresholdMin(minutes);
      window.localStorage.setItem(NOTIFY_THRESHOLD_STORAGE_KEY, String(minutes));
      // Choosing a threshold is a clear opt-in signal — the right moment to
      // ask the browser for notification permission.
      requestNotificationPermission();
    },
    [requestNotificationPermission],
  );

  const prevGestureCountRef = useRef<number>(0);
  useEffect(() => {
    if (dashboardData && prevGestureCountRef.current > 0) {
      if (
        account !== dashboardData.LastBidderAddr &&
        dashboardData.CurNumBids > prevGestureCountRef.current
      ) {
        playAudio();
      }
    }
    if (dashboardData) {
      prevGestureCountRef.current = dashboardData.CurNumBids;
    }
  }, [dashboardData, account, playAudio]);

  const {
    gestureType,
    ethGestureInfo,
    cstGestureData,
    isGesturing,
    rwlkId,
    gestureCostPlus,
    onGesture,
    onGestureWithCST,
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
  const finalizationConfirmed = !endgame.isConfirmationPending;

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

  const optimisticallyRecordGesture = useCallback(() => {
    queryClient.setQueryData<DashboardInfo | null>(['dashboardInfo'], (current) => {
      if (!current) return current;
      return {
        ...current,
        CurNumBids: (current.CurNumBids ?? 0) + 1,
        LastBidderAddr: account ?? current.LastBidderAddr,
      };
    });
    setGesturePulseKey((value) => value + 1);
  }, [account, queryClient]);

  // Optimistic chat rows: a just-sent message shows instantly and is removed
  // once the indexer echoes the real gesture (or after a safety timeout).
  const [pendingMessages, setPendingMessages] = useState<PendingChatMessage[]>([]);
  const pendingExpiryTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const timers = pendingExpiryTimersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const recordPendingMessage = useCallback((address: string, message: string) => {
    const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setPendingMessages((prev) => [...prev, { id, address, message }]);
    pendingExpiryTimersRef.current.push(
      setTimeout(() => {
        setPendingMessages((prev) => prev.filter((entry) => entry.id !== id));
      }, PENDING_MESSAGE_EXPIRY_MS),
    );
  }, []);

  useEffect(() => {
    setPendingMessages((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.filter(
        (entry) =>
          !curGestureList.some(
            (gesture) =>
              gesture.BidderAddr?.toLowerCase() === entry.address.toLowerCase() &&
              typeof gesture.Message === 'string' &&
              gesture.Message.trim() === entry.message,
          ),
      );
      return next.length === prev.length ? prev : next;
    });
  }, [curGestureList]);

  const handleGesture = useCallback(
    async (source: GestureSurface = 'panel') => {
      requestNotificationPermission();
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
      if (await (gestureType === 'CST' ? onGestureWithCST() : onGesture())) {
        trackGestureSubmitted({ source, method: gestureType, hasMessage: trimmedMessage !== '' });
        if (trimmedMessage && account) {
          recordPendingMessage(account, trimmedMessage);
        }
        optimisticallyRecordGesture();
        withPostTxRefresh();
      }
    },
    [
      account,
      gestureForm.message,
      gestureType,
      notify,
      onGesture,
      onGestureWithCST,
      optimisticallyRecordGesture,
      recordPendingMessage,
      requestNotificationPermission,
      setMessage,
      tToast,
      uxScenario,
      withPostTxRefresh,
    ],
  );
  const handleFinalize = useCallback(async () => {
    if (await onFinalize()) {
      trackFinalizeSubmitted('clock');
      withPostTxRefresh(1000, 3000, false);
    }
  }, [onFinalize, withPostTxRefresh]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Endgame theater: the tab title ticks during the final window so players
  // who tabbed away can see the clock closing from anywhere.
  useTabTitleCountdown({ enabled: isFinalWindow, targetMs: allocationTime });

  // One shared label for the gesture panel and the action dock, so the
  // displayed cost can never drift between them.
  const submitLabel = getGestureSubmitLabel({
    t,
    gestureType,
    ethPrice: ethGestureInfo?.ETHPrice,
    gestureCostPlus,
    rwlkId,
    cstGestureData: liveCstGestureData,
  });

  const trackAmounts = useMemo(() => deriveAllocationTrackAmounts(data), [data]);

  const scrollToGesturePanel = useCallback(() => {
    const el = document.getElementById('make-gesture');
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
        block: 'start',
      });
      el.focus({ preventScroll: true });
    }
  }, []);

  const handlePrimaryCtaClick = useCallback(() => {
    scrollToGesturePanel();
  }, [scrollToGesturePanel]);

  // Method switches reset any picked RandomWalk token so a stale token can't
  // ride along silently.
  const handleSelectGestureType = useCallback(
    (value: string) => {
      setRwlkId(-1);
      setBidType(value);
    },
    [setBidType, setRwlkId],
  );

  // The desktop action dock appears only after the stage scrolls out of
  // view. jsdom has no IntersectionObserver, so the guard also keeps unit
  // tests quiet.
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const [stageOutOfView, setStageOutOfView] = useState(false);
  useEffect(() => {
    const el = stageContainerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setStageOutOfView(entry ? !entry.isIntersecting : false),
      // Roughly the sticky header height: the stage counts as "gone" once it
      // has fully passed under the chrome.
      { rootMargin: '-96px 0px 0px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Derived cycle moments for the chat feed. Memoized so the feed's memo
  // boundary holds between polls (the page re-renders every second).
  const feedSystemEvents = useMemo(
    () =>
      deriveFeedSystemEvents({
        gestures: curGestureList,
        cycleNumber: round >= 0 ? round : undefined,
        roundStartTs: data?.TsRoundStart ?? 0,
      }),
    [curGestureList, round, data?.TsRoundStart],
  );

  // Chat empty-state CTA: bring the one gesture panel into view and focus
  // its message field (messages ride on gestures).
  const panelMessageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const handleJoinChatCta = useCallback(() => {
    trackChatJoinCtaClicked();
    scrollToGesturePanel();
    const input = panelMessageInputRef.current;
    const disclosure = input?.closest('details');
    if (disclosure) disclosure.open = true;
    input?.focus({ preventScroll: true });
  }, [scrollToGesturePanel]);

  // Mobile bottom sheet: hosts the same gesture panel, opened from the dock,
  // so phones can act from anywhere on the page.
  const [gestureSheetOpen, setGestureSheetOpen] = useState(false);
  const openGestureSheet = useCallback(() => {
    trackGestureSheetOpened();
    setGestureSheetOpen(true);
  }, []);

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

  const hasAttachedAssets = donatedNFTs.length > 0 || donatedERC20Tokens.length > 0;
  const cycleNumber = data?.CurRoundNum;
  const previousCycle = (cycleNumber ?? 0) - 1;
  const hasPreviousCycle = previousCycle > 0;

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
        />
      </PageShell>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <PageShell
        variant="data"
        backdrop="subtle"
        className="home-control-shell pb-24 pt-[calc(var(--header-height)+1rem)] max-sm:pt-[calc(var(--header-height)+0.75rem)] lg:px-5 lg:pb-12 xl:max-w-[100rem]"
      >
        {uxScenario && (
          <div className="mb-2 rounded-lg border border-amber-300/25 bg-amber-300/[0.08] px-3 py-1 text-xs text-amber-100">
            <span className="font-semibold text-amber-50">UX scenario: {uxScenario.name}</span>
            <span className="ml-2 text-amber-100/80">
              Cycle data and gesture placement are simulated for local UI testing.
            </span>
          </div>
        )}

        {/* All live decision inputs stay visible together on desktop. */}
        <ControlDesk
          ref={stageContainerRef}
          header={
            <PulseBar
              cycleNumber={cycleNumber ?? null}
              phase={cycleState.phase}
              gestureCount={data?.CurNumBids ?? 0}
              lastGestureAge={lastGestureAge}
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
              onFinalize={() => void handleFinalize()}
              notifyThresholdMin={notifyThresholdMin}
              onNotifyThresholdChange={handleNotifyThresholdChange}
              ethUsdPrice={ethUsdPrice}
              compact
              embedded
            />
          }
          calibration={
            <CalibrationStatus
              data={data}
              ethGestureInfo={ethGestureInfo}
              cstGestureData={liveCstGestureData}
            />
          }
          orientation={<ParticipationGuide />}
          latestParticipant={
            <LatestParticipantIntel
              champions={champions}
              latestGesture={latestGesture}
              latestMessage={latestGesture?.Message ?? ''}
              account={account}
              signatureEth={trackAmounts.signatureEth}
              attachedNftCount={donatedNFTs.length}
              attachedErc20Count={donatedERC20Tokens.length}
              showLastGesture={showLastGesture}
              gestureDetailsPending={latestResolution.isSyncing}
              compact
            />
          }
          chronoEndurance={
            <ChronoEnduranceIntel
              champions={champions}
              chronoEth={trackAmounts.chronoEth}
              compact
              account={account}
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
                submitLabel={submitLabel}
                canGesture={canGesture}
                isGesturing={isGesturing}
                cycleTimerEnded={cycleTimerEnded}
                onSubmit={() => void handleGesture('panel')}
                onSelectGestureType={handleSelectGestureType}
                variant="card"
                messageInputRef={panelMessageInputRef}
                embedded
                calibrationExternal
              />
            ) : undefined
          }
          personal={
            account ? (
              <DeckPersonalStrip
                account={account}
                data={data}
                gestures={curGestureList}
                cstRewardPreview={gestureForm.gestureCstRewardAmount}
                champions={champions}
                embedded
              />
            ) : undefined
          }
          allocationLedger={<AllocationLedger data={data} />}
        />

        {/* Activity and attached assets follow the current cycle controls. */}
        <div className="mt-5">
          <div
            data-testid="home-feed-actions"
            className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 px-1"
          >
            <Link
              href="/current-cycle"
              data-testid="cycle-details-link-card"
              className={`${TOUCH_TARGET_TEXT_LINK_CLASS} inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-foreground`}
            >
              {t('cycleDetails.title')}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            {hasPreviousCycle && (
              <Link
                href={`/allocation/${previousCycle}`}
                data-testid="previous-cycle-link-card"
                className={`${TOUCH_TARGET_TEXT_LINK_CLASS} inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary`}
              >
                {t('hero.console.previousAllocations', { number: String(previousCycle) })}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            )}
          </div>

          <div
            data-testid="home-feed-layout"
            className="mt-2 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,23rem)]"
          >
            <div data-testid="home-feed-column" className="min-w-0">
              {/* Height only at lg+: phones keep the feed in document flow. */}
              <MemoGestureMessageChat
                gestures={curGestureList}
                cycleNumber={round >= 0 ? round : undefined}
                pulseKey={gesturePulseKey}
                onJoinCta={!loading && isRoundActive ? handleJoinChatCta : undefined}
                systemEvents={feedSystemEvents}
                pendingMessages={pendingMessages}
                className="lg:h-[clamp(20rem,48vh,28rem)] print:h-auto"
              />
            </div>

            <div data-testid="home-depth-rail" className="min-w-0 space-y-3">
              <MemoDeckArtCard bannerToken={bannerToken} />
              {hasAttachedAssets && (
                <div data-testid="home-rail-attached-assets">
                  <MemoAttachedNFTAllocationShowcase
                    nfts={donatedNFTs}
                    erc20Tokens={donatedERC20Tokens}
                    cycleNumber={round >= 0 ? round : undefined}
                    variant="rail"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <details
          data-testid="home-story-section"
          className="group/story mt-6 rounded-2xl border border-white/10 bg-[#0b1226]/70"
        >
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
            {t('orientation.storyTitle')}
            <ChevronDown
              className="h-5 w-5 text-muted-foreground transition-transform motion-reduce:transition-none group-open/story:rotate-180"
              aria-hidden
            />
          </summary>
          <div className="border-t border-white/10 p-3 sm:p-5">
            <MemoHomeObservatoryHero
              data={data}
              bannerToken={bannerToken}
              canOpenGesturePanel={!loading && isRoundActive}
              phase={cycleState.phase}
              onPrimaryCtaClick={handlePrimaryCtaClick}
              headingLevel="h2"
            />
            <CyclePhaseGuide
              data={data}
              loading={loading}
              allocationTime={allocationTime}
              activationTime={activationTime}
              now={now}
              finalizationConfirmed={finalizationConfirmed}
            />
            <Link
              href="/experimental-ui"
              prefetch={false}
              data-testid="experimental-ui-entry"
              className="inline-flex min-h-11 items-center gap-2 px-2 text-sm text-muted-foreground hover:text-primary"
            >
              {t('deck.experimentalUi')}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </details>
      </PageShell>

      {/* Endgame theater: full-viewport vignette during the final window. */}
      {isFinalWindow && cycleState.phase !== 'final-hour' && (
        <div
          aria-hidden
          data-testid="final-window-vignette"
          className="pointer-events-none fixed inset-0 z-20 bg-[radial-gradient(ellipse_at_center,transparent_52%,rgb(var(--chrono-rose-rgb)/0.13)_80%,rgb(127_29_29/0.30))] motion-safe:animate-pulse-glow print:hidden"
        />
      )}

      {/* The one persistent quick-action surface: routes to the gesture
          panel (bottom sheet on phones, scroll on desktop). */}
      <ActionDock
        stageOutOfView={stageOutOfView}
        data={data}
        loading={loading}
        allocationTime={allocationTime}
        activationTime={activationTime}
        now={now}
        finalizationConfirmed={finalizationConfirmed}
        submitLabel={submitLabel}
        onOpenSheet={openGestureSheet}
        onJumpToPanel={scrollToGesturePanel}
      />

      {/* Mobile bottom sheet: the same gesture panel, same shared form
          state, so drafts follow the participant between mounts. */}
      <Sheet open={gestureSheetOpen} onOpenChange={setGestureSheetOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] overflow-y-auto rounded-t-2xl border-white/[0.10] bg-[rgb(10_14_42/0.97)] p-4 pb-6 lg:hidden"
        >
          <SheetTitle className="sr-only">{t('observatory.panel.sheetTitle')}</SheetTitle>
          <GesturePanel
            data={data}
            loading={loading}
            isRoundActive={isRoundActive}
            account={account}
            form={gestureForm}
            cstGestureData={liveCstGestureData}
            submitLabel={submitLabel}
            canGesture={canGesture}
            isGesturing={isGesturing}
            cycleTimerEnded={cycleTimerEnded}
            onSubmit={() => {
              setGestureSheetOpen(false);
              void handleGesture('sheet');
            }}
            onSelectGestureType={handleSelectGestureType}
            variant="sheet"
            embedded
          />
        </SheetContent>
      </Sheet>
    </LazyMotion>
  );
};

export default HomePage;
