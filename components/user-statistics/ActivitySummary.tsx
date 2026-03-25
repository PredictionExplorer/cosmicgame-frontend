'use client';

import { motion } from 'framer-motion';
import { Gavel, Ticket, Layers } from 'lucide-react';

import { formatEthValue } from '@/utils';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';

import type { UserProfileInfo } from './UserStatsSection';

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const, delay: 0.25 },
  },
};

interface StatPair {
  label: string;
  value: string | number;
  tooltip: string;
}

function MiniStat({ label, value, tooltip }: StatPair) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {label}
        <InfoTooltip content={tooltip} />
      </span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function StatGroup({
  icon,
  title,
  stats,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  stats: StatPair[];
  className?: string;
}) {
  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        {icon}
        {title}
      </div>
      {stats.map((s) => (
        <MiniStat key={s.label} {...s} />
      ))}
    </div>
  );
}

export interface ActivitySummaryProps {
  userInfo: UserProfileInfo;
  totalStakeRewardEth?: number;
  className?: string;
}

export function ActivitySummary({
  userInfo,
  totalStakeRewardEth = 0,
  className,
}: ActivitySummaryProps) {
  const rwlk = userInfo.StakingStatisticsRWalk;
  const totalStakeActions = (rwlk?.TotalNumStakeActions ?? 0) + (rwlk?.TotalNumUnstakeActions ?? 0);

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <Card
        className={cn('gradient-border-card p-5 backdrop-blur-sm bg-white/[0.02]', className)}
        data-testid="activity-summary"
      >
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
          Activity Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:divide-x sm:divide-white/[0.06]">
          <StatGroup
            icon={<Gavel className="h-3.5 w-3.5" />}
            title="Bidding"
            stats={[
              {
                label: 'Bids Placed',
                value: userInfo.NumBids.toLocaleString(),
                tooltip: 'Total bids across all rounds.',
              },
              {
                label: 'Max Bid',
                value: formatEthValue(userInfo.MaxBidAmount ?? 0),
                tooltip: 'The highest single bid you have ever placed.',
              },
            ]}
          />
          <StatGroup
            icon={<Ticket className="h-3.5 w-3.5" />}
            title="Raffles"
            className="sm:pl-6"
            stats={[
              {
                label: 'ETH Raffles Entered',
                value: (userInfo.NumRaffleEthWinnings ?? 0).toLocaleString(),
                tooltip: 'Number of ETH raffle draws you have participated in.',
              },
              {
                label: 'NFTs Won',
                value: (userInfo.RaffleNFTsCount ?? 0).toLocaleString(),
                tooltip: 'CosmicSignature NFTs won through raffle mints.',
              },
            ]}
          />
          <StatGroup
            icon={<Layers className="h-3.5 w-3.5" />}
            title="Staking"
            className="sm:pl-6"
            stats={[
              {
                label: 'Stake Actions',
                value: totalStakeActions.toLocaleString(),
                tooltip: 'Combined stake and unstake actions for RandomWalk NFTs.',
              },
              {
                label: 'Rewards Earned',
                value: formatEthValue(totalStakeRewardEth),
                tooltip: 'Total ETH earned from staking CosmicSignature NFTs.',
              },
            ]}
          />
        </div>
      </Card>
    </motion.div>
  );
}
