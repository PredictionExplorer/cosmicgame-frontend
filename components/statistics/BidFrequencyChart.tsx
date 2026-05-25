'use client';

import { useMemo, useState, type FC } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { formatUnixTsLabel } from '@/utils';
import { useBidFrequency, useBidTimeBounds } from '@/hooks/useApiQuery';
import type { BidFrequencyBucket } from '@/services/api/types';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';

const CHART_HEIGHT = 320;
const BAR_COLOR = '#15bffd';
const DAY_SECS = 86400;
const HOUR_SECS = 3600;
const DEFAULT_LOOKBACK_SECS = 365 * DAY_SECS;

type IntervalOption = 'day' | 'hour';

type ChartPoint = {
  bucketTs: number;
  label: string;
  numBids: number;
  uniqueBidders: number;
};

function toChartPoints(records: BidFrequencyBucket[], withTime: boolean): ChartPoint[] {
  return records.map((r) => ({
    bucketTs: r.BucketTs,
    label: formatUnixTsLabel(r.BucketTs, withTime),
    numBids: r.NumBids ?? 0,
    uniqueBidders: r.UniqueBidders ?? 0,
  }));
}

type FrequencyTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ChartPoint }>;
};

function FrequencyTooltip({ active, payload }: FrequencyTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-[#0d1117]/95 px-3 py-2 text-sm shadow-lg">
      <p className="mb-2 font-medium text-white">{point.label}</p>
      <dl className="space-y-1 text-muted-foreground">
        <div className="flex justify-between gap-4">
          <dt>Gestures</dt>
          <dd className="text-white">{point.numBids}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Unique participants</dt>
          <dd className="text-white">{point.uniqueBidders}</dd>
        </div>
      </dl>
    </div>
  );
}

type BidFrequencyChartProps = {
  enabled?: boolean;
};

/** Bar chart of gesture frequency over time (daily or hourly buckets). */
export const BidFrequencyChart: FC<BidFrequencyChartProps> = ({ enabled = true }) => {
  const [interval, setInterval] = useState<IntervalOption>('day');
  const { data: bounds } = useBidTimeBounds(enabled);

  const { initTs, finTs, intervalSecs } = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const maxTs = bounds?.MaxTs && bounds.MaxTs > 0 ? bounds.MaxTs : now;
    const minTs = bounds?.MinTs && bounds.MinTs > 0 ? bounds.MinTs : maxTs - DEFAULT_LOOKBACK_SECS;
    const lookbackStart = Math.max(minTs, maxTs - DEFAULT_LOOKBACK_SECS);
    return {
      initTs: lookbackStart,
      finTs: maxTs + (interval === 'hour' ? HOUR_SECS : DAY_SECS),
      intervalSecs: interval === 'hour' ? HOUR_SECS : DAY_SECS,
    };
  }, [bounds, interval]);

  const { data, isLoading, isError, refetch } = useBidFrequency(
    initTs,
    finTs,
    intervalSecs,
    enabled,
  );

  const chartData = useMemo(
    () => toChartPoints(data ?? [], interval === 'hour'),
    [data, interval],
  );

  return (
    <div className="space-y-4" data-testid="bid-frequency-chart">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Bucket</span>
        <Button
          type="button"
          size="sm"
          variant={interval === 'day' ? 'default' : 'outline'}
          onClick={() => setInterval('day')}
        >
          Daily
        </Button>
        <Button
          type="button"
          size="sm"
          variant={interval === 'hour' ? 'default' : 'outline'}
          onClick={() => setInterval('hour')}
        >
          Hourly
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load gesture frequency"
          message="Could not fetch gesture frequency for the selected range."
          onRetry={() => refetch()}
        />
      ) : chartData.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No gesture activity in this time range.
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="bucketTs"
                tickFormatter={(ts) => formatUnixTsLabel(Number(ts), interval === 'hour')}
                tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
                interval="preserveStartEnd"
                minTickGap={interval === 'hour' ? 48 : 24}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
                allowDecimals={false}
                width={40}
              />
              <Tooltip content={<FrequencyTooltip />} />
              <Bar dataKey="numBids" fill={BAR_COLOR} radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground">
            Gestures in the first hour after each cycle opens are excluded — opening activity
            is unusually concentrated and would otherwise skew this chart.
          </p>
        </>
      )}
    </div>
  );
};
