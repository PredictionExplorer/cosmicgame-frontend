'use client';

import { memo, useId, useMemo, useState, type FC } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useLocale, useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { formatAddress, formatHoursTick, formatSeconds } from '@/utils/format';
import {
  getEnduranceGantt,
  getEnduranceTimeline,
  type EnduranceGantt,
  type EnduranceLane,
  type EnduranceStint,
  type EnduranceTimelinePoint,
} from '@/utils/endurance';
import { useGestureListByCycle } from '@/hooks/useApiQuery';
import { useFormat } from '@/hooks/useFormat';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ChartFigure } from './charts/ChartFigure';
import { ChartPlot } from './charts/ChartPlot';
import { ChartLegend, LegendSwatch } from './charts/ChartLegend';
import type { ReadoutItem } from './charts/ChartReadout';
import { ChartTooltipCard } from './charts/ChartTooltipCard';
import { useDurationAxis, useElapsedHoursAxis } from './charts/axes';
import {
  CHART_MARGIN,
  GRID_PROPS,
  SERIES_COLOR,
  TIMELINE_LANE_FOCUS_CLASS,
  TIMELINE_MARK_CLASS,
  TOOLTIP_PROPS,
  X_AXIS_PROPS,
  Y_AXIS_PROPS,
  timelineMarkStyle,
} from './charts/theme';
import {
  ChartAddressLink,
  SummaryAddress,
  useChartLinksOpenNewWindow,
  useCoarsePointer,
  useTimelineReadout,
} from './charts/timeline';
import { useCycleClock } from './charts/useCycleClock';
import { useRovingStints } from './charts/useRovingStints';
import { ENDURANCE_LANE_GRID, EnduranceGanttSkeleton } from './EnduranceTimelineSkeleton';

export { EnduranceTimelineSkeleton } from './EnduranceTimelineSkeleton';

const LINE_CHART_HEIGHT = 320;
/**
 * Lanes a page shows before "Show all": the longest holders, which are the
 * lanes a reader compares. The embed, a page of its own, shows every lane.
 */
export const DEFAULT_LANE_LIMIT = 14;

const pct = (v: number): string => `${Math.max(0, Math.min(100, v * 100))}%`;

/** The table's address link inside an embed, drawn as the table's own address cells are. */
const EMBED_TABLE_ADDRESS =
  'font-mono no-underline [color:inherit] transition-colors hover:text-primary focus-visible:text-primary';

const LANE_GRID = ENDURANCE_LANE_GRID;

/** A stint's colour: the champion's record hold, the Chrono-Warrior's lane, or an ordinary lead. */
function stintColor(stint: EnduranceStint, lane: EnduranceLane): string {
  if (stint.isEnduranceChampion) return SERIES_COLOR.endurance;
  if (lane.isChronoWarrior) return SERIES_COLOR.chrono;
  return SERIES_COLOR.lead;
}

/** A lane's title, spelled out beside the legend's swatch for it. */
function RoleTag({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 type-caption text-muted-foreground">
      <LegendSwatch color={color} className="size-2" />
      {name}
    </span>
  );
}

/**
 * Runs of a lane's stints close enough to read as one hold (a gap under this
 * share of the cycle, a few pixels on a wide screen): drawn as one band under
 * the stints, so a participant who kept retaking the lead reads as a stretch
 * of dominance rather than a barcode. The stints stay the marks a reader
 * points at and steps through.
 */
const RUN_GAP_SHARE = 0.004;

/** The bands behind a lane's stints, as [start, end] in hours; single stints are left out. */
export function stintRuns(stints: readonly EnduranceStint[], durHours: number): [number, number][] {
  const sorted = [...stints].sort((a, b) => a.startHours - b.startHours);
  const gap = durHours * RUN_GAP_SHARE;
  const runs: { start: number; end: number; count: number }[] = [];
  for (const stint of sorted) {
    const end = stint.startHours + stint.durationHours;
    const last = runs[runs.length - 1];
    if (last && stint.startHours - last.end <= gap) {
      last.end = Math.max(last.end, end);
      last.count += 1;
    } else {
      runs.push({ start: stint.startHours, end, count: 1 });
    }
  }
  return runs.filter((run) => run.count > 1).map((run) => [run.start, run.end]);
}

function TimelineTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: EnduranceTimelinePoint }>;
}) {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;
  return (
    <ChartTooltipCard
      title={t('charts.endurance.intoCycle', {
        duration: formatHoursTick(point.hoursIntoRound, locale),
      })}
      rows={[
        {
          key: 'lead',
          label: t('charts.endurance.currentLeadWindow'),
          value: formatSeconds(point.lead, locale),
          color: SERIES_COLOR.lead,
        },
        {
          key: 'endurance',
          label: t('charts.endurance.enduranceRecord'),
          value: formatSeconds(point.enduranceRecord, locale),
          color: SERIES_COLOR.endurance,
          shape: 'line',
        },
        {
          key: 'chrono',
          label: t('charts.endurance.chronoRecord'),
          value: formatSeconds(point.chronoRecord, locale),
          color: SERIES_COLOR.chrono,
          shape: 'line',
        },
      ]}
      footer={t('charts.endurance.leadHeldByValue', { address: formatAddress(point.leader) })}
    />
  );
}

/** The records as lines over the cycle, beside the lead window's sawtooth. */
const EnduranceLineView = memo(function EnduranceLineView({
  points,
}: {
  points: EnduranceTimelinePoint[];
}) {
  const t = useTranslations('statistics');
  const maxHours = points[points.length - 1]?.hoursIntoRound ?? 0;
  const maxRecord = points.reduce(
    (max, p) => Math.max(max, p.lead, p.enduranceRecord, p.chronoRecord),
    0,
  );
  const xAxis = useElapsedHoursAxis(maxHours);
  const yAxis = useDurationAxis(0, maxRecord);

  return (
    <div className="space-y-4">
      <ChartPlot height={LINE_CHART_HEIGHT}>
        <ComposedChart data={points} margin={CHART_MARGIN}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis
            {...X_AXIS_PROPS}
            dataKey="hoursIntoRound"
            type="number"
            domain={xAxis.domain}
            ticks={xAxis.ticks}
            tickFormatter={xAxis.format}
          />
          <YAxis
            {...Y_AXIS_PROPS}
            domain={yAxis.domain}
            ticks={yAxis.ticks}
            tickFormatter={yAxis.format}
            width={yAxis.width}
          />
          <Tooltip {...TOOLTIP_PROPS} content={<TimelineTooltip />} />
          <Area
            type="linear"
            dataKey="lead"
            stroke={SERIES_COLOR.lead}
            fill={SERIES_COLOR.lead}
            fillOpacity={0.16}
            strokeWidth={1}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="stepAfter"
            dataKey="enduranceRecord"
            stroke={SERIES_COLOR.endurance}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="stepAfter"
            dataKey="chronoRecord"
            stroke={SERIES_COLOR.chrono}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ChartPlot>
      <ChartLegend
        items={[
          { key: 'lead', label: t('charts.endurance.currentLeadWindow'), color: SERIES_COLOR.lead },
          {
            key: 'endurance',
            label: t('charts.endurance.enduranceChampionRecord'),
            color: SERIES_COLOR.endurance,
            shape: 'line',
          },
          {
            key: 'chrono',
            label: t('charts.endurance.chronoRecord'),
            color: SERIES_COLOR.chrono,
            shape: 'line',
          },
        ]}
      />
    </div>
  );
});

/**
 * The Endurance record's label, pinned over its stint in the champion's lane:
 * the chart's point stays readable however thin the stint draws. Starts at
 * the stint, or ends at it near the lane's right end. Seen, not heard: the
 * readout above the chart and the stint's own label already say it.
 */
function RecordCallout({ at, width, text }: { at: number; width: number; text: string }) {
  const nearEnd = at > 0.6;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute bottom-full mb-1 flex items-center gap-1.5 whitespace-nowrap type-caption text-foreground"
      style={nearEnd ? { right: pct(Math.max(0, 1 - at - width)) } : { left: pct(Math.max(0, at)) }}
    >
      <LegendSwatch color={SERIES_COLOR.endurance} className="size-2" />
      {text}
    </span>
  );
}

/**
 * Who held the lead, and for how long: a lane per address on one time axis
 * (a shared grid, so the axis and the lanes cannot drift apart at any
 * width), each bar a hold from one gesture to the next. One tab stop; the
 * arrow keys step through holds and lanes; the hovered, tapped or focused
 * hold reads out below. Past `laneLimit` lanes the rest wait behind "Show
 * all", with the count in view, never in a scroll area of their own.
 */
const EnduranceGanttView = memo(function EnduranceGanttView({
  gantt,
  laneLimit,
}: {
  gantt: EnduranceGantt;
  laneLimit: number | null;
}) {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const coarse = useCoarsePointer();
  const lanesId = useId();
  const [showAll, setShowAll] = useState(false);
  const durHours = Math.max(gantt.roundDurationSeconds / 3600, 1 / 60);
  const axis = useElapsedHoursAxis(durHours);
  const total = gantt.lanes.length;
  const limited = laneLimit !== null && total > laneLimit && !showAll;
  const lanes = limited ? gantt.lanes.slice(0, laneLimit) : gantt.lanes;
  const counts = useMemo(() => lanes.map((lane) => lane.stints.length), [lanes]);
  const roving = useRovingStints(counts);
  const readout = useTimelineReadout<{ lane: EnduranceLane; stint: EnduranceStint }>();

  const describe = (lane: EnduranceLane, stint: EnduranceStint) =>
    t('charts.endurance.stintAria', {
      address: formatAddress(lane.address),
      duration: formatSeconds(stint.durationSeconds, locale),
      from: formatHoursTick(stint.startHours, locale),
      to: formatHoursTick(stint.startHours + stint.durationHours, locale),
      role: stint.isEnduranceChampion
        ? t('charts.endurance.roleEndurance')
        : stint.isRecord
          ? t('charts.endurance.roleNewRecord')
          : '',
    });

  return (
    <div className="space-y-3">
      <ChartLegend
        items={[
          {
            key: 'endurance',
            label: t('charts.endurance.legendEndurance'),
            color: SERIES_COLOR.endurance,
          },
          { key: 'chrono', label: t('charts.endurance.legendChrono'), color: SERIES_COLOR.chrono },
          { key: 'lead', label: t('charts.endurance.legendLead'), color: SERIES_COLOR.lead },
          {
            key: 'record',
            label: t('charts.endurance.legendNewRecord'),
            color: 'hsl(var(--foreground))',
            shape: 'ring',
          },
        ]}
      />

      <div className={cn(LANE_GRID, 'border-b border-rule pb-2')} aria-hidden>
        <span className="hidden sm:block" />
        <div className="relative h-4 type-caption text-subtle tabular-nums">
          {axis.ticks.map((tick, index) => {
            const at = tick / durHours;
            const last = index === axis.ticks.length - 1 && at > 0.92;
            return (
              <span
                key={tick}
                className="absolute top-0 whitespace-nowrap"
                style={{
                  left: pct(at),
                  transform: index === 0 ? 'none' : last ? 'translateX(-100%)' : 'translateX(-50%)',
                }}
              >
                {axis.format(tick)}
              </span>
            );
          })}
        </div>
      </div>

      <div
        id={lanesId}
        role="group"
        aria-label={t('charts.endurance.ganttLabel')}
        onKeyDown={roving.onKeyDown}
        onMouseLeave={readout.onMouseLeave}
      >
        {lanes.map((lane, row) => (
          <div
            key={lane.address}
            role="group"
            aria-label={t('charts.endurance.laneLabel', {
              address: formatAddress(lane.address),
              count: lane.stints.length,
              longest: formatSeconds(lane.maxStintSeconds, locale),
            })}
            className={cn(
              LANE_GRID,
              'border-b border-rule-faint py-1.5 transition-colors duration-fast',
              TIMELINE_LANE_FOCUS_CLASS,
            )}
          >
            {/* The address stays whole; a title's tags sit beside it on a phone, under it from sm. */}
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 sm:flex-col sm:flex-nowrap sm:items-start sm:justify-center">
              <span className="truncate type-mono text-foreground" title={lane.address}>
                {formatAddress(lane.address)}
              </span>
              {lane.isEnduranceChampion || lane.isChronoWarrior ? (
                <span className="flex flex-wrap gap-x-3 gap-y-0.5">
                  {lane.isEnduranceChampion ? (
                    <RoleTag
                      name={t('charts.endurance.enduranceChampion')}
                      color={SERIES_COLOR.endurance}
                    />
                  ) : null}
                  {lane.isChronoWarrior ? (
                    <RoleTag
                      name={t('charts.endurance.chronoWarrior')}
                      color={SERIES_COLOR.chrono}
                    />
                  ) : null}
                </span>
              ) : null}
            </div>
            {/* No clipping: a focused stint draws its ring outside itself. The champion's lane
                keeps a line above its track for the record's callout. */}
            <div
              className={cn(
                'relative min-h-6 self-center rounded-edge bg-surface-sunken',
                lane.isEnduranceChampion && 'mt-6',
              )}
            >
              {axis.ticks.slice(1).map((tick) => (
                <span
                  key={tick}
                  aria-hidden
                  className="absolute inset-y-0 w-px bg-rule-faint"
                  style={{ left: pct(tick / durHours) }}
                />
              ))}
              {stintRuns(lane.stints, durHours).map(([start, end]) => (
                <span
                  key={start}
                  aria-hidden
                  className="absolute inset-y-1.5 rounded-edge opacity-40"
                  style={{
                    left: pct(start / durHours),
                    width: pct((end - start) / durHours),
                    backgroundColor: lane.isChronoWarrior ? SERIES_COLOR.chrono : SERIES_COLOR.lead,
                  }}
                />
              ))}
              {lane.stints.map((stint) =>
                stint.isEnduranceChampion ? (
                  <RecordCallout
                    key="record"
                    at={stint.startHours / durHours}
                    width={stint.durationHours / durHours}
                    text={t('charts.endurance.recordCallout', {
                      duration: formatSeconds(stint.durationSeconds, locale),
                    })}
                  />
                ) : null,
              )}
              {lane.stints.map((stint, item) => {
                const ringRecord = stint.isRecord && !stint.isEnduranceChampion;
                const active = readout.active?.stint === stint;
                return (
                  <span
                    key={item}
                    ref={roving.markRef(row, item)}
                    role="img"
                    aria-label={describe(lane, stint)}
                    tabIndex={roving.isCurrent(row, item) ? 0 : -1}
                    {...readout.markHandlers({ lane, stint }, () =>
                      roving.setCurrent({ row, item }),
                    )}
                    className={cn(
                      TIMELINE_MARK_CLASS,
                      'inset-y-1 rounded-edge transition-opacity duration-fast',
                      // The record is the chart's point: never thinner than a finger's worth of ink.
                      stint.isEnduranceChampion
                        ? 'z-[1] [--mark-min:6px]'
                        : ringRecord
                          ? '[--mark-min:3px]'
                          : '[--mark-min:2px]',
                      active || stint.isEnduranceChampion ? 'opacity-100' : 'opacity-75',
                    )}
                    style={{
                      ...timelineMarkStyle(
                        stint.startHours / durHours,
                        stint.durationHours / durHours,
                      ),
                      backgroundColor: stintColor(stint, lane),
                      boxShadow: ringRecord
                        ? 'inset 0 0 0 1.5px hsl(var(--foreground))'
                        : undefined,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {laneLimit !== null && total > laneLimit ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="type-body-sm text-muted-foreground">
            {showAll
              ? t('charts.endurance.lanesAll', { total })
              : t('charts.endurance.lanesShown', { shown: lanes.length, total })}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={showAll}
            aria-controls={lanesId}
            onClick={() => setShowAll((value) => !value)}
          >
            {showAll
              ? t('charts.endurance.showFewerLanes', { count: laneLimit })
              : t('charts.endurance.showAllLanes', { count: total })}
          </Button>
        </div>
      ) : null}

      <p aria-live="polite" className="min-h-5 type-body-sm text-muted-foreground">
        {readout.active
          ? describe(readout.active.lane, readout.active.stint)
          : t(coarse ? 'charts.endurance.hintTouch' : 'charts.endurance.hint')}
      </p>
    </div>
  );
});

/** The readout's figures (the two titles and the lanes), empty while the cycle loads. */
function useEnduranceReadout(gantt: EnduranceGantt | null): ReadoutItem[] {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const format = useFormat();
  return [
    {
      id: 'endurance',
      label: t('charts.endurance.enduranceChampion'),
      value: gantt ? formatSeconds(gantt.enduranceChampionStintSeconds, locale) : null,
      caption: gantt ? <SummaryAddress address={gantt.enduranceChampionAddress} /> : null,
      swatch: { color: SERIES_COLOR.endurance },
    },
    {
      id: 'chrono',
      label: t('charts.endurance.chronoWarrior'),
      value: gantt ? formatSeconds(gantt.chronoWarriorSeconds, locale) : null,
      caption: gantt ? <SummaryAddress address={gantt.chronoWarriorAddress} /> : null,
      swatch: { color: SERIES_COLOR.chrono },
    },
    {
      id: 'lanes',
      label: t('charts.endurance.leaders'),
      value: gantt ? format.count(gantt.lanes.length) : null,
    },
  ];
}

type LaneRow = {
  address: string;
  holds: number;
  longest: number;
  total: number;
  role: string;
};

type EnduranceTimelineChartProps = {
  round: number;
  /** True when `round` is the in-progress round (open-ended at "now"). */
  isLive: boolean;
  /** Names the figure. */
  label: string;
  /**
   * Lanes shown before "Show all" (`DEFAULT_LANE_LIMIT`); `null` shows every
   * lane, for the embed, which is a page of its own.
   */
  laneLimit?: number | null;
  /**
   * How many lanes the server counted for this cycle. The loading state then
   * draws that many lanes, so the page keeps its height when they arrive.
   */
  expectedLanes?: number;
};

/**
 * One cycle's lead history, reconstructed from its gesture list: who held
 * the lead and for how long (Gantt), or the two records as lines. The
 * summary names the Endurance Champion and the Chrono-Warrior; the table
 * lists every address that held the lead.
 */
const EnduranceTimelineChart: FC<EnduranceTimelineChartProps> = ({
  round,
  isLive,
  label,
  laneLimit = DEFAULT_LANE_LIMIT,
  expectedLanes,
}) => {
  const t = useTranslations('statistics');
  const newWindowLinks = useChartLinksOpenNewWindow();
  const hasRound = round >= 0;
  const { data: gestures, isLoading, isError, refetch } = useGestureListByCycle(round, 'asc');
  const [view, setView] = useState<'gantt' | 'lines'>('gantt');

  // A finalized cycle ends at its finalization, the live one at "now" (whole minutes).
  // Nothing is drawn before that end is known: without it the last holder's stint, which
  // can be the record, would be missing, and the readout would name the wrong champion.
  const clock = useCycleClock(round, isLive);
  const gantt = useMemo(
    () => getEnduranceGantt(gestures ?? [], clock.endTs, clock.nowTs),
    [gestures, clock.endTs, clock.nowTs],
  );
  const timeline = useMemo(
    () => getEnduranceTimeline(gestures ?? [], clock.endTs, clock.nowTs),
    [gestures, clock.endTs, clock.nowTs],
  );

  const rows = useMemo<LaneRow[]>(
    () =>
      gantt.lanes.map((lane) => ({
        address: lane.address,
        holds: lane.stints.length,
        longest: lane.maxStintSeconds,
        total: lane.totalSeconds,
        role: [
          lane.isEnduranceChampion ? t('charts.endurance.enduranceChampion') : null,
          lane.isChronoWarrior ? t('charts.endurance.chronoWarrior') : null,
        ]
          .filter(Boolean)
          .join(', '),
      })),
    [gantt.lanes, t],
  );

  const columns = useMemo<DataTableColumn<LaneRow>[]>(
    () => [
      {
        id: 'address',
        kind: 'address',
        header: t('charts.activePeriods.participant'),
        value: (row) => row.address,
        // In an embed the participant opens in a new window, like the summary's links.
        cell: newWindowLinks
          ? (row) => <ChartAddressLink address={row.address} className={EMBED_TABLE_ADDRESS} />
          : undefined,
      },
      { id: 'role', kind: 'text', header: t('charts.endurance.role'), value: (row) => row.role },
      {
        id: 'holds',
        kind: 'count',
        header: t('charts.endurance.holds'),
        value: (row) => row.holds,
        sortable: true,
      },
      {
        id: 'longest',
        kind: 'duration',
        header: t('charts.endurance.longestHold'),
        value: (row) => row.longest,
        sortable: true,
      },
      {
        id: 'total',
        kind: 'duration',
        header: t('charts.endurance.totalHeld'),
        value: (row) => row.total,
        sortable: true,
      },
    ],
    [newWindowLinks, t],
  );

  // A cycle without a gesture had no lead, whatever its end: saying so needs no clock.
  const noGestures = hasRound && !isLoading && !isError && (gestures?.length ?? 0) === 0;
  const loading = hasRound && !noGestures && (isLoading || clock.status === 'loading');
  const ready = hasRound && !loading && !isError && clock.status === 'ready';
  const readout = useEnduranceReadout(ready && gantt.lanes.length > 0 ? gantt : null);
  const state = !hasRound ? (
    <EmptyState headingLevel={4} variant="inline" title={t('charts.endurance.selectCycle')} />
  ) : noGestures ? (
    <EmptyState headingLevel={4} variant="inline" title={t('charts.endurance.empty')} />
  ) : loading ? (
    // As many lanes as the server counted (or a page's worth), at most the lanes shown.
    <EnduranceGanttSkeleton
      lanes={Math.max(
        1,
        Math.min(
          expectedLanes && expectedLanes > 0 ? expectedLanes : DEFAULT_LANE_LIMIT,
          laneLimit ?? Number.POSITIVE_INFINITY,
        ),
      )}
    />
  ) : isError ? (
    <ErrorState
      headingLevel={4}
      title={t('charts.endurance.loadErrorTitle')}
      message={t('charts.endurance.loadErrorMessage')}
      onRetry={() => refetch()}
    />
  ) : clock.status === 'error' ? (
    // The cycle's end could not be read: its last stint is unknown, so nothing is drawn.
    <ErrorState
      headingLevel={4}
      title={t('charts.endurance.loadErrorTitle')}
      message={t('shared.serviceError')}
      onRetry={clock.retry}
    />
  ) : gantt.lanes.length === 0 ? (
    <EmptyState headingLevel={4} variant="inline" title={t('charts.endurance.empty')} />
  ) : null;

  // Gantt or lines swaps the whole plot: a view switch, so Tabs, not a segmented choice.
  return (
    <Tabs value={view} onValueChange={(next) => setView(next as 'gantt' | 'lines')}>
      <ChartFigure
        label={label}
        readout={loading || (ready && gantt.lanes.length > 0) ? readout : undefined}
        state={state}
        loading={loading}
        note={t('charts.endurance.note')}
        controls={
          <TabsList aria-label={t('charts.endurance.viewLabel')}>
            <TabsTrigger value="gantt">{t('charts.endurance.gantt')}</TabsTrigger>
            <TabsTrigger value="lines">{t('charts.endurance.lineChart')}</TabsTrigger>
          </TabsList>
        }
        table={<DataTable data={rows} columns={columns} ariaLabel={label} />}
      >
        <div data-testid="endurance-timeline-chart">
          <TabsContent value="gantt" className="mt-0">
            <EnduranceGanttView gantt={gantt} laneLimit={laneLimit} />
          </TabsContent>
          <TabsContent value="lines" className="mt-0">
            <EnduranceLineView points={timeline.points} />
          </TabsContent>
        </div>
      </ChartFigure>
    </Tabs>
  );
};

export default EnduranceTimelineChart;
