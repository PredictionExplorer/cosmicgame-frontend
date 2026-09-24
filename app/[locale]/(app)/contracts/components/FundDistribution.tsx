'use client';

import { useLocale, useTranslations } from 'next-intl';

import {
  ALLOCATION_TRACK_COLORS,
  ALLOCATION_TRACK_COPY_KEYS,
  withNextCycleShare,
  type AllocationTrackShare,
} from '@/config/allocationTracks';
import { cn } from '@/lib/utils';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatPercent } from '@/utils/format';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton } from '@/components/ui/skeleton';
import { UnknownValue } from '@/components/ui/unknown-value';

interface FundDistributionProps {
  prizePercentage?: number;
  chronoWarriorPercentage?: number;
  stellarSelectionPercentage?: number;
  stakingPercentage?: number;
  charityPercentage?: number;
  loading?: boolean;
}

/**
 * The Cycle Reserve split. Each segment is drawn against the whole reserve (100%), and the
 * remainder that carries into the next cycle is its own segment, so a 25% track fills a
 * quarter of the bar rather than half of it. The legend below the bar carries every figure
 * as text, each track's name explaining itself; the bar only draws the proportions.
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
  const locale = useLocale();

  const shares: AllocationTrackShare[] = withNextCycleShare([
    { id: 'signature', percent: toFiniteNumber(prizePercentage) },
    { id: 'chrono', percent: toFiniteNumber(chronoWarriorPercentage) },
    { id: 'stellar', percent: toFiniteNumber(stellarSelectionPercentage) },
    { id: 'anchor', percent: toFiniteNumber(stakingPercentage) },
    { id: 'publicGoods', percent: toFiniteNumber(charityPercentage) },
  ]);
  const segments = shares.map((share) => ({
    ...share,
    label: t(`funds.segments.${ALLOCATION_TRACK_COPY_KEYS[share.id]}.label`),
    tooltip: t(`funds.segments.${ALLOCATION_TRACK_COPY_KEYS[share.id]}.tooltip`),
    color: ALLOCATION_TRACK_COLORS[share.id],
    formatted: share.percent === null ? null : formatPercent(share.percent, locale),
  }));

  return (
    <section aria-labelledby="allocation-tracks-heading">
      <SectionHeader
        headingId="allocation-tracks-heading"
        title={t('funds.title')}
        description={t('funds.description')}
      />
      {loading ? (
        <div className="mt-6" aria-busy="true">
          <Skeleton className="h-3 w-full rounded-pill" />
          <div className="mt-5 grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {segments.map((segment) => (
              <Skeleton key={segment.id} className="h-6 w-full" />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div
            className="flex h-3 w-full gap-0.5"
            role="img"
            aria-label={t('funds.chartAria')}
            data-testid="fund-bar"
          >
            {segments.map((segment) =>
              segment.percent === null || segment.percent <= 0 ? null : (
                <span
                  key={segment.id}
                  data-testid={`fund-segment-${segment.id}`}
                  className={cn('h-full first:rounded-s-pill last:rounded-e-pill', segment.color)}
                  style={{ width: `${Math.min(100, segment.percent)}%` }}
                />
              ),
            )}
          </div>
          <dl className="mt-5 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {segments.map((segment) => (
              <div
                key={segment.id}
                data-track={segment.id}
                className="flex min-h-11 items-center gap-3 border-b border-rule-faint py-2"
              >
                <dt className="flex min-w-0 flex-1 items-center gap-2.5 type-body-sm text-muted-foreground">
                  <span
                    aria-hidden
                    className={cn('size-2.5 shrink-0 rounded-full', segment.color)}
                  />
                  <ExplainedTerm definition={segment.tooltip} announce="moreInformation">
                    {segment.label}
                  </ExplainedTerm>
                </dt>
                <dd className="shrink-0 type-figure-sm text-foreground">
                  {segment.formatted ?? <UnknownValue label={tCommon('status.unavailable')} />}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
