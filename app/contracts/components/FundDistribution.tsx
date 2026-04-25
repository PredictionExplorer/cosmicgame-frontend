'use client';

import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Skeleton } from '@/components/ui/skeleton';

interface FundSegment {
  label: string;
  value: number;
  color: string;
  tooltip: string;
}

interface FundDistributionProps {
  prizePercentage?: number;
  chronoWarriorPercentage?: number;
  stellarSelectionPercentage?: number;
  stakingPercentage?: number;
  charityPercentage?: number;
  loading?: boolean;
}

const SEGMENT_COLORS = {
  allocation: 'bg-[#35C9FF]',
  chrono: 'bg-[#AC56FF]',
  stellarSelection: 'bg-[#F59E0B]',
  anchoring: 'bg-[#10B981]',
  charity: 'bg-[#F472B6]',
} as const;

const DOT_COLORS = {
  allocation: 'bg-[#35C9FF]',
  chrono: 'bg-[#AC56FF]',
  stellarSelection: 'bg-[#F59E0B]',
  anchoring: 'bg-[#10B981]',
  charity: 'bg-[#F472B6]',
} as const;

export function FundDistribution({
  prizePercentage,
  chronoWarriorPercentage,
  stellarSelectionPercentage,
  stakingPercentage,
  charityPercentage,
  loading = false,
}: FundDistributionProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full rounded-full" />
          <div className="mt-4 flex flex-wrap gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const segments: FundSegment[] = [
    {
      label: 'Signature Allocation',
      value: prizePercentage ?? 0,
      color: SEGMENT_COLORS.allocation,
      tooltip:
        'Percentage of the Cycle Reserve retrieved by the participant who made the Final Gesture',
    },
    {
      label: 'Chrono-Warrior',
      value: chronoWarriorPercentage ?? 0,
      color: SEGMENT_COLORS.chrono,
      tooltip:
        'Allocation to the participant who held the Endurance Champion position for the longest consecutive interval',
    },
    {
      label: 'Stellar Selection',
      value: stellarSelectionPercentage ?? 0,
      color: SEGMENT_COLORS.stellarSelection,
      tooltip: 'Portion distributed to randomly selected participants when the cycle finalizes',
    },
    {
      label: 'Anchor Distribution',
      value: stakingPercentage ?? 0,
      color: SEGMENT_COLORS.anchoring,
      tooltip: 'Distributions to anchor-holders proportional to their anchored token count',
    },
    {
      label: 'Public Goods',
      value: charityPercentage ?? 0,
      color: SEGMENT_COLORS.charity,
      tooltip: 'Forwarded to the Public Goods Beneficiary (Protocol Guild) each cycle',
    },
  ];

  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold">Fund Distribution</CardTitle>
          <InfoTooltip content="How the Cycle Reserve distributes across allocation tracks: Signature Allocation, Stellar Selection, Public Goods, Anchor Distribution, and the Compounding Cycle Reserve." />
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="flex h-10 w-full overflow-hidden rounded-full bg-white/[0.06]"
          role="img"
          aria-label="Fund distribution bar chart"
        >
          {segments.map((segment, i) => {
            if (segment.value <= 0) return null;
            const widthPercent = total > 0 ? (segment.value / total) * 100 : 0;
            return (
              <motion.div
                key={segment.label}
                className={cn(
                  segment.color,
                  'relative h-full',
                  i > 0 && 'border-l border-black/20',
                )}
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' as const }}
                title={`${segment.label}: ${segment.value}%`}
              />
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {segments.map((segment) => {
            const dotColor =
              Object.values(DOT_COLORS)[
                Object.values(SEGMENT_COLORS).indexOf(
                  segment.color as (typeof SEGMENT_COLORS)[keyof typeof SEGMENT_COLORS],
                )
              ];
            return (
              <div key={segment.label} className="flex items-center gap-2 text-sm">
                <span
                  className={cn('inline-block h-2.5 w-2.5 rounded-full', dotColor ?? segment.color)}
                />
                <span className="text-muted-foreground">{segment.label}</span>
                <span className="font-semibold">{segment.value}%</span>
                <InfoTooltip content={segment.tooltip} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
