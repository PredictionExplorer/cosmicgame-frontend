'use client';

import { useMemo } from 'react';
import { Wallet, Coins, Trophy, Gem, Gavel, TrendingUp } from 'lucide-react';

import { formatEthValue } from '@/utils';

import { cn } from '@/lib/utils';
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';

import type { UserProfileInfo } from './UserStatsSection';

export interface HeroStatsProps {
  userInfo: UserProfileInfo;
  balanceETH: number;
  balanceCST: number;
  stellarSelectionETHProbability: number;
  stellarSelectionNFTProbability: number;
  loading?: boolean;
  className?: string;
}

export function HeroStats({
  userInfo,
  balanceETH,
  balanceCST,
  stellarSelectionETHProbability,
  stellarSelectionNFTProbability,
  loading = false,
  className,
}: HeroStatsProps) {
  const totalEthWon = useMemo(
    () => (userInfo.SumRaffleEthWinnings ?? 0) + (userInfo.SumRaffleEthWithdrawal ?? 0),
    [userInfo.SumRaffleEthWinnings, userInfo.SumRaffleEthWithdrawal],
  );

  const bestProbability = useMemo(() => {
    const eth = stellarSelectionETHProbability >= 0 ? stellarSelectionETHProbability : -1;
    const nft = stellarSelectionNFTProbability >= 0 ? stellarSelectionNFTProbability : -1;
    return Math.max(eth, nft);
  }, [stellarSelectionETHProbability, stellarSelectionNFTProbability]);

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
          'Your Cosmic Signature Token (ERC-20) balance, imprinted through participation and Anchor Distributions.',
        icon: <Coins className="h-4 w-4" />,
        featured: true,
      },
      {
        label: 'Signature Allocations Received',
        value: userInfo.NumPrizes.toLocaleString(),
        tooltip:
          'Number of times you retrieved the Signature Allocation by making the Final Gesture before the Cycle Finalization Time expired.',
        icon: <Trophy className="h-4 w-4" />,
      },
      {
        label: 'Total ETH Received',
        value: formatEthValue(totalEthWon),
        tooltip:
          'Combined ETH retrieved from Stellar Selection allocations and other distributions across all cycles you participated in.',
        icon: <Gem className="h-4 w-4" />,
      },
      {
        label: 'Gestures Made',
        value: userInfo.NumBids.toLocaleString(),
        tooltip: 'Total number of gestures you have made across all Performance Cycles.',
        icon: <Gavel className="h-4 w-4" />,
      },
      {
        label: 'Selection Frequency',
        value: bestProbability >= 0 ? `${(bestProbability * 100).toFixed(2)}%` : '--',
        tooltip:
          'Your best Stellar Selection frequency in the current cycle, calculated from your gesture count relative to total gestures and the number of selected recipients.',
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
    <div
      className={cn('grid grid-cols-2 lg:grid-cols-3 gap-4 print-motion-visible', className)}
      data-testid="hero-stats"
    >
      {stats.map((stat) => (
        <div key={stat.label}>
          <StatCard
            label={stat.label}
            value={stat.value}
            tooltip={stat.tooltip}
            icon={stat.icon}
            featured={stat.featured}
            gradient={stat.gradient}
          />
        </div>
      ))}
    </div>
  );
}
