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
  Legend,
} from 'recharts';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatSeconds, shortenHex } from '@/utils';

import { Link } from '@/i18n/navigation';
import {
  getEnduranceGantt,
  getEnduranceTimeline,
  type EnduranceGantt,
  type EnduranceTimeline,
  type EnduranceTimelinePoint,
} from '@/utils/endurance';
import { useGestureListByCycle, useRoundInfo, useCurrentTime } from '@/hooks/useApiQuery';
import { useNow } from '@/hooks/useNow';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LEAD_COLOR = '#15bffd'; // cyan — ordinary lead stint
const ENDURANCE_COLOR = '#9C37FD'; // violet — endurance champion (longest single hold)
const CHRONO_COLOR = '#fb7185'; // rose — chrono warrior (longest reign)
const RECORD_COLOR = '#fbbf24'; // amber — a stint that set a new endurance record

const TICK_COUNT = 6;
const LANE_SCROLL_THRESHOLD = 14;

/** Compact "hours into round" label, e.g. "45m", "1.5h", "2d". */
function formatHoursTick(hours: number, locale: string = 'en'): string {
  const zh = locale === 'zh';
  if (hours >= 24) {
    const d = hours / 24;
    return `${Number.isInteger(d) ? d.toFixed(0) : d.toFixed(1)}${zh ? '天' : 'd'}`;
  }
  if (hours >= 1) {
    return `${Number.isInteger(hours) ? hours.toFixed(0) : hours.toFixed(1)}${zh ? '小时' : 'h'}`;
  }
  return `${Math.round(hours * 60)}${zh ? '分' : 'm'}`;
}

const pct = (v: number): string => `${Math.max(0, Math.min(100, v * 100))}%`;

function gridlineGradient(columns: number): string {
  return (
    `repeating-linear-gradient(to right,` +
    ` rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px,` +
    ` transparent 1px, transparent calc(100% / ${columns}))`
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function RoleBadge({
  color,
  label,
  children,
}: {
  color: string;
  /** Full role name announced to assistive tech in place of the abbreviation. */
  label: string;
  children: string;
}) {
  return (
    <span
      className="rounded px-1 py-px text-[9px] font-semibold leading-none"
      style={{ backgroundColor: `${color}26`, color }}
      title={label}
      aria-label={label}
    >
      <span aria-hidden>{children}</span>
    </span>
  );
}

const LINE_CHART_HEIGHT = 360;

/** Compact duration for the line chart's Y-axis ticks, e.g. "45m", "1.5h", "2d". */
function formatDurationTick(secs: number, locale: string = 'en'): string {
  const zh = locale === 'zh';
  if (secs <= 0) return '0';
  if (secs >= 86400) {
    const d = secs / 86400;
    return `${Number.isInteger(d) ? d.toFixed(0) : d.toFixed(1)}${zh ? '天' : 'd'}`;
  }
  if (secs >= 3600) {
    const h = secs / 3600;
    return `${Number.isInteger(h) ? h.toFixed(0) : h.toFixed(1)}${zh ? '小时' : 'h'}`;
  }
  return `${Math.round(secs / 60)}${zh ? '分' : 'm'}`;
}

type TimelineTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: EnduranceTimelinePoint }>;
};

function TimelineTooltip({ active, payload }: TimelineTooltipProps) {
  const t = useTranslations('statistics');
  const locale = useLocale();
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  const rows = [
    { color: LEAD_COLOR, name: t('charts.endurance.currentLeadWindow'), value: point.lead },
    {
      color: ENDURANCE_COLOR,
      name: t('charts.endurance.enduranceRecord'),
      value: point.enduranceRecord,
    },
    { color: CHRONO_COLOR, name: t('charts.endurance.chronoRecord'), value: point.chronoRecord },
  ];

  return (
    <div className="rounded-lg border border-white/10 bg-[#0d1117]/95 px-3 py-2 text-sm shadow-lg">
      <p className="mb-2 font-medium text-white">
        {t('charts.endurance.intoCycle', {
          duration: formatHoursTick(point.hoursIntoRound, locale),
        })}
      </p>
      <dl className="space-y-1 text-muted-foreground">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: row.color }}
              />
              {row.name}
            </dt>
            <dd className="text-white">{formatSeconds(row.value, locale)}</dd>
          </div>
        ))}
        <div className="mt-1 flex justify-between gap-4 border-t border-white/10 pt-1">
          <dt>{t('charts.endurance.leadHeldBy')}</dt>
          <dd className="font-mono text-white">{shortenHex(point.leader, 4)}</dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * Line view: the live lead window (cyan sawtooth) plus the two monotonic record
 * lines (endurance + chrono). Memoized on `points` so it doesn't repaint on the
 * page's periodic re-renders.
 */
const EnduranceLineView = memo(function EnduranceLineView({
  points,
}: {
  points: EnduranceTimelinePoint[];
}) {
  const t = useTranslations('statistics');
  const locale = useLocale();

  return (
    <ResponsiveContainer width="100%" height={LINE_CHART_HEIGHT}>
      <ComposedChart data={points} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis
          dataKey="hoursIntoRound"
          type="number"
          domain={[0, 'dataMax']}
          tickFormatter={(h) => formatHoursTick(Number(h), locale)}
          tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
          interval="preserveStartEnd"
          minTickGap={32}
          label={{
            value: t('charts.endurance.timeIntoCycle'),
            position: 'insideBottom',
            offset: -4,
            fill: 'rgba(255,255,255,0.45)',
            fontSize: 11,
          }}
        />
        <YAxis
          tickFormatter={(v) => formatDurationTick(Number(v), locale)}
          tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
          width={48}
        />
        <Tooltip
          content={<TimelineTooltip />}
          isAnimationActive={false}
          allowEscapeViewBox={{ x: false, y: false }}
          wrapperStyle={{ pointerEvents: 'none', zIndex: 10 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="linear"
          dataKey="lead"
          name={t('charts.endurance.currentLeadWindow')}
          stroke={LEAD_COLOR}
          fill={LEAD_COLOR}
          fillOpacity={0.18}
          strokeWidth={1}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="stepAfter"
          dataKey="enduranceRecord"
          name={t('charts.endurance.enduranceChampionRecord')}
          stroke={ENDURANCE_COLOR}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="stepAfter"
          dataKey="chronoRecord"
          name={t('charts.endurance.chronoRecord')}
          stroke={CHRONO_COLOR}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
});

/**
 * Pure DOM Gantt, memoized on `gantt`. Each row is an address; each bar is a lead
 * stint positioned on a shared time axis with width = hold duration. Being plain
 * DOM (no SVG/canvas) it never repaints/flashes on the page's periodic re-renders.
 */
const EnduranceGanttView = memo(function EnduranceGanttView({ gantt }: { gantt: EnduranceGantt }) {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const durHours = gantt.roundDurationSeconds / 3600;
  const manyLanes = gantt.lanes.length > LANE_SCROLL_THRESHOLD;
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => i);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <LegendDot color={ENDURANCE_COLOR} label={t('charts.endurance.legendEndurance')} />
        <LegendDot color={CHRONO_COLOR} label={t('charts.endurance.legendChrono')} />
        <LegendDot color={LEAD_COLOR} label={t('charts.endurance.legendLead')} />
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ boxShadow: `inset 0 0 0 1.5px ${RECORD_COLOR}` }}
          />
          {t('charts.endurance.legendNewRecord')}
        </span>
      </div>

      {/* Time axis (aligned to the bar tracks, not the label column). */}
      <div className="flex items-center gap-3">
        <div className="w-36 shrink-0" />
        <div className="relative h-4 flex-1">
          {ticks.map((i) => {
            const transform =
              i === 0
                ? 'translateX(0)'
                : i === TICK_COUNT
                  ? 'translateX(-100%)'
                  : 'translateX(-50%)';
            return (
              <span
                key={i}
                className="absolute top-0 text-[10px] text-muted-foreground"
                style={{ left: pct(i / TICK_COUNT), transform }}
              >
                {formatHoursTick((durHours * i) / TICK_COUNT, locale)}
              </span>
            );
          })}
        </div>
      </div>

      <div className={manyLanes ? 'max-h-[520px] overflow-y-auto pr-1' : ''}>
        <div className="space-y-1.5">
          {gantt.lanes.map((lane) => (
            <div key={lane.address} className="flex items-center gap-3">
              <div className="flex w-36 shrink-0 items-center gap-1.5 overflow-hidden">
                <span className="truncate font-mono text-xs text-white" title={lane.address}>
                  {shortenHex(lane.address, 4)}
                </span>
                {lane.isEnduranceChampion ? (
                  <RoleBadge
                    color={ENDURANCE_COLOR}
                    label={t('charts.endurance.enduranceChampion')}
                  >
                    {t('charts.endurance.enduranceChampionAbbr')}
                  </RoleBadge>
                ) : null}
                {lane.isChronoWarrior ? (
                  <RoleBadge color={CHRONO_COLOR} label={t('charts.endurance.chronoWarrior')}>
                    {t('charts.endurance.chronoWarriorAbbr')}
                  </RoleBadge>
                ) : null}
              </div>
              <div
                className="relative h-5 flex-1 overflow-hidden rounded bg-white/[0.03]"
                style={{ backgroundImage: gridlineGradient(TICK_COUNT) }}
              >
                {lane.stints.map((stint, i) => {
                  const color = stint.isEnduranceChampion
                    ? ENDURANCE_COLOR
                    : lane.isChronoWarrior
                      ? CHRONO_COLOR
                      : LEAD_COLOR;
                  // The champion's violet fill already marks the final record; ring the
                  // earlier record-setters in amber so each "new record" moment stands out.
                  const ringRecord = stint.isRecord && !stint.isEnduranceChampion;
                  return (
                    <div
                      key={i}
                      title={t('charts.endurance.stintAria', {
                        address: shortenHex(lane.address, 6),
                        duration: formatSeconds(stint.durationSeconds, locale),
                        from: formatHoursTick(stint.startHours, locale),
                        to: formatHoursTick(stint.startHours + stint.durationHours, locale),
                        role: stint.isEnduranceChampion
                          ? t('charts.endurance.roleEndurance')
                          : stint.isRecord
                            ? t('charts.endurance.roleNewRecord')
                            : '',
                      })}
                      // Focusable so keyboard and screen-reader users can step
                      // through stints; `title` alone is hover-only.
                      tabIndex={0}
                      role="img"
                      aria-label={t('charts.endurance.stintAria', {
                        address: shortenHex(lane.address, 6),
                        duration: formatSeconds(stint.durationSeconds, locale),
                        from: formatHoursTick(stint.startHours, locale),
                        to: formatHoursTick(stint.startHours + stint.durationHours, locale),
                        role: stint.isEnduranceChampion
                          ? t('charts.endurance.roleEndurance')
                          : stint.isRecord
                            ? t('charts.endurance.roleNewRecord')
                            : '',
                      })}
                      className="absolute top-0.5 bottom-0.5 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
                      style={{
                        left: pct(stint.startHours / durHours),
                        width: pct(stint.durationHours / durHours),
                        minWidth: ringRecord ? 3 : 2,
                        background: color,
                        opacity: stint.isEnduranceChampion ? 0.95 : ringRecord ? 0.9 : 0.72,
                        boxShadow: ringRecord ? `inset 0 0 0 1.5px ${RECORD_COLOR}` : undefined,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{t('charts.endurance.description')}</p>
    </div>
  );
});

type EnduranceTimelineChartProps = {
  round: number;
  /** True when `round` is the in-progress round (open-ended at "now"). */
  isLive: boolean;
};

/**
 * Per-round endurance/chrono Gantt, reconstructed client-side from the round's
 * gesture list.
 */
const EnduranceTimelineChart: FC<EnduranceTimelineChartProps> = ({ round, isLive }) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const hasRound = round >= 0;
  const { data: gestures, isLoading, isError, refetch } = useGestureListByCycle(round, 'asc');

  // Finalized rounds end at their claim timestamp; the live round stays open at "now".
  const { data: roundInfo } = useRoundInfo(hasRound && !isLive ? round : -1);
  const { data: serverNow } = useCurrentTime();
  const clientNow = Math.floor(useNow(60_000) / 1000);
  const nowSec = serverNow && serverNow > 0 ? serverNow : clientNow;

  const roundEndTs = !isLive && roundInfo?.TimeStamp ? roundInfo.TimeStamp : 0;

  // Only the live round depends on "now"; quantize to whole minutes so the memo
  // (and the chart) updates at most once a minute, never on the 12s poll tick.
  const nowForCalc = isLive ? Math.floor(nowSec / 60) * 60 : 0;
  const gantt = useMemo(
    () => getEnduranceGantt(gestures ?? [], roundEndTs, nowForCalc),
    [gestures, roundEndTs, nowForCalc],
  );
  const timeline: EnduranceTimeline = useMemo(
    () => getEnduranceTimeline(gestures ?? [], roundEndTs, nowForCalc),
    [gestures, roundEndTs, nowForCalc],
  );

  if (!hasRound) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {t('charts.endurance.selectCycle')}
      </p>
    );
  }
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }
  if (isError) {
    return (
      <ErrorState
        title={t('charts.endurance.loadErrorTitle')}
        message={t('charts.endurance.loadErrorMessage')}
        onRetry={() => refetch()}
      />
    );
  }
  if (gantt.lanes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {t('charts.endurance.empty')}
      </p>
    );
  }

  return (
    <div className="space-y-3" data-testid="endurance-timeline-chart">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span className="text-muted-foreground">
          {t('charts.endurance.championSummary', {
            address: shortenHex(gantt.enduranceChampionAddress, 4),
            duration: formatSeconds(gantt.enduranceChampionStintSeconds, locale),
          })}
        </span>
        <span className="text-muted-foreground">
          {t('charts.endurance.chronoSummary', {
            address: shortenHex(gantt.chronoWarriorAddress, 4),
            duration: formatSeconds(gantt.chronoWarriorSeconds, locale),
          })}
        </span>
      </div>

      <Tabs defaultValue="gantt" className="w-full">
        <TabsList>
          <TabsTrigger value="gantt">{t('charts.endurance.gantt')}</TabsTrigger>
          <TabsTrigger value="lines">{t('charts.endurance.lineChart')}</TabsTrigger>
        </TabsList>
        <TabsContent value="gantt" className="mt-4">
          <EnduranceGanttView gantt={gantt} />
        </TabsContent>
        <TabsContent value="lines" className="mt-4">
          <EnduranceLineView points={timeline.points} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

type EnduranceTimelineSectionProps = {
  /** The current in-progress round number (from dashboard CurRoundNum). */
  currentRoundNum: number;
};

/**
 * Round picker + endurance/chrono Gantt. Defaults to the current round and lets
 * you step back through finalized rounds to compare their endurance shapes.
 */
export const EnduranceTimelineSection: FC<EnduranceTimelineSectionProps> = ({
  currentRoundNum,
}) => {
  const t = useTranslations('statistics');
  const maxRound = Math.max(0, currentRoundNum);
  // `null` means "follow the live round": the selection is derived from
  // currentRoundNum until the user explicitly navigates, so a new live round
  // (or a late-arriving dashboard response) is picked up automatically.
  const [pinnedRound, setPinnedRound] = useState<number | null>(null);
  const selectedRound = pinnedRound === null ? maxRound : Math.min(pinnedRound, maxRound);
  const setSelectedRound = (round: number) => {
    const clamped = Math.min(Math.max(0, round), maxRound);
    setPinnedRound(clamped >= maxRound ? null : clamped);
  };

  const isLive = selectedRound >= currentRoundNum;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {t('charts.endurance.cycle')}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label={t('charts.endurance.previousCycleAria')}
            disabled={selectedRound <= 0}
            onClick={() => setSelectedRound(selectedRound - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <input
            type="number"
            min={0}
            max={maxRound}
            value={selectedRound}
            aria-label={t('charts.endurance.cycleNumberAria')}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next)) {
                setSelectedRound(Math.floor(next));
              }
            }}
            className="w-20 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-center text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label={t('charts.endurance.nextCycleAria')}
            disabled={selectedRound >= maxRound}
            onClick={() => setSelectedRound(selectedRound + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {isLive ? (
          <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {t('charts.endurance.liveCycle')}
          </span>
        ) : (
          <Button type="button" size="sm" variant="ghost" onClick={() => setPinnedRound(null)}>
            {t('charts.endurance.jumpLive')}
          </Button>
        )}
        <Link
          href={`/embed/endurance/${selectedRound}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('charts.endurance.openWindowAria')}
          title={t('charts.endurance.openWindowTitle')}
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      <EnduranceTimelineChart round={selectedRound} isLive={isLive} />
    </div>
  );
};

export default EnduranceTimelineChart;
