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

  /** Prefer DB row count from cg_prize; fall back to aggregated winner counts. */
  const totalPrizesGiven =
    data != null
      ? Number(
          data.CgPrizeRowCount ??
            data.MainStats?.CgPrizeRowCount ??
            data.TotalPrizeAwards ??
            data.MainStats?.TotalPrizeAwards ??
            data.TotalPrizes ??
            0,
        )
      : 0;

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
        subtitle="Historical data and overall metrics for the Cosmic Signature protocol"
      />

      {/* Link to current cycle */}
      <Link
        href="/current-cycle"
        className="gradient-border-card mb-12 flex items-center justify-between rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.06] via-accent/[0.04] to-primary/[0.06] p-4 group hover:from-primary/[0.08] hover:to-primary/[0.08] transition-all"
      >
        <div>
          <p className="text-sm font-medium text-white">Looking for current cycle data?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            View gesture history, leaderboards, and live cycle details
          </p>
        </div>
        <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-0.5 transition-transform" />
      </Link>

      {/* 1 \u2500\u2500 Hero Stat Cards \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        <StatCard
          label="Total Cycles"
          value={data.CurRoundNum}
          icon={<Hash className="h-4 w-4" />}
          tooltip="Total Performance Cycles completed since launch"
        />
        <StatCard
          label="Allocations Distributed"
          value={totalPrizesGiven as ReactNode}
          icon={<Trophy className="h-4 w-4" />}
          tooltip="Rows in cg_prize (every allocation slot). Includes protocol markers that are not attributed to a single recipient (e.g. Anchor Distribution deposits per cycle)."
        />
        <StatCard
          label="NFTs Imprinted"
          value={data.MainStats.NumCSTokenMints}
          icon={<Layers className="h-4 w-4" />}
          tooltip="Total Cosmic Signature NFTs (ERC-721) imprinted across all cycles"
        />
        <StatCard
          label="Contract Balance"
          value={formatEthValue(data.CosmicGameBalanceEth ?? 0)}
          icon={<Wallet className="h-4 w-4" />}
          tooltip="ETH held by the protocol smart contract, used to fund allocations and Stellar Selection"
          gradient
        />
      </div>

      <section className="space-y-12">
        {/* 2 ── Financial Overview ────────────────────────────────── */}
        <div>
          <SectionDivider title="Financial Overview" className="mb-6" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Allocation Economy */}
            <StatisticsGroup
              title="Allocation Economy"
              icon={<Trophy className="h-4 w-4" />}
              accentColor="blue"
            >
              <StatisticsItem
                title="Num Allocations Distributed"
                value={
                  <Link href="/allocation" className="text-inherit">
                    {totalPrizesGiven as ReactNode}
                  </Link>
                }
                tooltip="COUNT(*) from cg_prize when available; otherwise aggregated recipient allocation counts"
              />
              <StatisticsItem
                title="Total Signature Allocations Distributed"
                value={formatEthValue(Number(data.TotalPrizesPaidAmountEth) || 0)}
                tooltip="Total ETH distributed as Signature Allocations to cycle recipients"
              />
              <StatisticsItem
                title="Stellar Selection ETH Deposited"
                value={formatEthValue(data.MainStats.TotalRaffleEthDeposits)}
                tooltip="Total ETH allocated to Stellar Selection pools across all cycles"
              />
              <StatisticsItem
                title="Stellar Selection ETH Retrieved"
                value={formatEthValue(data.MainStats.TotalRaffleEthWithdrawn)}
                tooltip="Total ETH retrieved by recipients from Stellar Selection pools"
              />
              {(data.MainStats.NumWinnersWithPendingRaffleWithdrawal ?? 0) > 0 && (
                <p className="text-sm text-primary mt-2">{`${data.MainStats.NumWinnersWithPendingRaffleWithdrawal} recipients have yet to retrieve funds totaling ${formatEthValue(data.MainStats.TotalRaffleEthDeposits - data.MainStats.TotalRaffleEthWithdrawn)} ETH`}</p>
              )}
            </StatisticsGroup>

            {/* Token Economy */}
            <StatisticsGroup
              title="Token Economy"
              icon={<Coins className="h-4 w-4" />}
              accentColor="purple"
            >
              <StatisticsItem
                title="NFTs Imprinted"
                value={
                  <Link href="/gallery" className="text-inherit">
                    {data.MainStats.NumCSTokenMints}
                  </Link>
                }
                tooltip="Total Cosmic Signature NFTs (ERC-721) imprinted"
              />
              <StatisticsItem
                title="Total CST Consumed"
                value={formatCSTValue(data.MainStats.TotalCSTConsumedEth)}
                tooltip="Cosmic Signature Tokens consumed by participants when gesturing with CST"
              />
              <StatisticsItem
                title="Gestures with CST"
                value={data.MainStats.NumBidsCST}
                tooltip="Number of gestures made using Cosmic Signature Tokens instead of ETH"
              />
              <StatisticsItem
                title="Outreach Reserve"
                value={formatCSTValue(data.MainStats.TotalMktRewardsEth)}
                tooltip="CST forwarded to ecosystem contributors who help promote the protocol"
              />
              <StatisticsItem
                title="Outreach Transactions"
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
                tooltip="RandomWalk NFTs attached to gestures for cost reduction"
              />
              <StatisticsItem
                title="Named Tokens"
                value={
                  <Link className="text-inherit" href="/named-nfts">
                    {data.MainStats.TotalNamedTokens}
                  </Link>
                }
                tooltip="Cosmic Signature NFTs that have been given a custom name by their owner"
              />
            </StatisticsGroup>

            {/* Public Goods & Contributions */}
            <StatisticsGroup
              title="Public Goods & Contributions"
              icon={<Heart className="h-4 w-4" />}
              accentColor="emerald"
            >
              <StatisticsItem
                title="Public Goods Balance"
                value={formatEthValue(Number(data.CharityBalanceEth) || 0)}
                tooltip="ETH allocated to the Public Goods Beneficiary, accumulated from protocol flows"
              />
              <StatisticsItem
                title="Protocol Contract Balance"
                value={`${(data.CosmicGameBalanceEth ?? 0).toFixed(4)} ETH`}
                tooltip="ETH held by the Cosmic Signature protocol smart contract"
              />
              <StatisticsItem
                title="Attached NFTs"
                value={
                  <Link className="text-inherit" href="/nft-donations">
                    {data.NumDonatedNFTs as ReactNode}
                  </Link>
                }
                tooltip="ERC-721 tokens attached to gestures by community members"
              />
              <StatisticsItem
                title="Total Contributed ETH"
                value={
                  <Link
                    className="text-inherit"
                    href="/eth-contribution"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {formatEthValue(data.MainStats.TotalEthDonatedAmountEth ?? 0)}
                  </Link>
                }
                tooltip="Total ETH contributed to the protocol across all cycles"
              />
              {(data.MainStats.NumCosmicGameDonations ?? 0) > 0 && (
                <>
                  <StatisticsItem
                    title="Protocol Contributions"
                    value={
                      <Link className="text-inherit" href="/public-goods-contributions-cg">
                        {data.MainStats.NumCosmicGameDonations}
                      </Link>
                    }
                  />
                  <StatisticsItem
                    title="Protocol Contributions Sum"
                    value={
                      <Link className="text-inherit" href="/public-goods-contributions-cg">
                        {formatEthValue(data.MainStats.SumCosmicGameDonationsEth ?? 0)}
                      </Link>
                    }
                  />
                </>
              )}
              {(Number(data.SumVoluntaryDonationsEth) || 0) > 0 && (
                <StatisticsItem
                  title="Voluntary Contributions"
                  value={
                    <Link className="text-inherit" href="/public-goods-contributions-voluntary">
                      {`${data.NumVoluntaryDonations} totaling ${(Number(data.SumVoluntaryDonationsEth) || 0).toFixed(4)} ETH`}
                    </Link>
                  }
                  tooltip="Contributions made voluntarily by community members"
                />
              )}
              {(data.MainStats.NumWithdrawals ?? 0) > 0 && (
                <StatisticsItem
                  title="Public Goods Retrievals"
                  value={
                    <Link className="text-inherit" href="/public-goods-retrievals">
                      {data.MainStats.NumWithdrawals}
                    </Link>
                  }
                />
              )}
              <StatisticsItem
                title="Total Public Goods Retrieved"
                value={formatEthValue(data.MainStats.SumWithdrawals ?? 0)}
                tooltip="Total ETH retrieved from the Public Goods Vault"
              />
            </StatisticsGroup>
          </div>
        </div>

        {/* 3 \u2500\u2500 Community & Participation \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
        <div>
          <SectionDivider title="Community & Participation" className="mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard
              label="Unique Participants"
              value={data.MainStats.NumUniqueBidders}
              icon={<Users className="h-4 w-4" />}
              tooltip="Total unique wallet addresses that have made at least one gesture"
            />
            <StatCard
              label="Unique Recipients"
              value={data.MainStats.NumUniqueWinners}
              icon={<Award className="h-4 w-4" />}
              tooltip="Total unique wallet addresses that have retrieved at least one Signature Allocation"
            />
            <StatCard
              label="Unique ETH Contributors"
              value={data.MainStats.NumUniqueDonors}
              icon={<Gift className="h-4 w-4" />}
              tooltip="Unique addresses that have contributed ETH to the protocol"
            />
            <StatCard
              label="Unique Anchor-holders"
              value={data.MainStats.NumUniqueStakersCST + data.MainStats.NumUniqueStakersRWalk}
              icon={<TrendingUp className="h-4 w-4" />}
              tooltip="Combined unique CST and RandomWalk token anchor-holders"
            />
          </div>

          <div className="space-y-8">
            <CollapsibleSection title="Unique Participants" defaultOpen>
              <UniqueBiddersTable list={uniqueBidders} />
            </CollapsibleSection>
            <CollapsibleSection title="Unique Recipients" defaultOpen>
              <UniqueWinnersTable list={uniqueWinners} />
            </CollapsibleSection>
            <CollapsibleSection title="Unique ETH Contributors" defaultOpen>
              <UniqueEthDonorsTable list={uniqueDonors} />
            </CollapsibleSection>
          </div>
        </div>

        {/* 4 ── Token Distribution ────────────────────────────────── */}
        <div>
          <SectionDivider title="Token Distribution" className="mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            <StatCard
              label="Cosmic Signature NFT Holders"
              value={cstDistribution.length}
              icon={<Users className="h-4 w-4" />}
              tooltip="Unique wallet addresses holding Cosmic Signature NFTs (ERC-721)"
              featured
            />
            <StatCard
              label="CST (ERC-20) Holders"
              value={ctBalanceDistribution.length}
              icon={<Coins className="h-4 w-4" />}
              tooltip="Unique wallet addresses holding CST tokens (ERC-20)"
            />
            <StatCard
              label="Attached NFTs"
              value={data.NumDonatedNFTs as ReactNode}
              icon={<Gift className="h-4 w-4" />}
              tooltip="Total ERC-721 tokens attached to gestures by community members"
              featured
            />
          </div>

          <div className="space-y-8">
            <CollapsibleSection
              title="Attached Token Distribution"
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

        {/* 5 \u2500\u2500 Anchoring \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
        <div>
          <SectionDivider title="Anchoring" className="mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            <StatCard
              label="Active CST Anchor-holders"
              value={data.MainStats.StakeStatisticsCST.NumActiveStakers}
              icon={<Lock className="h-4 w-4" />}
              tooltip="Wallets currently anchoring at least one Cosmic Signature NFT"
              featured
            />
            <StatCard
              label="Active RWLK Anchor-holders"
              value={data.MainStats.StakeStatisticsRWalk.NumActiveStakers}
              icon={<Activity className="h-4 w-4" />}
              tooltip="Wallets currently anchoring at least one RandomWalk Token"
              featured
            />
            <StatCard
              label="Total Anchor Distributions"
              value={formatEthValue(data.MainStats.StakeStatisticsCST.TotalRewardEth ?? 0)}
              icon={<TrendingUp className="h-4 w-4" />}
              tooltip="Total ETH distributed to Cosmic Signature NFT anchor-holders"
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
          title="Cycle Activations"
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
