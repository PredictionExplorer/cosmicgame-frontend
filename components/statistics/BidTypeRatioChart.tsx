'use client';

// lexicon-allow-start: internal analytics identifiers mirror backend wire names
import { memo, useMemo, useState, type FC } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { formatUnixTsLabel } from '@/utils';

import { useBidTypeRatio, useCurrentTime } from '@/hooks/useApiQuery';
import { useNow } from '@/hooks/useNow';
import type { BidTypeRatioBucket } from '@/services/api/types';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';

const CHART_HEIGHT = 340;

// bid_type mapping: 0=ETH, 1=RandomWalk (ETH-paid), 2=CST
const ETH_COLOR = '#627eea';
const RWALK_COLOR = '#9C37FD';
const CST_COLOR = '#15bffd';

const DAY_SECS = 86400;

type IntervalOption = { label: string; secs: number };
const INTERVAL_OPTIONS: IntervalOption[] = [
  { label: '1h', secs: 3600 },
  { label: '6h', secs: 21600 },
  { label: '12h', secs: 43200 },
  { label: '1d', secs: 86400 },
];

// Recharts Area "type" controls how control points are connected. Linear is the
// default per spec; "step" holds each value flat across the window, "monotone"
// draws a smooth curve.
type InterpolationOption = { label: string; type: 'linear' | 'step' | 'monotone' };
const INTERPOLATION_OPTIONS: InterpolationOption[] = [
  { label: 'Linear', type: 'linear' },
  { label: 'Step', type: 'step' },
  { label: 'Smooth', type: 'monotone' },
];

type ChartPoint = {
  bucketTs: number;
  label: string;
  ethPct: number;
  rwalkPct: number;
  cstPct: number;
  ethBids: number;
  rwalkBids: number;
  cstBids: number;
  totalBids: number;
};

function toChartPoints(records: BidTypeRatioBucket[], withTime: boolean): ChartPoint[] {
  return records.map((r) => ({
    bucketTs: r.BucketTs,
    label: formatUnixTsLabel(r.BucketTs, withTime),
    ethPct: r.EthPct ?? 0,
    rwalkPct: r.RwalkPct ?? 0,
    cstPct: r.CstPct ?? 0,
    ethBids: r.EthBids ?? 0,
    rwalkBids: r.RwalkBids ?? 0,
    cstBids: r.CstBids ?? 0,
    totalBids: r.TotalBids ?? 0,
  }));
}

type RatioTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ChartPoint }>;
};

function RatioTooltip({ active, payload }: RatioTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  const rows: Array<{ color: string; name: string; pct: number; bids: number }> = [
    { color: ETH_COLOR, name: 'ETH', pct: point.ethPct, bids: point.ethBids },
    { color: RWALK_COLOR, name: 'RandomWalk', pct: point.rwalkPct, bids: point.rwalkBids },
    { color: CST_COLOR, name: 'CST', pct: point.cstPct, bids: point.cstBids },
  ];

  return (
    <div className="rounded-lg border border-white/10 bg-[#0d1117]/95 px-3 py-2 text-sm shadow-lg">
      <p className="mb-2 font-medium text-white">{point.label}</p>
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
            <dd className="text-white">
              {row.pct.toFixed(2)}% <span className="text-muted-foreground">({row.bids})</span>
            </dd>
          </div>
        ))}
        <div className="mt-1 flex justify-between gap-4 border-t border-white/10 pt-1">
          <dt>Total gestures</dt>
          <dd className="text-white">{point.totalBids}</dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * Pure Recharts view, memoized on its props. Isolating it keeps the chart from
 * repainting on every 12s parent re-render (the dashboard poll) — it only redraws
 * when the data, interpolation, or axis granularity actually change.
 */
const RatioAreaChart = memo(function RatioAreaChart({
  data,
  interpolation,
  withTime,
}: {
  data: ChartPoint[];
  interpolation: InterpolationOption['type'];
  withTime: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis
          dataKey="bucketTs"
          tickFormatter={(ts) => formatUnixTsLabel(Number(ts), withTime)}
          tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
          interval="preserveStartEnd"
          minTickGap={withTime ? 48 : 24}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
          width={44}
        />
        <Tooltip
          content={<RatioTooltip />}
          isAnimationActive={false}
          allowEscapeViewBox={{ x: false, y: false }}
          wrapperStyle={{ pointerEvents: 'none', zIndex: 10 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area
          type={interpolation}
          dataKey="ethPct"
          name="ETH"
          stackId="ratio"
          stroke={ETH_COLOR}
          fill={ETH_COLOR}
          fillOpacity={0.7}
          isAnimationActive={false}
        />
        <Area
          type={interpolation}
          dataKey="rwalkPct"
          name="RandomWalk"
          stackId="ratio"
          stroke={RWALK_COLOR}
          fill={RWALK_COLOR}
          fillOpacity={0.7}
          isAnimationActive={false}
        />
        <Area
          type={interpolation}
          dataKey="cstPct"
          name="CST"
          stackId="ratio"
          stroke={CST_COLOR}
          fill={CST_COLOR}
          fillOpacity={0.7}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

type BidTypeRatioChartProps = {
  /** Unix seconds for the start of the current round (from dashboard TsRoundStart). */
  roundStartTs: number;
  enabled?: boolean;
};

/**
 * 100% stacked area chart of bid-type composition (ETH / RandomWalk / CST) for
 * the current round only, sampled at a user-selected interval. Percentages are
 * per-interval (windowed); windows with no gestures dip to baseline.
 */
export const BidTypeRatioChart: FC<BidTypeRatioChartProps> = ({ roundStartTs, enabled = true }) => {
  const [intervalSecs, setIntervalSecs] = useState<number>(21600); // 6h
  const [interpolation, setInterpolation] = useState<InterpolationOption['type']>('monotone'); // Smooth

  // Round end / "now" comes from the backend (chain pending-block time), with a
  // client-clock fallback so the chart still renders if that request fails.
  const { data: serverNow } = useCurrentTime();
  const clientNow = Math.floor(useNow(60_000) / 1000);
  const nowSec = serverNow && serverNow > 0 ? serverNow : clientNow;

  const hasRound = roundStartTs > 0;
  const fromTs = roundStartTs;
  // Align the window's end to the bucket grid so the query key only changes when
  // "now" crosses into a new bucket — not on every 12s clock tick. Previously the
  // key churned each tick, dropping `data` to undefined and blanking the chart
  // (a visible flash) before it refetched.
  const spanBuckets = Math.max(1, Math.ceil((nowSec - fromTs) / intervalSecs));
  const toTs = fromTs + spanBuckets * intervalSecs;

  const { data, isLoading, isError, refetch } = useBidTypeRatio(
    fromTs,
    toTs,
    intervalSecs,
    enabled && hasRound,
  );

  const withTime = intervalSecs < DAY_SECS;
  const chartData = useMemo(() => toChartPoints(data ?? [], withTime), [data, withTime]);

  return (
    <div className="space-y-4" data-testid="bid-type-ratio-chart">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Sample every
          </span>
          {INTERVAL_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              type="button"
              size="sm"
              variant={intervalSecs === opt.secs ? 'default' : 'outline'}
              onClick={() => setIntervalSecs(opt.secs)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Interpolation
          </span>
          {INTERPOLATION_OPTIONS.map((opt) => (
            <Button
              key={opt.type}
              type="button"
              size="sm"
              variant={interpolation === opt.type ? 'default' : 'outline'}
              onClick={() => setInterpolation(opt.type)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {!hasRound ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          The current round hasn&apos;t started yet.
        </p>
      ) : isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load gesture-type distribution"
          message="Could not fetch the gesture-type composition for the current round."
          onRetry={() => refetch()}
        />
      ) : chartData.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No gesture activity in the current round yet.
        </p>
      ) : (
        <RatioAreaChart data={chartData} interpolation={interpolation} withTime={withTime} />
      )}

      <p className="text-xs text-muted-foreground">
        Each sample is the gesture-type mix within that window (per-interval, not cumulative).
        Windows with no gestures show 0% for all types.
      </p>
    </div>
  );
};
// lexicon-allow-end
