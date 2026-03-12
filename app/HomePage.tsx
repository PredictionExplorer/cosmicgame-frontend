'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { zeroAddress } from 'viem';
import { ArrowRight, Radio } from 'lucide-react';
import Countdown from 'react-countdown';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { getAssetsUrl } from '@/utils';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { MainWrapper, StyledCard } from '@/components/styled';
import { useActiveWeb3React } from '@/hooks/web3';
import { ART_BLOCKS_ADDRESS } from '@/config/networks';
import LatestNFTs from '@/components/nft/LatestNFTs';
import NFTImage from '@/components/nft/NFTImage';
import { reportError } from '@/utils/errors';
import { SpecialPrizeWinners } from '@/components/tables/SpecialPrizeWinners';
import { BiddingStatus } from '@/components/common/BiddingStatus';
import { BidForm } from '@/components/home/BidForm';
import Prize from '@/components/common/Prize';
import { useBidForm } from '@/hooks/useBidForm';
import { usePrizeClaim } from '@/hooks/usePrizeClaim';
import { usePrizeNotification } from '@/hooks/usePrizeNotification';
import {
  useDashboardInfo,
  useBidListByRound,
  useCurrentTime,
  useCSTInfo,
} from '@/hooks/useApiQuery';

const sectionFade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const HomePage = () => {
  const searchParams = useSearchParams();
  const { account } = useActiveWeb3React();
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading: dashboardLoading, isError: dashboardError } = useDashboardInfo();
  const { data: currentTimeData } = useCurrentTime();

  const round = dashboardData?.CurRoundNum ?? -1;
  const { data: bidListData } = useBidListByRound(round, 'desc');

  const data = dashboardData ?? null;
  const loading = dashboardLoading;
  const curBidList = bidListData ?? [];

  const offset = useMemo(() => {
    if (currentTimeData == null) return 0;
    return currentTimeData * 1000 - Date.now();
  }, [currentTimeData]);

  const [bannerTokenId, setBannerTokenId] = useState<number | null>(null);

  useEffect(() => {
    if (dashboardData && bannerTokenId === null) {
      const count = dashboardData.MainStats.NumCSTokenMints;
      if (count > 0) {
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

  const bidForm = useBidForm();
  const prizeClaim = usePrizeClaim({ data, offset });
  const { playAudio, requestNotificationPermission } = usePrizeNotification({
    prizeTime: prizeClaim.prizeTime,
  });

  const prevBidCountRef = useRef<number>(0);
  useEffect(() => {
    if (dashboardData && prevBidCountRef.current > 0) {
      if (
        account !== dashboardData.LastBidderAddr &&
        dashboardData.CurNumBids > prevBidCountRef.current
      ) {
        playAudio();
      }
    }
    if (dashboardData) {
      prevBidCountRef.current = dashboardData.CurNumBids;
    }
  }, [dashboardData, account, playAudio]);

  const { bidType, ethBidInfo, cstBidData, isBidding, rwlkId, bidPricePlus } = bidForm;
  const { fetchActivationTime, prizeTime, timeoutClaimPrize, isClaiming, activationTime } =
    prizeClaim;

  const withPostTxRefresh = (afterMs = 1500, activationMs = 3000) => {
    setTimeout(() => {
      queryClient.invalidateQueries();
      bidForm.setMessage('');
    }, afterMs);
    setTimeout(() => {
      fetchActivationTime().catch((e) => reportError(e, 'fetchActivationTime'));
    }, activationMs);
  };

  const handleBid = async () => {
    if (await (bidType === 'CST' ? bidForm.onBidWithCST() : bidForm.onBid())) withPostTxRefresh();
  };
  const handleClaimPrize = async () => {
    if (await prizeClaim.onClaimPrize()) withPostTxRefresh(1000, 3000);
  };

  useEffect(() => {
    requestNotificationPermission();
    if (searchParams?.get('randomwalk')) {
      bidForm.setRwlkId(Number(searchParams.get('tokenId')));
      bidForm.setBidType('RandomWalk');
    }
    if (searchParams?.get('donation')) {
      bidForm.setNftDonateAddress(ART_BLOCKS_ADDRESS);
      bidForm.setNftId(searchParams.get('tokenId') ?? '');
      bidForm.setBidType('ETH');
      bidForm.setAdvancedExpanded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, requestNotificationPermission]);

  const getBidLabel = () => {
    const adj = (ethBidInfo?.ETHPrice ?? 0) * (1 + bidPricePlus / 100);
    const fmt = (v: number, t: number) => (v > t ? v.toFixed(2) : v.toFixed(5));
    if (bidType === 'ETH') return `Bid now with ETH (${fmt(adj, 0.1)} ETH)`;
    if (bidType === 'RandomWalk' && rwlkId !== -1)
      return `Bid now with RandomWalk token ${rwlkId} (${fmt(adj * 0.5, 0.2)} ETH)`;
    if (bidType === 'CST')
      return `Bid now with CST ${cstBidData.SecondsElapsed > cstBidData.AuctionDuration ? '(FREE BID)' : `(${cstBidData.CSTPrice.toFixed(2)} CST)`}`;
    return `Bid now with ${bidType}`;
  };

  const canBid = prizeTime > Date.now() || data?.LastBidderAddr !== account;
  const canClaim = !(prizeTime > Date.now() || data?.LastBidderAddr === zeroAddress || loading);
  const claimWait = prizeTime + timeoutClaimPrize * 1000;
  const isActive = account !== null && activationTime < Date.now() / 1000;

  return (
    <>
      <MainWrapper>
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" className="text-primary" />
          </div>
        )}

        {!loading && (dashboardError || !data) && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              Unable to load game data.
            </p>
            <p className="mt-2 text-sm text-muted-foreground/70">
              The game API may be temporarily unavailable. Please try refreshing the page.
            </p>
          </div>
        )}

        {/* ===== LIVE ROUND BAR ===== */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-3.5 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Radio className="h-4 w-4 text-primary" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-live-dot" />
            </div>
            {data && (
              <div>
                <h1 className="font-display text-lg font-bold tracking-tight sm:text-xl">
                  Round #{data.CurRoundNum}
                </h1>
                <p className="text-[11px] text-muted-foreground">
                  {data.CurNumBids} bid{data.CurNumBids !== 1 ? 's' : ''} placed
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {(data?.CurRoundNum ?? 0) > 1 && (
              <Link
                href={`/prize/${(data?.CurRoundNum ?? 0) - 1}`}
                className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Round {(data?.CurRoundNum ?? 0) - 1} results
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
            <a
              href="/changed-parameters"
              className="text-xs text-muted-foreground/60 hover:text-primary transition-colors"
            >
              Parameters
            </a>
          </div>
        </motion.div>

        {/* ===== BIDDING STATUS (countdown + stats) ===== */}
        <BiddingStatus
          data={data}
          loading={loading}
          activationTime={activationTime}
          curBidList={curBidList}
          ethBidInfo={ethBidInfo}
          prizeTime={prizeTime}
        />

        {/* ===== SPECIAL PRIZE LEADERS + NFT PREVIEW ===== */}
        {data?.TsRoundStart !== 0 && (
          <motion.div
            variants={sectionFade}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2">
              <SpecialPrizeWinners />
            </div>
            <div className="hidden lg:block">
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
                    />
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Sample Cosmic Signature NFT</p>
                  </div>
                </StyledCard>
              </Link>
            </div>
          </motion.div>
        )}

        {/* ===== BID ACTION AREA ===== */}
        {!loading && isActive && (
          <motion.div
            variants={sectionFade}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="mt-10"
          >
            <div className="gradient-border-card rounded-2xl bg-white/[0.015] p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold tracking-tight mb-1">Place Your Bid</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Choose your bid method and enter the game.
              </p>

              <BidForm {...bidForm} data={data} />

              <div className="mt-6 space-y-4">
                {canBid && (
                  <Button
                    size="lg"
                    onClick={handleBid}
                    className="w-full bg-gradient-to-r from-[#15BFFD] to-[#9C37FD] hover:opacity-90 text-white border-0 font-semibold text-base h-12"
                    disabled={
                      isBidding || (bidType === 'RandomWalk' && rwlkId === -1) || bidType === ''
                    }
                  >
                    {isBidding ? (
                      <span className="flex items-center gap-2">
                        <Spinner size="sm" /> Processing...
                      </span>
                    ) : (
                      <>
                        {getBidLabel()} <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                )}
                {canClaim && (
                  <>
                    <Button
                      size="lg"
                      onClick={handleClaimPrize}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 text-white border-0 font-semibold text-base h-12"
                      disabled={
                        isClaiming || (data?.LastBidderAddr !== account && claimWait > Date.now())
                      }
                    >
                      {isClaiming ? (
                        <span className="flex items-center gap-2">
                          <Spinner size="sm" /> Processing...
                        </span>
                      ) : (
                        <>
                          Claim Prize
                          <span className="flex items-center">
                            {claimWait > Date.now() && data?.LastBidderAddr !== account && (
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
                    {data?.LastBidderAddr !== account && claimWait > Date.now() && (
                      <p className="text-sm italic text-right text-primary">
                        Please wait until the last bidder claims the prize.
                      </p>
                    )}
                  </>
                )}
              </div>
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
          >
            <Prize data={data} />
          </motion.div>
        )}

        {/* ===== FULL ROUND DETAILS LINK ===== */}
        <motion.div
          variants={sectionFade}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/current-round"
            className="mt-10 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 group hover:bg-white/[0.04] transition-all duration-300"
          >
            <div>
              <p className="text-sm font-medium text-white">View Full Round Details</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Bid history, leaderboards, donations, and fund distribution
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>
      </MainWrapper>

      <LatestNFTs />
    </>
  );
};

export default HomePage;
