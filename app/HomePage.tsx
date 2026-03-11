'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { zeroAddress } from 'viem';
import { ArrowRight } from 'lucide-react';
import Countdown from 'react-countdown';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';

import { getAssetsUrl, getEnduranceChampions } from '@/utils';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { MainWrapper, StyledCard } from '@/components/styled';
import { useActiveWeb3React } from '@/hooks/web3';
import { ART_BLOCKS_ADDRESS } from '@/config/networks';
import LatestNFTs from '@/components/nft/LatestNFTs';
import NFTImage from '@/components/nft/NFTImage';
import type { DonatedNFT as DonatedNFTType } from '@/services/api/types';
import { reportError } from '@/utils/errors';
import { SpecialPrizeWinners } from '@/components/tables/SpecialPrizeWinners';
import { BiddingStatus } from '@/components/common/BiddingStatus';
import { WinningHistorySection } from '@/components/home/WinningHistorySection';
import { BidForm } from '@/components/home/BidForm';
import { RoundInfoSection } from '@/components/home/RoundInfoSection';
import { useBidForm } from '@/hooks/useBidForm';
import { usePrizeClaim } from '@/hooks/usePrizeClaim';
import { usePrizeNotification } from '@/hooks/usePrizeNotification';
import {
  useDashboardInfo,
  useBidListByRound,
  useDonationsNFTByRound,
  useDonationsCGWithInfoByRound,
  useDonationsERC20ByRound,
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
  const { data: nftDonationsData } = useDonationsNFTByRound(round);
  const { data: ethDonationsRawData } = useDonationsCGWithInfoByRound(round);
  const { data: erc20DonationsData } = useDonationsERC20ByRound(round);

  type EthDonation = import('@/components/tables/EthDonationTable').EthDonation;
  type DonatedERC20 = import('@/components/donations/DonatedERC20Table').DonatedERC20Token;

  const data = dashboardData ?? null;
  const loading = dashboardLoading;
  const curBidList = bidListData ?? [];
  const donatedNFTs = (nftDonationsData ?? []) as DonatedNFTType[];
  const ethDonations = (ethDonationsRawData ?? []) as EthDonation[];
  const donatedERC20Tokens = (erc20DonationsData ?? []) as DonatedERC20[];

  const offset = useMemo(() => {
    if (currentTimeData == null) return 0;
    return currentTimeData * 1000 - Date.now();
  }, [currentTimeData]);

  const championList = useMemo(() => {
    if (!bidListData) return null;
    const champions = getEnduranceChampions(bidListData);
    return [...champions].sort((a, b) => b.chronoWarrior - a.chronoWarrior);
  }, [bidListData]);

  const [bannerTokenId, setBannerTokenId] = useState<number | null>(null);
  const [curPage, setCurrentPage] = useState(1);
  const [imageOpen, setImageOpen] = useState(false);
  const [twitterPopupOpen, setTwitterPopupOpen] = useState(false);
  const [twitterHandle, setTwitterHandle] = useState('');
  const [donatedTokensTab, setDonatedTokensTab] = useState(0);
  const perPage = 12;

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
  const {
    fetchActivationTime,
    prizeTime,
    timeoutClaimPrize,
    isClaiming,
    activationTime,
    claimHistory,
  } = prizeClaim;

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
    if (searchParams?.get('referred_by')) setTwitterPopupOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, requestNotificationPermission]);

  useEffect(() => {
    if (twitterHandle)
      bidForm.setMessage(`@${twitterHandle} referred by @${searchParams.get('referred_by')}.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [twitterHandle]);

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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Spinner size="lg" className="text-white" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 lg:gap-16 mb-8">
          <div>
            <BiddingStatus
              data={data}
              loading={loading}
              activationTime={activationTime}
              curBidList={curBidList}
              ethBidInfo={ethBidInfo}
              prizeTime={prizeTime}
            />
            {!loading && isActive && <BidForm {...bidForm} data={data} />}
          </div>
          <div>
            {(data?.CurRoundNum ?? 0) > 1 && (
              <Link href={`/prize/${(data?.CurRoundNum ?? 0) - 1}`} className="text-inherit">
                Round {(data?.CurRoundNum ?? 0) - 1} ended, check results here
              </Link>
            )}
            <div className="hidden md:block">
              <StyledCard className="mt-2">
                <Link
                  href={bannerToken.id >= 0 ? `/detail/${bannerToken.id}` : '/detail/sample'}
                  className="block"
                >
                  <NFTImage
                    src={
                      bannerToken.seed === ''
                        ? '/images/qmark.png'
                        : getAssetsUrl(`cosmicsignature/${bannerToken.seed}.png`)
                    }
                  />
                </Link>
              </StyledCard>
            </div>
            {data?.TsRoundStart !== 0 && <SpecialPrizeWinners />}
            {isActive && (
              <>
                {canBid && !loading && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleBid}
                    className="w-full mt-6"
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
                      className="w-full mt-6"
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
                      <p className="text-sm italic text-right text-primary mt-4">
                        Please wait until the last bidder claims the prize.
                      </p>
                    )}
                  </>
                )}
              </>
            )}
            <div className="block md:hidden">
              <Button
                variant="outline"
                size="lg"
                className="w-full mt-6"
                onClick={() => setImageOpen(true)}
              >
                Show Random Sample NFT
              </Button>
            </div>
          </div>
        </div>
        <RoundInfoSection
          data={data}
          curBidList={curBidList}
          championList={championList}
          ethDonations={ethDonations}
          donatedNFTs={donatedNFTs}
          donatedERC20Tokens={donatedERC20Tokens}
          donatedTokensTab={donatedTokensTab}
          onTabChange={(_e, v) => setDonatedTokensTab(v)}
          curPage={curPage}
          setCurPage={setCurrentPage}
          perPage={perPage}
        />
      </MainWrapper>

      <LatestNFTs />

      <WinningHistorySection
        claimHistory={claimHistory}
        imageOpen={imageOpen}
        setImageOpen={setImageOpen}
        bannerTokenSeed={bannerToken.seed}
        twitterPopupOpen={twitterPopupOpen}
        setTwitterPopupOpen={setTwitterPopupOpen}
        setTwitterHandle={setTwitterHandle}
      />
    </>
  );
};

export default HomePage;
