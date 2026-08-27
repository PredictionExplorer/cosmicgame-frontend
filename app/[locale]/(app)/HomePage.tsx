'use client';

import { memo, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { zeroAddress } from 'viem';
import { ArrowRight, ChevronDown } from 'lucide-react';
import type { CountdownRenderProps } from 'react-countdown';
import { useQueryClient } from '@tanstack/react-query';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';

import { formatSeconds } from '@/utils';

import { Link } from '@/i18n/navigation';
import { reportError } from '@/utils/errors';
import { useNotify } from '@/hooks/useNotify';
import ConnectWalletButton from '@/components/common/ConnectWalletButton';
import { SmoothCountdown } from '@/components/common/SmoothCountdown';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { GradientText } from '@/components/ui/gradient-text';
import { Spinner } from '@/components/ui/spinner';
import { PageShell } from '@/components/ui/page-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { useActiveWeb3React } from '@/hooks/web3';
import {
  SpecialAllocationRecipients,
  type RoleKey,
} from '@/components/tables/SpecialAllocationRecipients';
import { GestureStatus } from '@/components/common/GestureStatus';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { CyclePhaseGuide } from '@/components/home/CyclePhaseGuide';
import { GestureForm } from '@/components/home/GestureForm';
import { GestureMessageChat, type PendingChatMessage } from '@/components/home/GestureMessageChat';
import { HomeObservatoryHero } from '@/components/home/HomeObservatoryHero';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { AllocationTracksBoard } from '@/components/home/deck/AllocationTracksBoard';
import { CycleMonument } from '@/components/home/deck/CycleMonument';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ADVANCED_SIDE_MEDIA_QUERY } from '@/components/home/GestureForm';
import { GestureAdvancedPanel } from '@/components/home/GestureAdvancedFields';
import { DeckArtCard } from '@/components/home/deck/DeckArtCard';
import { DeckMiniBar } from '@/components/home/deck/DeckMiniBar';
import { DeckPersonalStrip } from '@/components/home/deck/DeckPersonalStrip';
import { GestureComposer } from '@/components/home/deck/GestureComposer';
import { deriveFeedSystemEvents } from '@/components/home/deck/feedSystemEvents';
import { getGestureSubmitLabel } from '@/components/home/deck/gestureSubmitLabel';
import { AttachedNFTAllocationShowcase } from '@/components/attachments/DonatedNFTPrizeShowcase';
import Allocation from '@/components/common/Allocation';
import { useGestureForm } from '@/hooks/useGestureForm';
import { useAllocationFinalize } from '@/hooks/useAllocationFinalize';
import { useEndgameChainSync } from '@/hooks/useEndgameChainSync';
import { useAllocationNotification } from '@/hooks/useAllocationNotification';
import { invalidateLiveGameQueries } from '@/hooks/useLiveGameDataRefresh';
import { useNow } from '@/hooks/useNow';
import { useRotatingIndex } from '@/hooks/useRotatingIndex';
import { useTabTitleCountdown } from '@/hooks/useTabTitleCountdown';
import {
  trackChatJoinCtaClicked,
  trackComposerSheetOpened,
  trackFinalizeSubmitted,
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
import { getCycleState } from '@/lib/cycleState';
import {
  UX_SCENARIO_DEMO_ACCOUNT,
  simulateUxScenarioGesture,
  useUxScenarioSnapshot,
} from '@/lib/uxCycleScenarios';
import type { CSTTokenInfo, DashboardInfo } from '@/services/api';
import { deriveLiveCstGestureData } from '@/utils/cstGesture';

const LatestNFTs = dynamic(() => import('@/components/nft/LatestNFTs'), {
  ssr: false,
  // Reserves roughly the section's final height (heading + divider + one
  // card row) in the section's own background color, so the client-only
  // mount grows the page smoothly instead of slamming the footer downward.
  loading: () => <div className="min-h-[36rem] bg-[#101441] py-20" aria-hidden />,
});

// This page re-renders every second (useNow keeps countdown-derived CTA
// state honest). These sections never consume the tick, so memo boundaries
// stop the per-second reconciliation of the heaviest subtrees — the chat
// feed alone renders dozens of rows — which directly reduces main-thread
// churn (INP) on mid-range phones. Their props are kept referentially
// stable below (useMemo'd arrays, useCallback handlers).
const MemoHomeObservatoryHero = memo(HomeObservatoryHero);
const MemoGestureMessageChat = memo(GestureMessageChat);
const MemoSpecialAllocationRecipients = memo(SpecialAllocationRecipients);
// The hero re-renders on every 1 Hz countdown tick otherwise; its props are
// all memoised/stable so memo() keeps the reel's videos untouched.
const MemoDeckArtCard = memo(DeckArtCard);
// Stable role lists: an inline array literal would be a fresh reference every
// render and defeat memo() (the leaderboard would re-render on countdown ticks).
const RAIL_LEADER_ROLES: RoleKey[] = ['latest', 'chrono'];
const LINKS_ROW_ROLES: RoleKey[] = ['lastcst'];
const MemoAllocation = memo(Allocation);
const MemoAttachedNFTAllocationShowcase = memo(AttachedNFTAllocationShowcase);

// Transform-only (no opacity ramp): several of these sections sit in the
// first viewport, and fading in from server-rendered `opacity: 0` would gate
// their paint — and potentially the page's LCP — on hydration.
const sectionFade = {
  hidden: { y: 20 },
  visible: { y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

/**
 * Marks the browser as a returning visitor. The story section (demoted hero)
 * auto-collapses for returning visitors after hydration; it sits below the
 * fold, so the collapse is never a visible layout shift, and the SSR HTML
 * always carries the full crawlable content.
 */
const STORY_VISITED_STORAGE_KEY = 'cosmic-observatory-visited';

/** Chosen "notify me before finalization" threshold, in minutes. */
const NOTIFY_THRESHOLD_STORAGE_KEY = 'cosmic-notify-threshold-min';
const DEFAULT_NOTIFY_THRESHOLD_MIN = 5;

/** Pending optimistic chat rows expire if the indexer never echoes them. */
const PENDING_MESSAGE_EXPIRY_MS = 90_000;

interface HomePageProps {
  initialDashboardData?: DashboardInfo | null;
  /** Server-picked story artwork so its URL ships in the SSR HTML. */
  initialBannerToken?: { id: number; info: CSTTokenInfo } | null;
}

const HomePage = ({ initialDashboardData = null, initialBannerToken = null }: HomePageProps) => {
  const t = useTranslations('home');
  const tToast = useTranslations('toasts');
  const locale = useLocale();
  const { account } = useActiveWeb3React();
  const queryClient = useQueryClient();
  const { notify } = useNotify();
  const uxScenario = useUxScenarioSnapshot();

  const renderInlineCountdown = ({ total }: CountdownRenderProps) => (
    <span className="font-mono tabular-nums">{formatSeconds(Math.ceil(total / 1000), locale)}</span>
  );

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    isError: dashboardFailed,
    refetch: refetchDashboard,
  } = useDashboardInfo(initialDashboardData);
  const { data: currentTimeData, dataUpdatedAt: currentTimeUpdatedAt } = useCurrentTime();

  const round = dashboardData?.CurRoundNum ?? -1;
  const { data: bidListData } = useGestureListByCycle(round, 'desc');
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
  const now = useNow(1000);
  const [currentTimeFallbackMs] = useState(() => Date.now());

  const offset = useMemo(() => {
    if (currentTimeData == null) return 0;
    const sampledAtMs = currentTimeUpdatedAt || currentTimeFallbackMs;
    return currentTimeData * 1000 - sampledAtMs;
  }, [currentTimeData, currentTimeUpdatedAt, currentTimeFallbackMs]);

  const [gesturePulseKey, setGesturePulseKey] = useState(0);
  const imprintedTokenCount = dashboardData?.MainStats.NumCSTokenMints ?? 0;
  // The server picks the first artwork (initialBannerToken) so its URL is
  // discoverable in the prerendered HTML; the client rotation starts from
  // that index and the seeded query below keeps the first client render
  // byte-identical with the SSR output.
  // While the hero's generation reel plays, the reel (not the timer) decides
  // when to move on: each clip runs to its end, then `reelAdvance` steps the
  // index. The timer only rotates the still image (small screens, reduced
  // motion, or a clip that failed to play).
  const [reelActive, setReelActive] = useState(false);
  const [reelAdvance, setReelAdvance] = useState(0);
  const handleReelEnded = useCallback(() => setReelAdvance((n) => n + 1), []);
  const bannerTokenId = useRotatingIndex({
    count: imprintedTokenCount,
    intervalMs: 15_000,
    enabled: imprintedTokenCount > 1 && !reelActive,
    randomStart: true,
    initialIndex: initialBannerToken?.id ?? null,
    advanceSignal: reelAdvance,
  });

  const { data: bannerCSTInfo, isError: bannerCSTError } = useCSTInfo(
    bannerTokenId,
    bannerTokenId != null && bannerTokenId === initialBannerToken?.id
      ? initialBannerToken.info
      : undefined,
  );

  const resolvedBannerToken = useMemo(
    () =>
      bannerTokenId != null && bannerCSTInfo
        ? { seed: `0x${bannerCSTInfo.Seed}`, id: bannerTokenId }
        : null,
    [bannerTokenId, bannerCSTInfo],
  );
  // While the next index's seed is still loading, keep showing the token we
  // already have rather than snapping back to the server-picked first one —
  // with the reel that snap would play a whole wrong clip. ("Adjust state
  // when a prop changes" pattern: no effect.)
  const [heldBannerToken, setHeldBannerToken] = useState(resolvedBannerToken);
  if (resolvedBannerToken && resolvedBannerToken !== heldBannerToken) {
    setHeldBannerToken(resolvedBannerToken);
  }
  const bannerToken = useMemo(() => {
    if (resolvedBannerToken) return resolvedBannerToken;
    if (heldBannerToken) return heldBannerToken;
    if (initialBannerToken?.info.Seed)
      return { seed: `0x${initialBannerToken.info.Seed}`, id: initialBannerToken.id };
    return null;
  }, [resolvedBannerToken, heldBannerToken, initialBannerToken]);
  // The reel cannot end a clip it never got a seed for: skip such a token so
  // rotation does not stall on one broken lookup.
  useEffect(() => {
    if (reelActive && bannerCSTError) setReelAdvance((n) => n + 1);
  }, [reelActive, bannerCSTError, bannerTokenId]);

  // The token the rotation shows next, resolved early so the hero reel can
  // pre-load its clip while the current one plays.
  const nextBannerTokenId =
    bannerTokenId != null && imprintedTokenCount > 1
      ? (bannerTokenId + 1) % imprintedTokenCount
      : null;
  const { data: nextBannerCSTInfo } = useCSTInfo(nextBannerTokenId);
  const nextBannerToken = useMemo(() => {
    if (nextBannerTokenId == null || !nextBannerCSTInfo?.Seed) return null;
    return { seed: `0x${nextBannerCSTInfo.Seed}`, id: nextBannerTokenId };
  }, [nextBannerTokenId, nextBannerCSTInfo]);

  const gestureForm = useGestureForm();
  const allocationFinalize = useAllocationFinalize({ data, offset });

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
    advancedExpanded,
    setAdvancedExpanded,
  } = gestureForm;
  // Hook placement: above the early returns below (rules-of-hooks).
  const isAdvancedSideViewport = useMediaQuery(ADVANCED_SIDE_MEDIA_QUERY);
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
    activationTime,
    onFinalize,
  } = allocationFinalize;

  // Final-minute synchronizer: 1s direct-chain reads (racing both RPC nodes,
  // ETL/backend bypassed) that keep the countdown target, last bidder, and
  // claim state within ~1-2s of on-chain reality around the zero-cross.
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
    async (source: GestureSurface = 'console') => {
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
  const handleFinalize = useCallback(
    async (source: GestureSurface = 'console') => {
      if (await onFinalize()) {
        trackFinalizeSubmitted(source);
        withPostTxRefresh(1000, 3000);
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
  const cycleTimerEnded = cycleState.isReadyToFinalize || cycleState.isConfirmingFinalization;
  const isFinalWindow =
    cycleState.phase === 'final-hour' ||
    cycleState.phase === 'final-ten' ||
    cycleState.phase === 'final-minute';

  // Endgame theater: the tab title ticks during the final window so players
  // who tabbed away can see the clock closing from anywhere.
  useTabTitleCountdown({ enabled: isFinalWindow, targetMs: allocationTime });

  // One shared label for every gesture submit surface (console, monument,
  // composer) so the displayed cost can never drift between them.
  const submitLabel = getGestureSubmitLabel({
    t,
    gestureType,
    ethPrice: ethGestureInfo?.ETHPrice ?? 0,
    gestureCostPlus,
    rwlkId,
    cstGestureData: liveCstGestureData,
  });

  const scrollToGestureForm = useCallback(() => {
    const el = document.getElementById('make-gesture');
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handlePrimaryCtaClick = useCallback(() => {
    scrollToGestureForm();
  }, [scrollToGestureForm]);

  // Method pills reset any picked RandomWalk token, exactly like the full
  // console's method buttons, so a stale token can't ride along silently.
  const handleSelectGestureType = useCallback(
    (value: string) => {
      setRwlkId(-1);
      setBidType(value);
    },
    [setBidType, setRwlkId],
  );

  // Returning visitors get the story section collapsed to a disclosure row.
  // SSR and first hydration render it expanded (state starts false), so
  // there is no hydration mismatch; the effect flips it below the fold.
  const [storyCollapsed, setStoryCollapsed] = useState(false);
  useEffect(() => {
    if (window.localStorage.getItem(STORY_VISITED_STORAGE_KEY) === '1') {
      setStoryCollapsed(true);
    } else {
      window.localStorage.setItem(STORY_VISITED_STORAGE_KEY, '1');
    }
  }, []);

  // The mini-bar appears only after the Deck scrolls out of view. jsdom has
  // no IntersectionObserver, so the guard also keeps unit tests quiet.
  const deckContainerRef = useRef<HTMLDivElement | null>(null);
  const [deckOutOfView, setDeckOutOfView] = useState(false);
  useEffect(() => {
    const el = deckContainerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setDeckOutOfView(entry ? !entry.isIntersecting : false),
      // Roughly the sticky header height: the Deck counts as "gone" once it
      // has fully passed under the chrome.
      { rootMargin: '-96px 0px 0px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToDeck = useCallback(() => {
    const el = document.getElementById('deck');
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  // Chat empty-state CTA: bring the composer into view and focus it. Falls
  // back to the full console's message field when the composer isn't
  // rendered (disconnected wallet or inactive cycle).
  const composerInputRef = useRef<HTMLTextAreaElement | null>(null);
  const handleJoinChatCta = useCallback(() => {
    trackChatJoinCtaClicked();
    const el = composerInputRef.current;
    if (el) {
      if (typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      el.focus({ preventScroll: true });
      return;
    }
    setAdvancedExpanded(true);
    scrollToGestureForm();
  }, [scrollToGestureForm, setAdvancedExpanded]);

  // Mobile bottom-sheet composer: lets phones gesture-and-post from anywhere
  // on the page instead of scrolling back to the Deck.
  const [composerSheetOpen, setComposerSheetOpen] = useState(false);
  const openComposerSheet = useCallback(() => {
    trackComposerSheetOpened();
    setComposerSheetOpen(true);
  }, []);

  const hasAttachedAssets = donatedNFTs.length > 0 || donatedERC20Tokens.length > 0;
  const cycleNumber = data?.CurRoundNum;
  const previousCycle = (cycleNumber ?? 0) - 1;
  const hasPreviousCycle = previousCycle > 0;

  // Without the dashboard read there is no cycle number, countdown, or
  // allocation pool — rendering the page would show an idle cycle that does
  // not exist, so say the read failed and offer a retry instead.
  if (dashboardFailed && !dashboardData) {
    return (
      <PageShell variant="data" backdrop="signature">
        <ErrorState
          title={t('error.title')}
          message={t('error.message')}
          onRetry={() => void refetchDashboard()}
          surface
        />
      </PageShell>
    );
  }

  // The full gesture console (method selector, RWLK picker, CST economics,
  // message + attachments, submit/finalize, connect prompt). Rendered inside
  // CycleMonument so the cycle clock and the act of gesturing are one surface;
  // HomePage keeps all form state. Same gate the standalone section had.
  // "Advanced" opens SIDEWAYS, not downward: at xl the monument takes the
  // chat column's space and the Advanced body fills a full-height panel
  // beside the monument body, so the centre card keeps its height. The same
  // media query gates GestureForm's inline body, so the fields exist once.
  const advancedConsoleWide =
    advancedExpanded && isAdvancedSideViewport && !loading && isRoundActive && !!account;
  const advancedSidePanel = advancedConsoleWide ? (
    <GestureAdvancedPanel {...gestureForm} showAll={data?.LastBidderAddr !== zeroAddress} />
  ) : undefined;

  const gestureConsole =
    loading || isRoundActive ? (
      <div id="make-gesture" className="scroll-mt-28">
        <h2 className="font-display text-lg font-bold tracking-tight mb-0.5">{t('form.title')}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t('form.subtitle')}</p>

        {loading ? (
          <div
            className="space-y-5"
            role="status"
            aria-label={t('form.loadingAria')}
            data-testid="gesture-form-skeleton"
          >
            {/* Plain Skeletons only: nesting SkeletonText would add a second role="status". */}
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/5" />
            <div className="grid gap-2 sm:grid-cols-3">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-12 rounded-md" />
          </div>
        ) : account ? (
          <>
            <GestureForm
              {...gestureForm}
              cstGestureData={liveCstGestureData}
              data={data}
              advancedPlacement="side"
            />

            <div className="mt-6 space-y-4">
              {canGesture && (
                <Button
                  id="gesture-submit"
                  size="lg"
                  onClick={() => void handleGesture('console')}
                  className="w-full bg-gradient-to-r from-[#15BFFD] to-[#9C37FD] hover:opacity-90 text-white border-0 font-semibold text-base h-12"
                  disabled={
                    isGesturing ||
                    (gestureType === 'RandomWalk' && rwlkId === -1) ||
                    gestureType === ''
                  }
                >
                  {isGesturing ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" /> {t('form.processing')}
                    </span>
                  ) : (
                    <>
                      {submitLabel} <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              )}
              {account && !canGesture && cycleTimerEnded === false && (
                <p className="text-sm text-muted-foreground">{t('form.finalGestureMade')}</p>
              )}
              {canClaim && (
                <>
                  <Button
                    size="lg"
                    onClick={() => void handleFinalize('console')}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 text-white border-0 font-semibold text-base h-12"
                    disabled={isClaiming || (data?.LastBidderAddr !== account && claimWait > now)}
                  >
                    {isClaiming ? (
                      <span className="flex items-center gap-2">
                        <Spinner size="sm" /> {t('form.processing')}
                      </span>
                    ) : (
                      <>
                        {t('form.finalize')}
                        <span className="flex items-center">
                          {claimWait > now && data?.LastBidderAddr !== account && (
                            <>
                              &nbsp;{t('form.finalizeAvailableIn')} &nbsp;
                              <SmoothCountdown
                                date={claimWait}
                                renderer={renderInlineCountdown}
                                intervalMs={1000}
                              />
                            </>
                          )}
                          &nbsp;
                          <ArrowRight className="h-[22px] w-[22px]" />
                        </span>
                      </>
                    )}
                  </Button>
                  {data?.LastBidderAddr !== account && claimWait > now && (
                    <p className="text-sm italic text-right text-primary">
                      {t('form.finalizeWaitNote')}
                    </p>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <div data-testid="connect-to-gesture" className="space-y-5">
            <GestureForm
              {...gestureForm}
              cstGestureData={liveCstGestureData}
              data={data}
              previewMode
            />
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="font-display text-lg font-semibold tracking-tight">
                {t('form.connect.title')}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{t('form.connect.body')}</p>
              <div className="mt-4">
                <ConnectWalletButton
                  isMobileView={false}
                  loading={false}
                  balance={{ ETH: 0, CosmicToken: 0, CosmicSignature: 0, RWLK: 0 }}
                  stakedTokenCount={{ cst: 0, rwalk: 0 }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    ) : undefined;

  return (
    <LazyMotion features={domAnimation}>
      <PageShell
        variant="data"
        backdrop="signature"
        className="xl:max-w-[92rem] 2xl:max-w-[108rem] 2xl:px-10"
      >
        {uxScenario && (
          <div className="mb-5 rounded-xl border border-amber-300/25 bg-amber-300/[0.08] px-4 py-3 text-sm text-amber-100">
            <span className="font-semibold text-amber-50">UX scenario: {uxScenario.name}</span>
            <span className="ml-2 text-amber-100/80">
              Cycle data and gesture placement are simulated for local UI testing.
            </span>
          </div>
        )}

        {/* ===== DECK HEADER (page H1 — must stay in the server HTML) =====
            Leads the page, above the artwork banner (Andrew, 2026-08-27).
            A <div>, not <header>: the site banner owns the header landmark,
            and e2e selectors like `header a[href]` must keep resolving to
            the navigation chrome only. */}
        <div
          data-testid="home-deck-header"
          className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3"
        >
          <div className="min-w-0">
            <div className="mb-2.5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300 animate-live-dot" />
              {cycleNumber == null
                ? t('hero.cycleFallback')
                : t('hero.cycleNumber', { number: String(cycleNumber) })}
            </div>
            <GradientText
              as="h1"
              id="home-deck-title"
              className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
            >
              {t('deck.title')}
            </GradientText>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t('deck.intro')}
            </p>
          </div>
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary"
          >
            {t('deck.newHere')}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        {/* ===== ARTWORK HERO =====
            The protocol is an art performance first: a real imprinted
            Signature fills the page's first band, right under the title. */}
        <div data-testid="home-art-hero" className="mb-8">
          <MemoDeckArtCard
            bannerToken={bannerToken}
            nextBannerToken={nextBannerToken}
            variant="hero"
            onReelEnded={handleReelEnded}
            onReelActiveChange={setReelActive}
          />
        </div>

        {/* ===== THE DECK: board | monument | chat ===== */}
        <div
          id="deck"
          ref={deckContainerRef}
          data-testid="home-deck-layout"
          className="grid scroll-mt-24 items-start gap-5 xl:mt-14 xl:items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)] xl:grid-cols-[minmax(18rem,23rem)_minmax(0,1fr)_minmax(23rem,27rem)] 2xl:grid-cols-[minmax(20rem,25rem)_minmax(0,1fr)_minmax(25rem,30rem)] 2xl:gap-6"
        >
          <div
            data-testid="home-deck-board"
            // grid-cols-1 at base is load-bearing: without an explicit track
            // the implicit `auto` column sizes to max-content, which defeats
            // every `truncate` inside the board on narrow phones.
            // The leaderboard heading (28px text + 16px gap) floats above the deck
            // line at xl: the negative margin lifts it into the xl:mt-14 band so
            // the first CARD's top edge aligns with the monument and composer.
            className="order-2 grid min-w-0 grid-cols-1 gap-5 lg:order-3 lg:col-span-2 lg:grid-cols-2 xl:order-1 xl:col-span-1 xl:grid-cols-1 xl:-mt-11"
          >
            {/* The cycle leaderboard rides beside the monument: what the
                previous gesture paid and who holds the records are the context
                for making a gesture, so they share the first viewport. */}
            {/* Always rendered: each role card has its own empty state, and a
                gate here (as before) left the whole left column blank while a
                cycle waits for its first gesture. */}
            <MemoSpecialAllocationRecipients
              currentAccount={account}
              latestMessage={curGestureList[0]?.Message ?? ''}
              latestGesture={curGestureList[0] ?? null}
              layout="stack"
              roles={RAIL_LEADER_ROLES}
              fillHeight
            />
          </div>

          <div
            data-testid="home-deck-monument"
            className={cn('order-1 min-w-0 xl:order-2', advancedConsoleWide && 'xl:col-span-2')}
          >
            <CycleMonument
              data={data}
              loading={loading}
              allocationTime={allocationTime}
              activationTime={activationTime}
              now={now}
              finalizationConfirmed={finalizationConfirmed}
              latestGesture={curGestureList[0] ?? null}
              pulseKey={gesturePulseKey}
              account={account}
              gestureConsole={gestureConsole}
              sidePanel={advancedSidePanel}
              notifyThresholdMin={notifyThresholdMin}
              onNotifyThresholdChange={handleNotifyThresholdChange}
              attachedNFTCount={donatedNFTs.length}
              attachedERC20Count={donatedERC20Tokens.length}
            />
          </div>

          <div
            data-testid="home-deck-chat"
            // Phones read monument → leaders → chat (the leaders are the
            // context for a gesture); lg pairs monument | chat with the
            // leaders below; xl is board | monument | chat.
            className={cn(
              'order-3 min-w-0 space-y-3 lg:order-2 xl:order-3 xl:flex xl:min-h-0 xl:flex-col',
              advancedConsoleWide && 'xl:hidden',
            )}
          >
            {!loading && isRoundActive && (
              <GestureComposer
                message={gestureForm.message}
                setMessage={setMessage}
                gestureType={gestureType}
                onSelectGestureType={handleSelectGestureType}
                showCstOption={data?.LastBidderAddr !== zeroAddress}
                cstIsFree={liveCstGestureData.isFree}
                rwlkId={rwlkId}
                account={account}
                isGesturing={isGesturing}
                canGesture={canGesture}
                submitLabel={submitLabel}
                onGesture={() => void handleGesture('composer')}
                onOpenFullConsole={scrollToGestureForm}
                textareaRef={composerInputRef}
              />
            )}
            <MemoGestureMessageChat
              gestures={curGestureList}
              cycleNumber={round >= 0 ? round : undefined}
              pulseKey={gesturePulseKey}
              onJoinCta={!loading && isRoundActive ? handleJoinChatCta : undefined}
              systemEvents={feedSystemEvents}
              pendingMessages={pendingMessages}
              // The clamp is the chat's OWN size for the grid row's intrinsic
              // height — without it a long feed makes the whole deck as tall
              // as the feed. flex-auto (NOT flex-1, whose basis 0 discards
              // the height) then grows it into whatever slack the
              // monument-driven row leaves, and the list scrolls inside.
              className="xl:h-[clamp(22rem,48vh,30rem)] xl:min-h-0 xl:flex-auto 2xl:h-[clamp(24rem,46vh,32rem)] print:max-h-none"
            />

            {/* ===== DETAIL RAIL (prices, standing, links, receipts) =====
                Lives under the chat so the deck's right column is the one
                place for everything that supports the cycle. */}
            <div data-testid="home-rail-column" className="space-y-6">
              <GestureStatus
                data={data}
                loading={loading}
                activationTime={activationTime}
                curGestureList={curGestureList}
                ethGestureInfo={ethGestureInfo}
                cstGestureData={liveCstGestureData}
                allocationTime={allocationTime}
                suppressPrimaryTimer
                attachedNFTCount={donatedNFTs.length}
                attachedERC20Count={donatedERC20Tokens.length}
              />

              {/* ===== ATTACHED ASSET RECEIPT ===== */}
              {hasAttachedAssets && (
                <m.div
                  data-testid="home-rail-attached-assets"
                  variants={sectionFade}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.48 }}
                  className="print-motion-visible"
                >
                  <MemoAttachedNFTAllocationShowcase
                    nfts={donatedNFTs}
                    erc20Tokens={donatedERC20Tokens}
                    cycleNumber={round >= 0 ? round : undefined}
                    variant="rail"
                  />
                </m.div>
              )}
            </div>
          </div>
        </div>

        {/* ===== YOUR POSITION (connected wallets) ===== */}
        {account && (
          <div className="mt-5">
            <DeckPersonalStrip
              account={account}
              data={data}
              gestures={curGestureList}
              cstRewardPreview={gestureForm.gestureCstRewardAmount}
            />
          </div>
        )}

        {/* ===== LINKS ROW: cycle links + the Final CST Gesture role =====
            One full-width strip between the deck and the allocation band. */}
        <div data-testid="home-links-row" className="mt-8 grid items-stretch gap-5 md:grid-cols-3">
          {/* ===== FULL ROUND DETAILS LINK ===== */}
          <m.div
            variants={sectionFade}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            className="print-motion-visible h-full"
          >
            <Link
              href="/current-cycle"
              data-testid="cycle-details-link-card"
              className="group relative isolate flex h-full items-center justify-between overflow-hidden rounded-2xl border border-primary/15 bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.10),rgb(255_255_255/0.035)_48%,rgb(var(--nebula-violet-rgb)/0.12))] p-5 shadow-[0_24px_90px_-58px_rgb(var(--aurora-cyan-rgb)/0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/[0.055]"
            >
              <span className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
              <span className="pointer-events-none absolute -bottom-14 left-8 h-28 w-28 rounded-full bg-[rgb(var(--nebula-violet-rgb)/0.18)] blur-3xl" />
              <span className="relative min-w-0">
                <span className="block text-sm font-semibold text-white">
                  {t('cycleDetails.title')}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {t('cycleDetails.subtitle')}
                </span>
              </span>
              <ArrowRight className="relative h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          </m.div>

          {hasPreviousCycle && (
            <Link
              href={`/allocation/${previousCycle}`}
              data-testid="previous-cycle-link-card"
              className="flex h-full items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 text-sm text-muted-foreground transition-all duration-300 hover:border-primary/25 hover:bg-white/[0.045] hover:text-primary"
            >
              {t('hero.console.previousAllocations', { number: String(previousCycle) })}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {data?.TsRoundStart !== 0 && (
            <MemoSpecialAllocationRecipients
              layout="stack"
              roles={LINKS_ROW_ROLES}
              hideHeading
              fillHeight
            />
          )}
        </div>

        {/* ===== ALLOCATION BAND: tracks rail | breakdown + cycle explainer ===== */}
        <div data-testid="home-allocation-band" className="mt-12">
          {/* The heading floats above the band's line, left-aligned over the
              tracks column — rectangles below all start on the same line. */}
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold tracking-tight">
              {t('allocation.title')}
            </h3>
            <InfoTooltip content={t('allocation.titleTooltip')} />
          </div>
          {/* xl: the tracks card stretches so its bottom border lands on the
              same line as the cycle-phase guide's (the guide's own trailing
              margin is zeroed here so that line is its real border). */}
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(18rem,23rem)_minmax(0,1fr)] xl:items-stretch">
            <AllocationTracksBoard data={data} account={account} className="xl:h-full" />
            <div className="min-w-0">
              {data && (
                <m.div
                  id="allocation-breakdown"
                  variants={sectionFade}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.4 }}
                  className="print-motion-visible scroll-mt-24"
                >
                  <MemoAllocation data={data} hideHeading />
                </m.div>
              )}

              {/* ===== CYCLE EXPLAINER (education, crawlable) ===== */}
              <div className="mt-8">
                <CyclePhaseGuide
                  className="mb-0"
                  data={data}
                  loading={loading}
                  allocationTime={allocationTime}
                  activationTime={activationTime}
                  now={now}
                  finalizationConfirmed={finalizationConfirmed}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===== STORY: what Cosmic Signature is (crawlable, below the fold).
            SSR always ships the full section; returning visitors get it
            collapsed to this disclosure after hydration. ===== */}
        <div data-testid="home-story-section" className="mt-12">
          {storyCollapsed ? (
            <button
              type="button"
              data-testid="story-expand"
              onClick={() => setStoryCollapsed(false)}
              className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-left transition-colors hover:border-primary/30 hover:bg-white/[0.05]"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">
                  {t('deck.story.collapsedTitle')}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {t('deck.story.collapsedSubtitle')}
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-primary">
                {t('deck.story.expand')}
                <ChevronDown className="h-4 w-4" aria-hidden />
              </span>
            </button>
          ) : (
            <MemoHomeObservatoryHero
              data={data}
              bannerToken={bannerToken}
              canOpenGesturePanel={!loading && isRoundActive}
              phase={cycleState.phase}
              onPrimaryCtaClick={handlePrimaryCtaClick}
              headingLevel="h2"
            />
          )}
        </div>
      </PageShell>

      {/* Endgame theater: full-viewport vignette during the final window. */}
      {isFinalWindow && cycleState.phase !== 'final-hour' && (
        <div
          aria-hidden
          data-testid="final-window-vignette"
          className="pointer-events-none fixed inset-0 z-20 bg-[radial-gradient(ellipse_at_center,transparent_52%,rgb(var(--chrono-rose-rgb)/0.13)_80%,rgb(127_29_29/0.30))] motion-safe:animate-pulse-glow print:hidden"
        />
      )}

      <DeckMiniBar
        visible={deckOutOfView}
        data={data}
        loading={loading}
        allocationTime={allocationTime}
        activationTime={activationTime}
        now={now}
        finalizationConfirmed={finalizationConfirmed}
        account={account}
        canGesture={canGesture}
        isGesturing={isGesturing}
        submitLabel={submitLabel}
        onGesture={() => void handleGesture('mini-bar')}
        onJumpToDeck={scrollToDeck}
      />

      {!loading && isRoundActive && (
        <div className="fixed inset-x-3 bottom-3 z-40 sm:hidden">
          {account ? (
            <Button
              size="lg"
              data-testid="mobile-composer-fab"
              onClick={openComposerSheet}
              className="h-12 w-full rounded-full shadow-[0_20px_70px_-30px_rgb(var(--aurora-cyan-rgb)/1)]"
            >
              {submitLabel}
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="h-12 w-full rounded-full shadow-[0_20px_70px_-30px_rgb(var(--aurora-cyan-rgb)/1)]"
            >
              <Link href="#deck">{t('mobileCta.preview')}</Link>
            </Button>
          )}
        </div>
      )}

      {/* Mobile bottom-sheet composer: same shared form state as every other
          surface, so drafts follow the player between the sheet and the Deck. */}
      <Sheet open={composerSheetOpen} onOpenChange={setComposerSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl border-white/[0.10] bg-[rgb(10_14_42/0.97)] p-4 pb-6 sm:hidden"
        >
          <SheetTitle className="sr-only">{t('deck.composer.title')}</SheetTitle>
          <GestureComposer
            message={gestureForm.message}
            setMessage={setMessage}
            gestureType={gestureType}
            onSelectGestureType={handleSelectGestureType}
            showCstOption={data?.LastBidderAddr !== zeroAddress}
            cstIsFree={liveCstGestureData.isFree}
            rwlkId={rwlkId}
            account={account}
            isGesturing={isGesturing}
            canGesture={canGesture}
            submitLabel={submitLabel}
            onGesture={() => {
              setComposerSheetOpen(false);
              void handleGesture('sheet');
            }}
            onOpenFullConsole={() => {
              setComposerSheetOpen(false);
              scrollToGestureForm();
            }}
          />
        </SheetContent>
      </Sheet>

      <LatestNFTs />
    </LazyMotion>
  );
};

export default HomePage;
