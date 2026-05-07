'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Crown,
  Swords,
  Coins,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Gavel,
  Heart,
  Landmark,
  BarChart3,
  ImageIcon,
  Gift,
  Share2,
  Layers,
  Users,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import {
  getExplorerUrl,
  convertTimestampToDateTime,
  formatEthValue,
  shortenHex,
  getEnduranceChampions,
} from '@/utils';

import { cn } from '@/lib/utils';
import { PageShell } from '@/components/ui/page-shell';
import {
  useRoundInfo,
  useGestureListByCycle,
  useDonationsNFTByRound,
  useCSTAnchorDistributionsByCycle,
  useDonationsERC20ByRound,
  useRoundList,
} from '@/hooks/useApiQuery';
import { useClipboard } from '@/hooks/useClipboard';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionDivider } from '@/components/ui/section-divider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StellarSelectionRecipientTable from '@/components/tables/StellarSelectionRecipientTable';
import GestureHistoryTable from '@/components/tables/GestureHistoryTable';
import AnchoringRecipientTable from '@/components/tables/AnchoringRecipientTable';
import AttachedNFTTable from '@/components/attachments/AttachedNFTTable';
import EnduranceChampionsTable from '@/components/tables/EnduranceChampionsTable';
import AttachedERC20Table from '@/components/attachments/AttachedERC20Table';

const sectionFade = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardFade = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
};

function CopyableAddress({
  address,
  href,
  className,
}: {
  address: string;
  href?: string;
  className?: string;
}) {
  const { copy } = useClipboard();

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await copy(address);
    toast.success('Address copied to clipboard');
  };

  const display = shortenHex(address, 6);

  return (
    <span className={cn('inline-flex items-center gap-1.5 group/addr', className)}>
      {href ? (
        <Link
          href={href}
          className="font-mono text-sm text-white hover:text-primary transition-colors truncate"
        >
          {display}
        </Link>
      ) : (
        <span className="font-mono text-sm text-muted-foreground truncate">{display}</span>
      )}
      <button
        onClick={handleCopy}
        className="shrink-0 p-0.5 rounded opacity-0 group-hover/addr:opacity-100 hover:text-primary transition-all"
        aria-label={`Copy address ${address}`}
      >
        <Copy className="h-3 w-3" />
      </button>
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <PageShell variant="data" backdrop="signature">
      <div className="mb-12">
        <Skeleton className="h-4 w-48 mb-6" />
        <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-4 flex-1">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-12 w-80" />
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
      <Skeleton className="h-5 w-40 mb-5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-5 w-48 mb-5" />
      <Skeleton className="h-16 rounded-xl mb-12" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-2xl mb-4" />
      <Skeleton className="h-64 rounded-xl" />
    </PageShell>
  );
}

function RoundNavigation({ roundNum, maxRound }: { roundNum: number; maxRound: number }) {
  const hasPrev = roundNum > 0;
  const hasNext = roundNum < maxRound;

  return (
    <div className="flex items-center gap-2" data-testid="round-navigation">
      {hasPrev ? (
        <Link
          href={`/allocation/${roundNum - 1}`}
          className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-muted-foreground hover:text-white hover:border-white/[0.15] transition-all"
          aria-label="Previous cycle"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Cycle {roundNum - 1}</span>
        </Link>
      ) : (
        <span />
      )}
      {hasNext ? (
        <Link
          href={`/allocation/${roundNum + 1}`}
          className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-muted-foreground hover:text-white hover:border-white/[0.15] transition-all"
          aria-label="Next cycle"
        >
          <span className="hidden sm:inline">Cycle {roundNum + 1}</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}

function RecipientCard({
  icon,
  title,
  tooltip,
  address,
  rewards,
  tokenId,
  tokenLabel,
  featured,
}: {
  icon: React.ReactNode;
  title: string;
  tooltip: string;
  address: string;
  rewards: { label: string; value: string }[];
  tokenId?: number;
  tokenLabel?: string;
  featured?: boolean;
}) {
  return (
    <motion.div
      variants={cardFade}
      className={cn(
        'group relative rounded-xl p-5 transition-all duration-300',
        featured
          ? 'gradient-border-card gradient-border-card-accent bg-white/[0.04] hover:bg-white/[0.06]'
          : 'gradient-border-card bg-white/[0.02] hover:bg-white/[0.04]',
      )}
      data-testid={`recipient-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            featured
              ? 'bg-gradient-to-br from-primary/25 to-accent/25 text-primary'
              : 'bg-white/[0.06] text-muted-foreground',
          )}
        >
          {icon}
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <h3
            className={cn(
              'text-sm font-semibold truncate',
              featured ? 'text-white' : 'text-white/90',
            )}
          >
            {title}
          </h3>
          <InfoTooltip content={tooltip} />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
            Recipient
          </span>
          <div className="mt-0.5">
            {address ? (
              <CopyableAddress address={address} href={`/user/${address}`} />
            ) : (
              <span className="text-sm text-muted-foreground/50 italic">None</span>
            )}
          </div>
        </div>

        <div className="space-y-1">
          {rewards.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                {r.label}
              </span>
              <span
                className={cn(
                  'text-sm font-medium tabular-nums',
                  featured
                    ? 'bg-gradient-to-r from-[#35C9FF] to-[#AC56FF] bg-clip-text text-transparent'
                    : 'text-white/80',
                )}
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>

        {tokenId !== undefined && tokenId > 0 && (
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
              {tokenLabel ?? 'NFT Token'}
            </span>
            <Link
              href={`/detail/${tokenId}`}
              className="mt-0.5 block text-sm text-primary hover:underline"
            >
              Token #{tokenId}
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface DistributionSegment {
  label: string;
  value: number;
  color: string;
  tooltip: string;
}

function AllocationDistributionBar({ segments }: { segments: DistributionSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  return (
    <div data-testid="allocation-distribution-bar">
      <motion.div
        className="flex h-3 rounded-full overflow-hidden bg-white/[0.04]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ transformOrigin: 'left' }}
      >
        {segments.map((seg) => {
          const pct = (seg.value / total) * 100;
          if (pct < 0.5) return null;
          return (
            <div
              key={seg.label}
              className={cn('relative transition-all duration-300', seg.color)}
              style={{ width: `${pct}%` }}
              title={seg.tooltip}
              data-testid={`distribution-segment-${seg.label.toLowerCase().replace(/\s+/g, '-')}`}
            />
          );
        })}
      </motion.div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
        {segments.map((seg) => {
          const pct = total > 0 ? ((seg.value / total) * 100).toFixed(1) : '0.0';
          return (
            <div key={seg.label} className="flex items-center gap-2 text-xs">
              <span className={cn('h-2.5 w-2.5 rounded-full', seg.color)} />
              <span className="text-muted-foreground">{seg.label}</span>
              <span className="text-white/80 font-medium tabular-nums">{pct}%</span>
              <InfoTooltip content={seg.tooltip} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/[0.08] px-1.5 text-[10px] font-medium tabular-nums text-muted-foreground">
      {count}
    </span>
  );
}

interface AllocationInfoPageProps {
  roundNum: number;
}

const AllocationInfoPage = ({ roundNum }: AllocationInfoPageProps) => {
  const { data: allocationInfo, isLoading: loadingRound } = useRoundInfo(roundNum);
  const { data: gestureHistory = [], isLoading: loadingGestures } = useGestureListByCycle(
    roundNum,
    'desc',
  );
  const { data: nftDonationsRaw = [], isLoading: loadingNFT } = useDonationsNFTByRound(roundNum);
  const { data: stakingRewardsRaw = [], isLoading: loadingStaking } =
    useCSTAnchorDistributionsByCycle(roundNum);
  const { data: donatedERC20Raw = [], isLoading: loadingERC20 } =
    useDonationsERC20ByRound(roundNum);
  const { data: roundList = [] } = useRoundList();
  const { copy } = useClipboard();

  const nftDonations =
    nftDonationsRaw as import('@/components/attachments/AttachedNFTTable').NFTRecord[];
  const anchorDistributions = stakingRewardsRaw;
  const donatedERC20Tokens =
    donatedERC20Raw as import('@/components/attachments/AttachedERC20Table').DonatedERC20Token[];
  const loading = loadingRound || loadingGestures || loadingNFT || loadingStaking || loadingERC20;

  const maxRound = useMemo(
    () => roundList.reduce((max, r) => Math.max(max, r.RoundNum ?? 0), 0),
    [roundList],
  );

  const championList = useMemo(() => {
    if (gestureHistory.length > 0 && allocationInfo) {
      const champions = getEnduranceChampions(gestureHistory, allocationInfo.TimeStamp);
      return champions.sort((a, b) => b.chronoWarrior - a.chronoWarrior);
    }
    return [];
  }, [gestureHistory, allocationInfo]);

  const handleShareRound = async () => {
    if (!allocationInfo) return;
    const summary = [
      `Cycle #${roundNum} \u2014 Cosmic Signature`,
      `Signature Allocation: ${allocationInfo.AmountEth.toFixed(4)} ETH`,
      `Recipient: ${shortenHex(allocationInfo.WinnerAddr, 6)}`,
      `Gestures: ${allocationInfo.RoundStats.TotalBids}`,
      `${typeof window !== 'undefined' ? window.location.href : ''}`,
    ].join('\n');
    await copy(summary);
    toast.success('Cycle summary copied to clipboard');
  };

  if (roundNum < 0) {
    return (
      <PageShell variant="data" backdrop="signature">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-2xl font-bold mb-2">Invalid Cycle Number</h2>
          <p className="text-muted-foreground mb-6">The cycle number must be a positive integer.</p>
          <Link
            href="/allocation"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Allocation Recipients
          </Link>
        </div>
      </PageShell>
    );
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!allocationInfo) {
    return (
      <PageShell variant="data" backdrop="signature">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-2xl font-bold mb-2">Allocation Data Not Found</h2>
          <p className="text-muted-foreground mb-6">
            No data available for Cycle #{roundNum}. The cycle may not have finalized yet.
          </p>
          <Link
            href="/allocation"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Allocation Recipients
          </Link>
        </div>
      </PageShell>
    );
  }

  const distributionSegments: DistributionSegment[] = [
    {
      label: 'Signature Allocation',
      value: allocationInfo.AmountEth,
      color: 'bg-[#15BFFD]',
      tooltip: `${allocationInfo.AmountEth.toFixed(4)} ETH retrieved by the participant who made the Final Gesture.`,
    },
    {
      label: 'Public Goods',
      value: allocationInfo.CharityAmountETH,
      color: 'bg-emerald-500',
      tooltip: `${allocationInfo.CharityAmountETH.toFixed(4)} ETH forwarded to the Public Goods Beneficiary (Protocol Guild).`,
    },
    {
      label: 'Anchor Distribution',
      value: allocationInfo.StakingDepositAmountEth,
      color: 'bg-[#9C37FD]',
      tooltip: `${allocationInfo.StakingDepositAmountEth.toFixed(4)} ETH distributed across Cosmic Signature NFTs anchored to the protocol.`,
    },
    {
      label: 'Stellar Selection',
      value: allocationInfo.RoundStats.TotalRaffleEthDepositsEth ?? 0,
      color: 'bg-[#5B8DEF]',
      tooltip: `${(allocationInfo.RoundStats.TotalRaffleEthDepositsEth ?? 0).toFixed(4)} ETH allocated to the Stellar Selection pool.`,
    },
  ];

  const stats = [
    {
      icon: <Trophy className="h-3.5 w-3.5" />,
      label: 'Cycle Reserve',
      value: `${allocationInfo.AmountEth.toFixed(4)} ETH`,
      tooltip:
        'The total ETH retrieved by the participant who made the Final Gesture of this cycle.',
    },
    {
      icon: <Heart className="h-3.5 w-3.5" />,
      label: 'Public Goods',
      value: `${allocationInfo.CharityAmountETH.toFixed(4)} ETH`,
      tooltip:
        'The amount forwarded to the Public Goods Beneficiary (Protocol Guild) from this cycle.',
    },
    {
      icon: <Landmark className="h-3.5 w-3.5" />,
      label: 'Anchor Distribution',
      value: `${allocationInfo.StakingDepositAmountEth.toFixed(4)} ETH`,
      tooltip:
        'Total ETH distributed to participants who anchored Cosmic Signature NFTs for this cycle.',
    },
    {
      icon: <BarChart3 className="h-3.5 w-3.5" />,
      label: 'Stellar Selection Pool',
      value: `${(allocationInfo.RoundStats.TotalRaffleEthDepositsEth ?? 0).toFixed(4)} ETH`,
      tooltip: 'Total ETH allocated to the Stellar Selection pool across the cycle.',
    },
    {
      icon: <Gavel className="h-3.5 w-3.5" />,
      label: 'Total Gestures',
      value: allocationInfo.RoundStats.TotalBids,
      tooltip: 'The total number of gestures made during this cycle.',
    },
    {
      icon: <Gift className="h-3.5 w-3.5" />,
      label: 'Attached NFTs',
      value: allocationInfo.RoundStats.TotalDonatedNFTs ?? 0,
      tooltip: 'Number of NFTs attached to gestures by participants during this cycle.',
    },
    {
      icon: <Layers className="h-3.5 w-3.5" />,
      label: 'Anchored Tokens',
      value: allocationInfo.StakingNumStakedTokens,
      tooltip: 'Number of NFT tokens anchored to the protocol for this cycle.',
    },
    {
      icon: <Users className="h-3.5 w-3.5" />,
      label: 'Unique Anchor-holders',
      value: anchorDistributions.length,
      tooltip: 'How many unique addresses had tokens anchored during this cycle.',
    },
    {
      icon: <Sparkles className="h-3.5 w-3.5" />,
      label: 'Total Contributed',
      value: formatEthValue(allocationInfo.RoundStats.TotalDonatedAmountEth ?? 0),
      tooltip:
        'Combined value of all ERC-20 token contributions attached to gestures during this cycle.',
    },
  ];

  const donationsCount = nftDonations.length + donatedERC20Tokens.length;

  return (
    <PageShell variant="data" backdrop="signature">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/allocation" className="hover:text-primary transition-colors">
          Allocation Recipients
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Cycle {roundNum}</span>
      </nav>

      {/* Hero Banner */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionFade}
        className="mb-12"
        aria-label="Cycle Hero"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent p-6 md:p-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.04] via-transparent to-accent/[0.04] pointer-events-none" />

          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-4 min-w-0 flex-1">
                <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Cycle #{roundNum}
                </h1>

                <div className="flex items-baseline gap-2 flex-wrap">
                  <p
                    className="text-3xl md:text-5xl font-bold tabular-nums bg-gradient-to-r from-[#35C9FF] via-[#1D9BEF] to-[#AC56FF] bg-clip-text text-transparent"
                    style={{ textShadow: '0 0 40px rgba(21, 191, 253, 0.2)' }}
                    data-testid="hero-allocation-amount"
                  >
                    {allocationInfo.AmountEth.toFixed(4)} ETH
                  </p>
                  <InfoTooltip
                    content="Total ETH retrieved by the participant who made the Final Gesture when the countdown reached zero."
                    iconClassName="h-4 w-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                      Recipient
                    </span>
                    <CopyableAddress
                      address={allocationInfo.WinnerAddr}
                      href={`/user/${allocationInfo.WinnerAddr}`}
                    />
                  </div>

                  {allocationInfo.TokenId > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                        NFT
                      </span>
                      <Link
                        href={`/detail/${allocationInfo.TokenId}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Cosmic Signature #{allocationInfo.TokenId}
                      </Link>
                      <InfoTooltip content="View this Cosmic Signature NFT in the gallery." />
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Finalized {convertTimestampToDateTime(allocationInfo.TimeStamp)}</span>
                    <span className="text-white/10">|</span>
                    <a
                      href={getExplorerUrl('tx', allocationInfo.TxHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      View transaction <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleShareRound}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-muted-foreground hover:text-white hover:border-white/[0.15] transition-all"
                  aria-label="Share cycle summary"
                  data-testid="share-round-button"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
                <RoundNavigation roundNum={roundNum} maxRound={maxRound} />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Cycle Recipients */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionFade}
        className="mb-12"
        aria-label="Cycle Recipients"
      >
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-display text-lg font-semibold tracking-tight">Cycle Recipients</h2>
          <InfoTooltip content="All allocation recipients for this cycle. The Signature Allocation goes to the participant who made the Final Gesture; special roles receive additional allocations." />
        </div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <RecipientCard
            icon={<Trophy className="h-5 w-5" />}
            title="Signature Allocation"
            tooltip="The participant who made the Final Gesture when the countdown reached zero. Retrieves the Signature Allocation in ETH, 1,000 CST, and a Cosmic Signature NFT."
            address={allocationInfo.WinnerAddr}
            rewards={[
              { label: 'ETH Allocation', value: `${allocationInfo.AmountEth.toFixed(4)} ETH` },
              {
                label: 'Recognition CST',
                value: `${(allocationInfo.CSTAmountEth ?? 0).toFixed(4)} CST`,
              },
            ]}
            tokenId={allocationInfo.TokenId}
            tokenLabel="Cosmic Signature NFT"
            featured
          />
          <RecipientCard
            icon={<Swords className="h-5 w-5" />}
            title="Chrono-Warrior"
            tooltip="The participant who held the Endurance Champion position for the longest consecutive interval. Retrieves ETH, Recognition CST, and a Cosmic Signature NFT."
            address={allocationInfo.ChronoWarriorAddr}
            rewards={[
              {
                label: 'ETH Allocation',
                value: `${allocationInfo.ChronoWarriorAmountEth.toFixed(4)} ETH`,
              },
              {
                label: 'Recognition CST',
                value: `${(allocationInfo.ChronoWarriorCstAmountEth ?? 0).toFixed(4)} CST`,
              },
            ]}
            tokenId={allocationInfo.ChronoWarriorNftTokenId}
            tokenLabel="Cosmic Signature NFT"
          />
          <RecipientCard
            icon={<Crown className="h-5 w-5" />}
            title="Endurance Champion"
            tooltip="The participant who held the most-recent-gesture position for the longest uninterrupted interval. Receives a Recognition CST imprint of 1,000 CST and a Cosmic Signature NFT."
            address={allocationInfo.EnduranceWinnerAddr}
            rewards={[
              {
                label: 'Recognition CST',
                value: `${(allocationInfo.EnduranceERC20AmountEth ?? 0).toFixed(4)} CST`,
              },
            ]}
            tokenId={allocationInfo.EnduranceERC721TokenId}
            tokenLabel="Cosmic Signature NFT"
          />
          <RecipientCard
            icon={<Coins className="h-5 w-5" />}
            title="Final CST Gesture"
            tooltip="The participant who made the last CST gesture of the cycle. Receives a Recognition CST imprint of 1,000 CST and a Cosmic Signature NFT."
            address={allocationInfo.LastCstBidderAddr}
            rewards={[
              {
                label: 'Recognition CST',
                value: `${(allocationInfo.LastCstBidderERC20AmountEth ?? 0).toFixed(4)} CST`,
              },
            ]}
            tokenId={allocationInfo.LastCstBidderERC721TokenId}
            tokenLabel="Cosmic Signature NFT"
          />
        </motion.div>
      </motion.section>

      {/* Allocation Distribution */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionFade}
        className="mb-12"
        aria-label="Allocation Distribution"
      >
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Allocation Distribution
          </h2>
          <InfoTooltip content="Visual breakdown of how the cycle's Cycle Reserve was distributed across allocation tracks." />
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <AllocationDistributionBar segments={distributionSegments} />
        </div>
      </motion.section>

      {/* Cycle Statistics */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionFade}
        className="mb-12"
        aria-label="Cycle Statistics"
      >
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-display text-lg font-semibold tracking-tight">Cycle Statistics</h2>
          <InfoTooltip content="Key metrics summarizing this cycle's activity and allocation distribution." />
        </div>
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {stats.map((stat, i) => (
            <motion.div key={stat.label} variants={cardFade}>
              <StatCard
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                tooltip={stat.tooltip}
                featured={i === 0}
                gradient={i === 0}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Section Divider */}
      <SectionDivider title="Detailed Data" className="mb-10" />

      {/* Tabbed Data Sections */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionFade}
        aria-label="Cycle Data"
      >
        <Tabs defaultValue="gestures" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-white/[0.03] p-1.5 rounded-xl">
            <TabsTrigger value="gestures" className="flex-1 min-w-[100px]">
              Gesture History
              <TabBadge count={gestureHistory.length} />
            </TabsTrigger>
            <TabsTrigger value="endurance" className="flex-1 min-w-[100px]">
              Endurance Champions
              <TabBadge count={championList.length} />
            </TabsTrigger>
            <TabsTrigger value="stellar-selection" className="flex-1 min-w-[100px]">
              Stellar Selection
              <TabBadge
                count={
                  (allocationInfo.RaffleETHDeposits?.length ?? 0) +
                  (allocationInfo.RaffleNFTWinners?.length ?? 0)
                }
              />
            </TabsTrigger>
            <TabsTrigger value="anchoring" className="flex-1 min-w-[100px]">
              Anchor Distributions
              <TabBadge count={anchorDistributions.length} />
            </TabsTrigger>
            <TabsTrigger value="contributions" className="flex-1 min-w-[100px]">
              Contributions
              <TabBadge count={donationsCount} />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gestures" className="mt-6">
            {gestureHistory.length > 0 ? (
              <GestureHistoryTable gestureHistory={gestureHistory} />
            ) : (
              <EmptyState title="No gestures were made in this cycle." />
            )}
          </TabsContent>

          <TabsContent value="endurance" className="mt-6">
            {championList.length > 0 ? (
              <EnduranceChampionsTable championList={championList} />
            ) : (
              <EmptyState title="No Endurance Champion data available for this cycle." />
            )}
          </TabsContent>

          <TabsContent value="stellar-selection" className="mt-6">
            {(allocationInfo.RaffleETHDeposits?.length ?? 0) +
              (allocationInfo.RaffleNFTWinners?.length ?? 0) >
            0 ? (
              <StellarSelectionRecipientTable
                RaffleETHDeposits={allocationInfo.RaffleETHDeposits}
                RaffleNFTWinners={allocationInfo.RaffleNFTWinners}
              />
            ) : (
              <EmptyState title="No Stellar Selection recipients for this cycle." />
            )}
          </TabsContent>

          <TabsContent value="anchoring" className="mt-6">
            {anchorDistributions.length > 0 ? (
              <AnchoringRecipientTable list={anchorDistributions} />
            ) : (
              <EmptyState title="No Anchor Distributions distributed in this cycle." />
            )}
          </TabsContent>

          <TabsContent value="contributions" className="mt-6">
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Attached NFTs</h3>
                  <InfoTooltip content="NFTs attached to gestures during this cycle, forwarded to the participant who made the Final Gesture." />
                </div>
                {nftDonations.length > 0 ? (
                  <AttachedNFTTable
                    list={nftDonations}
                    handleClaim={undefined}
                    claimingTokens={[]}
                  />
                ) : (
                  <EmptyState title="No NFTs were attached to gestures in this cycle." />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Attached ERC-20 Tokens</h3>
                  <InfoTooltip content="ERC-20 tokens attached to gestures by participants, forwarded to the Signature Allocation recipient." />
                </div>
                {donatedERC20Tokens.length > 0 ? (
                  <AttachedERC20Table list={donatedERC20Tokens} handleClaim={null} />
                ) : (
                  <EmptyState title="No ERC-20 tokens were attached to gestures in this cycle." />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.section>
    </PageShell>
  );
};

export default AllocationInfoPage;
