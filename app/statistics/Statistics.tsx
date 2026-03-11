'use client';

import { useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import Countdown from 'react-countdown';
import { formatEther } from 'viem';

import { convertTimestampToDateTime, formatCSTValue, formatEthValue, formatSeconds } from '@/utils';

import { MainWrapper } from '@/components/styled';
import BiddingHistoryTable from '@/components/tables/BiddingHistoryTable';
import { UniqueBiddersTable, Bidder } from '@/components/tables/UniqueBiddersTable';
import { UniqueWinnersTable, Winner } from '@/components/tables/UniqueWinnersTable';
import DonatedNFTDistributionTable from '@/components/donations/DonatedNFTDistributionTable';
import { CSTokenDistributionTable } from '@/components/tokens/CSTokenDistributionTable';
import { CTBalanceDistributionTable } from '@/components/tokens/CTBalanceDistributionTable';
import { CTBalanceDistributionChart } from '@/components/tokens/CTBalanceDistributionChart';
import { SystemModesTable, EventRow } from '@/components/tables/SystemModesTable';
import { UniqueEthDonorsTable, UniqueEthDonor } from '@/components/tables/UniqueEthDonorsTable';
import { ZERO_ADDRESS } from '@/config/misc';
import {
  useDashboardInfo,
  useBidListByRound,
  useUniqueBidders,
  useUniqueWinners,
  useUniqueCSTStakers,
  useUniqueRWLKStakers,
  useUniqueDonors,
  useDonationsNFTList,
  useCSTDistribution,
  useCTBalancesDistribution,
  useStakingCSTActions,
  useStakingRWLKActions,
  useStakedCSTTokensGlobal,
  useStakedRWLKTokensGlobal,
  useSystemModelist,
  useCTPrice,
} from '@/hooks/useApiQuery';
import { StatisticsItem, CountdownRenderer } from '@/components/statistics/StatisticsItem';
import { StakingSection } from '@/components/statistics/StakingSection';
import { DonatedNFTsGrid } from '@/components/statistics/DonatedNFTsGrid';
import type { UniqueStakerCST } from '@/components/tables/UniqueStakersCSTTable';
import type { UniqueStakerRWLK } from '@/components/tables/UniqueStakersRWLKTable';

interface CSTBidData {
  AuctionDuration: number;
  CSTPrice: number;
  SecondsElapsed: number;
}

const Statistics = () => {
  const { data: dashboardData, isLoading: dashboardLoading, isError } = useDashboardInfo();
  const round = dashboardData?.CurRoundNum ?? -1;

  const { data: bidListData } = useBidListByRound(round, 'desc');
  const { data: uniqueBiddersData } = useUniqueBidders();
  const { data: uniqueWinnersData } = useUniqueWinners();
  const { data: uniqueCSTStakersData } = useUniqueCSTStakers();
  const { data: uniqueRWLKStakersData } = useUniqueRWLKStakers();
  const { data: uniqueDonorsData } = useUniqueDonors();
  const { data: nftDonationsData } = useDonationsNFTList();
  const { data: cstDistributionData } = useCSTDistribution();
  const { data: ctBalanceDistributionData } = useCTBalancesDistribution();
  const { data: stakingCSTActionsData } = useStakingCSTActions();
  const { data: stakingRWLKActionsData } = useStakingRWLKActions();
  const { data: stakedCSTokensData } = useStakedCSTTokensGlobal();
  const { data: stakedRWLKTokensData } = useStakedRWLKTokensGlobal();
  const { data: systemModeChangesData } = useSystemModelist();
  const { data: ctPriceData } = useCTPrice();

  const data = dashboardData ?? null;

  const cstBidData = useMemo<CSTBidData>(() => {
    if (!ctPriceData) return { AuctionDuration: 0, CSTPrice: 0, SecondsElapsed: 0 };
    return {
      AuctionDuration: parseInt(ctPriceData.AuctionDuration, 10),
      CSTPrice: parseFloat(formatEther(BigInt(ctPriceData.CSTPrice))),
      SecondsElapsed: parseInt(ctPriceData.SecondsElapsed, 10),
    };
  }, [ctPriceData]);

  const uniqueBidders = useMemo(() => {
    if (!uniqueBiddersData) return [];
    return [...uniqueBiddersData].sort((a: Bidder, b: Bidder) => b.NumBids - a.NumBids);
  }, [uniqueBiddersData]);

  const uniqueWinners = (uniqueWinnersData ?? []) as Winner[];
  const uniqueCSTStakers = (uniqueCSTStakersData ?? []) as UniqueStakerCST[];
  const uniqueRWLKStakers = (uniqueRWLKStakersData ?? []) as UniqueStakerRWLK[];
  const uniqueDonors = (uniqueDonorsData ?? []) as UniqueEthDonor[];
  const nftDonations = nftDonationsData ?? [];
  const cstDistribution = (cstDistributionData ??
    []) as import('@/services/api/types').TokenDistribution[];
  const ctBalanceDistribution = (ctBalanceDistributionData ??
    []) as import('@/services/api/types').CTBalanceDistribution[];
  const stakingCSTActions = stakingCSTActionsData ?? null;
  const stakingRWLKActions = stakingRWLKActionsData ?? null;
  const stakedCSTokens = stakedCSTokensData ?? null;
  const stakedRWLKTokens = stakedRWLKTokensData ?? null;
  const systemModeChanges = (systemModeChangesData as EventRow[] | undefined) ?? null;

  if (dashboardLoading) {
    return (
      <MainWrapper>
        <p className="text-lg font-semibold">Loading...</p>
      </MainWrapper>
    );
  }

  if (isError || !data) {
    return (
      <MainWrapper>
        <p className="text-lg font-semibold text-destructive">
          Failed to load statistics. Please refresh the page.
        </p>
      </MainWrapper>
    );
  }

  const currentRoundStats = [
    { title: 'Current Round', value: data.CurRoundNum },
    {
      title: 'Round Start Date',
      value:
        data.LastBidderAddr === ZERO_ADDRESS
          ? "Round isn't started yet."
          : convertTimestampToDateTime(data.TsRoundStart),
    },
    { title: 'Current Bid Price', value: formatEthValue(data.BidPriceEth) },
    { title: 'Current Bid Price using RandomWalk', value: formatEthValue(data.BidPriceEth / 2) },
    {
      title: 'Current Bid Price using CST',
      value: cstBidData?.CSTPrice > 0 ? formatCSTValue(cstBidData.CSTPrice) : 'FREE',
    },
    { title: 'CST Auction Elapsed Time', value: formatSeconds(cstBidData.SecondsElapsed) },
    { title: 'CST Auction Duration', value: formatSeconds(cstBidData.AuctionDuration) },
    { title: 'Number of Bids Since Round Start', value: data.CurNumBids },
    { title: 'Total Donated NFTs', value: data.CurRoundStats?.TotalDonatedNFTs ?? 0 },
    {
      title: 'Total Donated ETH',
      value: (
        <Link
          className="font-mono text-inherit"
          href={`/eth-donation/round/${data.CurRoundNum}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {formatEthValue(data.CurRoundStats?.TotalDonatedAmountEth ?? 0)}
        </Link>
      ),
    },
    { title: 'Prize Amount', value: formatEthValue(data.PrizeAmountEth ?? 0) },
    {
      title: 'Prize Claim Date',
      value:
        data.PrizeClaimTs === 0
          ? "Round isn't started yet."
          : convertTimestampToDateTime(data.PrizeClaimTs, true),
    },
    {
      title: 'Last Bidder',
      value:
        data.LastBidderAddr === ZERO_ADDRESS ? (
          "Round isn't started yet."
        ) : (
          <Link className="font-mono text-inherit" href={`/user/${data.LastBidderAddr}`}>
            {data.LastBidderAddr}
          </Link>
        ),
    },
  ];

  const overallStats: { title: string; value: ReactNode }[] = [
    {
      title: 'CosmicGame contract balance',
      value: `${(data.CosmicGameBalanceEth ?? 0).toFixed(4)} ETH`,
    },
    {
      title: 'Num Prizes Given',
      value: (
        <Link href="/prize" className="text-inherit">
          {data.TotalPrizes as ReactNode}
        </Link>
      ),
    },
    {
      title: 'Total Cosmic Signature Tokens minted',
      value: (
        <Link href="/gallery" className="text-inherit">
          {data.MainStats.NumCSTokenMints}
        </Link>
      ),
    },
    {
      title: 'Total Amount Paid in Main Prizes',
      value: formatEthValue(Number(data.TotalPrizesPaidAmountEth) || 0),
    },
    {
      title: 'Total Amount Paid in ETH Raffles',
      value: formatEthValue(data.MainStats.TotalRaffleEthDeposits),
    },
    { title: 'Total CST Consumed', value: formatCSTValue(data.MainStats.TotalCSTConsumedEth) },
    {
      title: 'Total Reward Paid to Marketing Agents with CST',
      value: formatCSTValue(data.MainStats.TotalMktRewardsEth),
    },
    {
      title: 'Number of Marketing Reward Transactions',
      value: (
        <Link className="text-inherit" href="/marketing">
          {data.MainStats.NumMktRewards}
        </Link>
      ),
    },
    {
      title: 'Amount of ETH collected by the winners from raffles',
      value: formatEthValue(data.MainStats.TotalRaffleEthWithdrawn),
    },
    {
      title: 'RandomWalk Tokens Used',
      value: (
        <Link className="text-inherit" href="/used-rwlk-nfts">
          {data.NumRwalkTokensUsed as ReactNode}
        </Link>
      ),
    },
    { title: 'Charity Balance', value: formatEthValue(Number(data.CharityBalanceEth) || 0) },
    { title: 'Number of Bids with CST', value: data.MainStats.NumBidsCST },
    { title: 'Number of Unique Bidders', value: data.MainStats.NumUniqueBidders },
    { title: 'Number of Unique Winners', value: data.MainStats.NumUniqueWinners },
    { title: 'Number of Unique ETH Donors', value: data.MainStats.NumUniqueDonors },
    {
      title: 'Number of Donated NFTs',
      value: (
        <Link className="text-inherit" href="/nft-donations">
          {data.NumDonatedNFTs as ReactNode}
        </Link>
      ),
    },
    {
      title: 'Amount of Cosmic Signature Tokens with assigned name',
      value: (
        <Link className="text-inherit" href="/named-nfts">
          {data.MainStats.TotalNamedTokens}
        </Link>
      ),
    },
    { title: 'Number of Unique CST Stakers', value: data.MainStats.NumUniqueStakersCST },
    { title: 'Number of Unique Random Walk Stakers', value: data.MainStats.NumUniqueStakersRWalk },
  ];

  return (
    <MainWrapper>
      <h3 className="text-xl font-semibold">Current Round Statistics</h3>
      <div className="my-8">
        {currentRoundStats.map((item) => (
          <StatisticsItem key={item.title} title={item.title} value={item.value} />
        ))}
        {data.PrizeClaimTs > Date.now() / 1000 && (
          <div className="my-2 flex">
            <p className="mr-4 w-[200px] font-medium text-primary md:w-[400px]">Time Left</p>
            <div className="flex-1">
              <Countdown date={data.PrizeClaimTs * 1000} renderer={CountdownRenderer} />
            </div>
          </div>
        )}
      </div>

      <div className="my-8">
        <h4 className="text-lg font-semibold">BID HISTORY FOR CURRENT ROUND</h4>
        <BiddingHistoryTable biddingHistory={bidListData ?? []} showRound={false} />
      </div>

      <h3 className="text-xl font-semibold">Overall Statistics</h3>
      <div className="mt-8">
        {overallStats.map((item) => (
          <StatisticsItem key={item.title} title={item.title} value={item.value} />
        ))}
        {(data.MainStats.NumWinnersWithPendingRaffleWithdrawal ?? 0) > 0 && (
          <p className="text-primary">{`${data.MainStats.NumWinnersWithPendingRaffleWithdrawal} winners are yet to withdraw funds totaling ${formatEthValue(data.MainStats.TotalRaffleEthDeposits - data.MainStats.TotalRaffleEthWithdrawn)} ETH`}</p>
        )}
        {(data.MainStats.NumCosmicGameDonations ?? 0) > 0 && (
          <>
            <StatisticsItem
              title="Number of Cosmic Game Donations"
              value={
                <Link className="text-inherit" href="/charity-deposits-cg">
                  {data.MainStats.NumCosmicGameDonations}
                </Link>
              }
            />
            <StatisticsItem
              title="Sum of Cosmic Game Donations"
              value={
                <Link className="text-inherit" href="/charity-deposits-cg">
                  {formatEthValue(data.MainStats.SumCosmicGameDonationsEth ?? 0)}
                </Link>
              }
            />
          </>
        )}
        {(Number(data.SumVoluntaryDonationsEth) || 0) > 0 && (
          <StatisticsItem
            title="Voluntary Donations Received"
            value={
              <Link
                className="text-inherit"
                href="/charity-deposits-voluntary"
              >{`${data.NumVoluntaryDonations} totaling ${(Number(data.SumVoluntaryDonationsEth) || 0).toFixed(4)} ETH`}</Link>
            }
          />
        )}
        {(data.MainStats.NumWithdrawals ?? 0) > 0 && (
          <StatisticsItem
            title="Withdrawals from Charity Wallet"
            value={
              <Link className="text-inherit" href="/charity-withdrawals">
                {data.MainStats.NumWithdrawals}
              </Link>
            }
          />
        )}
        <StatisticsItem
          title="Total amount withdrawn from Charity Wallet"
          value={formatEthValue(data.MainStats.SumWithdrawals ?? 0)}
        />
        <StatisticsItem
          title="Total Donated ETH"
          value={
            <Link
              className="text-inherit"
              href="/eth-donation"
              target="_blank"
              rel="noopener noreferrer"
            >
              {formatEthValue(data.MainStats.TotalEthDonatedAmountEth ?? 0)}
            </Link>
          }
        />
      </div>

      <div className="mt-8">
        <h4 className="mb-4 text-lg font-semibold">Unique Bidders</h4>
        <UniqueBiddersTable list={uniqueBidders} />
      </div>
      <div className="mt-8">
        <h4 className="mb-4 text-lg font-semibold">Unique Winners</h4>
        <UniqueWinnersTable list={uniqueWinners} />
      </div>
      <div className="mt-8">
        <h4 className="mb-4 text-lg font-semibold">Unique Eth Donors</h4>
        <UniqueEthDonorsTable list={uniqueDonors} />
      </div>
      <div className="mt-8">
        <h4 className="mb-4 text-lg font-semibold">
          Donated Token Distribution per Contract Address
        </h4>
        <DonatedNFTDistributionTable list={data.MainStats.DonatedTokenDistribution ?? []} />
      </div>
      <div className="mt-8">
        <h4 className="mb-4 text-lg font-semibold">Cosmic Signature Token (ERC721) Distribution</h4>
        <CSTokenDistributionTable list={cstDistribution} />
      </div>
      <div className="mt-8">
        <h4 className="mb-4 text-lg font-semibold">
          Cosmic Signature Token (ERC20) Balance Distribution
        </h4>
        <CTBalanceDistributionChart list={ctBalanceDistribution} />
      </div>
      <div className="mt-8">
        <CTBalanceDistributionTable list={ctBalanceDistribution.slice(0, 20)} />
      </div>

      <StakingSection
        cstStats={data.MainStats.StakeStatisticsCST}
        rwlkStats={data.MainStats.StakeStatisticsRWalk}
        stakingCSTActions={stakingCSTActions}
        stakingRWLKActions={stakingRWLKActions}
        stakedCSTokens={stakedCSTokens}
        stakedRWLKTokens={stakedRWLKTokens}
        uniqueCSTStakers={uniqueCSTStakers}
        uniqueRWLKStakers={uniqueRWLKStakers}
      />

      <DonatedNFTsGrid nftDonations={nftDonations} />

      <div>
        <h4 className="mb-4 mt-16 text-lg font-semibold">Round Activations</h4>
        {systemModeChanges === null ? (
          <p className="text-lg font-semibold">Loading...</p>
        ) : (
          <SystemModesTable list={systemModeChanges ?? []} />
        )}
      </div>
    </MainWrapper>
  );
};

export default Statistics;
