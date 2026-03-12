'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Coins, Trophy, Gem, Gavel, TrendingUp } from 'lucide-react';

import { formatEthValue } from '@/utils';

import { cn } from '@/lib/utils';
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';

import type { UserProfileInfo } from './UserStatsSection';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export interface HeroStatsProps {
  userInfo: UserProfileInfo;
  balanceETH: number;
  balanceCST: number;
  raffleETHProbability: number;
  raffleNFTProbability: number;
  loading?: boolean;
  className?: string;
}

export function HeroStats({
  userInfo,
  balanceETH,
  balanceCST,
  raffleETHProbability,
  raffleNFTProbability,
  loading = false,
  className,
}: HeroStatsProps) {
  const totalEthWon = useMemo(
    () => (userInfo.SumRaffleEthWinnings ?? 0) + (userInfo.SumRaffleEthWithdrawal ?? 0),
    [userInfo.SumRaffleEthWinnings, userInfo.SumRaffleEthWithdrawal],
  );

  const bestProbability = useMemo(() => {
    const eth = raffleETHProbability >= 0 ? raffleETHProbability : -1;
    const nft = raffleNFTProbability >= 0 ? raffleNFTProbability : -1;
    return Math.max(eth, nft);
  }, [raffleETHProbability, raffleNFTProbability]);

  const stats = useMemo(
    () => [
      {
        label: 'ETH Balance',
        value: `${balanceETH.toFixed(4)} ETH`,
        tooltip: 'Your current ETH balance in this wallet.',
        icon: <Wallet className="h-4 w-4" />,
        featured: true,
        gradient: true,
      },
      {
        label: 'CST Balance',
        value: `${balanceCST.toFixed(2)} CST`,
        tooltip:
          'Your Cosmic Token (ERC20) balance, earned through gameplay and reward distributions.',
        icon: <Coins className="h-4 w-4" />,
        featured: true,
      },
      {
        label: 'Prizes Won',
        value: userInfo.NumPrizes.toLocaleString(),
        tooltip:
          'Number of times you have won the main prize by being the last bidder when the round timer expired.',
        icon: <Trophy className="h-4 w-4" />,
      },
      {
        label: 'Total ETH Won',
        value: formatEthValue(totalEthWon),
        tooltip:
          'Combined ETH earned from raffle winnings and withdrawals across all rounds you participated in.',
        icon: <Gem className="h-4 w-4" />,
      },
      {
        label: 'Bids Placed',
        value: userInfo.NumBids.toLocaleString(),
        tooltip: 'Total number of bids you have placed across all rounds of the game.',
        icon: <Gavel className="h-4 w-4" />,
      },
      {
        label: 'Win Probability',
        value: bestProbability >= 0 ? `${(bestProbability * 100).toFixed(2)}%` : '--',
        tooltip:
          'Your best chance of winning in the current round, calculated from your bid count relative to total bids and the number of raffle winners drawn.',
        icon: <TrendingUp className="h-4 w-4" />,
      },
    ],
    [balanceETH, balanceCST, userInfo.NumPrizes, userInfo.NumBids, totalEthWon, bestProbability],
  );

  if (loading) {
    return (
      <div
        className={cn('grid grid-cols-2 lg:grid-cols-3 gap-4', className)}
        data-testid="hero-stats-skeleton"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={cn('grid grid-cols-2 lg:grid-cols-3 gap-4', className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      data-testid="hero-stats"
    >
      {stats.map((stat) => (
        <motion.div key={stat.label} variants={itemVariants}>
          <StatCard
            label={stat.label}
            value={stat.value}
            tooltip={stat.tooltip}
            icon={stat.icon}
            featured={stat.featured}
            gradient={stat.gradient}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
