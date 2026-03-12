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
  Check,
  Gavel,
  Heart,
  Landmark,
  BarChart3,
  Image,
  Gift,
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
import { PageHeader } from '@/components/layout/PageHeader';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RaffleWinnerTable from '@/components/tables/RaffleWinnerTable';
import BiddingHistoryTable from '@/components/tables/BiddingHistoryTable';
import StakingWinnerTable from '@/components/tables/StakingWinnerTable';
import DonatedNFTTable from '@/components/donations/DonatedNFTTable';
import EnduranceChampionsTable from '@/components/tables/EnduranceChampionsTable';
import DonatedERC20Table from '@/components/donations/DonatedERC20Table';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
  }),
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
      <div className="mb-8 space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-md mb-4" />
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

function WinnerSpotlightCard({
  icon,
  title,
  tooltip,
  address,
  amounts,
  tokenId,
  tokenLabel,
  index,
  featured,
}: {
  icon: React.ReactNode;
  title: string;
  tooltip: string;
  address: string;
  amounts: string[];
  tokenId?: number;
  tokenLabel?: string;
  index: number;
  featured?: boolean;
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className={cn(
        'gradient-border-card rounded-xl p-5 transition-all duration-300 hover:bg-white/[0.04]',
        featured ? 'gradient-border-card-accent bg-white/[0.03]' : 'bg-white/[0.02]',
      )}
      data-testid={`winner-spotlight-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            featured
              ? 'bg-gradient-to-br from-primary/20 to-accent/20 text-primary'
              : 'bg-white/[0.06] text-muted-foreground',
          )}
        >
          {icon}
        </div>
        <div className="flex items-center gap-1.5">
          <h3 className={cn('text-sm font-semibold', featured ? 'text-white' : 'text-white/90')}>
            {title}
          </h3>
          <InfoTooltip content={tooltip} />
        </div>
      </div>

      <div className="space-y-2.5">
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

        <div className="space-y-0.5">
          {amounts.map((amount) => (
            <p
              key={amount}
              className={cn(
                'text-sm',
                featured
                  ? 'font-medium bg-gradient-to-r from-[#35C9FF] to-[#AC56FF] bg-clip-text text-transparent'
                  : 'text-muted-foreground',
              )}
            >
              {amount}
            </p>
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

function StatCard({
  icon,
  label,
  value,
  tooltip,
  index,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tooltip: string;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]"
      data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <div className="text-muted-foreground/60">{icon}</div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          {label}
        </span>
        <InfoTooltip content={tooltip} />
      </div>
      <p className="text-lg font-semibold text-white tabular-nums">{value}</p>
    </motion.div>
  );
}

function SpecialPrizeCard({
  icon,
  title,
  tooltip,
  address,
  rewards,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  tooltip: string;
  address: string;
  rewards: { label: string; value: string; href?: string }[];
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="gradient-border-card rounded-xl bg-white/[0.02] p-4"
      data-testid={`special-prize-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-muted-foreground">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </span>
            <InfoTooltip content={tooltip} />
          </div>
          {address ? (
            <CopyableAddress address={address} href={`/user/${address}`} />
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">No recipient</p>
          )}
          <div className="mt-3 space-y-1.5">
            {rewards.map((r) => (
              <div key={r.label} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground/60">{r.label}:</span>
                {r.href ? (
                  <Link href={r.href} className="text-primary hover:underline">
                    {r.value}
                  </Link>
                ) : (
                  <span className="text-white/80 tabular-nums">{r.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 text-center"
      data-testid="empty-state"
    >
      <div className="rounded-full bg-white/[0.04] p-4 mb-4">
        <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
      </div>
      <p className="text-sm text-muted-foreground/60">{message}</p>
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

  const stats = [
    {
      icon: <Trophy className="h-4 w-4" />,
      label: 'Prize Pool',
      value: `${prizeInfo.AmountEth.toFixed(4)} ETH`,
      tooltip: 'The total ETH awarded to the main prize winner for this round.',
    },
    {
      icon: <Heart className="h-4 w-4" />,
      label: 'Charity',
      value: `${prizeInfo.CharityAmountETH.toFixed(4)} ETH`,
      tooltip: 'The amount donated to charity from this round.',
    },
    {
      icon: <Landmark className="h-4 w-4" />,
      label: 'Staking Deposit',
      value: `${prizeInfo.StakingDepositAmountEth.toFixed(4)} ETH`,
      tooltip: 'Total ETH deposited into the staking pool, distributed among NFT stakers.',
    },
    {
      icon: <BarChart3 className="h-4 w-4" />,
      label: 'Raffle Deposits',
      value: `${(prizeInfo.RoundStats.TotalRaffleEthDepositsEth ?? 0).toFixed(4)} ETH`,
      tooltip: 'Total ETH deposited into the raffle pool by participants.',
    },
    {
      icon: <Gavel className="h-4 w-4" />,
      label: 'Total Bids',
      value: prizeInfo.RoundStats.TotalBids,
      tooltip: 'The total number of bids placed during this round.',
    },
    {
      icon: <Gift className="h-4 w-4" />,
      label: 'Donated NFTs',
      value: prizeInfo.RoundStats.TotalDonatedNFTs ?? 0,
      tooltip: 'Number of NFTs donated by participants during this round.',
    },
  ];

  const donationsCount = nftDonations.length + donatedERC20Tokens.length;

  return (
    <MainWrapper>
      {/* Hero / Round Header */}
      <div className="mb-10">
        <PageHeader
          title={`Round #${roundNum}`}
          subtitle={`Finalized ${convertTimestampToDateTime(prizeInfo.TimeStamp)}`}
          align="left"
          breadcrumbs={[{ label: 'Prize Winners', href: '/prize' }, { label: `Round ${roundNum}` }]}
        >
          <div className="flex items-center gap-3 mt-4">
            <a
              href={getExplorerUrl('tx', prizeInfo.TxHash)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              View transaction <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </PageHeader>
        <div className="mt-6">
          <RoundNavigation roundNum={roundNum} maxRound={maxRound} />
        </div>
      </div>

      {/* Winner Spotlight Cards */}
      <section className="mb-10" aria-label="Winner Spotlight">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-display text-lg font-semibold tracking-tight">Winner Spotlight</h2>
          <InfoTooltip content="The three headline prize winners for this round." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WinnerSpotlightCard
            icon={<Trophy className="h-5 w-5" />}
            title="Main Prize Winner"
            tooltip="The last bidder when the countdown reached zero. Wins the main ETH prize and a Cosmic Signature NFT."
            address={prizeInfo.WinnerAddr}
            amounts={[`${prizeInfo.AmountEth.toFixed(4)} ETH`]}
            tokenId={prizeInfo.TokenId}
            tokenLabel="Cosmic Signature NFT"
            index={0}
            featured
          />
          <WinnerSpotlightCard
            icon={<Swords className="h-5 w-5" />}
            title="Chrono Warrior"
            tooltip="The bidder who held the Endurance Champion title for the longest consecutive period. Wins a percentage of the total contract balance."
            address={prizeInfo.ChronoWarriorAddr}
            amounts={[`${prizeInfo.ChronoWarriorAmountEth.toFixed(4)} ETH`]}
            tokenId={prizeInfo.ChronoWarriorNftTokenId}
            tokenLabel="NFT Reward"
            index={1}
          />
          <WinnerSpotlightCard
            icon={<Crown className="h-5 w-5" />}
            title="Endurance Champion"
            tooltip="The bidder who remained the last bidder for the longest consecutive period. Wins CST tokens and a Cosmic Signature NFT."
            address={prizeInfo.EnduranceWinnerAddr}
            amounts={[`${(prizeInfo.EnduranceERC20AmountEth ?? 0).toFixed(4)} CST`]}
            tokenId={prizeInfo.EnduranceERC721TokenId}
            tokenLabel="Cosmic Signature NFT"
            index={2}
          />
        </div>
      </section>

      {/* Prize Distribution Summary */}
      <section className="mb-10" aria-label="Round Statistics">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-display text-lg font-semibold tracking-tight">Round Statistics</h2>
          <InfoTooltip content="Key metrics summarizing this round's activity and prize distribution." />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} {...stat} index={i} />
          ))}
        </div>
      </section>

      {/* Special Prize Recipients */}
      <section className="mb-10" aria-label="Special Prize Recipients">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Special Prize Recipients
          </h2>
          <InfoTooltip content="Detailed breakdown of all special prize categories and their recipients for this round." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SpecialPrizeCard
            icon={<Crown className="h-5 w-5" />}
            title="Endurance Champion"
            tooltip="The bidder who held the last-bidder position for the longest uninterrupted streak. Receives CST tokens and a Cosmic Signature NFT."
            address={prizeInfo.EnduranceWinnerAddr}
            rewards={[
              {
                label: 'CST Reward',
                value: `${(prizeInfo.EnduranceERC20AmountEth ?? 0).toFixed(4)} CST`,
              },
              {
                label: 'NFT Token',
                value: `#${prizeInfo.EnduranceERC721TokenId}`,
                href: `/detail/${prizeInfo.EnduranceERC721TokenId}`,
              },
            ]}
            index={0}
          />
          <SpecialPrizeCard
            icon={<Swords className="h-5 w-5" />}
            title="Chrono Warrior"
            tooltip="Awarded to the bidder who accumulated the longest total time holding the Endurance Champion title. Wins ETH from the contract balance."
            address={prizeInfo.ChronoWarriorAddr}
            rewards={[
              {
                label: 'ETH Reward',
                value: `${prizeInfo.ChronoWarriorAmountEth.toFixed(4)} ETH`,
              },
            ]}
            index={1}
          />
          <SpecialPrizeCard
            icon={<Coins className="h-5 w-5" />}
            title="Last CST Bidder"
            tooltip="The last person to place a bid using CST tokens. Receives CST tokens and a Cosmic Signature NFT as a reward."
            address={prizeInfo.LastCstBidderAddr}
            rewards={[
              {
                label: 'CST Reward',
                value: `${(prizeInfo.LastCstBidderERC20AmountEth ?? 0).toFixed(4)} CST`,
              },
              {
                label: 'NFT Token',
                value: `#${prizeInfo.LastCstBidderERC721TokenId}`,
                href: `/detail/${prizeInfo.LastCstBidderERC721TokenId}`,
              },
            ]}
            index={2}
          />
        </div>

        {/* Additional details row */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground/60">Staked Tokens</span>
              <InfoTooltip content="Number of NFT tokens staked during this round, earning staking rewards." />
            </div>
            <p className="text-sm font-semibold text-white mt-1 tabular-nums">
              {prizeInfo.StakingNumStakedTokens}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground/60">Number of Stakers</span>
              <InfoTooltip content="How many unique addresses had tokens staked in this round." />
            </div>
            <p className="text-sm font-semibold text-white mt-1 tabular-nums">
              {stakingRewards.length}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground/60">Total Donated</span>
              <InfoTooltip content="Combined value of all ERC20 token donations during this round." />
            </div>
            <p className="text-sm font-semibold text-white mt-1 tabular-nums">
              {formatEthValue(prizeInfo.RoundStats.TotalDonatedAmountEth ?? 0)}
            </p>
          </div>
        </div>
      </section>

      {/* Tabbed Data Sections */}
      <section aria-label="Round Data">
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
              <EmptyState message="No bids were placed in this round." />
            )}
          </TabsContent>

          <TabsContent value="endurance" className="mt-6">
            {championList.length > 0 ? (
              <EnduranceChampionsTable championList={championList} />
            ) : (
              <EmptyState message="No endurance champion data available for this round." />
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
              <EmptyState message="No raffle rewards for this round." />
            )}
          </TabsContent>

          <TabsContent value="staking" className="mt-6">
            {stakingRewards.length > 0 ? (
              <StakingWinnerTable list={stakingRewards} />
            ) : (
              <EmptyState message="No staking rewards distributed in this round." />
            )}
          </TabsContent>

          <TabsContent value="donations" className="mt-6">
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Image className="h-4 w-4 text-muted-foreground" />
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
                  <EmptyState message="No NFTs were donated in this round." />
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
                  <EmptyState message="No ERC20 tokens were donated in this round." />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </MainWrapper>
  );
};

export default PrizeInfoPage;
