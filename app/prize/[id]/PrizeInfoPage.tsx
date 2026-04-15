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
import { MainWrapper } from '@/components/styled';
import {
  useRoundInfo,
  useBidListByRound,
  useDonationsNFTByRound,
  useStakingCSTRewardsByRound,
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
import RaffleWinnerTable from '@/components/tables/RaffleWinnerTable';
import BiddingHistoryTable from '@/components/tables/BiddingHistoryTable';
import StakingWinnerTable from '@/components/tables/StakingWinnerTable';
import DonatedNFTTable from '@/components/donations/DonatedNFTTable';
import EnduranceChampionsTable from '@/components/tables/EnduranceChampionsTable';
import DonatedERC20Table from '@/components/donations/DonatedERC20Table';

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
    <MainWrapper>
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
    </MainWrapper>
  );
}

function RoundNavigation({ roundNum, maxRound }: { roundNum: number; maxRound: number }) {
  const hasPrev = roundNum > 0;
  const hasNext = roundNum < maxRound;

  return (
    <div className="flex items-center gap-2" data-testid="round-navigation">
      {hasPrev ? (
        <Link
          href={`/prize/${roundNum - 1}`}
          className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-muted-foreground hover:text-white hover:border-white/[0.15] transition-all"
          aria-label="Previous round"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Round {roundNum - 1}</span>
        </Link>
      ) : (
        <span />
      )}
      {hasNext ? (
        <Link
          href={`/prize/${roundNum + 1}`}
          className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-muted-foreground hover:text-white hover:border-white/[0.15] transition-all"
          aria-label="Next round"
        >
          <span className="hidden sm:inline">Round {roundNum + 1}</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}

function WinnerCard({
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
      data-testid={`winner-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
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
            Winner
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

function PrizeDistributionBar({ segments }: { segments: DistributionSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  return (
    <div data-testid="prize-distribution-bar">
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

interface PrizeInfoPageProps {
  roundNum: number;
}

const PrizeInfoPage = ({ roundNum }: PrizeInfoPageProps) => {
  const { data: prizeInfo, isLoading: loadingRound } = useRoundInfo(roundNum);
  const { data: bidHistory = [], isLoading: loadingBids } = useBidListByRound(roundNum, 'desc');
  const { data: nftDonationsRaw = [], isLoading: loadingNFT } = useDonationsNFTByRound(roundNum);
  const { data: stakingRewardsRaw = [], isLoading: loadingStaking } =
    useStakingCSTRewardsByRound(roundNum);
  const { data: donatedERC20Raw = [], isLoading: loadingERC20 } =
    useDonationsERC20ByRound(roundNum);
  const { data: roundList = [] } = useRoundList();
  const { copy } = useClipboard();

  const nftDonations =
    nftDonationsRaw as import('@/components/donations/DonatedNFTTable').NFTRecord[];
  const stakingRewards = stakingRewardsRaw;
  const donatedERC20Tokens =
    donatedERC20Raw as import('@/components/donations/DonatedERC20Table').DonatedERC20Token[];
  const loading = loadingRound || loadingBids || loadingNFT || loadingStaking || loadingERC20;

  const maxRound = useMemo(
    () => roundList.reduce((max, r) => Math.max(max, r.RoundNum ?? 0), 0),
    [roundList],
  );

  const championList = useMemo(() => {
    if (bidHistory.length > 0 && prizeInfo) {
      const champions = getEnduranceChampions(bidHistory, prizeInfo.TimeStamp);
      return champions.sort((a, b) => b.chronoWarrior - a.chronoWarrior);
    }
    return [];
  }, [bidHistory, prizeInfo]);

  const handleShareRound = async () => {
    if (!prizeInfo) return;
    const summary = [
      `Round #${roundNum} — Cosmic Signature`,
      `Prize: ${prizeInfo.AmountEth.toFixed(4)} ETH`,
      `Winner: ${shortenHex(prizeInfo.WinnerAddr, 6)}`,
      `Bids: ${prizeInfo.RoundStats.TotalBids}`,
      `${typeof window !== 'undefined' ? window.location.href : ''}`,
    ].join('\n');
    await copy(summary);
    toast.success('Round summary copied to clipboard');
  };

  if (roundNum < 0) {
    return (
      <MainWrapper>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-2xl font-bold mb-2">Invalid Round Number</h2>
          <p className="text-muted-foreground mb-6">The round number must be a positive integer.</p>
          <Link
            href="/prize"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Prize Winners
          </Link>
        </div>
      </MainWrapper>
    );
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!prizeInfo) {
    return (
      <MainWrapper>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-2xl font-bold mb-2">Prize Data Not Found</h2>
          <p className="text-muted-foreground mb-6">
            No data available for round #{roundNum}. The round may not have ended yet.
          </p>
          <Link
            href="/prize"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Prize Winners
          </Link>
        </div>
      </MainWrapper>
    );
  }

  const distributionSegments: DistributionSegment[] = [
    {
      label: 'Main Prize',
      value: prizeInfo.AmountEth,
      color: 'bg-[#15BFFD]',
      tooltip: `${prizeInfo.AmountEth.toFixed(4)} ETH awarded to the main prize winner.`,
    },
    {
      label: 'Charity',
      value: prizeInfo.CharityAmountETH,
      color: 'bg-emerald-500',
      tooltip: `${prizeInfo.CharityAmountETH.toFixed(4)} ETH donated to charity.`,
    },
    {
      label: 'Staking',
      value: prizeInfo.StakingDepositAmountEth,
      color: 'bg-[#9C37FD]',
      tooltip: `${prizeInfo.StakingDepositAmountEth.toFixed(4)} ETH distributed to NFT stakers.`,
    },
    {
      label: 'Raffle',
      value: prizeInfo.RoundStats.TotalRaffleEthDepositsEth ?? 0,
      color: 'bg-[#5B8DEF]',
      tooltip: `${(prizeInfo.RoundStats.TotalRaffleEthDepositsEth ?? 0).toFixed(4)} ETH in raffle deposits.`,
    },
  ];

  const stats = [
    {
      icon: <Trophy className="h-3.5 w-3.5" />,
      label: 'Prize Pool',
      value: `${prizeInfo.AmountEth.toFixed(4)} ETH`,
      tooltip: 'The total ETH awarded to the main prize winner for this round.',
    },
    {
      icon: <Heart className="h-3.5 w-3.5" />,
      label: 'Charity',
      value: `${prizeInfo.CharityAmountETH.toFixed(4)} ETH`,
      tooltip: 'The amount donated to charity from this round.',
    },
    {
      icon: <Landmark className="h-3.5 w-3.5" />,
      label: 'Staking Deposit',
      value: `${prizeInfo.StakingDepositAmountEth.toFixed(4)} ETH`,
      tooltip: 'Total ETH deposited into the staking pool, distributed among NFT stakers.',
    },
    {
      icon: <BarChart3 className="h-3.5 w-3.5" />,
      label: 'Raffle Deposits',
      value: `${(prizeInfo.RoundStats.TotalRaffleEthDepositsEth ?? 0).toFixed(4)} ETH`,
      tooltip: 'Total ETH deposited into the raffle pool by participants.',
    },
    {
      icon: <Gavel className="h-3.5 w-3.5" />,
      label: 'Total Bids',
      value: prizeInfo.RoundStats.TotalBids,
      tooltip: 'The total number of bids placed during this round.',
    },
    {
      icon: <Gift className="h-3.5 w-3.5" />,
      label: 'Donated NFTs',
      value: prizeInfo.RoundStats.TotalDonatedNFTs ?? 0,
      tooltip: 'Number of NFTs donated by participants during this round.',
    },
    {
      icon: <Layers className="h-3.5 w-3.5" />,
      label: 'Staked Tokens',
      value: prizeInfo.StakingNumStakedTokens,
      tooltip: 'Number of NFT tokens staked during this round, earning staking rewards.',
    },
    {
      icon: <Users className="h-3.5 w-3.5" />,
      label: 'Unique Stakers',
      value: stakingRewards.length,
      tooltip: 'How many unique addresses had tokens staked in this round.',
    },
    {
      icon: <Sparkles className="h-3.5 w-3.5" />,
      label: 'Total Donated',
      value: formatEthValue(prizeInfo.RoundStats.TotalDonatedAmountEth ?? 0),
      tooltip: 'Combined value of all ERC20 token donations during this round.',
    },
  ];

  const donationsCount = nftDonations.length + donatedERC20Tokens.length;

  return (
    <MainWrapper>
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/prize" className="hover:text-primary transition-colors">
          Prize Winners
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Round {roundNum}</span>
      </nav>

      {/* Hero Banner */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionFade}
        className="mb-12"
        aria-label="Round Hero"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent p-6 md:p-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.04] via-transparent to-accent/[0.04] pointer-events-none" />

          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-4 min-w-0 flex-1">
                <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Round #{roundNum}
                </h1>

                <div className="flex items-baseline gap-2 flex-wrap">
                  <p
                    className="text-3xl md:text-5xl font-bold tabular-nums bg-gradient-to-r from-[#35C9FF] via-[#1D9BEF] to-[#AC56FF] bg-clip-text text-transparent"
                    style={{ textShadow: '0 0 40px rgba(21, 191, 253, 0.2)' }}
                    data-testid="hero-prize-amount"
                  >
                    {prizeInfo.AmountEth.toFixed(4)} ETH
                  </p>
                  <InfoTooltip
                    content="Total ETH awarded to the last bidder when the countdown reached zero."
                    iconClassName="h-4 w-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                      Winner
                    </span>
                    <CopyableAddress
                      address={prizeInfo.WinnerAddr}
                      href={`/user/${prizeInfo.WinnerAddr}`}
                    />
                  </div>

                  {prizeInfo.TokenId > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                        NFT
                      </span>
                      <Link
                        href={`/detail/${prizeInfo.TokenId}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Cosmic Signature #{prizeInfo.TokenId}
                      </Link>
                      <InfoTooltip content="View this COSMIC NFT in the gallery." />
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Finalized {convertTimestampToDateTime(prizeInfo.TimeStamp)}</span>
                    <span className="text-white/10">|</span>
                    <a
                      href={getExplorerUrl('tx', prizeInfo.TxHash)}
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
                  aria-label="Share round summary"
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

      {/* Round Winners */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionFade}
        className="mb-12"
        aria-label="Round Winners"
      >
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-display text-lg font-semibold tracking-tight">Round Winners</h2>
          <InfoTooltip content="All prize recipients for this round. The main winner gets the ETH jackpot; special roles earn additional rewards." />
        </div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <WinnerCard
            icon={<Trophy className="h-5 w-5" />}
            title="Main Prize Winner"
            tooltip="The last bidder when the countdown reached zero. Wins the main ETH prize and a COSMIC NFT."
            address={prizeInfo.WinnerAddr}
            rewards={[{ label: 'ETH Prize', value: `${prizeInfo.AmountEth.toFixed(4)} ETH` }]}
            tokenId={prizeInfo.TokenId}
            tokenLabel="COSMIC NFT"
            featured
          />
          <WinnerCard
            icon={<Swords className="h-5 w-5" />}
            title="Chrono Warrior"
            tooltip="The bidder who accumulated the longest total time as Endurance Champion. Wins ETH from the contract balance and an NFT."
            address={prizeInfo.ChronoWarriorAddr}
            rewards={[
              {
                label: 'ETH Reward',
                value: `${prizeInfo.ChronoWarriorAmountEth.toFixed(4)} ETH`,
              },
            ]}
            tokenId={prizeInfo.ChronoWarriorNftTokenId}
            tokenLabel="NFT Reward"
          />
          <WinnerCard
            icon={<Crown className="h-5 w-5" />}
            title="Endurance Champion"
            tooltip="The bidder who held the last-bidder position for the longest uninterrupted streak. Wins CST tokens and a COSMIC NFT."
            address={prizeInfo.EnduranceWinnerAddr}
            rewards={[
              {
                label: 'CST Reward',
                value: `${(prizeInfo.EnduranceERC20AmountEth ?? 0).toFixed(4)} CST`,
              },
            ]}
            tokenId={prizeInfo.EnduranceERC721TokenId}
            tokenLabel="COSMIC NFT"
          />
          <WinnerCard
            icon={<Coins className="h-5 w-5" />}
            title="Last CST Bidder"
            tooltip="The last person to place a bid using CST tokens. Receives CST tokens and a COSMIC NFT."
            address={prizeInfo.LastCstBidderAddr}
            rewards={[
              {
                label: 'CST Reward',
                value: `${(prizeInfo.LastCstBidderERC20AmountEth ?? 0).toFixed(4)} CST`,
              },
            ]}
            tokenId={prizeInfo.LastCstBidderERC721TokenId}
            tokenLabel="COSMIC NFT"
          />
        </motion.div>
      </motion.section>

      {/* Prize Distribution */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionFade}
        className="mb-12"
        aria-label="Prize Distribution"
      >
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-display text-lg font-semibold tracking-tight">Prize Distribution</h2>
          <InfoTooltip content="Visual breakdown of how the round's funds were allocated across prize categories." />
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <PrizeDistributionBar segments={distributionSegments} />
        </div>
      </motion.section>

      {/* Round Statistics */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionFade}
        className="mb-12"
        aria-label="Round Statistics"
      >
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-display text-lg font-semibold tracking-tight">Round Statistics</h2>
          <InfoTooltip content="Key metrics summarizing this round's activity and prize distribution." />
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
        aria-label="Round Data"
      >
        <Tabs defaultValue="bids" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-white/[0.03] p-1.5 rounded-xl">
            <TabsTrigger value="bids" className="flex-1 min-w-[100px]">
              Bid History
              <TabBadge count={bidHistory.length} />
            </TabsTrigger>
            <TabsTrigger value="endurance" className="flex-1 min-w-[100px]">
              Endurance Champions
              <TabBadge count={championList.length} />
            </TabsTrigger>
            <TabsTrigger value="raffle" className="flex-1 min-w-[100px]">
              Raffle Rewards
              <TabBadge
                count={
                  (prizeInfo.RaffleETHDeposits?.length ?? 0) +
                  (prizeInfo.RaffleNFTWinners?.length ?? 0)
                }
              />
            </TabsTrigger>
            <TabsTrigger value="staking" className="flex-1 min-w-[100px]">
              Staking Rewards
              <TabBadge count={stakingRewards.length} />
            </TabsTrigger>
            <TabsTrigger value="donations" className="flex-1 min-w-[100px]">
              Donations
              <TabBadge count={donationsCount} />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bids" className="mt-6">
            {bidHistory.length > 0 ? (
              <BiddingHistoryTable biddingHistory={bidHistory} />
            ) : (
              <EmptyState title="No bids were placed in this round." />
            )}
          </TabsContent>

          <TabsContent value="endurance" className="mt-6">
            {championList.length > 0 ? (
              <EnduranceChampionsTable championList={championList} />
            ) : (
              <EmptyState title="No endurance champion data available for this round." />
            )}
          </TabsContent>

          <TabsContent value="raffle" className="mt-6">
            {(prizeInfo.RaffleETHDeposits?.length ?? 0) +
              (prizeInfo.RaffleNFTWinners?.length ?? 0) >
            0 ? (
              <RaffleWinnerTable
                RaffleETHDeposits={prizeInfo.RaffleETHDeposits}
                RaffleNFTWinners={prizeInfo.RaffleNFTWinners}
              />
            ) : (
              <EmptyState title="No raffle rewards for this round." />
            )}
          </TabsContent>

          <TabsContent value="staking" className="mt-6">
            {stakingRewards.length > 0 ? (
              <StakingWinnerTable list={stakingRewards} />
            ) : (
              <EmptyState title="No staking rewards distributed in this round." />
            )}
          </TabsContent>

          <TabsContent value="donations" className="mt-6">
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Donated NFTs</h3>
                  <InfoTooltip content="NFTs donated by participants during this round, awarded to the main prize winner." />
                </div>
                {nftDonations.length > 0 ? (
                  <DonatedNFTTable
                    list={nftDonations}
                    handleClaim={undefined}
                    claimingTokens={[]}
                  />
                ) : (
                  <EmptyState title="No NFTs were donated in this round." />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Donated ERC20 Tokens</h3>
                  <InfoTooltip content="ERC20 tokens donated by participants, distributed as part of the prize pool." />
                </div>
                {donatedERC20Tokens.length > 0 ? (
                  <DonatedERC20Table list={donatedERC20Tokens} handleClaim={null} />
                ) : (
                  <EmptyState title="No ERC20 tokens were donated in this round." />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.section>
    </MainWrapper>
  );
};

export default PrizeInfoPage;
