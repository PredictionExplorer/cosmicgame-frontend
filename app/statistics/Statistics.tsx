'use client';

import { useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { formatCSTValue, formatEthValue } from '@/utils';

import { MainWrapper } from '@/components/styled';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/stat-card';
import { SectionDivider } from '@/components/ui/section-divider';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { UniqueBiddersTable, Bidder } from '@/components/tables/UniqueBiddersTable';
import { UniqueWinnersTable, Winner } from '@/components/tables/UniqueWinnersTable';
import DonatedNFTDistributionTable from '@/components/donations/DonatedNFTDistributionTable';
import { CSTokenDistributionTable } from '@/components/tokens/CSTokenDistributionTable';
import { CTBalanceDistributionTable } from '@/components/tokens/CTBalanceDistributionTable';
import { CTBalanceDistributionChart } from '@/components/tokens/CTBalanceDistributionChart';
import { SystemModesTable, EventRow } from '@/components/tables/SystemModesTable';
import { UniqueEthDonorsTable, UniqueEthDonor } from '@/components/tables/UniqueEthDonorsTable';
import {
  useDashboardInfo,
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
} from '@/hooks/useApiQuery';
import { StatisticsItem } from '@/components/statistics/StatisticsItem';
import { StakingSection } from '@/components/statistics/StakingSection';
import { DonatedNFTsGrid } from '@/components/statistics/DonatedNFTsGrid';
import type { UniqueStakerCST } from '@/components/tables/UniqueStakersCSTTable';
import type { UniqueStakerRWLK } from '@/components/tables/UniqueStakersRWLKTable';

const Statistics = () => {
  const { data: dashboardData, isLoading: dashboardLoading, isError } = useDashboardInfo();

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

  const data = dashboardData ?? null;

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
          title="Failed to load statistics"
          message="Please refresh the page to try again."
          onRetry={() => window.location.reload()}
        />
      </MainWrapper>
    );
  }

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
      <PageHeader
        title="Statistics"
        subtitle="Historical data and overall metrics for the Cosmic Signature game"
      />

      {/* Link to current round */}
      <Link
        href="/current-round"
        className="mb-12 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/[0.04] p-4 group hover:bg-primary/[0.06] transition-colors"
      >
        <div>
          <p className="text-sm font-medium text-white">Looking for current round data?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            View bid history, leaderboards, and live round details
          </p>
        </div>
        <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-0.5 transition-transform" />
      </Link>

      {/* Key overall metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        <StatCard label="Total Rounds" value={data.CurRoundNum} />
        <StatCard label="Prizes Given" value={data.TotalPrizes as ReactNode} />
        <StatCard label="NFTs Minted" value={data.MainStats.NumCSTokenMints} />
        <StatCard
          label="Contract Balance"
          value={formatEthValue(data.CosmicGameBalanceEth ?? 0)}
          gradient
        />
      </div>

      <section className="space-y-12">
        {/* Overall Stats */}
        <div>
          <SectionDivider title="Overall Statistics" className="mb-6" />
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            {overallStats.map((item) => (
              <StatisticsItem key={item.title} title={item.title} value={item.value} />
            ))}
            {(data.MainStats.NumWinnersWithPendingRaffleWithdrawal ?? 0) > 0 && (
              <p className="text-sm text-primary mt-2">{`${data.MainStats.NumWinnersWithPendingRaffleWithdrawal} winners are yet to withdraw funds totaling ${formatEthValue(data.MainStats.TotalRaffleEthDeposits - data.MainStats.TotalRaffleEthWithdrawn)} ETH`}</p>
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
                  <Link className="text-inherit" href="/charity-deposits-voluntary">
                    {`${data.NumVoluntaryDonations} totaling ${(Number(data.SumVoluntaryDonationsEth) || 0).toFixed(4)} ETH`}
                  </Link>
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
        </div>

        {/* Participants */}
        <div>
          <SectionDivider title="Participants" className="mb-6" />
          <div className="space-y-8">
            <div>
              <h4 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Unique Bidders
              </h4>
              <UniqueBiddersTable list={uniqueBidders} />
            </div>
            <div>
              <h4 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Unique Winners
              </h4>
              <UniqueWinnersTable list={uniqueWinners} />
            </div>
            <div>
              <h4 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Unique ETH Donors
              </h4>
              <UniqueEthDonorsTable list={uniqueDonors} />
            </div>
          </div>
        </div>

        {/* Token Distribution */}
        <div>
          <SectionDivider title="Token Distribution" className="mb-6" />
          <div className="space-y-8">
            <div>
              <h4 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Donated Token Distribution
              </h4>
              <DonatedNFTDistributionTable list={data.MainStats.DonatedTokenDistribution ?? []} />
            </div>
            <div>
              <h4 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Cosmic Signature Token (ERC721)
              </h4>
              <CSTokenDistributionTable list={cstDistribution} />
            </div>
            <div>
              <h4 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Cosmic Token (ERC20) Balance
              </h4>
              <CTBalanceDistributionChart list={ctBalanceDistribution} />
              <div className="mt-4">
                <CTBalanceDistributionTable list={ctBalanceDistribution.slice(0, 20)} />
              </div>
            </div>
          </div>
        </div>

        {/* Staking */}
        <div>
          <SectionDivider title="Staking" className="mb-6" />
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
        </div>

        <DonatedNFTsGrid nftDonations={nftDonations} />

        <div>
          <SectionDivider title="Round Activations" className="mb-6" />
          {systemModeChanges === null ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <SystemModesTable list={systemModeChanges ?? []} />
          )}
        </div>
      </section>
    </MainWrapper>
  );
};

export default Statistics;
