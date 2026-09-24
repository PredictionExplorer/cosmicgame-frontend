'use client';

import { memo, useState, useEffect, useMemo, useRef, useCallback, type ReactNode } from 'react';
import { Title as DialogTitle } from '@radix-ui/react-dialog';
import { zeroAddress } from 'viem';
import { ArrowRight } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { reportError } from '@/utils/errors';
import { useNotify } from '@/hooks/useNotify';
import { PageHeader } from '@/components/layout/PageHeader';
import { useSiteNavCopy } from '@/components/layout/siteNavCopy';
import { AttentionMenu } from '@/components/ui/attention-menu';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Surface } from '@/components/ui/surface';
import { useActiveWeb3React } from '@/hooks/web3';
import { GestureMessageChat, type PendingChatMessage } from '@/components/home/GestureMessageChat';
import { deriveFeedSystemEvents } from '@/components/home/deck/feedSystemEvents';
import { ActionDock } from '@/components/home/observatory/ActionDock';
import { getGestureSubmitLabel } from '@/components/home/observatory/gestureSubmitLabel';
import { AllocationTracksBoard } from '@/components/home/experimental/AllocationTracksBoard';
import { CycleMonument } from '@/components/home/experimental/CycleMonument';
import { CyclePhaseGuide } from '@/components/home/experimental/CyclePhaseGuide';
import {
  DeckPersonalStrip,
  type PersonalFeedStatus,
} from '@/components/home/experimental/DeckPersonalStrip';
import { GestureConsole } from '@/components/home/experimental/GestureConsole';
import { StageArtwork, type StageToken } from '@/components/home/experimental/StageArtwork';
import { StandingsLedger } from '@/components/home/experimental/StandingsLedger';
import { useArtMotionPreference } from '@/components/home/experimental/useArtMotionPreference';
import { useChampionsAtClock } from '@/components/home/experimental/useChampionsAtClock';
import { useFocusClearOfDock } from '@/components/home/experimental/useFocusClearOfDock';
import { AttachedNFTAllocationShowcase } from '@/components/attachments/DonatedNFTPrizeShowcase';
import type { ArtStatus } from '@/components/ui/art-frame';
import { useGestureForm } from '@/hooks/useGestureForm';
import { useHomeGestureFeed } from '@/hooks/useHomeGestureFeed';
import { useAllocationFinalize } from '@/hooks/useAllocationFinalize';
import { useEndgameChainSync } from '@/hooks/useEndgameChainSync';
import { useAllocationNotification } from '@/hooks/useAllocationNotification';
import { useGestureChime } from '@/hooks/useGestureChime';
import { invalidateLiveGameQueries } from '@/hooks/useLiveGameDataRefresh';
import { useNow } from '@/hooks/useNow';
import { useRotatingIndex } from '@/hooks/useRotatingIndex';
import { useTabTitleCountdown } from '@/hooks/useTabTitleCountdown';
import { useTxStageLabel } from '@/hooks/useTxStageLabel';
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
  useCSTInfo,
  useDonationsNFTByRound,
  useDonationsERC20ByRound,
} from '@/hooks/useApiQuery';
import { deriveAllocationTrackAmounts } from '@/lib/allocationTracks';
import { AllocationIcon } from '@/lib/conceptIcons';
import { SITE_ROUTE_ICONS } from '@/config/siteNavIcons';
import { getCycleState, getDashboardActivationTime } from '@/lib/cycleState';
import { resolveLatestGesture } from '@/lib/latestGesture';
import {
  UX_SCENARIO_DEMO_ACCOUNT,
  simulateUxScenarioGesture,
  useUxScenarioSnapshot,
} from '@/lib/uxCycleScenarios';
import type { CSTTokenInfo, DashboardInfo, GestureInfo, SpecialRecipients } from '@/services/api';
import { deriveLiveCstGestureData } from '@/utils/cstGesture';
import { sameAddress } from '@/utils/format';
import { getStableClientTargetTime, type ServerTimingSample } from '@/utils/time';

// This page re-renders every second (useNow keeps countdown-derived action
// state honest). These sections never consume the tick, so memo boundaries
// stop the per-second reconciliation of the heaviest subtrees — the chat
// feed alone renders dozens of rows. Their props are kept referentially
// stable below (useMemo'd arrays, useCallback handlers).
const MemoGestureMessageChat = memo(GestureMessageChat);
const MemoAttachedNFTAllocationShowcase = memo(AttachedNFTAllocationShowcase);
const MemoStageArtwork = memo(StageArtwork);
const MemoAllocationTracksBoard = memo(AllocationTracksBoard);

/** Pending optimistic chat rows expire if the indexer never echoes them. */
const PENDING_MESSAGE_EXPIRY_MS = 90_000;

/** Consecutive artworks that may fail to load before the plate stops skipping. */
const MAX_UNAVAILABLE_SKIPS = 3;

/** Roughly the sticky header: a region counts as gone once it passed under it. */
const HEADER_ROOT_MARGIN = '-96px 0px 0px 0px';

/** The sheet's console heading is the dialog's title: one visible name, not two. */
function renderSheetTitle({ className, children }: { className: string; children: ReactNode }) {
  return <DialogTitle className={className}>{children}</DialogTitle>;
}

interface ExperimentalHomePageProps {
  initialDashboardData?: DashboardInfo | null;
  /** Server-picked artwork so its URL ships in the SSR HTML. */
  initialBannerToken?: { id: number; info: CSTTokenInfo } | null;
  /** Server-seeded latest gesture, so the standings are complete on first paint. */
  initialLatestGesture?: GestureInfo | null;
  /** Server-seeded role snapshot; the direct-chain fallback still takes over when required. */
  initialSpecialRecipients?: SpecialRecipients | null;
  /** Server clock and finalization sample, so SSR and hydration share one phase. */
  initialTimingSample?: ServerTimingSample | null;
  /** Clock fallback for SSR and hydration when the timing reads are unavailable. */
  initialRenderAtMs?: number;
}

function toStageToken(id: number, info: CSTTokenInfo | null | undefined): StageToken | null {
  if (!info?.Seed) return null;
  return {
    id,
    seed: `0x${info.Seed}`,
    name: typeof info.TokenName === 'string' ? info.TokenName : null,
    cycle: typeof info.RoundNum === 'number' ? info.RoundNum : null,
  };
}

/**
 * The experimental home: the same live cycle as the Observatory, composed
 * art first. The featured Signature hangs on its plate beside the monument
 * (the clock, the Signature Allocation and the one gesture console); the
 * standings sit under the art, level with the console; the chat and the
 * allocation tracks follow, then the cycle's phases.
 */
const ExperimentalHomePage = ({
  initialDashboardData = null,
  initialBannerToken = null,
  initialLatestGesture = null,
  initialSpecialRecipients = null,
  initialTimingSample = null,
  initialRenderAtMs = 0,
}: ExperimentalHomePageProps) => {
  const t = useTranslations('home');
  const tToast = useTranslations('toasts');
  const locale = useLocale();
  const siteNav = useSiteNavCopy();
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
  const feed = useHomeGestureFeed(round, initialGestureList);
  const { data: nftDonationsData } = useDonationsNFTByRound(round);
  const { data: erc20DonationsData } = useDonationsERC20ByRound(round);

  const data = dashboardData ?? null;
  const loading = dashboardLoading;
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
  // The feed serves its one-row server seed until the first snapshot lands.
  const personalFeedStatus: PersonalFeedStatus = feed.error
    ? 'error'
    : feed.isLoading || !feed.mode
      ? 'loading'
      : 'ready';
  const donatedNFTs = useMemo(() => nftDonationsData ?? [], [nftDonationsData]);
  const donatedERC20Tokens = useMemo(() => erc20DonationsData ?? [], [erc20DonationsData]);

  // Re-renders every second so countdown comparisons stay honest. useNow is 0
  // for the hydration render: the serialized timing sample stands in for it,
  // so an active cycle never prerenders as "opening soon".
  const tickingNow = useNow(1000);
  const now = tickingNow || coherentInitialTimingSample?.sampledAtMs || initialRenderAtMs;
  const [clientClockAnchorMs, setClientClockAnchorMs] = useState(
    () => coherentInitialTimingSample?.sampledAtMs || initialRenderAtMs || Date.now(),
  );
  useEffect(() => {
    if (!coherentInitialTimingSample || currentTimeUpdatedAt > 0) return;
    // Re-anchor once after hydration, so a failed timing refetch leaves no
    // persistent server/browser clock skew.
    setClientClockAnchorMs((current) =>
      current === coherentInitialTimingSample.sampledAtMs ? Date.now() : current,
    );
  }, [coherentInitialTimingSample, currentTimeUpdatedAt]);
  const currentTimeAnchorMs = currentTimeUpdatedAt || clientClockAnchorMs;
  const offset = useMemo(() => {
    if (currentTimeData == null) return 0;
    return currentTimeData * 1000 - currentTimeAnchorMs;
  }, [currentTimeAnchorMs, currentTimeData]);

  const latestResolution = useMemo(
    () =>
      resolveLatestGesture({
        dashboardLastAddress: data?.LastBidderAddr,
        gestures: feed.latestGesture ? [feed.latestGesture] : [],
      }),
    [feed.latestGesture, data?.LastBidderAddr],
  );
  const latestGesture = latestResolution.gesture;

  const [gesturePulseKey, setGesturePulseKey] = useState(0);

  // ── Featured artwork ────────────────────────────────────────────────
  // The server picks the first artwork so its URL is in the prerendered
  // HTML. While the generation reel plays, the reel (not the timer) decides
  // when to move on; the viewer's pause holds both.
  const imprintedTokenCount = dashboardData?.MainStats.NumCSTokenMints ?? 0;
  const { paused: artPaused, setPaused: setArtPaused } = useArtMotionPreference();
  const [reelActive, setReelActive] = useState(false);
  const [artAdvance, setArtAdvance] = useState(0);
  // Consecutive tokens whose files all failed; a loaded artwork resets it.
  const unavailableSkipsRef = useRef(0);
  const handleReelEnded = useCallback(() => {
    unavailableSkipsRef.current = 0;
    setArtAdvance((n) => n + 1);
  }, []);
  const handleArtStatus = useCallback((_tokenId: number, status: ArtStatus) => {
    if (status === 'loaded') unavailableSkipsRef.current = 0;
    if (status !== 'unavailable' || unavailableSkipsRef.current >= MAX_UNAVAILABLE_SKIPS) return;
    unavailableSkipsRef.current += 1;
    setArtAdvance((n) => n + 1);
  }, []);
  const bannerTokenId = useRotatingIndex({
    count: imprintedTokenCount,
    intervalMs: 15_000,
    enabled: imprintedTokenCount > 1 && !reelActive && !artPaused,
    randomStart: true,
    initialIndex: initialBannerToken?.id ?? null,
    advanceSignal: artAdvance,
  });
  const { data: bannerCSTInfo, isError: bannerCSTError } = useCSTInfo(
    bannerTokenId,
    bannerTokenId != null && bannerTokenId === initialBannerToken?.id
      ? initialBannerToken.info
      : undefined,
  );
  const resolvedBannerToken = useMemo(
    () => (bannerTokenId != null ? toStageToken(bannerTokenId, bannerCSTInfo) : null),
    [bannerTokenId, bannerCSTInfo],
  );
  // While the next token's seed loads, keep the one already shown rather than
  // snapping back to the server pick ("adjust state when a prop changes").
  const [heldBannerToken, setHeldBannerToken] = useState(resolvedBannerToken);
  if (resolvedBannerToken && resolvedBannerToken !== heldBannerToken) {
    setHeldBannerToken(resolvedBannerToken);
  }
  const bannerToken = useMemo(
    () =>
      resolvedBannerToken ??
      heldBannerToken ??
      (initialBannerToken ? toStageToken(initialBannerToken.id, initialBannerToken.info) : null),
    [resolvedBannerToken, heldBannerToken, initialBannerToken],
  );
  // The reel cannot finish a clip it never got a seed for: skip that token.
  useEffect(() => {
    if (reelActive && bannerCSTError) setArtAdvance((n) => n + 1);
  }, [reelActive, bannerCSTError, bannerTokenId]);
  const nextBannerTokenId =
    bannerTokenId != null && imprintedTokenCount > 1
      ? (bannerTokenId + 1) % imprintedTokenCount
      : null;
  const { data: nextBannerCSTInfo } = useCSTInfo(nextBannerTokenId);
  const nextBannerToken = useMemo(
    () => (nextBannerTokenId != null ? toStageToken(nextBannerTokenId, nextBannerCSTInfo) : null),
    [nextBannerTokenId, nextBannerCSTInfo],
  );

  // ── Cycle state ──────────────────────────────────────────────────────
  const gestureForm = useGestureForm();
  const hasCurrentGesture = !!data && data.LastBidderAddr !== zeroAddress;
  // Measured against the page clock, so the server HTML and the hydration
  // render show the hold as of the sampled instant, never a false "0s".
  const champions = useChampionsAtClock({
    initialData: initialSpecialRecipients,
    latestParticipantEvidence: latestResolution.evidence,
    enabled: hasCurrentGesture,
    nowMs: now,
  });
  const allocationFinalize = useAllocationFinalize({
    data,
    offset,
    initialTimingSample: coherentInitialTimingSample,
  });

  // Attention settings (chime, alert before finalization, tab-title
  // countdown) are opt-in per browser, from the bell in the header.
  useAllocationNotification({
    allocationTime: allocationFinalize.allocationTime,
    cycleNumber: dashboardData?.CurRoundNum ?? null,
    notificationTitle: t('notifications.finalizationSoonTitle'),
    notificationBody: (minutesLeft) =>
      t('notifications.finalizationSoonBody', { minutes: String(minutesLeft) }),
  });
  useGestureChime({
    account,
    lastGestureAddress: dashboardData?.LastBidderAddr,
    gestureCount: dashboardData?.CurNumBids,
  });

  const {
    gestureType,
    ethGestureInfo,
    cstGestureData,
    rwlkId,
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
  // Phase inputs stay on one cycle snapshot: around finalization the chain
  // can already be on cycle N+1 while the indexed dashboard still describes
  // cycle N, so the dashboard's activation time wins when it has one.
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
  const activationTime =
    projectedDashboardActivationTime > 0 ? projectedDashboardActivationTime : chainActivationTime;

  // Final-minute synchronizer: direct-chain reads around the zero-cross.
  const endgame = useEndgameChainSync({ targetMs: allocationTime });
  const finalizationConfirmed = !endgame.isConfirmationPending;

  const withPostTxRefresh = useCallback(
    (retryMs = 1500, activationMs = 3000) => {
      void invalidateLiveGameQueries(queryClient).catch((e) => reportError(e, 'refresh live data'));
      setMessage('');
      setTimeout(() => {
        void invalidateLiveGameQueries(queryClient).catch((e) => reportError(e, 'retry live data'));
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
    setPendingMessages((prev) => [
      ...prev,
      { id, address, message, timestamp: Math.floor(Date.now() / 1000) },
    ]);
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
          !chatGestures.some(
            (gesture) =>
              gesture.BidderAddr?.toLowerCase() === entry.address.toLowerCase() &&
              typeof gesture.Message === 'string' &&
              gesture.Message.trim() === entry.message,
          ),
      );
      return next.length === prev.length ? prev : next;
    });
  }, [chatGestures]);

  /** Resolves `true` once the Gesture is confirmed (or simulated). */
  const handleGesture = useCallback(
    async (source: GestureSurface = 'console'): Promise<boolean> => {
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
        return Boolean(nextScenario);
      }
      if (!(await (gestureType === 'CST' ? onGestureWithCST() : onGesture()))) return false;
      trackGestureSubmitted({ source, method: gestureType, hasMessage: trimmedMessage !== '' });
      if (trimmedMessage && account) {
        recordPendingMessage(account, trimmedMessage);
      }
      optimisticallyRecordGesture();
      withPostTxRefresh();
      return true;
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
      setMessage,
      tToast,
      uxScenario,
      withPostTxRefresh,
    ],
  );
  /** Resolves `true` once the finalization is confirmed. */
  const handleFinalize = useCallback(
    async (source: GestureSurface = 'console'): Promise<boolean> => {
      if (!(await onFinalize())) return false;
      trackFinalizeSubmitted(source);
      withPostTxRefresh(1000, 3000);
      return true;
    },
    [onFinalize, withPostTxRefresh],
  );

  // Deep link from the RandomWalk collection (?randomwalk=1&tokenId=N), read
  // in an effect: the search-params hook would force this statically
  // generated route into client-side rendering.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('randomwalk')) {
      setRwlkId(Number(params.get('tokenId')));
      setBidType('RandomWalk');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once, on arrival
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
  // One address comparison for every role check: a checksum or case mismatch
  // must never show the Gesture button, not Finalize, to the finalizer.
  const isLatestParticipant = sameAddress(data?.LastBidderAddr, account);
  const canGesture = allocationTime > now || !isLatestParticipant;
  // Finalization additionally waits for the on-chain zero-cross confirmation
  // so a last-second gesture can't leave anyone clicking into a revert.
  const canClaim =
    !(allocationTime > now || data?.LastBidderAddr === zeroAddress || loading) &&
    finalizationConfirmed;
  const claimWait = allocationTime + timeoutFinalize * 1000;
  const isRoundActive =
    cycleState.isGestureOpen || cycleState.isReadyToFinalize || cycleState.isConfirmingFinalization;
  const cycleTimerEnded = cycleState.isReadyToFinalize || cycleState.isConfirmingFinalization;
  const isFinalWindow =
    cycleState.phase === 'final-hour' ||
    cycleState.phase === 'final-ten' ||
    cycleState.phase === 'final-minute';
  const showConsole = loading || isRoundActive;

  // The tab title ticks in the final window only when the viewer opted in.
  useTabTitleCountdown({ enabled: isFinalWindow, targetMs: allocationTime });

  // The one label of every gesture submit (console, sheet and dock), so the
  // quoted cost can never drift between them.
  const submitLabel = getGestureSubmitLabel({
    t,
    locale,
    gestureType,
    ethPrice: ethGestureInfo?.ETHPrice,
    rwlkId,
    cstGestureData: liveCstGestureData,
  });
  // The dock names what its console will do: the transaction stage while a
  // Gesture is in flight, Finalize for the wallet whose move that is.
  const stageLabel = useTxStageLabel();
  const dockLabel =
    (gestureForm.isGesturing ? stageLabel(gestureForm.gestureTxStage) : null) ??
    (!canGesture && canClaim ? t('form.finalize') : submitLabel);

  const trackAmounts = useMemo(() => deriveAllocationTrackAmounts(data), [data]);

  // Method switches reset any picked RandomWalk token so a stale token can't
  // ride along silently.
  const handleSelectGestureType = useCallback(
    (value: string) => {
      setRwlkId(-1);
      setBidType(value);
    },
    [setBidType, setRwlkId],
  );

  const scrollToConsole = useCallback(() => {
    const el = document.getElementById('make-gesture');
    if (!el) return;
    if (typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({
        behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
        block: 'start',
      });
    }
    el.focus({ preventScroll: true });
  }, []);

  // Keyboard focus never lands under the dock.
  useFocusClearOfDock();

  // The action dock: on desktop it appears once the monument has scrolled
  // past; on phones it steps aside while the console itself is on screen.
  const monumentRef = useRef<HTMLDivElement | null>(null);
  const consoleRef = useRef<HTMLDivElement | null>(null);
  const [monumentOutOfView, setMonumentOutOfView] = useState(false);
  const [consoleInView, setConsoleInView] = useState(false);
  useEffect(() => {
    const el = monumentRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const rootTop = entry.rootBounds?.top ?? 0;
        const bottom = entry.boundingClientRect?.bottom ?? Number.POSITIVE_INFINITY;
        setMonumentOutOfView(!entry.isIntersecting && bottom <= rootTop);
      },
      { rootMargin: HEADER_ROOT_MARGIN },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const el = consoleRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setConsoleInView(false);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setConsoleInView(entry?.isIntersecting ?? false),
      { rootMargin: HEADER_ROOT_MARGIN },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [showConsole]);

  // The source-aligned clock discovers milestones even between Gestures. A
  // 30-second bucket keeps this timeline out of the one-second render path.
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

  // The chat's empty state: messages ride on gestures, so its call to action
  // brings the console into view and focuses the message field.
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const handleJoinChatCta = useCallback(() => {
    trackChatJoinCtaClicked();
    const input = messageInputRef.current;
    if (!input) return;
    if (typeof input.scrollIntoView === 'function') {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    input.focus({ preventScroll: true });
  }, []);

  // Phones: the dock opens the same console, with the same state, in a sheet.
  // The sheet stays open through signing and pending, so its commit button
  // and transaction status show the stage; it closes once the chain confirms.
  const [sheetOpen, setSheetOpen] = useState(false);
  const openSheet = useCallback(() => {
    trackGestureSheetOpened();
    setSheetOpen(true);
  }, []);
  const handleSheetGesture = useCallback(async () => {
    if (await handleGesture('sheet')) setSheetOpen(false);
  }, [handleGesture]);
  const handleSheetFinalize = useCallback(async () => {
    if (await handleFinalize('sheet')) setSheetOpen(false);
  }, [handleFinalize]);

  const hasAttachedAssets = donatedNFTs.length > 0 || donatedERC20Tokens.length > 0;
  const cycleNumber = data?.CurRoundNum;
  const previousCycle = (cycleNumber ?? 0) - 1;
  const hasPreviousCycle = previousCycle > 0;
  const CurrentCycleIcon = SITE_ROUTE_ICONS.currentCycle;

  // Without the dashboard read there is no cycle number, countdown or
  // allocation pool: say the read failed and offer a retry.
  if (dashboardFailed && !dashboardData) {
    return (
      <PageShell variant="data" backdrop="subtle">
        <ErrorState
          title={t('error.title')}
          message={t('error.message')}
          onRetry={() => void refetchDashboard()}
          headingLevel={2}
          surface
        />
      </PageShell>
    );
  }

  const consoleProps = {
    data,
    loading,
    account: account ?? null,
    form: gestureForm,
    cstGestureData: liveCstGestureData,
    submitLabel,
    canGesture,
    cycleTimerEnded,
    onSelectGestureType: handleSelectGestureType,
  };
  const finalizeState = {
    canClaim,
    isClaiming,
    isLatestParticipant,
    openToAllAtMs: claimWait,
    nowMs: now,
  };

  return (
    <>
      <PageShell variant="data" backdrop="hero" className="max-w-none px-0 sm:px-0">
        <Container>
          {uxScenario && (
            <p
              role="note"
              className="mb-6 rounded-surface border border-rule bg-attention-surface px-4 py-3 type-body-sm text-foreground"
            >
              <span className="font-semibold">UX scenario: {uxScenario.name}</span>
              <span className="ms-2 text-muted-foreground">
                Cycle data and gesture placement are simulated for local UI testing.
              </span>
            </p>
          )}

          <div data-testid="home-deck-header">
            <PageHeader
              eyebrow={
                cycleNumber == null
                  ? t('hero.cycleFallback')
                  : t('hero.cycleNumber', { number: String(cycleNumber) })
              }
              title={t('deck.title')}
              titleId="home-deck-title"
              subtitle={t('deck.intro')}
              actions={
                // Phones: the actions and the related link share one row
                // (scrolling, with the edge fade the related row uses), so
                // the header gives the art more of the first screen.
                <div className="flex max-w-full items-center gap-2 scrollbar-none max-sm:-my-1 max-sm:-ms-1 max-sm:overflow-x-auto max-sm:py-1 max-sm:ps-1 max-sm:pe-8 max-sm:[mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]">
                  <AttentionMenu />
                  <Button asChild variant="outline" size="sm" className="shrink-0">
                    <Link href="/" data-testid="experimental-ui-return">
                      {t('deck.returnToCurrent')}
                    </Link>
                  </Button>
                  <Link
                    href="/how-it-works"
                    data-testid="experimental-ui-new-here"
                    className="group inline-flex min-h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill border border-rule px-3 type-label text-muted-foreground transition-colors duration-fast hover:border-input hover:text-foreground sm:hidden"
                  >
                    {t('deck.newHere')}
                    <ArrowRight
                      aria-hidden
                      className="size-3.5 shrink-0 text-subtle transition-colors duration-fast group-hover:text-foreground"
                    />
                  </Link>
                </div>
              }
              // From sm the related link sits in the header's own row.
              related={[{ href: '/how-it-works', label: t('deck.newHere') }]}
              className="mb-8 pb-6 max-sm:[&>nav]:hidden sm:mb-10 sm:pb-8"
            />
          </div>

          <div
            id="deck"
            data-testid="home-deck-layout"
            className="grid scroll-mt-24 grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-12 xl:gap-x-14"
          >
            <MemoStageArtwork
              token={bannerToken}
              nextToken={nextBannerToken}
              rotates={imprintedTokenCount > 1}
              paused={artPaused}
              onPausedChange={setArtPaused}
              onReelEnded={handleReelEnded}
              onReelActiveChange={setReelActive}
              onArtStatus={handleArtStatus}
              className="lg:col-span-7 lg:row-start-1"
            />

            <div
              ref={monumentRef}
              data-testid="home-deck-monument"
              className="min-w-0 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1"
            >
              <CycleMonument
                data={data}
                loading={loading}
                allocationTime={allocationTime}
                activationTime={activationTime}
                now={now}
                finalizationConfirmed={finalizationConfirmed}
                attachedNFTCount={donatedNFTs.length}
                attachedERC20Count={donatedERC20Tokens.length}
              >
                {showConsole ? (
                  <div ref={consoleRef} className="mt-8">
                    <Surface variant="quiet" className="p-5 sm:p-6">
                      <GestureConsole
                        variant="page"
                        {...consoleProps}
                        onGesture={() => void handleGesture('console')}
                        finalize={{
                          ...finalizeState,
                          onFinalize: () => void handleFinalize('console'),
                        }}
                        messageInputRef={messageInputRef}
                      />
                    </Surface>
                  </div>
                ) : null}
              </CycleMonument>
            </div>

            <div data-testid="home-deck-board" className="min-w-0 lg:col-span-7 lg:row-start-2">
              <StandingsLedger
                champions={champions}
                latestGesture={latestGesture}
                account={account}
                signatureEth={data ? trackAmounts.signatureEth : null}
                chronoEth={data ? trackAmounts.chronoEth : null}
                nowMs={now}
                footer={
                  account ? (
                    <DeckPersonalStrip
                      account={account}
                      gestures={curGestureList}
                      totalGestures={data?.CurNumBids}
                      feedStatus={personalFeedStatus}
                    />
                  ) : null
                }
              />
            </div>
          </div>

          {hasAttachedAssets && (
            <div data-testid="home-attached-assets" className="mt-16">
              <MemoAttachedNFTAllocationShowcase
                nfts={donatedNFTs}
                erc20Tokens={donatedERC20Tokens}
                cycleNumber={round >= 0 ? round : undefined}
                className="my-0"
              />
            </div>
          )}

          <div
            data-testid="home-feed"
            className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-12 xl:gap-x-14"
          >
            <div data-testid="home-deck-chat" className="relative min-w-0 lg:col-span-7">
              {/* On desktop the chat fills the height the tracks ledger sets
                  and scrolls inside it; on phones it keeps its own height. */}
              <MemoGestureMessageChat
                gestures={chatGestures}
                pagination={chatPagination}
                serverModerated={feed.mode === 'paged'}
                isLoading={feed.isLoading}
                error={Boolean(feed.error)}
                onRetry={feed.retry}
                resetKey={feed.resetKey}
                cycleNumber={round >= 0 ? round : undefined}
                pulseKey={gesturePulseKey}
                onJoinCta={!loading && isRoundActive ? handleJoinChatCta : undefined}
                systemEvents={feedSystemEvents}
                pendingMessages={pendingMessages}
                className="h-[clamp(24rem,70svh,34rem)] lg:absolute lg:inset-0 lg:h-auto print:static print:h-auto"
              />
            </div>
            <MemoAllocationTracksBoard data={data} className="lg:col-span-5" />
          </div>

          <ul data-testid="home-links-row" className="mt-16 grid gap-4 sm:grid-cols-2">
            <li className="min-w-0">
              <Surface asChild variant="outlined" interactive>
                <Link
                  href="/current-cycle"
                  data-testid="cycle-details-link-card"
                  className="group flex h-full items-center gap-4 p-5"
                >
                  <CurrentCycleIcon className="size-5 shrink-0 text-subtle" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block type-title text-foreground">
                      {siteNav.routeLabel('currentCycle')}
                    </span>
                    <span className="mt-1 block type-body-sm text-muted-foreground">
                      {siteNav.routeDescription('currentCycle')}
                    </span>
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-subtle transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none"
                    aria-hidden
                  />
                </Link>
              </Surface>
            </li>
            {hasPreviousCycle ? (
              <li className="min-w-0">
                <Surface asChild variant="outlined" interactive>
                  <Link
                    href={`/allocation/${previousCycle}`}
                    data-testid="previous-cycle-link-card"
                    className="group flex h-full items-center gap-4 p-5"
                  >
                    <AllocationIcon className="size-5 shrink-0 text-subtle" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block type-title text-foreground">
                        {t('hero.console.previousAllocations', { number: String(previousCycle) })}
                      </span>
                      <span className="mt-1 block type-body-sm text-muted-foreground">
                        {t('deck.links.previousCycleDescription')}
                      </span>
                    </span>
                    <ArrowRight
                      className="size-4 shrink-0 text-subtle transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none"
                      aria-hidden
                    />
                  </Link>
                </Surface>
              </li>
            ) : null}
          </ul>

          <CyclePhaseGuide
            className="mt-16"
            data={data}
            loading={loading}
            allocationTime={allocationTime}
            activationTime={activationTime}
            now={now}
            finalizationConfirmed={finalizationConfirmed}
          />
        </Container>
      </PageShell>

      {/* The one persistent quick action: it routes to the console (the sheet
          on phones, a scroll on desktop) and never submits by itself. */}
      <ActionDock
        stageOutOfView={monumentOutOfView}
        data={data}
        loading={loading}
        allocationTime={allocationTime}
        activationTime={activationTime}
        now={now}
        finalizationConfirmed={finalizationConfirmed}
        submitLabel={dockLabel}
        onOpenSheet={openSheet}
        onJumpToPanel={scrollToConsole}
        className={consoleInView ? 'hidden' : undefined}
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] overflow-y-auto rounded-t-surface border-rule bg-surface-raised p-5 pb-8 lg:hidden"
        >
          <GestureConsole
            variant="sheet"
            renderTitle={renderSheetTitle}
            {...consoleProps}
            onGesture={() => void handleSheetGesture()}
            finalize={{ ...finalizeState, onFinalize: () => void handleSheetFinalize() }}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ExperimentalHomePage;
