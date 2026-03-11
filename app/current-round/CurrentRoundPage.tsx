'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { getEnduranceChampions, formatEthValue, convertTimestampToDateTime } from '@/utils';

import { MainWrapper } from '@/components/styled';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/stat-card';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { RoundInfoSection } from '@/components/home/RoundInfoSection';
import type { DonatedNFT as DonatedNFTType } from '@/services/api/types';
import {
  useDashboardInfo,
  useBidListByRound,
  useDonationsNFTByRound,
  useDonationsCGWithInfoByRound,
  useDonationsERC20ByRound,
} from '@/hooks/useApiQuery';

type EthDonation = import('@/components/tables/EthDonationTable').EthDonation;
type DonatedERC20 = import('@/components/donations/DonatedERC20Table').DonatedERC20Token;

const CurrentRoundPage = () => {
  const { data: dashboardData, isLoading, isError } = useDashboardInfo();
  const round = dashboardData?.CurRoundNum ?? -1;

  const { data: bidListData } = useBidListByRound(round, 'desc');
  const { data: nftDonationsData } = useDonationsNFTByRound(round);
  const { data: ethDonationsRawData } = useDonationsCGWithInfoByRound(round);
  const { data: erc20DonationsData } = useDonationsERC20ByRound(round);

  const data = dashboardData ?? null;
  const curBidList = bidListData ?? [];
  const donatedNFTs = (nftDonationsData ?? []) as DonatedNFTType[];
  const ethDonations = (ethDonationsRawData ?? []) as EthDonation[];
  const donatedERC20Tokens = (erc20DonationsData ?? []) as DonatedERC20[];

  const championList = useMemo(() => {
    if (!bidListData) return null;
    const champions = getEnduranceChampions(bidListData);
    return [...champions].sort((a, b) => b.chronoWarrior - a.chronoWarrior);
  }, [bidListData]);

  const [curPage, setCurPage] = useState(1);
  const [donatedTokensTab, setDonatedTokensTab] = useState(0);
  const perPage = 12;

  if (isLoading) {
    return (
      <MainWrapper>
        <div className="flex items-center justify-center py-32">
          <Spinner size="lg" />
        </div>
      </MainWrapper>
    );
  }

  if (isError || !data) {
    return (
      <MainWrapper>
        <ErrorState
          title="Failed to load round data"
          message="Please refresh the page to try again."
          onRetry={() => window.location.reload()}
        />
      </MainWrapper>
    );
  }

  const roundStarted = data.TsRoundStart
    ? convertTimestampToDateTime(data.TsRoundStart)
    : 'Not started';

  return (
    <MainWrapper>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Game
      </Link>

      <PageHeader
        title={`Round #${data.CurRoundNum}`}
        subtitle={`Started ${roundStarted} \u2022 ${data.CurNumBids} bids so far`}
        align="left"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        <StatCard label="Bids" value={data.CurNumBids} />
        <StatCard label="Prize Pool" value={formatEthValue(data.PrizeAmountEth ?? 0)} gradient />
        <StatCard
          label="Donated ETH"
          value={formatEthValue(data.CurRoundStats?.TotalDonatedAmountEth ?? 0)}
        />
        <StatCard label="Donated NFTs" value={data.CurRoundStats?.TotalDonatedNFTs ?? 0} />
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
        setCurPage={setCurPage}
        perPage={perPage}
      />
    </MainWrapper>
  );
};

export default CurrentRoundPage;
