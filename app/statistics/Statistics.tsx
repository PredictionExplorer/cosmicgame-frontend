'use client';

import { useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Trophy,
  Coins,
  Hash,
  Wallet,
  Users,
  Award,
  Heart,
  TrendingUp,
  Gift,
  Layers,
  Lock,
  Activity,
} from 'lucide-react';

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
import { StatisticsGroup } from '@/components/statistics/StatisticsGroup';
import { CollapsibleSection } from '@/components/statistics/CollapsibleSection';
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

  return (
    <MainWrapper>
      <PageHeader
        title="Statistics"
        subtitle="Historical data and overall metrics for the Cosmic Signature game"
      />

      {/* Link to current round */}
      <Link
        href="/current-round"
        className="gradient-border-card mb-12 flex items-center justify-between rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.06] via-accent/[0.04] to-primary/[0.06] p-4 group hover:from-primary/[0.08] hover:to-primary/[0.08] transition-all"
      >
        <div>
          <p className="text-sm font-medium text-white">Looking for current round data?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            View bid history, leaderboards, and live round details
          </p>
        </div>
        <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-0.5 transition-transform" />
      </Link>

      {/* 1 ── Hero Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        <StatCard
          label="Total Rounds"
          value={data.CurRoundNum}
          icon={<Hash className="h-4 w-4" />}
          tooltip="Total number of game rounds played since launch"
        />
        <StatCard
          label="Prizes Given"
          value={data.TotalPrizes as ReactNode}
          icon={<Trophy className="h-4 w-4" />}
          tooltip="Total number of main prizes awarded to round winners"
        />
        <StatCard
          label="NFTs Minted"
          value={data.MainStats.NumCSTokenMints}
          icon={<Layers className="h-4 w-4" />}
          tooltip="Total Cosmic Signature Tokens (ERC-721) minted across all rounds"
        />
        <StatCard
          label="Contract Balance"
          value={formatEthValue(data.CosmicGameBalanceEth ?? 0)}
          icon={<Wallet className="h-4 w-4" />}
          tooltip="ETH held by the CosmicGame smart contract, used to fund prizes and raffles"
          gradient
        />
      </div>

      <section className="space-y-12">
        {/* 2 ── Financial Overview ────────────────────────────────── */}
        <div>
          <SectionDivider title="Financial Overview" className="mb-6" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Prize Economy */}
            <StatisticsGroup
              title="Prize Economy"
              icon={<Trophy className="h-4 w-4" />}
              accentColor="blue"
            >
              <StatisticsItem
                title="Num Prizes Given"
                value={
                  <Link href="/prize" className="text-inherit">
                    {data.TotalPrizes as ReactNode}
                  </Link>
                }
                tooltip="Number of main prizes awarded to round winners"
              />
              <StatisticsItem
                title="Total Main Prizes Paid"
                value={formatEthValue(Number(data.TotalPrizesPaidAmountEth) || 0)}
                tooltip="Total ETH paid out as main prizes to round winners"
              />
              <StatisticsItem
                title="Raffle ETH Deposited"
                value={formatEthValue(data.MainStats.TotalRaffleEthDeposits)}
                tooltip="Total ETH deposited into raffle pools across all rounds"
              />
              <StatisticsItem
                title="Raffle ETH Withdrawn"
                value={formatEthValue(data.MainStats.TotalRaffleEthWithdrawn)}
                tooltip="Total ETH collected by winners from raffle pools"
              />
              {(data.MainStats.NumWinnersWithPendingRaffleWithdrawal ?? 0) > 0 && (
                <p className="text-sm text-primary mt-2">{`${data.MainStats.NumWinnersWithPendingRaffleWithdrawal} winners are yet to withdraw funds totaling ${formatEthValue(data.MainStats.TotalRaffleEthDeposits - data.MainStats.TotalRaffleEthWithdrawn)} ETH`}</p>
              )}
            </StatisticsGroup>

            {/* Token Economy */}
            <StatisticsGroup
              title="Token Economy"
              icon={<Coins className="h-4 w-4" />}
              accentColor="purple"
            >
              <StatisticsItem
                title="CST Minted"
                value={
                  <Link href="/gallery" className="text-inherit">
                    {data.MainStats.NumCSTokenMints}
                  </Link>
                }
                tooltip="Total Cosmic Signature Tokens (ERC-721) minted"
              />
              <StatisticsItem
                title="Total CST Consumed"
                value={formatCSTValue(data.MainStats.TotalCSTConsumedEth)}
                tooltip="Cosmic Signature Tokens burned by players when placing bids with CST"
              />
              <StatisticsItem
                title="Bids with CST"
                value={data.MainStats.NumBidsCST}
                tooltip="Number of bids placed using Cosmic Signature Tokens instead of ETH"
              />
              <StatisticsItem
                title="Marketing Rewards"
                value={formatCSTValue(data.MainStats.TotalMktRewardsEth)}
                tooltip="CST paid to marketing agents who help promote the game"
              />
              <StatisticsItem
                title="Marketing Transactions"
                value={
                  <Link className="text-inherit" href="/marketing">
                    {data.MainStats.NumMktRewards}
                  </Link>
                }
              />
              <StatisticsItem
                title="RandomWalk Tokens Used"
                value={
                  <Link className="text-inherit" href="/used-rwlk-nfts">
                    {data.NumRwalkTokensUsed as ReactNode}
                  </Link>
                }
                tooltip="RandomWalk NFTs used as free bids in the game"
              />
              <StatisticsItem
                title="Named Tokens"
                value={
                  <Link className="text-inherit" href="/named-nfts">
                    {data.MainStats.TotalNamedTokens}
                  </Link>
                }
                tooltip="Cosmic Signature Tokens that have been given a custom name by their owner"
              />
            </StatisticsGroup>

            {/* Charity & Donations */}
            <StatisticsGroup
              title="Charity & Donations"
              icon={<Heart className="h-4 w-4" />}
              accentColor="emerald"
            >
              <StatisticsItem
                title="Charity Balance"
                value={formatEthValue(Number(data.CharityBalanceEth) || 0)}
                tooltip="ETH allocated for charity, accumulated from game proceeds"
              />
              <StatisticsItem
                title="CosmicGame Contract Balance"
                value={`${(data.CosmicGameBalanceEth ?? 0).toFixed(4)} ETH`}
                tooltip="ETH held by the CosmicGame smart contract"
              />
              <StatisticsItem
                title="Donated NFTs"
                value={
                  <Link className="text-inherit" href="/nft-donations">
                    {data.NumDonatedNFTs as ReactNode}
                  </Link>
                }
                tooltip="ERC-721 tokens donated to the game by community members"
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
                tooltip="Total ETH donated to the game across all rounds"
              />
              {(data.MainStats.NumCosmicGameDonations ?? 0) > 0 && (
                <>
                  <StatisticsItem
                    title="Cosmic Game Donations"
                    value={
                      <Link className="text-inherit" href="/charity-deposits-cg">
                        {data.MainStats.NumCosmicGameDonations}
                      </Link>
                    }
                  />
                  <StatisticsItem
                    title="CG Donations Sum"
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
                  title="Voluntary Donations"
                  value={
                    <Link className="text-inherit" href="/charity-deposits-voluntary">
                      {`${data.NumVoluntaryDonations} totaling ${(Number(data.SumVoluntaryDonationsEth) || 0).toFixed(4)} ETH`}
                    </Link>
                  }
                  tooltip="Donations made voluntarily by community members"
                />
              )}
              {(data.MainStats.NumWithdrawals ?? 0) > 0 && (
                <StatisticsItem
                  title="Charity Withdrawals"
                  value={
                    <Link className="text-inherit" href="/charity-withdrawals">
                      {data.MainStats.NumWithdrawals}
                    </Link>
                  }
                />
              )}
              <StatisticsItem
                title="Total Charity Withdrawn"
                value={formatEthValue(data.MainStats.SumWithdrawals ?? 0)}
                tooltip="Total ETH withdrawn from the charity wallet"
              />
            </StatisticsGroup>
          </div>
        </div>

        {/* 3 ── Community & Participation ─────────────────────────── */}
        <div>
          <SectionDivider title="Community & Participation" className="mb-6" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard
              label="Unique Bidders"
              value={data.MainStats.NumUniqueBidders}
              icon={<Users className="h-4 w-4" />}
              tooltip="Total unique wallet addresses that have placed at least one bid"
            />
            <StatCard
              label="Unique Winners"
              value={data.MainStats.NumUniqueWinners}
              icon={<Award className="h-4 w-4" />}
              tooltip="Total unique wallet addresses that have won at least one round"
            />
            <StatCard
              label="Unique ETH Donors"
              value={data.MainStats.NumUniqueDonors}
              icon={<Gift className="h-4 w-4" />}
              tooltip="Unique addresses that have donated ETH to the game"
            />
            <StatCard
              label="Unique Stakers"
              value={data.MainStats.NumUniqueStakersCST + data.MainStats.NumUniqueStakersRWalk}
              icon={<TrendingUp className="h-4 w-4" />}
              tooltip="Combined unique CST and RandomWalk token stakers"
            />
          </div>

          <div className="space-y-8">
            <CollapsibleSection title="Unique Bidders" defaultOpen>
              <UniqueBiddersTable list={uniqueBidders} />
            </CollapsibleSection>
            <CollapsibleSection title="Unique Winners" defaultOpen>
              <UniqueWinnersTable list={uniqueWinners} />
            </CollapsibleSection>
            <CollapsibleSection title="Unique ETH Donors" defaultOpen>
              <UniqueEthDonorsTable list={uniqueDonors} />
            </CollapsibleSection>
          </div>
        </div>

        {/* 4 ── Token Distribution ────────────────────────────────── */}
        <div>
          <SectionDivider title="Token Distribution" className="mb-6" />

          <div className="grid grid-cols-3 gap-3 mb-8">
            <StatCard
              label="CST Holders"
              value={cstDistribution.length}
              icon={<Users className="h-4 w-4" />}
              tooltip="Unique wallet addresses holding Cosmic Signature Tokens (ERC-721)"
              featured
            />
            <StatCard
              label="CST (ERC-20) Holders"
              value={ctBalanceDistribution.length}
              icon={<Coins className="h-4 w-4" />}
              tooltip="Unique wallet addresses holding CST tokens (ERC-20)"
            />
            <StatCard
              label="Donated NFTs"
              value={data.NumDonatedNFTs as ReactNode}
              icon={<Gift className="h-4 w-4" />}
              tooltip="Total ERC-721 tokens donated to the game by community members"
              featured
            />
          </div>

          <div className="space-y-8">
            <CollapsibleSection
              title="Donated Token Distribution"
              defaultOpen={false}
              icon={<Gift className="h-3.5 w-3.5" />}
            >
              <DonatedNFTDistributionTable list={data.MainStats.DonatedTokenDistribution ?? []} />
            </CollapsibleSection>
            <CollapsibleSection
              title="Cosmic Signature Token (ERC-721)"
              icon={<Layers className="h-3.5 w-3.5" />}
            >
              <CSTokenDistributionTable list={cstDistribution} />
            </CollapsibleSection>
            <CollapsibleSection
              title="CST (ERC-20) Balance Distribution"
              icon={<Coins className="h-3.5 w-3.5" />}
            >
              <CTBalanceDistributionChart list={ctBalanceDistribution} />
              <div className="mt-4">
                <CTBalanceDistributionTable list={ctBalanceDistribution.slice(0, 20)} />
              </div>
            </CollapsibleSection>
          </div>
        </div>

        {/* 5 ── Staking ──────────────────────────────────────────── */}
        <div>
          <SectionDivider title="Staking" className="mb-6" />

          <div className="grid grid-cols-3 gap-3 mb-8">
            <StatCard
              label="Active CST Stakers"
              value={data.MainStats.StakeStatisticsCST.NumActiveStakers}
              icon={<Lock className="h-4 w-4" />}
              tooltip="Wallets currently staking at least one Cosmic Signature Token"
              featured
            />
            <StatCard
              label="Active RWLK Stakers"
              value={data.MainStats.StakeStatisticsRWalk.NumActiveStakers}
              icon={<Activity className="h-4 w-4" />}
              tooltip="Wallets currently staking at least one RandomWalk Token"
              featured
            />
            <StatCard
              label="Total Staking Rewards"
              value={formatEthValue(data.MainStats.StakeStatisticsCST.TotalRewardEth ?? 0)}
              icon={<TrendingUp className="h-4 w-4" />}
              tooltip="Total ETH distributed as staking rewards to CST stakers"
              gradient
            />
          </div>

          <div className="gradient-border-card rounded-xl bg-white/[0.02] p-1">
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
        </div>

        {/* 6 ── Donated NFTs Grid ────────────────────────────────── */}
        <DonatedNFTsGrid nftDonations={nftDonations} />

        {/* 7 ── Round Activations ────────────────────────────────── */}
        <div>
          <SectionDivider title="System Events" className="mb-6" />
        </div>
        <CollapsibleSection
          title="Round Activations"
          defaultOpen={false}
          icon={<Activity className="h-3.5 w-3.5" />}
        >
          {systemModeChanges === null ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <SystemModesTable list={systemModeChanges ?? []} />
          )}
        </CollapsibleSection>
      </section>
    </MainWrapper>
  );
};

export default Statistics;
