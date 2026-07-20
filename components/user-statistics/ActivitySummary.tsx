'use client';

import { Gavel, Ticket, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatEthValue } from '@/utils';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';

import type { UserProfileInfo } from './UserStatsSection';

interface StatPair {
  label: string;
  value: string | number;
  tooltip: string;
}

function MiniStat({ label, value, tooltip }: StatPair) {
  return (
    <div className="flex items-baseline justify-between gap-2" title={tooltip}>
      <span className="activity-overview-label flex min-w-0 flex-1 items-center gap-1 text-xs text-muted-foreground print:!text-foreground/80">
        {label}
        <span className="print:hidden">
          <InfoTooltip content={tooltip} />
        </span>
      </span>
      <span className="activity-stat-value shrink-0 text-sm font-semibold tabular-nums text-foreground print:!text-foreground">
        {value}
      </span>
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
    <div className={cn('activity-overview-group space-y-2.5 print:!pl-0', className)}>
      <div className="activity-overview-group-title flex items-center gap-2 text-sm font-medium text-primary print:!text-foreground">
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
  totalAnchorDistributionEth?: number;
  className?: string;
}

export function ActivitySummary({
  userInfo,
  totalAnchorDistributionEth = 0,
  className,
}: ActivitySummaryProps) {
  const t = useTranslations('myPages');
  const rwlk = userInfo.StakingStatisticsRWalk;
  const totalAnchorActions =
    (rwlk?.TotalNumStakeActions ?? 0) + (rwlk?.TotalNumUnstakeActions ?? 0);

  return (
    <div className="print-motion-visible print:overflow-visible" data-testid="activity-summary">
      <Card
        className={cn(
          'activity-overview-card gradient-border-card p-5 backdrop-blur-sm bg-white/[0.02]',
          'print:!overflow-visible print:!border-border print:!bg-background print:!shadow-none print:!backdrop-blur-none',
          className,
        )}
      >
        <h3 className="activity-overview-heading mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground print:!text-foreground/80">
          {t('statistics.activity.title')}
        </h3>
        <div className="activity-overview-grid grid grid-cols-1 gap-6 sm:grid-cols-3 sm:divide-x sm:divide-white/[0.06] print:!block print:space-y-5 print:!divide-none">
          <StatGroup
            icon={<Gavel className="h-3.5 w-3.5" />}
            title={t('statistics.activity.groups.gestures')}
            stats={[
              {
                label: t('statistics.activity.gesturesMade.label'),
                value: userInfo.NumBids.toLocaleString(),
                tooltip: t('statistics.activity.gesturesMade.tooltip'),
              },
              {
                label: t('statistics.activity.maxGesture.label'),
                value: formatEthValue(userInfo.MaxBidAmount ?? 0),
                tooltip: t('statistics.activity.maxGesture.tooltip'),
              },
            ]}
          />
          <StatGroup
            icon={<Ticket className="h-3.5 w-3.5" />}
            title={t('statistics.activity.groups.stellarSelections')}
            className="sm:pl-6"
            stats={[
              {
                label: t('statistics.activity.ethSelections.label'),
                value: (userInfo.NumRaffleEthWinnings ?? 0).toLocaleString(),
                tooltip: t('statistics.activity.ethSelections.tooltip'),
              },
              {
                label: t('statistics.activity.nftsReceived.label'),
                value: (userInfo.RaffleNFTsCount ?? 0).toLocaleString(),
                tooltip: t('statistics.activity.nftsReceived.tooltip'),
              },
            ]}
          />
          <StatGroup
            icon={<Layers className="h-3.5 w-3.5" />}
            title={t('statistics.activity.groups.anchoring')}
            className="sm:pl-6"
            stats={[
              {
                label: t('statistics.activity.anchorActions.label'),
                value: totalAnchorActions.toLocaleString(),
                tooltip: t('statistics.activity.anchorActions.tooltip'),
              },
              {
                label: t('statistics.activity.distributionsReceived.label'),
                value: formatEthValue(totalAnchorDistributionEth),
                tooltip: t('statistics.activity.distributionsReceived.tooltip'),
              },
            ]}
          />
        </div>
      </Card>
    </div>
  );
}
