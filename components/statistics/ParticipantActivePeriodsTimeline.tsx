'use client';

import { useMemo, type FC } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { formatAddress, formatDuration, formatUnixTsLabel } from '@/utils/format';
import { Link } from '@/i18n/navigation';
// lexicon-allow-start: the hook and wire types mirror the backend route statistics/bidding/top_bidders
import { useTopBidderActivePeriods as useActivePeriodsQuery } from '@/hooks/useApiQuery';
import type {
  BidderActivePeriod as ActivePeriod,
  TopBidderInfo as TopParticipant,
} from '@/services/api/types';
// lexicon-allow-end
import { useFormat } from '@/hooks/useFormat';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonTable } from '@/components/ui/skeleton';

import { ACTIVE_PERIODS_TOP_N, activePeriodsRange } from './charts/activityRanges';
import { ChartFigure } from './charts/ChartFigure';
import type { ReadoutItem } from './charts/ChartReadout';
import { UtcTime } from './charts/UtcTime';
import { useTimeAxis } from './charts/axes';
import {
  SERIES_COLOR,
  TIMELINE_LANE_FOCUS_CLASS,
  TIMELINE_MARK_CLASS,
  timelineMarkStyle,
} from './charts/theme';
import { SummaryAddress, useCoarsePointer, useTimelineReadout } from './charts/timeline';
import { useGestureTimeBounds } from './charts/useGestureTimeBounds';
import { useRovingStints } from './charts/useRovingStints';

/** The thinnest a period may draw, so a one-hour burst in a year still shows. */
const MIN_BAR_PERCENT = 0.3;

type Lane = {
  participant: TopParticipant;
  periods: ActivePeriod[];
};

type TableRow = {
  address: string;
  gestures: number;
  periods: number;
  longest: number;
  first: number | null;
  last: number | null;
};

const percent = (value: number): string => `${Math.max(0, Math.min(100, value * 100))}%`;

/**
 * The lane grid. From `sm` the rank, address and count sit in a column beside
 * the lane; on a phone they take their own line above it, so the plot spans
 * the width instead of a third of it.
 */
const LANE_GRID = 'grid grid-cols-1 gap-x-3 sm:grid-cols-[minmax(7.5rem,11rem)_minmax(0,1fr)]';

type ParticipantActivePeriodsTimelineProps = {
  enabled?: boolean;
  /** Names the figure (the section's title). */
  label: string;
};

/**
 * The most active participants' active periods (runs of gestures with no
 * more than six hours between them) on one time axis that fits the screen at
 * every width: a lane per participant, ranked by gestures, every bar in the
 * gestures series colour so rank, not hue, identifies a lane. One tab stop:
 * the arrow keys step through a lane's periods and between lanes, and the
 * hovered, tapped or focused period reads out below the plot.
 */
export const ParticipantActivePeriodsTimeline: FC<ParticipantActivePeriodsTimelineProps> = ({
  enabled = true,
  label,
}) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const format = useFormat();
  const bounds = useGestureTimeBounds(enabled);
  const { initTs, finTs } = activePeriodsRange(bounds);

  const { data, isLoading, isError, refetch } = useActivePeriodsQuery(
    ACTIVE_PERIODS_TOP_N,
    initTs,
    finTs,
    enabled && bounds.settled,
  );

  const lanes = useMemo((): Lane[] => {
    const periods = data?.ActivePeriods ?? [];
    return (data?.TopBidders ?? []).map((participant) => ({
      participant,
      periods: periods
        .filter((p) => p.BidderAid === participant.BidderAid)
        .sort((a, b) => a.PeriodStart - b.PeriodStart),
    }));
  }, [data?.TopBidders, data?.ActivePeriods]);

  const counts = useMemo(() => lanes.map((lane) => lane.periods.length), [lanes]);
  const roving = useRovingStints(counts);
  const readout = useTimelineReadout<ActivePeriod>();
  const coarse = useCoarsePointer();
  const axis = useTimeAxis(initTs, finTs);
  const range = Math.max(1, finTs - initTs);

  const tableRows = useMemo<TableRow[]>(
    () =>
      lanes.map(({ participant, periods }) => ({
        address: participant.BidderAddr,
        gestures: participant.NumBids,
        periods: periods.length,
        longest: periods.reduce((max, p) => Math.max(max, p.DurationSecs ?? 0), 0),
        first: periods[0]?.PeriodStart ?? null,
        last: periods[periods.length - 1]?.PeriodEnd ?? null,
      })),
    [lanes],
  );

  const columns = useMemo<DataTableColumn<TableRow>[]>(
    () => [
      {
        id: 'participant',
        kind: 'address',
        header: t('charts.activePeriods.participant'),
        value: (row) => row.address,
      },
      {
        id: 'gestures',
        kind: 'count',
        header: t('charts.frequency.gestures'),
        value: (row) => row.gestures,
        sortable: true,
      },
      {
        id: 'periods',
        kind: 'count',
        header: t('charts.activePeriods.periods'),
        value: (row) => row.periods,
        sortable: true,
      },
      {
        id: 'longest',
        kind: 'duration',
        header: t('charts.activePeriods.longest'),
        value: (row) => row.longest,
        sortable: true,
      },
      {
        id: 'last',
        kind: 'text',
        header: t('charts.activePeriods.lastActive'),
        value: (row) => row.last,
        // UTC, like the chart's axis.
        cell: (row) =>
          row.last === null ? null : <UtcTime timestamp={row.last} locale={locale} />,
        sortable: true,
      },
    ],
    [locale, t],
  );

  const periodLabel = (period: ActivePeriod) =>
    t('charts.activePeriods.ariaLabel', {
      address: formatAddress(period.BidderAddr),
      count: period.NumBids,
      start: formatUnixTsLabel(period.PeriodStart, true, locale),
      end: formatUnixTsLabel(period.PeriodEnd, true, locale),
    });

  const leader = lanes[0]?.participant;
  // The longest run of any lane, and whose it was.
  const longest = lanes
    .flatMap((lane) => lane.periods)
    .reduce<ActivePeriod | null>(
      (best, period) => ((period.DurationSecs ?? 0) > (best?.DurationSecs ?? -1) ? period : best),
      null,
    );
  const loading = !bounds.settled || isLoading;
  const figures: ReadoutItem[] | undefined = loading
    ? [
        { id: 'leader', label: t('charts.activePeriods.mostGestures'), value: null, caption: null },
        { id: 'longest', label: t('charts.activePeriods.longest'), value: null, caption: null },
      ]
    : leader
      ? [
          {
            id: 'leader',
            label: t('charts.activePeriods.mostGestures'),
            value: format.count(leader.NumBids),
            caption: <SummaryAddress address={leader.BidderAddr} />,
          },
          ...(longest
            ? [
                {
                  id: 'longest',
                  label: t('charts.activePeriods.longest'),
                  value: formatDuration(longest.DurationSecs ?? 0, { locale, maxUnits: 2 }),
                  caption: <SummaryAddress address={longest.BidderAddr} />,
                },
              ]
            : []),
        ]
      : undefined;
  const state = loading ? (
    <SkeletonTable rows={8} columns={2} />
  ) : isError ? (
    <ErrorState
      headingLevel={3}
      title={t('charts.activePeriods.loadErrorTitle')}
      message={t('charts.activePeriods.loadErrorMessage')}
      onRetry={() => refetch()}
    />
  ) : lanes.length === 0 ? (
    <EmptyState headingLevel={3} variant="inline" title={t('charts.activePeriods.empty')} />
  ) : null;

  return (
    <ChartFigure
      label={label}
      readout={isError ? undefined : figures}
      state={state}
      loading={loading}
      note={t('charts.activePeriods.note')}
      table={<DataTable data={tableRows} columns={columns} ariaLabel={label} />}
    >
      <div data-testid="participant-active-periods-timeline" className="min-w-0">
        {/* One grid for the axis and every lane, so they cannot drift apart. */}
        <div className={LANE_GRID}>
          <div className="hidden border-b border-rule pb-2 type-caption text-subtle sm:block">
            {t('charts.activePeriods.participant')}
          </div>
          <div aria-hidden className="relative border-b border-rule pb-2 type-caption text-subtle">
            {axis.ticks.map((tick, index) => (
              <span
                key={tick}
                className="absolute bottom-2 whitespace-nowrap tabular-nums"
                style={{
                  left: percent((tick - initTs) / range),
                  transform:
                    index === axis.ticks.length - 1 && (tick - initTs) / range > 0.9
                      ? 'translateX(-100%)'
                      : 'translateX(-50%)',
                }}
              >
                {axis.format(tick)}
              </span>
            ))}
            <span className="invisible">0</span>
          </div>
        </div>

        <div
          role="group"
          aria-label={label}
          onKeyDown={roving.onKeyDown}
          onMouseLeave={readout.onMouseLeave}
        >
          {lanes.map((lane, row) => (
            <div
              key={lane.participant.BidderAid}
              role="group"
              aria-label={t('charts.activePeriods.laneLabel', {
                rank: row + 1,
                address: formatAddress(lane.participant.BidderAddr),
                gestures: lane.participant.NumBids,
                periods: lane.periods.length,
              })}
              className={cn(
                LANE_GRID,
                'border-b border-rule-faint pt-1.5 transition-colors duration-fast sm:pt-0',
                TIMELINE_LANE_FOCUS_CLASS,
              )}
            >
              {/* A phone reads rank, address and count on one line above the lane. */}
              <div className="flex min-w-0 items-baseline justify-between gap-3 sm:min-h-10 sm:items-center sm:py-1">
                <span className="flex min-w-0 items-baseline gap-2">
                  <span
                    aria-hidden
                    className="w-4 shrink-0 text-right type-caption text-subtle tabular-nums"
                  >
                    {row + 1}
                  </span>
                  <Link
                    href={`/user/${lane.participant.BidderAddr}`}
                    className="link-quiet truncate type-mono text-foreground"
                  >
                    {formatAddress(lane.participant.BidderAddr)}
                  </Link>
                </span>
                <span className="shrink-0 type-caption text-subtle tabular-nums">
                  {format.count(lane.participant.NumBids)}
                </span>
              </div>
              <div className="relative min-h-10">
                {lane.periods.length === 0 ? (
                  // Gestures more than six hours apart form no period: say so, not an empty lane.
                  <span className="absolute inset-y-0 start-0 flex items-center type-caption text-subtle">
                    {t('charts.activePeriods.noPeriods')}
                  </span>
                ) : null}
                {axis.ticks.map((tick) => (
                  <span
                    key={tick}
                    aria-hidden
                    className="absolute inset-y-0 w-px bg-rule-faint"
                    style={{ left: percent((tick - initTs) / range) }}
                  />
                ))}
                {lane.periods.map((period, item) => {
                  const start = (period.PeriodStart - initTs) / range;
                  const width = Math.max(
                    (period.PeriodEnd - period.PeriodStart) / range,
                    MIN_BAR_PERCENT / 100,
                  );
                  const current = roving.isCurrent(row, item);
                  return (
                    <span
                      key={`${period.PeriodStart}-${period.PeriodEnd}`}
                      ref={roving.markRef(row, item)}
                      role="img"
                      aria-label={periodLabel(period)}
                      tabIndex={current ? 0 : -1}
                      {...readout.markHandlers(period, () => roving.setCurrent({ row, item }))}
                      className={cn(
                        TIMELINE_MARK_CLASS,
                        'inset-y-2.5 rounded-edge opacity-80 transition-opacity duration-fast [--mark-min:3px] hover:opacity-100',
                        readout.active === period && 'opacity-100',
                      )}
                      style={{
                        ...timelineMarkStyle(start, width),
                        backgroundColor: SERIES_COLOR.gestures,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p aria-live="polite" className="mt-3 min-h-5 type-body-sm text-muted-foreground">
          {readout.active
            ? periodLabel(readout.active)
            : t(coarse ? 'charts.activePeriods.hintTouch' : 'charts.activePeriods.hint')}
        </p>
      </div>
    </ChartFigure>
  );
};
