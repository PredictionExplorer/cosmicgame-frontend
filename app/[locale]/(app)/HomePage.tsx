'use client';

import { memo, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { zeroAddress } from 'viem';
import { ArrowRight, Radio } from 'lucide-react';
import type { CountdownRenderProps } from 'react-countdown';
import { useQueryClient } from '@tanstack/react-query';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';

import { formatSeconds, shortenHex } from '@/utils';

import { Link } from '@/i18n/navigation';
import { reportError } from '@/utils/errors';
import { useNotify } from '@/hooks/useNotify';
import ConnectWalletButton from '@/components/common/ConnectWalletButton';
import { SmoothCountdown } from '@/components/common/SmoothCountdown';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Spinner } from '@/components/ui/spinner';
import { PageShell } from '@/components/ui/page-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { useActiveWeb3React } from '@/hooks/web3';
import { SpecialAllocationRecipients } from '@/components/tables/SpecialAllocationRecipients';
import { GestureStatus } from '@/components/common/GestureStatus';
import { ChronoCoreTimer } from '@/components/home/ChronoCoreTimer';
import { CyclePhaseGuide } from '@/components/home/CyclePhaseGuide';
import { GestureForm } from '@/components/home/GestureForm';
import { GestureMessageChat } from '@/components/home/GestureMessageChat';
import { HomeObservatoryHero } from '@/components/home/HomeObservatoryHero';
import { PublicGoodsImpactCard } from '@/components/home/PublicGoodsImpactCard';
import { AttachedNFTAllocationShowcase } from '@/components/attachments/DonatedNFTPrizeShowcase';
import Allocation from '@/components/common/Allocation';
import { useGestureForm } from '@/hooks/useGestureForm';
import { useAllocationFinalize } from '@/hooks/useAllocationFinalize';
import { useEndgameChainSync } from '@/hooks/useEndgameChainSync';
import { useAllocationNotification } from '@/hooks/useAllocationNotification';
import { invalidateLiveGameQueries } from '@/hooks/useLiveGameDataRefresh';
import { useLivePulse } from '@/hooks/useLivePulse';
import { useNow } from '@/hooks/useNow';
import { useRotatingIndex } from '@/hooks/useRotatingIndex';
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
import type { CSTTokenInfo, DashboardInfo, GestureInfo } from '@/services/api';
import { deriveLiveCstGestureData } from '@/utils/cstGesture';
import { formatFixed } from '@/utils/format';

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
const MemoAllocation = memo(Allocation);
const MemoPublicGoodsImpactCard = memo(PublicGoodsImpactCard);
const MemoAttachedNFTAllocationShowcase = memo(AttachedNFTAllocationShowcase);

// Transform-only (no opacity ramp): several of these sections sit in the
// first viewport, and fading in from server-rendered `opacity: 0` would gate
// their paint — and potentially the page's LCP — on hydration.
const sectionFade = {
  hidden: { y: 20 },
  visible: { y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

type HomeTranslator = ReturnType<typeof useTranslations>;

function formatRelativeGestureAge(timestamp: unknown, nowMs: number, t: HomeTranslator): string {
  const numericTimestamp = Number(timestamp);
  if (!Number.isFinite(numericTimestamp) || numericTimestamp <= 0) return t('ticker.age.justNow');
  const elapsedSeconds = Math.max(0, Math.floor((nowMs - numericTimestamp * 1000) / 1000));
  if (elapsedSeconds < 60) return t('ticker.age.seconds', { count: String(elapsedSeconds) });
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return t('ticker.age.minutes', { count: String(elapsedMinutes) });
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return t('ticker.age.hours', { count: String(elapsedHours) });
  return t('ticker.age.days', { count: String(Math.floor(elapsedHours / 24)) });
}

function getGestureKindSelectValue(gestureType: unknown): 'eth' | 'randomWalk' | 'cst' {
  if (gestureType === 2) return 'cst';
  if (gestureType === 1) return 'randomWalk';
  return 'eth';
}

function LatestGestureTicker({
  gesture,
  pulseKey,
}: {
  gesture: GestureInfo | null;
  pulseKey: number;
}) {
  const t = useTranslations('home');
  const nowMs = useNow(15_000);
  const isPulsing = useLivePulse(pulseKey);

  if (!gesture) return null;

  return (
    <Link
      href={`/gesture/${gesture.EvtLogId}`}
      className={`mt-4 flex items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-primary/[0.055] px-4 py-3 text-sm transition-colors hover:border-primary/35 hover:bg-primary/[0.08] ${
        isPulsing ? 'animate-live-flash' : ''
      }`}
      aria-label={t('ticker.openLatestAria', { id: String(gesture.EvtLogId) })}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20">
          <Radio className="h-4 w-4" />
          {isPulsing && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-300" />
          )}
        </span>
        <span className="min-w-0">
          {/* Wraps to two lines on a phone rather than truncating: the address
              is the useful part and the ellipsis cut it off entirely. */}
          <span className="block break-words font-medium text-foreground sm:truncate">
            {t('ticker.gestureLine', {
              address: shortenHex(gesture.BidderAddr, 6),
              kind: getGestureKindSelectValue(gesture.GestureType),
            })}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {formatRelativeGestureAge(gesture.TimeStamp, nowMs, t)}
          </span>
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

interface HomePageProps {
  initialDashboardData?: DashboardInfo | null;
  /** Server-picked hero artwork so the LCP image URL ships in the SSR HTML. */
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
  // The server picks the first artwork (initialBannerToken) so its priority
  // image is discoverable in the prerendered HTML; the client rotation
  // starts from that index and the seeded query below keeps the first
  // client render byte-identical with the SSR output.
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
  const allocationFinalize = useAllocationFinalize({ data, offset });
  const { playAudio, requestNotificationPermission } = useAllocationNotification({
    allocationTime: allocationFinalize.allocationTime,
    notificationTitle: t('notifications.finalizationSoonTitle'),
    notificationBody: t('notifications.finalizationSoonBody'),
  });

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
    setAdvancedExpanded,
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

  const handleGesture = useCallback(async () => {
    requestNotificationPermission();
    if (uxScenario) {
      const nextScenario = simulateUxScenarioGesture({
        bidder: account ?? UX_SCENARIO_DEMO_ACCOUNT,
        gestureType: gestureType as 'ETH' | 'RandomWalk' | 'CST',
        message: gestureForm.message,
      });
      if (nextScenario) {
        setMessage('');
        setGesturePulseKey((value) => value + 1);
        notify('success', tToast('gesture.simulated', { seconds: nextScenario.extensionSeconds }));
      }
      return;
    }
    if (await (gestureType === 'CST' ? onGestureWithCST() : onGesture())) {
      optimisticallyRecordGesture();
      withPostTxRefresh();
    }
  }, [
    account,
    gestureForm.message,
    gestureType,
    notify,
    onGesture,
    onGestureWithCST,
    optimisticallyRecordGesture,
    requestNotificationPermission,
    setMessage,
    tToast,
    uxScenario,
    withPostTxRefresh,
  ]);
  const handleFinalize = useCallback(async () => {
    if (await onFinalize()) withPostTxRefresh(1000, 3000);
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

  const getGestureLabel = () => {
    const adj = (ethGestureInfo?.ETHPrice ?? 0) * (1 + gestureCostPlus / 100);
    const fmt = (v: number, threshold: number) => (v > threshold ? v.toFixed(2) : v.toFixed(5));
    if (gestureType === 'ETH') return t('form.submit.eth', { cost: fmt(adj, 0.1) });
    if (gestureType === 'RandomWalk' && rwlkId !== -1)
      return t('form.submit.randomWalkWithToken', {
        tokenId: String(rwlkId),
        cost: fmt(adj * 0.5, 0.2),
      });
    if (gestureType === 'CST') {
      if (liveCstGestureData.isFree) return t('form.submit.cstFree');
      return t('form.submit.cst', { cost: formatFixed(liveCstGestureData.CSTPrice, 2) });
    }
    if (gestureType === 'RandomWalk') return t('form.submit.randomWalk');
    return t('form.submit.generic', { method: gestureType });
  };

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

  const scrollToGestureForm = useCallback(() => {
    const el = document.getElementById('make-gesture');
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handlePrimaryCtaClick = useCallback(() => {
    scrollToGestureForm();
  }, [scrollToGestureForm]);

  // Chat empty-state CTA: reveal the message field (Advanced) and bring the form into view.
  const handleJoinChatCta = useCallback(() => {
    setAdvancedExpanded(true);
    scrollToGestureForm();
  }, [scrollToGestureForm, setAdvancedExpanded]);

  const hasAttachedAssets = donatedNFTs.length > 0 || donatedERC20Tokens.length > 0;
  const hasPublicGoodsImpact = Number(data?.CharityPercentage ?? 0) > 0;

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
        <MemoHomeObservatoryHero
          data={data}
          bannerToken={bannerToken}
          canOpenGesturePanel={!loading && isRoundActive}
          phase={cycleState.phase}
          onPrimaryCtaClick={handlePrimaryCtaClick}
        />

        <ChronoCoreTimer
          data={data}
          loading={loading}
          allocationTime={allocationTime}
          activationTime={activationTime}
          now={now}
          canOpenGesturePanel={!loading && isRoundActive}
          onPrimaryCtaClick={handlePrimaryCtaClick}
          finalizationConfirmed={finalizationConfirmed}
        />

        <CyclePhaseGuide
          data={data}
          loading={loading}
          allocationTime={allocationTime}
          activationTime={activationTime}
          now={now}
          finalizationConfirmed={finalizationConfirmed}
        />

        <div
          data-testid="home-current-cycle-layout"
          className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(28rem,36rem)] 2xl:grid-cols-[minmax(0,1.08fr)_minmax(34rem,42rem)] 2xl:gap-10"
        >
          <div data-testid="home-primary-column" className="min-w-0">
            {/* ===== BIDDING STATUS (countdown + stats) ===== */}
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
            <LatestGestureTicker gesture={curGestureList[0] ?? null} pulseKey={gesturePulseKey} />

            {/* ===== SPECIAL ALLOCATION LEADERS ===== */}
            {data?.TsRoundStart !== 0 && (
              /* Plain div (no Framer Motion): motion’s inline opacity/transform often stays invisible in print */
              <div className="mt-8">
                {/* min-w-0 + print fixes: home PDF often uses narrow width and can collapse badly in Skia */}
                <div className="min-w-0 print:col-auto">
                  <MemoSpecialAllocationRecipients
                    currentAccount={account}
                    latestMessage={curGestureList[0]?.Message ?? ''}
                    latestGesture={curGestureList[0] ?? null}
                  />
                </div>
              </div>
            )}

            {/* ===== BID ACTION AREA ===== */}
            {(loading || isRoundActive) && (
              <m.div
                id="make-gesture"
                variants={sectionFade}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
                className="print-motion-visible mt-10"
              >
                <div className="gradient-border-card rounded-2xl bg-white/[0.015] p-6 sm:p-8">
                  <h2 className="font-display text-xl font-bold tracking-tight mb-1">
                    {t('form.title')}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">{t('form.subtitle')}</p>

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
                      />

                      <div className="mt-6 space-y-4">
                        {canGesture && (
                          <Button
                            id="gesture-submit"
                            size="lg"
                            onClick={handleGesture}
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
                                {getGestureLabel()} <ArrowRight className="ml-2 h-5 w-5" />
                              </>
                            )}
                          </Button>
                        )}
                        {account && !canGesture && cycleTimerEnded === false && (
                          <p className="text-sm text-muted-foreground">
                            {t('form.finalGestureMade')}
                          </p>
                        )}
                        {canClaim && (
                          <>
                            <Button
                              size="lg"
                              onClick={handleFinalize}
                              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 text-white border-0 font-semibold text-base h-12"
                              disabled={
                                isClaiming || (data?.LastBidderAddr !== account && claimWait > now)
                              }
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
                        <p className="mt-2 text-sm text-muted-foreground">
                          {t('form.connect.body')}
                        </p>
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
              </m.div>
            )}
            {/* ===== PRIZE BREAKDOWN ===== */}
            {data && (
              <m.div
                variants={sectionFade}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
                className="print-motion-visible"
              >
                <MemoAllocation data={data} />
              </m.div>
            )}
          </div>

          {/*
            The rail pins as one unit. Pinning only the chat looked right until
            you scrolled: a sticky element travels for exactly as long as there
            is container height beneath it, and here that height was the three
            cards below — so they slid up through the chat, which is glass and
            let them show straight through. Sticking the whole rail means there
            is nothing left to scroll past it. `max-h` plus `overflow-y-auto`
            keeps a rail taller than the viewport reachable rather than pinning
            its lower half permanently off screen.
          */}
          <div
            data-testid="home-chat-column"
            className="min-w-0 space-y-6 xl:sticky xl:top-[var(--sticky-offset)] xl:z-10 xl:max-h-[calc(100vh-var(--sticky-offset)-1.5rem)] xl:overflow-y-auto xl:overscroll-contain xl:pr-1 print:static print:max-h-none print:overflow-visible print:pr-0"
          >
            <MemoGestureMessageChat
              gestures={curGestureList}
              cycleNumber={round >= 0 ? round : undefined}
              pulseKey={gesturePulseKey}
              onJoinCta={!loading && isRoundActive ? handleJoinChatCta : undefined}
              className="xl:h-[clamp(30rem,68vh,34rem)] 2xl:h-[clamp(32rem,64vh,36rem)] print:h-auto"
            />

            {/* ===== FULL ROUND DETAILS LINK ===== */}
            <m.div
              variants={sectionFade}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
              className="print-motion-visible"
            >
              <Link
                href="/current-cycle"
                data-testid="cycle-details-link-card"
                className="group relative isolate flex items-center justify-between overflow-hidden rounded-2xl border border-primary/15 bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.10),rgb(255_255_255/0.035)_48%,rgb(var(--nebula-violet-rgb)/0.12))] p-5 shadow-[0_24px_90px_-58px_rgb(var(--aurora-cyan-rgb)/0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/[0.055]"
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

            {/* ===== PUBLIC GOODS IMPACT ===== */}
            {data && hasPublicGoodsImpact && (
              <m.div
                data-testid="home-rail-public-goods"
                variants={sectionFade}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.45 }}
                className="print-motion-visible"
              >
                <MemoPublicGoodsImpactCard data={data} variant="rail" />
              </m.div>
            )}

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
      </PageShell>

      {!loading && isRoundActive && (
        <div className="fixed inset-x-3 bottom-3 z-40 sm:hidden">
          <Button
            asChild
            size="lg"
            className="h-12 w-full rounded-full shadow-[0_20px_70px_-30px_rgb(var(--aurora-cyan-rgb)/1)]"
          >
            <Link href="#make-gesture">
              {account ? t('mobileCta.makeGesture') : t('mobileCta.preview')}
            </Link>
          </Button>
        </div>
      )}

      <LatestNFTs />
    </LazyMotion>
  );
};

export default HomePage;
