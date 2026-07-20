'use client';

// lexicon-allow-start: internal analytics identifiers mirror backend wire names
import { useMemo, useState, type FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocale, useTranslations } from 'next-intl';

import { formatGroupedNumber, formatUnixTsLabel } from '@/utils';

import { useBidFrequency, useBidTimeBounds } from '@/hooks/useApiQuery';
import { useNow } from '@/hooks/useNow';
import type { BidFrequencyBucket } from '@/services/api/types';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';

const CHART_HEIGHT = 320;
const BAR_COLOR = 'rgb(var(--aurora-cyan-rgb))';
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

function toChartPoints(
  records: BidFrequencyBucket[],
  withTime: boolean,
  locale: string,
): ChartPoint[] {
  return records.map((r) => ({
    bucketTs: r.BucketTs,
    label: formatUnixTsLabel(r.BucketTs, withTime, locale),
    numBids: r.NumBids ?? 0,
    uniqueBidders: r.UniqueBidders ?? 0,
  }));
}

type FrequencyTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ChartPoint }>;
};

function FrequencyTooltip({ active, payload }: FrequencyTooltipProps) {
  const t = useTranslations('statistics');
  const locale = useLocale();
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-background/95 px-3 py-2 text-sm shadow-lg">
      <p className="mb-2 font-medium text-white">{point.label}</p>
      <dl className="space-y-1 text-muted-foreground">
        <div className="flex justify-between gap-4">
          <dt>{t('charts.frequency.gestures')}</dt>
          <dd className="text-white">{formatGroupedNumber(point.numBids, locale)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{t('charts.frequency.uniqueParticipants')}</dt>
          <dd className="text-white">{formatGroupedNumber(point.uniqueBidders, locale)}</dd>
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
  const t = useTranslations('statistics');
  const locale = useLocale();
  const [interval, setInterval] = useState<IntervalOption>('day');
  const { data: bounds } = useBidTimeBounds(enabled);
  const nowSec = Math.floor(useNow(60_000) / 1000);

  const { initTs, finTs, intervalSecs } = useMemo(() => {
    const maxTs = bounds?.MaxTs && bounds.MaxTs > 0 ? bounds.MaxTs : nowSec;
    const minTs = bounds?.MinTs && bounds.MinTs > 0 ? bounds.MinTs : maxTs - DEFAULT_LOOKBACK_SECS;
    const lookbackStart = Math.max(minTs, maxTs - DEFAULT_LOOKBACK_SECS);
    return {
      initTs: lookbackStart,
      finTs: maxTs + (interval === 'hour' ? HOUR_SECS : DAY_SECS),
      intervalSecs: interval === 'hour' ? HOUR_SECS : DAY_SECS,
    };
  }, [bounds, interval, nowSec]);

  const { data, isLoading, isError, refetch } = useBidFrequency(
    initTs,
    finTs,
    intervalSecs,
    enabled,
  );

  const chartData = useMemo(
    () => toChartPoints(data ?? [], interval === 'hour', locale),
    [data, interval, locale],
  );

  return (
    <div className="space-y-4" data-testid="bid-frequency-chart">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {t('charts.frequency.bucket')}
        </span>
        <Button
          type="button"
          size="sm"
          variant={interval === 'day' ? 'default' : 'outline'}
          aria-pressed={interval === 'day'}
          onClick={() => setInterval('day')}
        >
          {t('charts.frequency.daily')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={interval === 'hour' ? 'default' : 'outline'}
          aria-pressed={interval === 'hour'}
          onClick={() => setInterval('hour')}
        >
          {t('charts.frequency.hourly')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <ErrorState
          title={t('charts.frequency.loadErrorTitle')}
          message={t('charts.frequency.loadErrorMessage')}
          onRetry={() => refetch()}
        />
      ) : chartData.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t('charts.frequency.empty')}
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="bucketTs"
                tickFormatter={(ts) => formatUnixTsLabel(Number(ts), interval === 'hour', locale)}
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
              <Bar
                dataKey="numBids"
                fill={BAR_COLOR}
                radius={[2, 2, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground">{t('charts.frequency.openingExcluded')}</p>
        </>
      )}
    </div>
  );
};
// lexicon-allow-end
