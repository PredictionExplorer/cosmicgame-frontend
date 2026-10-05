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
import { SiteLink } from '@/components/layout/SiteLink';
import { useSiteNavCopy } from '@/components/layout/siteNavCopy';
import { AttentionMenu } from '@/components/ui/attention-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { ErrorState } from '@/components/ui/error-state';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { PageShell } from '@/components/ui/page-shell';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Surface } from '@/components/ui/surface';
import { useActiveWeb3React } from '@/hooks/web3';
import { GestureMessageChat } from '@/components/home/GestureMessageChat';
import { readRandomWalkLink } from '@/components/home/gestureInput';
import { deriveFeedSystemEvents } from '@/components/home/deck/feedSystemEvents';
import { ActionDock } from '@/components/home/observatory/ActionDock';
import {
  getGestureSubmitLabel,
  getGestureSubmitParts,
} from '@/components/home/observatory/gestureSubmitLabel';
import { StandingsLedger } from '@/components/home/observatory/StandingsLedger';
import { AllocationTracksBoard } from '@/components/home/experimental/AllocationTracksBoard';
import { CycleMonument } from '@/components/home/experimental/CycleMonument';
import { CyclePhaseGuide } from '@/components/home/experimental/CyclePhaseGuide';
import {
  DeckPersonalStrip,
  type PersonalFeedStatus,
} from '@/components/home/experimental/DeckPersonalStrip';
import { GestureConsole } from '@/components/home/experimental/GestureConsole';
import { StageArtwork, type StageToken } from '@/components/home/experimental/StageArtwork';
import { useArtMotionPreference } from '@/components/home/experimental/useArtMotionPreference';
import { AttachedNFTAllocationShowcase } from '@/components/attachments/DonatedNFTPrizeShowcase';
import type { ArtStatus } from '@/components/ui/art-frame';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useAttentionPreferences } from '@/hooks/useAttentionPreferences';
import { useChampions } from '@/hooks/useChampions';
import { useBackgroundDeadlineRefresh, useReturnResync } from '@/hooks/useDeadlineWatch';
import { useGestureForm } from '@/hooks/useGestureForm';
import { useHomeGestureFeed } from '@/hooks/useHomeGestureFeed';
import { useAllocationFinalize } from '@/hooks/useAllocationFinalize';
import { useEndgameChainSync } from '@/hooks/useEndgameChainSync';
import { useGestureChime } from '@/hooks/useGestureChime';
import { useLiveFreshness } from '@/hooks/useLiveFreshness';
import { useOwnGestureOverlay } from '@/hooks/useOwnGestureOverlay';
import { usePendingChatMessages } from '@/hooks/usePendingChatMessages';
import { usePositionMoment } from '@/hooks/usePositionMoment';
import { useVerifiedFinalizationAlert } from '@/hooks/useVerifiedFinalizationAlert';
import { invalidateLiveGameQueries } from '@/hooks/useLiveGameDataRefresh';
import { useNow } from '@/hooks/useNow';
import { useRotatingIndex } from '@/hooks/useRotatingIndex';
import { useTabTitleCountdown } from '@/hooks/useTabTitleCountdown';
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
import { OUTBOUND_LINKS } from '@/config/siteNav';
import { SITE_ROUTE_ICONS } from '@/config/siteNavIcons';
import { getCycleState, getDashboardActivationTime } from '@/lib/cycleState';
import { headerRootMargin } from '@/lib/headerOffset';
import { resolveLatestGesture, type LatestParticipantEvidence } from '@/lib/latestGesture';
import { fetchEndgameChainSample, type EndgameChainSample } from '@/lib/rpcRace';
import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';
import {
  UX_SCENARIO_DEMO_ACCOUNT,
  simulateUxScenarioGesture,
  useUxScenarioSnapshot,
} from '@/lib/uxCycleScenarios';
import type { CSTTokenInfo, DashboardInfo, GestureInfo, SpecialRecipients } from '@/services/api';
import { deriveLiveCstGestureData } from '@/utils/cstGesture';
import { toFiniteNumber } from '@/utils/finiteNumber';
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

/** Consecutive artworks that may fail to load before the plate stops skipping. */
const MAX_UNAVAILABLE_SKIPS = 3;

/** The deadline read whose freshness the opted-in tab-title countdown follows. */
const DEADLINE_FRESHNESS_KEYS = [['allocationTime']] as const;

/** Feedback on the preview goes to the community's Discord. */
const FEEDBACK_HREF = OUTBOUND_LINKS.find((link) => link.id === 'discord')!.href;

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
  const imprintedAt = toFiniteNumber(info.TimeStamp ?? info.MintTimeStamp);
  return {
    id,
    seed: `0x${info.Seed}`,
    name: typeof info.TokenName === 'string' ? info.TokenName : null,
    cycle: typeof info.RoundNum === 'number' ? info.RoundNum : null,
    imprintedAt: imprintedAt != null && imprintedAt > 0 ? imprintedAt : null,
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
  // The wallet's own confirmed Gesture counts on every surface from its
  // receipt until the index includes it (F221), as on the Observatory.
  const { cosmicGame } = useContractAddresses();
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
    data: overlaidDashboard,
    own: ownGesture,
    record: recordOwnGesture,
  } = useOwnGestureOverlay({
    dashboard: dashboardData ?? null,
    readChain,
    onChainSample: storeChainSample,
    // The wallet's own history now includes the Gesture.
    onIndexed: (address) => void queryClient.invalidateQueries({ queryKey: ['userInfo', address] }),
    onError: reportError,
  });
  const { data: currentTimeData, dataUpdatedAt: currentTimeUpdatedAt } = useCurrentTime(
    coherentInitialTimingSample?.currentServerTimeSec,
    coherentInitialTimingSample ? 0 : undefined,
  );

  const data = overlaidDashboard;
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

  const [gesturePulseKey, setGesturePulseKey] = useState(0);

  // ── Featured artwork ────────────────────────────────────────────────
  // The server picks the first artwork so its URL is in the prerendered
  // HTML. The stills rotate on a timer; it holds while the viewer watches a
  // Signature take shape, and the viewer's pause holds both.
  const imprintedTokenCount = dashboardData?.MainStats.NumCSTokenMints ?? 0;
  const { paused: artPaused, setPaused: setArtPaused } = useArtMotionPreference();
  const [reelActive, setReelActive] = useState(false);
  const [artAdvance, setArtAdvance] = useState(0);
  // Consecutive tokens whose files all failed; a loaded artwork resets it.
  const unavailableSkipsRef = useRef(0);
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
  const { data: bannerCSTInfo } = useCSTInfo(
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

  // ── Cycle state ──────────────────────────────────────────────────────
  // Before the cycle's first Gesture the form holds ETH, the only method the
  // contract accepts then, even if CST was chosen in the previous cycle.
  const gestureForm = useGestureForm({ firstGesture: data?.LastBidderAddr === zeroAddress });
  const hasCurrentGesture = !!data && data.LastBidderAddr !== zeroAddress;
  // The one champions derivation of the app, seeded with the page clock, so
  // the server HTML and the hydration render show the hold as of the sampled
  // instant, never a false "0s".
  const champions = useChampions(initialSpecialRecipients, latestEvidence, hasCurrentGesture, now);
  const allocationFinalize = useAllocationFinalize({
    data,
    offset,
    initialTimingSample: coherentInitialTimingSample,
  });

  // Attention settings (chime, alert before finalization, tab-title
  // countdown) are opt-in per browser, from the bell in the header. The
  // alert re-reads the time left from the chain before it fires (F220).
  useVerifiedFinalizationAlert({
    allocationTime: allocationFinalize.allocationTime,
    cycleNumber: dashboardData?.CurRoundNum ?? null,
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
  // A tab that returns with a stale deadline holds "ready" until a fresh
  // reading lands: a Gesture may have moved it while the tab was hidden, and
  // a Finalize sent on the stale reading would revert and still cost gas.
  const returnResync = useReturnResync();
  const finalizationConfirmed = !endgame.isConfirmationPending && !returnResync;

  /**
   * Refreshes the live reads after a confirmed transaction. A finalization
   * leaves the current special recipients out: during the rollover the
   * backend answers that read with an error, so its stale value is dropped
   * rather than refetched.
   */
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

  // The receipt is in: the Gesture counts now, on every surface.
  const recordConfirmedGesture = useCallback(() => {
    setGesturePulseKey((value) => value + 1);
    if (account) recordOwnGesture(account, offset);
  }, [account, offset, recordOwnGesture]);

  // Optimistic chat rows until the indexer echoes them (F221), the app's one
  // implementation: each keeps its transaction, and a slow echo says so.
  const { pending: pendingMessages, record: recordPendingMessage } =
    usePendingChatMessages(chatGestures);
  const { getLastGestureHash } = gestureForm;

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
        recordPendingMessage(account, trimmedMessage, getLastGestureHash());
      }
      recordConfirmedGesture();
      withPostTxRefresh();
      return true;
    },
    [
      account,
      gestureForm.message,
      gestureType,
      getLastGestureHash,
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
  /** Resolves `true` once the finalization is confirmed. */
  const handleFinalize = useCallback(
    async (source: GestureSurface = 'console'): Promise<boolean> => {
      if (!(await onFinalize())) return false;
      trackFinalizeSubmitted(source);
      withPostTxRefresh(1000, 3000, false);
      return true;
    },
    [onFinalize, withPostTxRefresh],
  );

  // Deep link from the RandomWalk collection (?randomwalk=1&tokenId=N), read
  // in an effect: the search-params hook would force this statically
  // generated route into client-side rendering. The Observatory's reader
  // (`readRandomWalkLink`): digits only, so "1e3" or "0x10" names no token.
  // The console still checks it against the wallet's own unused NFTs before
  // it offers the Gesture.
  useEffect(() => {
    const link = readRandomWalkLink(window.location.search);
    if (!link) return;
    setBidType('RandomWalk');
    if (link.tokenId != null) setRwlkId(link.tokenId);
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
  // An armed alert or countdown keeps the deadline fresh while the tab is
  // hidden, and the title never counts toward a deadline that stopped
  // updating.
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

  // The one quote behind every gesture submit (console, sheet and dock), so
  // the cost shown can never drift between them. The shared dock sets the
  // verb and the price on their own lines, and names the transaction stage
  // or Finalize itself.
  const submitQuote = {
    t,
    locale,
    gestureType,
    ethPrice: ethGestureInfo?.ETHPrice,
    rwlkId,
    cstGestureData: liveCstGestureData,
  };
  const submitLabel = getGestureSubmitLabel(submitQuote);
  const submitParts = getGestureSubmitParts(submitQuote);

  const trackAmounts = useMemo(() => deriveAllocationTrackAmounts(data), [data]);

  // The wallet's own moments: its Gesture landing, or its place taken.
  const position = usePositionMoment({
    account,
    latestAddress: loading ? undefined : data?.LastBidderAddr,
    cycle: data?.CurRoundNum,
    gestureCount: data?.CurNumBids,
    nowMs: now,
  });

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

  // The action dock repeats the clock and the priced action, so it steps
  // aside at every width while the monument (the clock, the Signature
  // Allocation and the console under them) is on screen: it shows over the
  // header and the art, and again once the console has scrolled past.
  // A callback ref: the monument mounts only once the dashboard read landed.
  const [monumentEl, setMonumentEl] = useState<HTMLDivElement | null>(null);
  const [monumentInView, setMonumentInView] = useState(false);
  useEffect(() => {
    if (!monumentEl || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setMonumentInView(entry?.isIntersecting ?? false),
      { rootMargin: headerRootMargin() },
    );
    observer.observe(monumentEl);
    return () => observer.disconnect();
  }, [monumentEl]);

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
  // Cycles count from 0, so Cycle 1 links the allocations of Cycle 0.
  const previousCycle = (cycleNumber ?? 0) - 1;
  const hasPreviousCycle = previousCycle >= 0;
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
    // Until the finalize timeout is read, the holder's window is unknown.
    openToAllAtMs: timeoutFinalize > 0 ? claimWait : null,
    nowMs: now,
  };

  return (
    <>
      {/* The page starts high, as the Observatory does: one header row, then
          the art. */}
      <PageShell
        variant="data"
        backdrop="hero"
        className="max-w-none px-0 pt-[calc(var(--header-height)+1.25rem)] max-sm:pt-[calc(var(--header-height)+1rem)] sm:px-0"
      >
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
            {/* A preview of the Observatory, not a second one: its own name, a
                Preview mark beside the cycle that explains what differs, and a
                way back and a way to say what works. */}
            <PageHeader
              eyebrow={
                <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
                  {cycleNumber == null
                    ? t('hero.cycleFallback')
                    : t('hero.cycleNumber', { number: String(cycleNumber) })}
                  <span className="inline-flex items-center gap-1">
                    <Badge tone="accent" size="sm" overline data-testid="experimental-ui-preview">
                      {t('deck.previewBadge')}
                    </Badge>
                    <InfoTooltip
                      content={t('deck.artViewIntro')}
                      label={t('deck.previewBadge')}
                      side="bottom"
                    />
                  </span>
                </span>
              }
              title={t('deck.artViewTitle')}
              titleId="home-deck-title"
              // One row, as on the Observatory: no standing lede, so the art
              // starts high on every screen. What the preview changes is the
              // Preview mark's explanation; while Gestures run, the clock's
              // status, the console and the phase guide say how to take part.
              actions={
                // The route to the walkthrough, then the two controls on one
                // row. They are one control family: one height (44px on
                // phones, 36px from sm), the control radius and the outline
                // edge.
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
                  <Link
                    href="/how-it-works"
                    data-testid="experimental-ui-new-here"
                    className={cn(
                      TOUCH_TARGET_TEXT_LINK_CLASS,
                      'link-quiet inline-flex items-center gap-1.5 type-label text-primary',
                    )}
                  >
                    <span className="lg:hidden">{t('deck.newHere')}</span>
                    <span className="max-lg:hidden">{t('deck.howItWorks')}</span>
                    <ArrowRight aria-hidden className="size-3.5 shrink-0" />
                  </Link>
                  <div className="flex max-w-full items-center gap-2">
                    {/* cn() cannot tell the rounded-control token is a radius,
                        so only the arbitrary form displaces the bell's own
                        rounded-full. */}
                    <AttentionMenu className="shrink-0 rounded-[var(--radius-control)] border-input hover:border-foreground/60 sm:h-9 sm:w-9" />
                    {/* A long label (uk) wraps inside the button on a 320px phone
                        rather than widen the page. */}
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="min-w-0 max-sm:h-auto max-sm:whitespace-normal max-sm:py-2 max-sm:text-center"
                    >
                      <Link href="/" data-testid="experimental-ui-return">
                        {t('deck.backToObservatory')}
                      </Link>
                    </Button>
                  </div>
                  <SiteLink
                    href={FEEDBACK_HREF}
                    kind="external"
                    data-testid="experimental-ui-feedback"
                    className={`${TOUCH_TARGET_TEXT_LINK_CLASS} link inline-flex items-center gap-1.5 type-body-sm`}
                  >
                    {t('deck.shareFeedback')}
                  </SiteLink>
                </div>
              }
              // A compact H1 lets the art lead; the header ends one rule
              // above the plate.
              className="mb-6 pb-5 sm:mb-6 sm:pb-4 [&_h1]:type-heading-1"
            />
          </div>

          {/* From 1024px the art and the standings share the left column and
              the monument takes the right one across both rows. The first row
              is the art's own height and the second takes the rest, so the
              standings keep the grid's gap under the art whatever the height
              of the console beside them. */}
          <div
            id="deck"
            data-testid="home-deck-layout"
            className="grid scroll-mt-24 grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-12 lg:grid-rows-[auto_1fr] xl:gap-x-14"
          >
            <MemoStageArtwork
              token={bannerToken}
              rotates={imprintedTokenCount > 1}
              paused={artPaused}
              onPausedChange={setArtPaused}
              onReelActiveChange={setReelActive}
              onArtStatus={handleArtStatus}
              className="lg:col-span-7 lg:row-start-1"
            />

            <div
              ref={setMonumentEl}
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
                  <div className="mt-8">
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

            <div
              data-testid="home-deck-board"
              className="min-w-0 lg:col-span-7 lg:row-start-2 lg:self-start"
            >
              {/* The one standings ledger of the app, as on the Observatory. */}
              <StandingsLedger
                champions={champions}
                latestGesture={latestGesture}
                gestureDetailsPending={latestResolution.isSyncing}
                showLastGesture={hasCurrentGesture}
                account={account}
                chronoEth={data ? trackAmounts.chronoEth : null}
                moment={position.moment}
              />
              {account ? (
                <DeckPersonalStrip
                  account={account}
                  gestures={curGestureList}
                  totalGestures={data?.CurNumBids}
                  feedStatus={personalFeedStatus}
                  className="mt-3 border-t"
                />
              ) : null}
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
              {/* From 1024px the chat fills the height the tracks ledger sets
                  and scrolls inside it. Below that it grows with its rows (the
                  chat windows them behind "Show more"), so nothing it holds
                  can spill over the tracks that follow. */}
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
                className="lg:absolute lg:inset-0 print:static print:h-auto"
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
        stepAside={sheetOpen || monumentInView}
        data={data}
        loading={loading}
        allocationTime={allocationTime}
        activationTime={activationTime}
        now={now}
        finalizationConfirmed={finalizationConfirmed}
        submit={submitParts}
        isGesturing={gestureForm.isGesturing}
        txStage={gestureForm.gestureTxStage}
        account={account ?? null}
        canClaim={canClaim}
        isClaiming={isClaiming}
        claimWait={claimWait}
        moment={position.moment}
        onFinalize={() => void handleFinalize('dock')}
        onOpenSheet={openSheet}
        onJumpToPanel={scrollToConsole}
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          // The console's heading names the dialog; there is no separate description.
          aria-describedby={undefined}
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
