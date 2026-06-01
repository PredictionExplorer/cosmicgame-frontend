'use client';

import { useMemo, useState, type ReactNode } from 'react';
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
import { statisticsCopy } from '@/content/statistics-copy';

import { formatDistributionPerAnchoredNftEth } from '@/utils/anchoringStats';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { StatCard } from '@/components/ui/stat-card';
import { SectionDivider } from '@/components/ui/section-divider';
import { Surface } from '@/components/ui/surface';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { UniqueParticipantsTable, Participant } from '@/components/tables/UniqueParticipantsTable';
import { UniqueRecipientsTable, Recipient } from '@/components/tables/UniqueRecipientsTable';
import AttachedNFTDistributionTable from '@/components/attachments/AttachedNFTDistributionTable';
import { CSTokenDistributionTable } from '@/components/tokens/CSTokenDistributionTable';
import { CTBalanceDistributionTable } from '@/components/tokens/CTBalanceDistributionTable';
import { CTBalanceDistributionChart } from '@/components/tokens/CTBalanceDistributionChart';
import { CSTTotalSupplyHistorySection } from '@/components/tokens/CSTTotalSupplyHistorySection';
import { SystemModesTable, EventRow } from '@/components/tables/SystemModesTable';
import { UniqueEthDonorsTable, UniqueEthDonor } from '@/components/tables/UniqueEthDonorsTable';
import {
  useDashboardInfo,
  useUniqueParticipants,
  useUniqueRecipients,
  useUniqueCSTAnchorHolders,
  useUniqueRWLKAnchorHolders,
  useUniqueDonors,
  useDonationsNFTList,
  useCSTDistribution,
  useCTBalancesDistribution,
  useCTStatistics,
  useCSTAnchorActions,
  useRWLKAnchorActions,
  useGlobalAnchoredCSTokens,
  useGlobalAnchoredRWLKTokens,
  useSystemModelist,
  useDonationsNFTByRound,
  useDonationsERC20ByRound,
} from '@/hooks/useApiQuery';
import type { AttachedNFT, DonatedERC20Token } from '@/services/api/types';
import { StatisticsItem } from '@/components/statistics/StatisticsItem';
import { StatisticsGroup } from '@/components/statistics/StatisticsGroup';
import { CollapsibleSection } from '@/components/statistics/CollapsibleSection';
import { AnchoringSection } from '@/components/statistics/AnchoringSection';
import { DonatedNFTsGrid } from '@/components/statistics/DonatedNFTsGrid';
import { DonatedTokensSection } from '@/components/home/DonatedTokensSection';
import { BiddingActivitySection } from '@/components/statistics/BiddingActivitySection';
import {
  AnchoringHeroStats,
  type AnchoringStatItem,
} from '@/components/anchoring/AnchoringHeroStats';
import type { UniqueAnchorHolderCST } from '@/components/tables/UniqueAnchorHoldersCSTTable';
import type { UniqueAnchorHolderRWLK } from '@/components/tables/UniqueAnchorHoldersRWLKTable';

const Statistics = () => {
  const { data: dashboardData, isLoading: dashboardLoading, isError } = useDashboardInfo();

  const { data: uniqueBiddersData } = useUniqueParticipants();
  const { data: uniqueWinnersData } = useUniqueRecipients();
  const { data: uniqueCSTAnchorHoldersData } = useUniqueCSTAnchorHolders();
  const { data: uniqueRWLKAnchorHoldersData } = useUniqueRWLKAnchorHolders();
  const { data: uniqueDonorsData } = useUniqueDonors();
  const { data: nftDonationsData } = useDonationsNFTList();
  const { data: cstDistributionData } = useCSTDistribution();
  const { data: ctBalanceDistributionData } = useCTBalancesDistribution();
  const { data: ctStatisticsData } = useCTStatistics();
  const { data: cstAnchorActionsData } = useCSTAnchorActions();
  const { data: rwlkAnchorActionsData } = useRWLKAnchorActions();
  const { data: stakedCSTokensData } = useGlobalAnchoredCSTokens();
  const { data: stakedRWLKTokensData } = useGlobalAnchoredRWLKTokens();
  const { data: systemModeChangesData } = useSystemModelist();

  const data = dashboardData ?? null;
  const curRoundNum = data?.CurRoundNum ?? -1;
  const [attachedTokensTab, setAttachedTokensTab] = useState(0);
  const [attachedTokensNftPage, setAttachedTokensNftPage] = useState(1);
  const { data: curRoundNftDonations } = useDonationsNFTByRound(curRoundNum);
  const { data: curRoundErc20Donations } = useDonationsERC20ByRound(curRoundNum);

  const uniqueParticipants = useMemo(() => {
    if (!uniqueBiddersData) return [];
    return [...uniqueBiddersData].sort((a: Participant, b: Participant) => b.NumBids - a.NumBids);
  }, [uniqueBiddersData]);

  const uniqueRecipients = (uniqueWinnersData ?? []) as Recipient[];
  const uniqueCSTAnchorHolders = (uniqueCSTAnchorHoldersData ?? []) as UniqueAnchorHolderCST[];
  const uniqueRWLKAnchorHolders = (uniqueRWLKAnchorHoldersData ?? []) as UniqueAnchorHolderRWLK[];
  const uniqueDonors = (uniqueDonorsData ?? []) as UniqueEthDonor[];
  const nftDonations = nftDonationsData ?? [];
  const cstDistribution = (cstDistributionData ??
    []) as import('@/services/api/types').TokenDistribution[];
  const ctBalanceDistribution = (ctBalanceDistributionData ??
    []) as import('@/services/api/types').CTBalanceDistribution[];
  const cstAnchorActions = cstAnchorActionsData ?? null;
  const rwlkAnchorActions = rwlkAnchorActionsData ?? null;
  const anchoredCSTokens = stakedCSTokensData ?? null;
  const anchoredRWLKTokens = stakedRWLKTokensData ?? null;
  const systemModeChanges = (systemModeChangesData as EventRow[] | undefined) ?? null;

  /** Prefer DB row count from cg_prize; fall back to aggregated recipient counts. */
  const totalAllocationsDistributed =
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
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Failed to load statistics"
        message="Please refresh the page to try again."
        onRetry={() => window.location.reload()}
      />
    );
  }

  const cstAnchorStats = data.MainStats.StakeStatisticsCST;
  const rwlkAnchorStats = data.MainStats.StakeStatisticsRWalk;
  const distributionPerCst = formatDistributionPerAnchoredNftEth(
    data.StakingAmountEth,
    cstAnchorStats.TotalTokensStaked,
  );
  const totalActiveAnchorHolders =
    cstAnchorStats.NumActiveStakers + rwlkAnchorStats.NumActiveStakers;

  const anchoringSnapshotStats: AnchoringStatItem[] = [
    {
      label: 'Cosmic Signature NFTs Anchored',
      value: cstAnchorStats.TotalTokensStaked.toLocaleString(),
      tooltip:
        'Total number of Cosmic Signature NFTs currently anchored in the protocol and sharing Anchor Distributions.',
      icon: <Lock className="h-4 w-4" />,
      featured: true,
    },
    {
      label: 'RandomWalk NFTs Anchored',
      value: rwlkAnchorStats.TotalTokensStaked.toLocaleString(),
      tooltip:
        'Total number of RandomWalk NFTs currently anchored and eligible for Anchored-NFT Stellar Selection.',
      icon: <Activity className="h-4 w-4" />,
      featured: true,
    },
    {
      label: 'Anchor Distribution Pool',
      value: formatEthValue(data.StakingAmountEth ?? 0),
      tooltip:
        'ETH currently allocated to the Anchor Distribution pool for Cosmic Signature NFT anchor-holders.',
      icon: <Coins className="h-4 w-4" />,
      gradient: true,
    },
    {
      label: 'Distribution per CST NFT',
      value: distributionPerCst.value,
      tooltip:
        'Current ETH Anchor Distribution per anchored Cosmic Signature NFT: on-chain pool divided by the indexed total of anchored NFTs.' +
        distributionPerCst.tooltipSuffix,
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      label: 'Active Anchor-holders',
      value: totalActiveAnchorHolders.toLocaleString(),
      tooltip:
        'Combined active wallets currently anchoring at least one Cosmic Signature NFT or RandomWalk NFT.',
      icon: <Users className="h-4 w-4" />,
    },
  ];

  return (
    <>
      <PageHeader
        align="left"
        titleLevel={2}
        eyebrow={
          <SectionEyebrow tone="aurora" pulse>
            Protocol Metrics · Live
          </SectionEyebrow>
        }
        title="Statistics"
        gradientTitle="signature"
        subtitle="Historical data and overall metrics for the Cosmic Signature protocol"
      />

      {/* Link to current cycle */}
      <Surface
        asChild
        variant="aurora"
        radius="lg"
        padding="none"
        interactive
        className="mb-12 block no-underline"
      >
        <Link href="/current-cycle" className="group">
          <div className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-base font-semibold text-white">Looking for current cycle data?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                View gesture history, leaderboards, and live cycle details
              </p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--aurora-cyan-rgb)/0.25)] bg-[rgb(var(--aurora-cyan-rgb)/0.10)]">
              <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
          <div
            aria-hidden
            className="h-1 bg-gradient-to-r from-[rgb(var(--aurora-cyan-rgb))] via-[rgb(var(--nebula-violet-rgb))] to-[rgb(var(--chrono-rose-rgb))] opacity-70"
          />
        </Link>
      </Surface>

      {/* 1 \u2500\u2500 Hero Stat Cards \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <Surface
        variant="gradient-border-accent"
        radius="xl"
        padding="lg"
        className="mb-12"
        data-testid="anchoring-at-a-glance"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <SectionEyebrow tone="impact" className="mb-3">
              Anchoring · Live
            </SectionEyebrow>
            <h3 className="text-2xl font-semibold tracking-tight text-white">
              Anchoring at a Glance
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Anchored tokens are a core part of Cosmic Signature: CST NFTs share ETH Anchor
              Distributions, while RandomWalk NFTs participate in Anchored-NFT Stellar Selection.
            </p>
          </div>
          <Link
            href="/anchoring"
            className="group inline-flex items-center gap-2 self-start rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary no-underline transition-colors hover:border-primary/45 hover:bg-primary/15 lg:self-auto"
          >
            View anchor history
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <AnchoringHeroStats
          stats={anchoringSnapshotStats}
          className="mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
        />
      </Surface>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        <StatCard
          label={statisticsCopy.metrics.totalCycles.label}
          value={data.CurRoundNum}
          icon={<Hash className="h-4 w-4" />}
          tooltip={statisticsCopy.metrics.totalCycles.tooltip}
        />
        <StatCard
          label={statisticsCopy.metrics.allocationsDistributed.label}
          value={totalAllocationsDistributed as ReactNode}
          icon={<Trophy className="h-4 w-4" />}
          tooltip={statisticsCopy.metrics.allocationsDistributed.tooltip}
        />
        <StatCard
          label={statisticsCopy.metrics.cosmicSignatureNftsImprinted.shortLabel}
          value={data.MainStats.NumCSTokenMints}
          icon={<Layers className="h-4 w-4" />}
          tooltip={statisticsCopy.metrics.cosmicSignatureNftsImprinted.tooltip}
        />
        <StatCard
          label={statisticsCopy.metrics.contractBalance.label}
          value={formatEthValue(data.CosmicGameBalanceEth ?? 0)}
          icon={<Wallet className="h-4 w-4" />}
          tooltip={statisticsCopy.metrics.contractBalance.tooltip}
          gradient
        />
      </div>

      <section className="space-y-12">
        {/* 2 ── Protocol Economy ─────────────────────────────────── */}
        <div>
          <SectionDivider title="Protocol Economy" className="mb-6" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Allocation Economy */}
            <StatisticsGroup
              title="Allocation Economy"
              icon={<Trophy className="h-4 w-4" />}
              accentColor="blue"
              tooltip={statisticsCopy.groups.allocationEconomy}
            >
              <StatisticsItem
                title="Num Allocations Distributed"
                value={
                  <Link href="/allocation" className="text-inherit">
                    {totalAllocationsDistributed as ReactNode}
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
              tooltip={statisticsCopy.groups.tokenEconomy}
            >
              <StatisticsItem
                title={statisticsCopy.metrics.totalSupplyErc20.label}
                value={formatCSTValue(ctStatisticsData?.TotalSupplyEth ?? 0)}
                tooltip={statisticsCopy.metrics.totalSupplyErc20.tooltip}
              />
              <StatisticsItem
                title={statisticsCopy.metrics.cosmicSignatureNftsImprinted.shortLabel}
                value={
                  <Link href="/gallery" className="text-inherit">
                    {data.MainStats.NumCSTokenMints}
                  </Link>
                }
                tooltip={statisticsCopy.metrics.cosmicSignatureNftsImprinted.tooltip}
              />
              <StatisticsItem
                title={statisticsCopy.metrics.totalCstConsumed.label}
                value={formatCSTValue(data.MainStats.TotalCSTConsumedEth)}
                tooltip={statisticsCopy.metrics.totalCstConsumed.tooltip}
              />
              <StatisticsItem
                title={statisticsCopy.metrics.cstGestures.label}
                value={data.MainStats.NumBidsCST}
                tooltip={statisticsCopy.metrics.cstGestures.tooltip}
              />
              <StatisticsItem
                title={statisticsCopy.metrics.outreachReserve.label}
                value={formatCSTValue(data.MainStats.TotalMktRewardsEth)}
                tooltip={statisticsCopy.metrics.outreachReserve.tooltip}
              />
              <StatisticsItem
                title={statisticsCopy.metrics.outreachTransactions.label}
                value={
                  <Link className="text-inherit" href="/marketing">
                    {data.MainStats.NumMktRewards}
                  </Link>
                }
                tooltip={statisticsCopy.metrics.outreachTransactions.tooltip}
              />
              <StatisticsItem
                title={statisticsCopy.metrics.randomWalkNftsUsed.label}
                value={
                  <Link className="text-inherit" href="/used-rwlk-nfts">
                    {data.NumRwalkTokensUsed as ReactNode}
                  </Link>
                }
                tooltip={statisticsCopy.metrics.randomWalkNftsUsed.tooltip}
              />
              <StatisticsItem
                title={statisticsCopy.metrics.namedTokens.label}
                value={
                  <Link className="text-inherit" href="/named-nfts">
                    {data.MainStats.TotalNamedTokens}
                  </Link>
                }
                tooltip={statisticsCopy.metrics.namedTokens.tooltip}
              />
            </StatisticsGroup>

            {/* Public Goods & Contributions */}
            <StatisticsGroup
              title="Public Goods & Contributions"
              icon={<Heart className="h-4 w-4" />}
              accentColor="emerald"
              tooltip={statisticsCopy.groups.publicGoods}
            >
              <StatisticsItem
                title="Public Goods Balance"
                value={formatEthValue(Number(data.CharityBalanceEth) || 0)}
                tooltip="ETH allocated to the Public Goods Beneficiary, accumulated from protocol flows"
              />
              <StatisticsItem
                title="Protocol Contract Balance"
                value={`${(data.CosmicGameBalanceEth ?? 0).toFixed(4)} ETH`}
                tooltip={statisticsCopy.metrics.contractBalance.tooltip}
              />
              <StatisticsItem
                title={statisticsCopy.metrics.attachedNfts.label}
                value={
                  <Link className="text-inherit" href="/attached-nfts">
                    {data.NumDonatedNFTs as ReactNode}
                  </Link>
                }
                tooltip={statisticsCopy.metrics.attachedNfts.tooltip}
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
              label={statisticsCopy.metrics.uniqueParticipants.label}
              value={data.MainStats.NumUniqueBidders}
              icon={<Users className="h-4 w-4" />}
              tooltip={statisticsCopy.metrics.uniqueParticipants.tooltip}
            />
            <StatCard
              label={statisticsCopy.metrics.uniqueRecipients.label}
              value={data.MainStats.NumUniqueWinners}
              icon={<Award className="h-4 w-4" />}
              tooltip={statisticsCopy.metrics.uniqueRecipients.tooltip}
            />
            <StatCard
              label={statisticsCopy.metrics.uniqueEthContributors.label}
              value={data.MainStats.NumUniqueDonors}
              icon={<Gift className="h-4 w-4" />}
              tooltip={statisticsCopy.metrics.uniqueEthContributors.tooltip}
            />
            <StatCard
              label={statisticsCopy.metrics.uniqueAnchorHolders.label}
              value={data.MainStats.NumUniqueStakersCST + data.MainStats.NumUniqueStakersRWalk}
              icon={<TrendingUp className="h-4 w-4" />}
              tooltip={statisticsCopy.metrics.uniqueAnchorHolders.tooltip}
            />
          </div>

          <div className="space-y-8">
            <CollapsibleSection title="Unique Participants" defaultOpen>
              <UniqueParticipantsTable list={uniqueParticipants} />
            </CollapsibleSection>
            <CollapsibleSection title="Unique Recipients" defaultOpen>
              <UniqueRecipientsTable list={uniqueRecipients} />
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
              label={statisticsCopy.metrics.cosmicSignatureNftHolders.label}
              value={cstDistribution.length}
              icon={<Users className="h-4 w-4" />}
              tooltip={statisticsCopy.metrics.cosmicSignatureNftHolders.tooltip}
              featured
            />
            <StatCard
              label={statisticsCopy.metrics.cstErc20Holders.label}
              value={ctBalanceDistribution.length}
              icon={<Coins className="h-4 w-4" />}
              tooltip={statisticsCopy.metrics.cstErc20Holders.tooltip}
            />
            <StatCard
              label={statisticsCopy.metrics.attachedNfts.label}
              value={data.NumDonatedNFTs as ReactNode}
              icon={<Gift className="h-4 w-4" />}
              tooltip={statisticsCopy.metrics.attachedNfts.tooltip}
              featured
            />
          </div>

          <div className="space-y-8">
            <CollapsibleSection
              title="Attached Token Distribution"
              description={statisticsCopy.sections.attachedTokenDistribution}
              defaultOpen={false}
              icon={<Gift className="h-3.5 w-3.5" />}
            >
              <AttachedNFTDistributionTable list={data.MainStats.DonatedTokenDistribution ?? []} />
            </CollapsibleSection>
            <CollapsibleSection
              title="Cosmic Signature Token (ERC-721)"
              description={statisticsCopy.sections.cosmicSignatureTokenDistribution}
              icon={<Layers className="h-3.5 w-3.5" />}
            >
              <CSTokenDistributionTable list={cstDistribution} />
            </CollapsibleSection>
            <CollapsibleSection
              title="CST (ERC-20) Balance Distribution"
              description={statisticsCopy.sections.cstBalanceDistribution}
              icon={<Coins className="h-3.5 w-3.5" />}
            >
              <CTBalanceDistributionChart list={ctBalanceDistribution} />
              <div className="mt-4">
                <CTBalanceDistributionTable list={ctBalanceDistribution.slice(0, 20)} />
              </div>
            </CollapsibleSection>
            <CollapsibleSection
              title="CST Total Supply"
              description={statisticsCopy.sections.cstTotalSupply}
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              defaultOpen
            >
              <CSTTotalSupplyHistorySection />
            </CollapsibleSection>
          </div>
        </div>

        {/* 5 \u2500\u2500 Anchoring \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
        <div>
          <SectionDivider title="Anchoring" className="mb-6" />

          <Surface variant="glass" radius="lg" padding="md" className="mb-6">
            <p className="text-sm leading-6 text-muted-foreground">
              Use the tabs below to inspect anchor/release actions, currently anchored tokens, and
              the unique wallets behind the global anchoring totals.
            </p>
          </Surface>

          <div className="gradient-border-card rounded-xl bg-white/[0.02] p-1">
            <AnchoringSection
              cstStats={cstAnchorStats}
              rwlkStats={rwlkAnchorStats}
              cstAnchorActions={cstAnchorActions}
              rwlkAnchorActions={rwlkAnchorActions}
              anchoredCSTokens={anchoredCSTokens}
              anchoredRWLKTokens={anchoredRWLKTokens}
              uniqueCSTAnchorHolders={uniqueCSTAnchorHolders}
              uniqueRWLKAnchorHolders={uniqueRWLKAnchorHolders}
            />
          </div>
        </div>

        {/* 6 ── Donated NFTs Grid ────────────────────────────────── */}
        <DonatedNFTsGrid nftDonations={nftDonations} />

        {/* 6b ── Current cycle attached tokens (ERC721 + ERC20, same as current-cycle page) ── */}
        <div className="mt-10">
          <DonatedTokensSection
            donatedNFTs={(curRoundNftDonations ?? []) as AttachedNFT[]}
            donatedERC20Tokens={(curRoundErc20Donations ?? []) as DonatedERC20Token[]}
            donatedTokensTab={attachedTokensTab}
            onTabChange={(_e, v) => setAttachedTokensTab(v)}
            curPage={attachedTokensNftPage}
            setCurPage={setAttachedTokensNftPage}
            perPage={12}
          />
        </div>

        {/* 7 ── Round Activations ────────────────────────────────── */}
        <div>
          <SectionDivider title="System Events" className="mb-6" />
        </div>
        <CollapsibleSection
          title="Cycle Activations"
          description={statisticsCopy.sections.cycleActivations}
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

        <BiddingActivitySection />
      </section>
    </>
  );
};

export default Statistics;
