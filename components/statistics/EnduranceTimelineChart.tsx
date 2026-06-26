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

import { formatSeconds, shortenHex } from '@/utils';

import {
  getEnduranceGantt,
  getEnduranceTimeline,
  type EnduranceGantt,
  type EnduranceStint,
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
function formatHoursTick(hours: number): string {
  if (hours >= 24) {
    const d = hours / 24;
    return `${Number.isInteger(d) ? d.toFixed(0) : d.toFixed(1)}d`;
  }
  if (hours >= 1) {
    return `${Number.isInteger(hours) ? hours.toFixed(0) : hours.toFixed(1)}h`;
  }
  return `${Math.round(hours * 60)}m`;
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

function RoleBadge({ color, children }: { color: string; children: string }) {
  return (
    <span
      className="rounded px-1 py-px text-[9px] font-semibold leading-none"
      style={{ backgroundColor: `${color}26`, color }}
    >
      {children}
    </span>
  );
}

function stintTitle(stint: EnduranceStint, address: string): string {
  const from = formatHoursTick(stint.startHours);
  const to = formatHoursTick(stint.startHours + stint.durationHours);
  const role = stint.isEnduranceChampion
    ? ' (Endurance Champion)'
    : stint.isRecord
      ? ' (new record)'
      : '';
  return `${shortenHex(address, 6)} • held ${formatSeconds(stint.durationSeconds)} • ${from} → ${to} into round${role}`;
}

const LINE_CHART_HEIGHT = 360;

/** Compact duration for the line chart's Y-axis ticks, e.g. "45m", "1.5h", "2d". */
function formatDurationTick(secs: number): string {
  if (secs <= 0) return '0';
  if (secs >= 86400) {
    const d = secs / 86400;
    return `${Number.isInteger(d) ? d.toFixed(0) : d.toFixed(1)}d`;
  }
  if (secs >= 3600) {
    const h = secs / 3600;
    return `${Number.isInteger(h) ? h.toFixed(0) : h.toFixed(1)}h`;
  }
  return `${Math.round(secs / 60)}m`;
}

type TimelineTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: EnduranceTimelinePoint }>;
};

function TimelineTooltip({ active, payload }: TimelineTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  const rows = [
    { color: LEAD_COLOR, name: 'Current lead window', value: point.lead },
    { color: ENDURANCE_COLOR, name: 'Endurance record', value: point.enduranceRecord },
    { color: CHRONO_COLOR, name: 'Chrono-warrior record', value: point.chronoRecord },
  ];

  return (
    <div className="rounded-lg border border-white/10 bg-[#0d1117]/95 px-3 py-2 text-sm shadow-lg">
      <p className="mb-2 font-medium text-white">
        {formatHoursTick(point.hoursIntoRound)} into round
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
            <dd className="text-white">{formatSeconds(row.value) || '0s'}</dd>
          </div>
        ))}
        <div className="mt-1 flex justify-between gap-4 border-t border-white/10 pt-1">
          <dt>Lead held by</dt>
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
  return (
    <ResponsiveContainer width="100%" height={LINE_CHART_HEIGHT}>
      <ComposedChart data={points} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis
          dataKey="hoursIntoRound"
          type="number"
          domain={[0, 'dataMax']}
          tickFormatter={(h) => formatHoursTick(Number(h))}
          tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
          interval="preserveStartEnd"
          minTickGap={32}
          label={{
            value: 'Time into round',
            position: 'insideBottom',
            offset: -4,
            fill: 'rgba(255,255,255,0.45)',
            fontSize: 11,
          }}
        />
        <YAxis
          tickFormatter={(v) => formatDurationTick(Number(v))}
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
          name="Current lead window"
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
          name="Endurance champion record"
          stroke={ENDURANCE_COLOR}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="stepAfter"
          dataKey="chronoRecord"
          name="Chrono-warrior record"
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
  const durHours = gantt.roundDurationSeconds / 3600;
  const manyLanes = gantt.lanes.length > LANE_SCROLL_THRESHOLD;
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => i);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <LegendDot color={ENDURANCE_COLOR} label="Endurance champion (longest single hold)" />
        <LegendDot color={CHRONO_COLOR} label="Chrono-warrior (longest reign)" />
        <LegendDot color={LEAD_COLOR} label="Lead held" />
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ boxShadow: `inset 0 0 0 1.5px ${RECORD_COLOR}` }}
          />
          New record set
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
                {formatHoursTick((durHours * i) / TICK_COUNT)}
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
                  <RoleBadge color={ENDURANCE_COLOR}>EC</RoleBadge>
                ) : null}
                {lane.isChronoWarrior ? <RoleBadge color={CHRONO_COLOR}>CW</RoleBadge> : null}
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
                      title={stintTitle(stint, lane.address)}
                      className="absolute top-0.5 bottom-0.5 rounded-sm"
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

      <p className="text-xs text-muted-foreground">
        Each bar is a lead stint — an address holding the lead from one gesture until the next
        gesture arrives. Bar width is how long they held the lead. Amber-outlined bars set a new
        endurance record at the time; the violet bar is the single longest hold of all (Endurance
        Champion); the rose lane held the title longest overall (Chrono-Warrior). Hover a bar for
        details.
      </p>
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
      <p className="py-8 text-center text-sm text-muted-foreground">Select a round to inspect.</p>
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
        title="Failed to load endurance timeline"
        message="Could not fetch the gesture history for this round."
        onRetry={() => refetch()}
      />
    );
  }
  if (gantt.lanes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No lead activity in this round yet.
      </p>
    );
  }

  return (
    <div className="space-y-3" data-testid="endurance-timeline-chart">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span className="text-muted-foreground">
          Endurance champion:{' '}
          <span className="font-mono text-white">
            {shortenHex(gantt.enduranceChampionAddress, 4)}
          </span>{' '}
          held{' '}
          <span className="font-medium text-white">
            {formatSeconds(gantt.enduranceChampionStintSeconds) || '0s'}
          </span>
        </span>
        <span className="text-muted-foreground">
          Chrono-warrior:{' '}
          <span className="font-mono text-white">{shortenHex(gantt.chronoWarriorAddress, 4)}</span>{' '}
          reigned{' '}
          <span className="font-medium text-white">
            {formatSeconds(gantt.chronoWarriorSeconds) || '0s'}
          </span>
        </span>
      </div>

      <Tabs defaultValue="gantt" className="w-full">
        <TabsList>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
          <TabsTrigger value="lines">Line chart</TabsTrigger>
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
  const maxRound = Math.max(0, currentRoundNum);
  // This section only mounts after the dashboard has resolved, so currentRoundNum is
  // already valid here; the initial selection is the live round.
  const [selectedRound, setSelectedRound] = useState<number>(maxRound);

  const isLive = selectedRound >= currentRoundNum;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Round</span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Previous round"
            disabled={selectedRound <= 0}
            onClick={() => setSelectedRound((r) => Math.max(0, r - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <input
            type="number"
            min={0}
            max={maxRound}
            value={selectedRound}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next)) {
                setSelectedRound(Math.min(Math.max(0, Math.floor(next)), maxRound));
              }
            }}
            className="w-20 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-center text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Next round"
            disabled={selectedRound >= maxRound}
            onClick={() => setSelectedRound((r) => Math.min(maxRound, r + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {isLive ? (
          <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Live round
          </span>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setSelectedRound(maxRound)}
          >
            Jump to live
          </Button>
        )}
        <a
          href={`/embed/endurance/${selectedRound}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open chart in a new window"
          title="Open in new window"
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <EnduranceTimelineChart round={selectedRound} isLive={isLive} />
    </div>
  );
};

export default EnduranceTimelineChart;
