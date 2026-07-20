'use client';

import { useMemo } from 'react';
import { Wallet, Coins, Trophy, Gem, Gavel, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('myPages');
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
        label: t('statistics.hero.ethBalance.label'),
        value: `${balanceETH.toFixed(4)} ETH`,
        tooltip: t('statistics.hero.ethBalance.tooltip'),
        icon: <Wallet className="h-4 w-4" />,
        featured: true,
        gradient: true,
      },
      {
        label: t('statistics.hero.cstBalance.label'),
        value: `${balanceCST.toFixed(2)} CST`,
        tooltip: t('statistics.hero.cstBalance.tooltip'),
        icon: <Coins className="h-4 w-4" />,
        featured: true,
      },
      {
        label: t('statistics.hero.signatureAllocations.label'),
        value: userInfo.NumPrizes.toLocaleString(),
        tooltip: t('statistics.hero.signatureAllocations.tooltip'),
        icon: <Trophy className="h-4 w-4" />,
      },
      {
        label: t('statistics.hero.totalEth.label'),
        value: formatEthValue(totalEthWon),
        tooltip: t('statistics.hero.totalEth.tooltip'),
        icon: <Gem className="h-4 w-4" />,
      },
      {
        label: t('statistics.hero.gestures.label'),
        value: userInfo.NumBids.toLocaleString(),
        tooltip: t('statistics.hero.gestures.tooltip'),
        icon: <Gavel className="h-4 w-4" />,
      },
      {
        label: t('statistics.hero.selectionFrequency.label'),
        value: bestProbability >= 0 ? `${(bestProbability * 100).toFixed(2)}%` : '--',
        tooltip: t('statistics.hero.selectionFrequency.tooltip'),
        icon: <TrendingUp className="h-4 w-4" />,
      },
    ],
    [balanceETH, balanceCST, userInfo.NumPrizes, userInfo.NumBids, totalEthWon, bestProbability, t],
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
