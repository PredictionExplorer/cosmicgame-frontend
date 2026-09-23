'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import {
  ALLOCATION_TRACK_COLORS,
  withNextCycleShare,
  type AllocationTrackId,
  type AllocationTrackShare,
} from '@/config/allocationTracks';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UnknownValue } from '@/components/ui/unknown-value';

interface FundDistributionProps {
  prizePercentage?: number;
  chronoWarriorPercentage?: number;
  stellarSelectionPercentage?: number;
  stakingPercentage?: number;
  charityPercentage?: number;
  loading?: boolean;
}

/** Catalog key under `contracts.funds.segments` for each track. */
const SEGMENT_COPY_KEY: Record<AllocationTrackId, string> = {
  signature: 'signature',
  chrono: 'chrono',
  stellar: 'stellar',
  anchor: 'anchor',
  publicGoods: 'publicGoods',
  nextCycle: 'next',
};

function toPercent(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * The Cycle Reserve split. Each segment is drawn against the whole reserve (100%), and the
 * remainder that carries into the next cycle is its own segment, so a 25% track fills a
 * quarter of the bar rather than half of it.
 */
export function FundDistribution({
  prizePercentage,
  chronoWarriorPercentage,
  stellarSelectionPercentage,
  stakingPercentage,
  charityPercentage,
  loading = false,
}: FundDistributionProps) {
  const t = useTranslations('contracts');
  const tCommon = useTranslations('common');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full rounded-full" />
          <div className="mt-4 flex flex-wrap gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const shares: AllocationTrackShare[] = withNextCycleShare([
    { id: 'signature', percent: toPercent(prizePercentage) },
    { id: 'chrono', percent: toPercent(chronoWarriorPercentage) },
    { id: 'stellar', percent: toPercent(stellarSelectionPercentage) },
    { id: 'anchor', percent: toPercent(stakingPercentage) },
    { id: 'publicGoods', percent: toPercent(charityPercentage) },
  ]);
  const segments = shares.map((share) => ({
    ...share,
    label: t(`funds.segments.${SEGMENT_COPY_KEY[share.id]}.label`),
    tooltip: t(`funds.segments.${SEGMENT_COPY_KEY[share.id]}.tooltip`),
    color: ALLOCATION_TRACK_COLORS[share.id],
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold">{t('funds.title')}</CardTitle>
          <InfoTooltip content={t('funds.description')} />
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="flex h-10 w-full overflow-hidden rounded-full bg-white/[0.06]"
          role="img"
          aria-label={t('funds.chartAria')}
        >
          {segments.map((segment, i) => {
            if (segment.percent === null || segment.percent <= 0) return null;
            return (
              <Tooltip key={segment.id}>
                <TooltipTrigger asChild>
                  <motion.div
                    className={cn(
                      segment.color,
                      'relative h-full',
                      i > 0 && 'border-l border-black/20',
                    )}
                    data-testid={`fund-segment-${segment.id}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, segment.percent)}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' as const }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[220px] text-xs leading-relaxed">
                    {segment.label}: {segment.percent}%
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {segments.map((segment) => (
            <div key={segment.id} className="flex items-center gap-2 text-sm">
              <span className={cn('inline-block h-2.5 w-2.5 rounded-full', segment.color)} />
              <span className="text-muted-foreground">{segment.label}</span>
              <span className="font-semibold">
                {segment.percent === null ? (
                  <UnknownValue label={tCommon('status.unavailable')} />
                ) : (
                  `${segment.percent}%`
                )}
              </span>
              <InfoTooltip content={segment.tooltip} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
