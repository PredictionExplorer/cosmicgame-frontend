'use client';

import { memo, useMemo, useState, type FC } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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
import { useGestureListByCycle, useRoundInfo, useCurrentTime } from '@/hooks/useApiQuery';
import { useNow } from '@/hooks/useNow';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonChart } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ChartFigure } from './charts/ChartFigure';
import { ChartLegend } from './charts/ChartLegend';
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
import { useRovingStints } from './charts/useRovingStints';

const LINE_CHART_HEIGHT = 320;
/** Lanes shown before the list scrolls inside its own frame. */
const LANE_SCROLL_THRESHOLD = 14;

const pct = (v: number): string => `${Math.max(0, Math.min(100, v * 100))}%`;

/** A stint's colour: the champion's record hold, the Chrono-Warrior's lane, or an ordinary lead. */
function stintColor(stint: EnduranceStint, lane: EnduranceLane): string {
  if (stint.isEnduranceChampion) return SERIES_COLOR.endurance;
  if (lane.isChronoWarrior) return SERIES_COLOR.chrono;
  return SERIES_COLOR.lead;
}

/**
 * A lane's role, as a short visible abbreviation with its full name for
 * assistive technology (an `abbr` with a sr-only expansion, never a bare
 * `aria-label` on a span).
 */
function RoleTag({ abbr, name, color }: { abbr: string; name: string; color: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-edge border border-rule px-1 type-caption leading-4 text-muted-foreground">
      <span aria-hidden className="size-1.5 rounded-pill" style={{ backgroundColor: color }} />
      <abbr title={name} className="no-underline" aria-hidden>
        {abbr}
      </abbr>
      <span className="sr-only">{name}</span>
    </span>
  );
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
      <ResponsiveContainer width="100%" height={LINE_CHART_HEIGHT}>
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
            width={44}
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
      </ResponsiveContainer>
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
 * Who held the lead, and for how long: a lane per address on one time axis
 * (a shared grid, so the axis and the lanes cannot drift apart at any
 * width), each bar a hold from one gesture to the next. One tab stop; the
 * arrow keys step through holds and lanes, and the focused or hovered hold
 * reads out below.
 */
const EnduranceGanttView = memo(function EnduranceGanttView({ gantt }: { gantt: EnduranceGantt }) {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const durHours = Math.max(gantt.roundDurationSeconds / 3600, 1 / 60);
  const axis = useElapsedHoursAxis(durHours);
  const counts = useMemo(() => gantt.lanes.map((lane) => lane.stints.length), [gantt.lanes]);
  const roving = useRovingStints(counts);
  const [readout, setReadout] = useState<{ lane: EnduranceLane; stint: EnduranceStint } | null>(
    null,
  );
  const manyLanes = gantt.lanes.length > LANE_SCROLL_THRESHOLD;

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

  // The end padding keeps a focused stint's ring, drawn outside the lane's
  // last stint, clear of the scrolling frame's edge.
  const grid = 'grid grid-cols-[minmax(6.5rem,10rem)_minmax(0,1fr)] gap-x-3 pe-1';

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

      <div className={cn(grid, 'border-b border-rule pb-2')} aria-hidden>
        <span />
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
        className={cn(
          manyLanes &&
            'max-h-[34rem] overflow-y-auto overscroll-y-contain pb-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-2rem),transparent)]',
        )}
        tabIndex={manyLanes ? -1 : undefined}
      >
        <div
          role="group"
          aria-label={t('charts.endurance.ganttLabel')}
          onKeyDown={roving.onKeyDown}
          onMouseLeave={() => setReadout(null)}
        >
          {gantt.lanes.map((lane, row) => (
            <div
              key={lane.address}
              role="group"
              aria-label={t('charts.endurance.laneLabel', {
                address: formatAddress(lane.address),
                count: lane.stints.length,
                longest: formatSeconds(lane.maxStintSeconds, locale),
              })}
              className={cn(
                grid,
                'border-b border-rule-faint py-1.5 transition-colors duration-fast',
                TIMELINE_LANE_FOCUS_CLASS,
              )}
            >
              {/* The address stays whole; a title's tags sit on their own line under it. */}
              <div className="flex min-w-0 flex-col justify-center gap-1">
                <span className="truncate type-mono text-foreground" title={lane.address}>
                  {formatAddress(lane.address)}
                </span>
                {lane.isEnduranceChampion || lane.isChronoWarrior ? (
                  <span className="flex flex-wrap gap-1">
                    {lane.isEnduranceChampion ? (
                      <RoleTag
                        abbr={t('charts.endurance.enduranceChampionAbbr')}
                        name={t('charts.endurance.enduranceChampion')}
                        color={SERIES_COLOR.endurance}
                      />
                    ) : null}
                    {lane.isChronoWarrior ? (
                      <RoleTag
                        abbr={t('charts.endurance.chronoWarriorAbbr')}
                        name={t('charts.endurance.chronoWarrior')}
                        color={SERIES_COLOR.chrono}
                      />
                    ) : null}
                  </span>
                ) : null}
              </div>
              {/* No clipping: a focused stint draws its ring outside itself. */}
              <div className="relative min-h-6 self-center rounded-edge bg-surface-sunken">
                {axis.ticks.slice(1).map((tick) => (
                  <span
                    key={tick}
                    aria-hidden
                    className="absolute inset-y-0 w-px bg-rule-faint"
                    style={{ left: pct(tick / durHours) }}
                  />
                ))}
                {lane.stints.map((stint, item) => {
                  const ringRecord = stint.isRecord && !stint.isEnduranceChampion;
                  const active = readout?.stint === stint;
                  return (
                    <span
                      key={item}
                      ref={roving.markRef(row, item)}
                      role="img"
                      aria-label={describe(lane, stint)}
                      tabIndex={roving.isCurrent(row, item) ? 0 : -1}
                      onFocus={() => {
                        roving.setCurrent({ row, item });
                        setReadout({ lane, stint });
                      }}
                      onMouseEnter={() => setReadout({ lane, stint })}
                      className={cn(
                        TIMELINE_MARK_CLASS,
                        'inset-y-1 rounded-edge transition-opacity duration-fast',
                        ringRecord ? '[--mark-min:3px]' : '[--mark-min:2px]',
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
      </div>

      <p aria-live="polite" className="min-h-5 type-body-sm text-muted-foreground">
        {readout ? describe(readout.lane, readout.stint) : t('charts.endurance.hint')}
      </p>
    </div>
  );
});

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
};

/**
 * One cycle's lead history, reconstructed from its gesture list: who held
 * the lead and for how long (Gantt), or the two records as lines. The
 * summary names the Endurance Champion and the Chrono-Warrior; the table
 * lists every address that held the lead.
 */
const EnduranceTimelineChart: FC<EnduranceTimelineChartProps> = ({ round, isLive, label }) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const hasRound = round >= 0;
  const { data: gestures, isLoading, isError, refetch } = useGestureListByCycle(round, 'asc');
  const [view, setView] = useState<'gantt' | 'lines'>('gantt');

  // Finalized rounds end at their claim timestamp; the live round stays open at "now".
  const { data: roundInfo } = useRoundInfo(hasRound && !isLive ? round : -1);
  const { data: serverNow } = useCurrentTime();
  const clientNow = Math.floor(useNow(60_000) / 1000);
  const nowSec = serverNow && serverNow > 0 ? serverNow : clientNow;
  const roundEndTs = !isLive && roundInfo?.TimeStamp ? roundInfo.TimeStamp : 0;
  // Only the live round depends on "now"; quantize to whole minutes so the
  // chart redraws at most once a minute, never on the 12s poll tick.
  const nowForCalc = isLive ? Math.floor(nowSec / 60) * 60 : 0;

  const gantt = useMemo(
    () => getEnduranceGantt(gestures ?? [], roundEndTs, nowForCalc),
    [gestures, roundEndTs, nowForCalc],
  );
  const timeline = useMemo(
    () => getEnduranceTimeline(gestures ?? [], roundEndTs, nowForCalc),
    [gestures, roundEndTs, nowForCalc],
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
    [t],
  );

  const state = !hasRound ? (
    <EmptyState headingLevel={4} variant="inline" title={t('charts.endurance.selectCycle')} />
  ) : isLoading ? (
    <SkeletonChart height={LINE_CHART_HEIGHT} bars={18} />
  ) : isError ? (
    <ErrorState
      headingLevel={4}
      title={t('charts.endurance.loadErrorTitle')}
      message={t('charts.endurance.loadErrorMessage')}
      onRetry={() => refetch()}
    />
  ) : gantt.lanes.length === 0 ? (
    <EmptyState headingLevel={4} variant="inline" title={t('charts.endurance.empty')} />
  ) : null;

  // Gantt or lines swaps the whole plot: a view switch, so Tabs, not a segmented choice.
  return (
    <Tabs value={view} onValueChange={(next) => setView(next as 'gantt' | 'lines')}>
      <ChartFigure
        label={label}
        summary={
          gantt.lanes.length > 0 ? (
            <>
              <span className="block">
                {t('charts.endurance.championSummary', {
                  address: formatAddress(gantt.enduranceChampionAddress),
                  duration: formatSeconds(gantt.enduranceChampionStintSeconds, locale),
                })}
              </span>
              <span className="block">
                {t('charts.endurance.chronoSummary', {
                  address: formatAddress(gantt.chronoWarriorAddress),
                  duration: formatSeconds(gantt.chronoWarriorSeconds, locale),
                })}
              </span>
            </>
          ) : undefined
        }
        state={state}
        note={t('charts.endurance.description')}
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
            <EnduranceGanttView gantt={gantt} />
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
