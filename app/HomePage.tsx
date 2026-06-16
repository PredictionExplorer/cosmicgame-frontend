'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { zeroAddress } from 'viem';
import { ArrowRight, Radio } from 'lucide-react';
import type { CountdownRenderProps } from 'react-countdown';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { LazyMotion, domAnimation, m } from 'framer-motion';

import { formatSeconds, shortenHex } from '@/utils';

import { reportError } from '@/utils/errors';
import { useNotify } from '@/hooks/useNotify';
import ConnectWalletButton from '@/components/common/ConnectWalletButton';
import { SmoothCountdown } from '@/components/common/SmoothCountdown';
import { Button } from '@/components/ui/button';
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
import { useAllocationNotification } from '@/hooks/useAllocationNotification';
import { invalidateLiveGameQueries } from '@/hooks/useLiveGameDataRefresh';
import { useLivePulse } from '@/hooks/useLivePulse';
import { useNow } from '@/hooks/useNow';
import {
  useDashboardInfo,
  useGestureListByCycle,
  useCurrentTime,
  useCSTInfo,
  useDonationsNFTByRound,
  useDonationsERC20ByRound,
} from '@/hooks/useApiQuery';
import { localClockUtcEpochMs, parseActivationMsFromDashboard } from '@/lib/activationTime';
import { getCycleState } from '@/lib/cycleState';
import { isLandingHost } from '@/lib/hostRouting';
import { LANDING_COUNTDOWN_REQUIRE_ROUND_ZERO } from '@/lib/landingFlags';
import { RootLandingPage } from '@/components/landing/RootLandingPage';
import type { DashboardInfo, GestureInfo } from '@/services/api';

const LatestNFTs = dynamic(() => import('@/components/nft/LatestNFTs'), {
  ssr: false,
  loading: () => <div className="py-20" aria-hidden />,
});

const sectionFade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

function renderInlineCountdown({ total }: CountdownRenderProps) {
  return <span className="font-mono tabular-nums">{formatSeconds(Math.ceil(total / 1000))}</span>;
}

function getGestureKindLabel(gestureType: unknown): string {
  if (gestureType === 2) return 'a CST gesture';
  if (gestureType === 1) return 'an ETH + RandomWalk gesture';
  return 'an ETH gesture';
}

function formatRelativeGestureAge(timestamp: unknown, nowMs: number): string {
  const numericTimestamp = Number(timestamp);
  if (!Number.isFinite(numericTimestamp) || numericTimestamp <= 0) return 'just now';
  const elapsedSeconds = Math.max(0, Math.floor((nowMs - numericTimestamp * 1000) / 1000));
  if (elapsedSeconds < 60) return `${elapsedSeconds}s ago`;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h ago`;
  return `${Math.floor(elapsedHours / 24)}d ago`;
}

function LatestGestureTicker({
  gesture,
  pulseKey,
}: {
  gesture: GestureInfo | null;
  pulseKey: number;
}) {
  const nowMs = useNow(15_000);
  const isPulsing = useLivePulse(pulseKey);

  if (!gesture) return null;

  return (
    <Link
      href={`/gesture/${gesture.EvtLogId}`}
      className={`mt-4 flex items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-primary/[0.055] px-4 py-3 text-sm transition-colors hover:border-primary/35 hover:bg-primary/[0.08] ${
        isPulsing ? 'animate-live-flash' : ''
      }`}
      aria-label={`Open latest gesture ${gesture.EvtLogId}`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20">
          <Radio className="h-4 w-4" />
          {isPulsing && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-300" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium text-foreground">
            {shortenHex(gesture.BidderAddr, 6)} made {getGestureKindLabel(gesture.GestureType)}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {formatRelativeGestureAge(gesture.TimeStamp, nowMs)}
          </span>
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

interface HomePageProps {
  initialDashboardData?: DashboardInfo | null;
  initialHostname?: string | null;
}

const HomePage = ({ initialDashboardData = null, initialHostname = null }: HomePageProps) => {
  const searchParams = useSearchParams();
  const { account } = useActiveWeb3React();
  const queryClient = useQueryClient();
  const { notify } = useNotify();

  const [hostname, setHostname] = useState<string | null>(initialHostname);

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  const { data: dashboardData, isLoading: dashboardLoading } =
    useDashboardInfo(initialDashboardData);
  const { data: currentTimeData, dataUpdatedAt: currentTimeUpdatedAt } = useCurrentTime();

  const round = dashboardData?.CurRoundNum ?? -1;
  const { data: bidListData } = useGestureListByCycle(round, 'desc');
  const { data: nftDonationsData } = useDonationsNFTByRound(round);
  const { data: erc20DonationsData } = useDonationsERC20ByRound(round);

  const data = dashboardData ?? null;
  const loading = dashboardLoading;
  const curGestureList = bidListData ?? [];
  const donatedNFTs = nftDonationsData ?? [];
  const donatedERC20Tokens = erc20DonationsData ?? [];

  // Re-renders every second so countdown comparisons (allocationTime > now,
  // claimWait > now, activationTime check) update without bare Date.now().
  const now = useNow(1000);
  const [currentTimeFallbackMs] = useState(() => Date.now());

  const offset = useMemo(() => {
    if (currentTimeData == null) return 0;
    const sampledAtMs = currentTimeUpdatedAt || currentTimeFallbackMs;
    return currentTimeData * 1000 - sampledAtMs;
  }, [currentTimeData, currentTimeUpdatedAt, currentTimeFallbackMs]);

  const [bannerTokenId, setBannerTokenId] = useState<number | null>(null);
  const [gesturePulseKey, setGesturePulseKey] = useState(0);

  useEffect(() => {
    if (dashboardData && bannerTokenId === null) {
      const count = dashboardData.MainStats.NumCSTokenMints;
      if (count > 0) {
        // Random NFT pick happens once per session when dashboardData first
        // loads. The lint rule flags setState-in-effect as an anti-pattern,
        // but this is a genuine "compute once from async data" — useMemo
        // would re-roll on every dashboardData fetch.
        setBannerTokenId(Math.floor(Math.random() * count));
      } else {
        setBannerTokenId(-1);
      }
    }
  }, [dashboardData, bannerTokenId]);

  const { data: bannerCSTInfo } = useCSTInfo(bannerTokenId);

  const bannerToken = useMemo(() => {
    if (bannerTokenId === -1) return { seed: 'sample', id: -1 };
    if (bannerCSTInfo) return { seed: `0x${bannerCSTInfo.Seed}`, id: bannerTokenId! };
    return { seed: '', id: -1 };
  }, [bannerTokenId, bannerCSTInfo]);

  const gestureForm = useGestureForm();
  const allocationFinalize = useAllocationFinalize({ data, offset });
  const { playAudio, requestNotificationPermission } = useAllocationNotification({
    allocationTime: allocationFinalize.allocationTime,
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
  } = gestureForm;
  const {
    fetchActivationTime,
    allocationTime,
    timeoutFinalize,
    isClaiming,
    activationTime,
    onFinalize,
  } = allocationFinalize;

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
    if (await (gestureType === 'CST' ? onGestureWithCST() : onGesture())) {
      optimisticallyRecordGesture();
      withPostTxRefresh();
    }
  }, [gestureType, onGesture, onGestureWithCST, optimisticallyRecordGesture, withPostTxRefresh]);
  const handleFinalize = useCallback(async () => {
    if (await onFinalize()) withPostTxRefresh(1000, 3000);
  }, [onFinalize, withPostTxRefresh]);

  useEffect(() => {
    requestNotificationPermission();
    if (searchParams?.get('randomwalk')) {
      setRwlkId(Number(searchParams.get('tokenId')));
      setBidType('RandomWalk');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, requestNotificationPermission]);

  useEffect(() => {
    const handleGesturePlaced = () => setGesturePulseKey((value) => value + 1);
    window.addEventListener('cosmic:gesture-placed', handleGesturePlaced);
    return () => window.removeEventListener('cosmic:gesture-placed', handleGesturePlaced);
  }, []);

  const getGestureLabel = () => {
    const adj = (ethGestureInfo?.ETHPrice ?? 0) * (1 + gestureCostPlus / 100);
    const fmt = (v: number, t: number) => (v > t ? v.toFixed(2) : v.toFixed(5));
    if (gestureType === 'ETH') return `Gesture with ETH (${fmt(adj, 0.1)} ETH)`;
    if (gestureType === 'RandomWalk' && rwlkId !== -1)
      return `Gesture with ETH + RandomWalk token ${rwlkId} (${fmt(adj * 0.5, 0.2)} ETH)`;
    if (gestureType === 'CST')
      return `Gesture with CST ${cstGestureData.SecondsElapsed > cstGestureData.AuctionDuration ? '(FREE GESTURE)' : `(${cstGestureData.CSTPrice.toFixed(2)} CST)`}`;
    if (gestureType === 'RandomWalk') return 'Gesture with ETH + RandomWalk';
    return `Gesture with ${gestureType}`;
  };

  const cycleState = getCycleState({ data, loading, allocationTime, activationTime, now });
  const canGesture = allocationTime > now || data?.LastBidderAddr !== account;
  const canClaim = !(allocationTime > now || data?.LastBidderAddr === zeroAddress || loading);
  const claimWait = allocationTime + timeoutFinalize * 1000;
  const isRoundActive = cycleState.isGestureOpen || cycleState.isReadyToFinalize;
  const cycleTimerEnded = cycleState.isReadyToFinalize;

  const scrollToGestureForm = () => {
    const el = document.getElementById('make-gesture');
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrimaryCtaClick = useCallback(async () => {
    scrollToGestureForm();

    if (!isRoundActive) {
      notify('info', 'This cycle is not active yet.');
      return;
    }
    if (!account) {
      notify('info', 'Connect your wallet below, then confirm your gesture in Rabby.');
      return;
    }

    if (cycleTimerEnded && canClaim) {
      const canFinalizeNow = data?.LastBidderAddr === account || claimWait <= now;
      if (canFinalizeNow) {
        await handleFinalize();
      } else {
        notify(
          'info',
          'Please wait for the participant who made the final gesture to finalize the cycle.',
        );
      }
      return;
    }

    if (!canGesture) {
      notify('info', 'You made the final gesture for this cycle. Finalize when the timer ends.');
      return;
    }

    const buttonDisabled =
      isGesturing || (gestureType === 'RandomWalk' && rwlkId === -1) || gestureType === '';
    if (buttonDisabled) {
      if (gestureType === 'RandomWalk' && rwlkId === -1) {
        notify('info', 'Select a RandomWalk token before making your gesture.');
      }
      return;
    }

    await handleGesture();
  }, [
    account,
    canClaim,
    canGesture,
    claimWait,
    cycleTimerEnded,
    data?.LastBidderAddr,
    gestureType,
    handleFinalize,
    handleGesture,
    isGesturing,
    isRoundActive,
    now,
    notify,
    rwlkId,
  ]);

  const hasAttachedAssets = donatedNFTs.length > 0 || donatedERC20Tokens.length > 0;
  const hasPublicGoodsImpact = Number(data?.CharityPercentage ?? 0) > 0;

  const landingHost = hostname !== null && isLandingHost(hostname);
  if (hostname === null) {
    return <div className="min-h-screen bg-background" />;
  }
  if (landingHost && dashboardLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  const roundOk = !LANDING_COUNTDOWN_REQUIRE_ROUND_ZERO || (dashboardData?.CurRoundNum ?? -1) === 0;
  const launchMs = parseActivationMsFromDashboard(dashboardData ?? null);
  const showPrelaunchLanding =
    landingHost && roundOk && launchMs != null && launchMs > localClockUtcEpochMs();

  if (showPrelaunchLanding && launchMs != null) {
    return <RootLandingPage launchTimestampMs={launchMs} />;
  }

  return (
    <LazyMotion features={domAnimation}>
      <PageShell
        variant="data"
        backdrop="signature"
        className="xl:max-w-[92rem] 2xl:max-w-[108rem] 2xl:px-10"
      >
        <HomeObservatoryHero
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
        />

        <CyclePhaseGuide
          data={data}
          loading={loading}
          allocationTime={allocationTime}
          activationTime={activationTime}
          now={now}
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
                  <SpecialAllocationRecipients
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
                    Make Your Gesture
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Choose a gesture method and participate in the active cycle.
                  </p>

                  {loading ? (
                    <div
                      className="space-y-5"
                      role="status"
                      aria-label="Loading gesture form"
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
                      <GestureForm {...gestureForm} data={data} />

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
                                <Spinner size="sm" /> Processing...
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
                            You made the final gesture for this cycle. When the timer ends, use
                            Finalize Cycle below.
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
                                  <Spinner size="sm" /> Processing...
                                </span>
                              ) : (
                                <>
                                  Finalize Cycle
                                  <span className="flex items-center">
                                    {claimWait > now && data?.LastBidderAddr !== account && (
                                      <>
                                        &nbsp;available in &nbsp;
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
                                Please wait for the participant who made the Final Gesture to
                                finalize the cycle.
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <div data-testid="connect-to-gesture" className="space-y-5">
                      <GestureForm {...gestureForm} data={data} previewMode />
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                        <h3 className="font-display text-lg font-semibold tracking-tight">
                          Connect to submit your gesture
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Review the live gesture methods and costs above, then connect MetaMask or
                          another wallet to submit on Arbitrum.
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
                <Allocation data={data} />
              </m.div>
            )}
          </div>

          <div data-testid="home-chat-column" className="min-w-0 space-y-6">
            <GestureMessageChat
              gestures={curGestureList}
              cycleNumber={round >= 0 ? round : undefined}
              pulseKey={gesturePulseKey}
              className="min-h-[30rem] xl:sticky xl:top-24 xl:min-h-[38rem] 2xl:min-h-[42rem]"
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
                    View Full Cycle Details
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    Gesture history, leaderboards, contributions, and allocation distribution
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
                <PublicGoodsImpactCard data={data} variant="rail" />
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
                <AttachedNFTAllocationShowcase
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
              {account ? 'Make a Gesture' : 'Preview Gesture Options'}
            </Link>
          </Button>
        </div>
      )}

      <LatestNFTs />
    </LazyMotion>
  );
};

export default HomePage;
