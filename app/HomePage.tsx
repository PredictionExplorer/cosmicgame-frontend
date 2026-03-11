'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { zeroAddress } from 'viem';
import { ArrowRight } from 'lucide-react';
import Countdown from 'react-countdown';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';

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

const HomePage = () => {
  const searchParams = useSearchParams();
  const { account } = useActiveWeb3React();
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardInfo();
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
  const [imageOpen, setImageOpen] = useState(false);

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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Spinner size="lg" className="text-white" />
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            <span className="bg-gradient-to-r from-[#35C9FF] via-[#1D9BEF] to-[#AC56FF] bg-clip-text text-transparent">
              Cosmic Signature
            </span>
          </h1>
          <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto">
            A strategy bidding game &mdash; bid against other players and time to win ETH prizes and
            unique NFTs.
          </p>
          {(data?.CurRoundNum ?? 0) > 1 && (
            <Link
              href={`/prize/${(data?.CurRoundNum ?? 0) - 1}`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              Round {(data?.CurRoundNum ?? 0) - 1} ended &mdash; view results
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {/* Main two-column */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
          {/* Left: Status + Form */}
          <div className="lg:col-span-3">
            <BiddingStatus
              data={data}
              loading={loading}
              activationTime={activationTime}
              curBidList={curBidList}
              ethBidInfo={ethBidInfo}
              prizeTime={prizeTime}
            />
            {!loading && isActive && <BidForm {...bidForm} data={data} />}

            {isActive && (
              <div className="mt-6 space-y-4">
                {canBid && !loading && (
                  <Button
                    size="lg"
                    onClick={handleBid}
                    className="w-full"
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
                      className="w-full"
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
            )}
          </div>

          {/* Right: NFT + Special prizes */}
          <div className="lg:col-span-2 space-y-6">
            <div className="hidden md:block">
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
                </StyledCard>
              </Link>
            </div>
            {data?.TsRoundStart !== 0 && <SpecialPrizeWinners />}
            <div className="block md:hidden">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setImageOpen(true)}
              >
                Show Random Sample NFT
              </Button>
            </div>
          </div>
        </div>

        {data && <Prize data={data} />}

        {/* Link to full round details */}
        <Link
          href="/current-round"
          className="mt-12 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 group hover:bg-white/[0.05] transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-white">View Full Round Details</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bid history, leaderboards, donations, and fund distribution
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      </MainWrapper>

      <LatestNFTs />
    </>
  );
};

export default HomePage;
