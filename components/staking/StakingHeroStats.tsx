import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';

export interface StakingStatItem {
  label: string;
  value: ReactNode;
  tooltip: string;
  icon?: ReactNode;
  featured?: boolean;
  gradient?: boolean;
}

interface StakingHeroStatsProps {
  stats: StakingStatItem[];
  loading?: boolean;
  className?: string;
}

export function StakingHeroStats({ stats, loading = false, className }: StakingHeroStatsProps) {
  if (loading) {
    return (
      <div
        className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}
        data-testid="staking-stats-skeleton"
      >
        {stats.map((stat) => (
          <StatCardSkeleton key={stat.label} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          tooltip={stat.tooltip}
          icon={stat.icon}
          featured={stat.featured}
          gradient={stat.gradient}
        />
      ))}
    </div>
  );
}
