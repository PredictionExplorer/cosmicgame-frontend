'use client';

import { useState, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { zeroAddress } from 'viem';
import { ArrowRight, Radio } from 'lucide-react';
import Countdown from 'react-countdown';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { getAssetsUrl } from '@/utils';

import ConnectWalletButton from '@/components/common/ConnectWalletButton';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { StyledCard } from '@/components/styled';
import { PageShell } from '@/components/ui/page-shell';
import { useActiveWeb3React } from '@/hooks/web3';
import NFTImage from '@/components/nft/NFTImage';
import { reportError } from '@/utils/errors';
import { SpecialAllocationRecipients } from '@/components/tables/SpecialAllocationRecipients';
import { GestureStatus } from '@/components/common/GestureStatus';
import { GestureForm } from '@/components/home/GestureForm';
import { PublicGoodsImpactCard } from '@/components/home/PublicGoodsImpactCard';
import Allocation from '@/components/common/Allocation';
import { useGestureForm } from '@/hooks/useGestureForm';
import { useAllocationFinalize } from '@/hooks/useAllocationFinalize';
import { useAllocationNotification } from '@/hooks/useAllocationNotification';
import { useNow } from '@/hooks/useNow';
import {
  useDashboardInfo,
  useGestureListByCycle,
  useCurrentTime,
  useCSTInfo,
} from '@/hooks/useApiQuery';
import { localClockUtcEpochMs, parseActivationMsFromDashboard } from '@/lib/activationTime';
import { isLandingHost } from '@/lib/hostRouting';
import { LANDING_COUNTDOWN_REQUIRE_ROUND_ZERO } from '@/lib/landingFlags';
import { RootLandingPage } from '@/components/landing/RootLandingPage';

// Hostname is stable for the session — no subscription needed. Returning
// the same string from getSnapshot satisfies useSyncExternalStore's
// stable-reference contract.
const subscribeNoop = (): (() => void) => () => {};
const getHostnameSnapshot = (): string | null =>
  typeof window === 'undefined' ? null : window.location.hostname;
const getHostnameServerSnapshot = (): string | null => null;

const LatestNFTs = dynamic(() => import('@/components/nft/LatestNFTs'), {
  ssr: false,
  loading: () => <div className="py-20" aria-hidden />,
});

const sectionFade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const HomePage = () => {
  const searchParams = useSearchParams();
  const { account } = useActiveWeb3React();
  const queryClient = useQueryClient();

  const hostname = useSyncExternalStore(
    subscribeNoop,
    getHostnameSnapshot,
    getHostnameServerSnapshot,
  );

  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardInfo();
  const { data: currentTimeData } = useCurrentTime();

  const round = dashboardData?.CurRoundNum ?? -1;
  const { data: bidListData } = useGestureListByCycle(round, 'desc');

  const data = dashboardData ?? null;
  const loading = dashboardLoading;
  const curGestureList = bidListData ?? [];

  // Re-renders every second so countdown comparisons (allocationTime > now,
  // claimWait > now, activationTime check) update without bare Date.now().
  const now = useNow(1000);

  const offset = useMemo(() => {
    if (currentTimeData == null) return 0;
    return currentTimeData * 1000 - now;
  }, [currentTimeData, now]);

  const [bannerTokenId, setBannerTokenId] = useState<number | null>(null);

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

  const { gestureType, ethGestureInfo, cstGestureData, isGesturing, rwlkId, gestureCostPlus } =
    gestureForm;
  const { fetchActivationTime, allocationTime, timeoutFinalize, isClaiming, activationTime } =
    allocationFinalize;

  const withPostTxRefresh = (afterMs = 1500, activationMs = 3000) => {
    setTimeout(() => {
      queryClient.invalidateQueries();
      gestureForm.setMessage('');
    }, afterMs);
    setTimeout(() => {
      fetchActivationTime().catch((e) => reportError(e, 'fetchActivationTime'));
    }, activationMs);
  };

  const handleGesture = async () => {
    if (await (gestureType === 'CST' ? gestureForm.onGestureWithCST() : gestureForm.onGesture()))
      withPostTxRefresh();
  };
  const handleFinalize = async () => {
    if (await allocationFinalize.onFinalize()) withPostTxRefresh(1000, 3000);
  };

  useEffect(() => {
    requestNotificationPermission();
    if (searchParams?.get('randomwalk')) {
      gestureForm.setRwlkId(Number(searchParams.get('tokenId')));
      gestureForm.setBidType('RandomWalk');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, requestNotificationPermission]);

  const getGestureLabel = () => {
    const adj = (ethGestureInfo?.ETHPrice ?? 0) * (1 + gestureCostPlus / 100);
    const fmt = (v: number, t: number) => (v > t ? v.toFixed(2) : v.toFixed(5));
    if (gestureType === 'ETH') return `Gesture with ETH (${fmt(adj, 0.1)} ETH)`;
    if (gestureType === 'RandomWalk' && rwlkId !== -1)
      return `Gesture with RandomWalk token ${rwlkId} (${fmt(adj * 0.5, 0.2)} ETH)`;
    if (gestureType === 'CST')
      return `Gesture with CST ${cstGestureData.SecondsElapsed > cstGestureData.AuctionDuration ? '(FREE GESTURE)' : `(${cstGestureData.CSTPrice.toFixed(2)} CST)`}`;
    return `Gesture with ${gestureType}`;
  };

  const canGesture = allocationTime > now || data?.LastBidderAddr !== account;
  const canClaim = !(allocationTime > now || data?.LastBidderAddr === zeroAddress || loading);
  const claimWait = allocationTime + timeoutFinalize * 1000;
  const isRoundActive = activationTime < now / 1000;

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
    <>
      <PageShell variant="data" backdrop="signature">
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Spinner size="lg" className="text-white" />
          </div>
        )}

        <section aria-label="About Cosmic Signature" className="mb-10">
          <h1 className="sr-only">
            Cosmic Signature — Procedural On-Chain Art Protocol on Arbitrum
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Participants make
            gestures during a Performance Cycle; every gesture shapes the cycle&apos;s final
            Signature and imprints Participation CST. When the cycle finalizes, the protocol
            distributes its reserves across more than ten allocation tracks — including Protocol
            Guild, the public-goods funding mechanism for Ethereum&apos;s core contributors.
          </p>
        </section>

        {/* ===== LIVE ROUND BAR ===== */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="print-motion-visible mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-3.5 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Radio className="h-4 w-4 text-primary" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-live-dot" />
            </div>
            {data && (
              <div>
                <h1 className="font-display text-lg font-bold tracking-tight sm:text-xl">
                  Cycle #{data.CurRoundNum}
                </h1>
                <p className="text-[11px] text-muted-foreground">
                  {data.CurNumBids} gesture{data.CurNumBids !== 1 ? 's' : ''} made
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {(data?.CurRoundNum ?? 0) > 1 && (
              <Link
                href={`/allocation/${(data?.CurRoundNum ?? 0) - 1}`}
                className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Cycle {(data?.CurRoundNum ?? 0) - 1} allocations
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
            <Link
              href="/coordination-changes"
              className="text-xs text-muted-foreground/60 hover:text-primary transition-colors"
            >
              Parameters
            </Link>
          </div>
        </motion.div>

        {/* ===== BIDDING STATUS (countdown + stats) ===== */}
        <GestureStatus
          data={data}
          loading={loading}
          activationTime={activationTime}
          curGestureList={curGestureList}
          ethGestureInfo={ethGestureInfo}
          allocationTime={allocationTime}
        />

        {/* ===== SPECIAL PRIZE LEADERS + NFT PREVIEW ===== */}
        {data?.TsRoundStart !== 0 && (
          /* Plain div (no Framer Motion): motion’s inline opacity/transform often stays invisible in print */
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 print:grid-cols-1">
            {/* min-w-0 + print col fixes: home PDF often uses narrow width; col-span-2 can collapse badly in Skia */}
            <div className="min-w-0 lg:col-span-2 print:col-auto">
              <SpecialAllocationRecipients
                currentAccount={account}
                latestMessage={curGestureList[0]?.Message ?? ''}
              />
            </div>
            <div className="hidden min-w-0 lg:block print:hidden">
              <Link
                href={bannerToken.id >= 0 ? `/detail/${bannerToken.id}` : '/detail/sample'}
                className="block group"
              >
                <StyledCard className="overflow-hidden rounded-xl border border-white/[0.06]">
                  <div className="transition-transform duration-300 group-hover:scale-[1.02]">
                    <NFTImage
                      src={
                        bannerToken.seed === ''
                          ? '/images/qmark.png'
                          : getAssetsUrl(`cosmicsignature/${bannerToken.seed}.png`)
                      }
                      priority
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Sample COSMIC NFT</p>
                  </div>
                </StyledCard>
              </Link>
            </div>
          </div>
        )}

        {/* ===== BID ACTION AREA ===== */}
        {!loading && isRoundActive && (
          <motion.div
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

              {account ? (
                <>
                  <GestureForm {...gestureForm} data={data} />

                  <div className="mt-6 space-y-4">
                    {canGesture && (
                      <Button
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
                                    <Countdown date={claimWait} />
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
                            Please wait for the participant who made the Final Gesture to finalize
                            the cycle.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div
                  data-testid="connect-to-gesture"
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
                >
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    Connect to make a gesture
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Connect MetaMask or another wallet to choose a gesture method and participate in
                    the active cycle.
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
              )}
            </div>
          </motion.div>
        )}
        {/* ===== PRIZE BREAKDOWN ===== */}
        {data && (
          <motion.div
            variants={sectionFade}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="print-motion-visible"
          >
            <Allocation data={data} />
          </motion.div>
        )}

        {/* ===== PUBLIC GOODS IMPACT ===== */}
        {data && (
          <motion.div
            variants={sectionFade}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.45 }}
            className="print-motion-visible"
          >
            <PublicGoodsImpactCard data={data} />
          </motion.div>
        )}

        {/* ===== FULL ROUND DETAILS LINK ===== */}
        <motion.div
          variants={sectionFade}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          className="print-motion-visible"
        >
          <Link
            href="/current-cycle"
            className="mt-10 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 group hover:bg-white/[0.04] transition-all duration-300"
          >
            <div>
              <p className="text-sm font-medium text-white">View Full Cycle Details</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Gesture history, leaderboards, contributions, and allocation distribution
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>
      </PageShell>

      <LatestNFTs />
    </>
  );
};

export default HomePage;
