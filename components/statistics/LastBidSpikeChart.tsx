'use client';

// lexicon-allow-start: internal analytics identifiers mirror backend wire names
import { useMemo, useState, type FC } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatGroupedNumber, formatUnixTsLabel } from '@/utils';

import { useBiddingActivity, useBidFrequency, useBidTimeBounds } from '@/hooks/useApiQuery';
import { useNow } from '@/hooks/useNow';
import type { BidFrequencyBucket, BidSpike } from '@/services/api/types';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';

const CHART_HEIGHT = 320;
const BAR_COLOR = 'rgb(var(--aurora-cyan-rgb))';
const SPIKE_COLOR = 'rgba(239, 68, 68, 0.18)';
const SPIKE_INTERVAL_SECS = 3600;
const VIEW_PADDING_SECS = 12 * 3600;
const DEFAULT_LOOKBACK_SECS = 365 * 86400;

type ChartPoint = {
  bucketTs: number;
  label: string;
  numBids: number;
};

function alignHour(ts: number): number {
  return Math.floor(ts / SPIKE_INTERVAL_SECS) * SPIKE_INTERVAL_SECS;
}

function spikeViewRange(spike: BidSpike): { initTs: number; finTs: number } {
  const initTs = alignHour(spike.StartTs - VIEW_PADDING_SECS);
  const finTs = alignHour(spike.EndTs + VIEW_PADDING_SECS) + SPIKE_INTERVAL_SECS;
  return { initTs, finTs };
}

function toChartPoints(records: BidFrequencyBucket[], locale: string): ChartPoint[] {
  return records.map((r) => ({
    bucketTs: r.BucketTs,
    label: formatUnixTsLabel(r.BucketTs, true, locale),
    numBids: r.NumBids ?? 0,
  }));
}

type SpikeTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ChartPoint }>;
};

function SpikeTooltip({ active, payload }: SpikeTooltipProps) {
  const t = useTranslations('statistics');
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-background/95 px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium text-white">{point.label}</p>
      <p className="text-muted-foreground">
        {t('charts.spikes.gestures', { count: point.numBids })}
      </p>
    </div>
  );
}

type LastBidSpikeChartProps = {
  enabled?: boolean;
};

/** Hourly frequency chart focused on gesture spikes, with navigation between detected spikes. */
export const LastBidSpikeChart: FC<LastBidSpikeChartProps> = ({ enabled = true }) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const { data: bounds } = useBidTimeBounds(enabled);
  const nowSec = Math.floor(useNow(60_000) / 1000);

  const { initTs, finTs } = useMemo(() => {
    const maxTs = bounds?.MaxTs && bounds.MaxTs > 0 ? bounds.MaxTs : nowSec;
    const minTs = bounds?.MinTs && bounds.MinTs > 0 ? bounds.MinTs : maxTs - DEFAULT_LOOKBACK_SECS;
    const lookbackStart = Math.max(minTs, maxTs - DEFAULT_LOOKBACK_SECS);
    return { initTs: lookbackStart, finTs: maxTs + SPIKE_INTERVAL_SECS };
  }, [bounds, nowSec]);

  const { data, isLoading, isError, refetch } = useBiddingActivity(
    initTs,
    finTs,
    SPIKE_INTERVAL_SECS,
    enabled && initTs > 0,
  );

  const spikes = data?.Spikes ?? [];
  const recentSpikeIndex = data?.RecentSpikeIndex ?? -1;

  const [selectedIndexOverride, setSelectedIndexOverride] = useState<number | null>(null);
  const selectedIndex = selectedIndexOverride ?? (recentSpikeIndex >= 0 ? recentSpikeIndex : null);

  const selectedSpike = selectedIndex !== null ? spikes[selectedIndex] : undefined;

  const viewRange = selectedSpike ? spikeViewRange(selectedSpike) : null;

  const {
    data: windowFrequency,
    isLoading: windowLoading,
    isError: windowError,
    refetch: refetchWindow,
  } = useBidFrequency(
    viewRange?.initTs ?? 0,
    viewRange?.finTs ?? 0,
    SPIKE_INTERVAL_SECS,
    enabled && viewRange !== null,
  );

  const chartData = useMemo(
    () => toChartPoints(windowFrequency ?? [], locale),
    [windowFrequency, locale],
  );

  const spikeLabelStart = selectedSpike
    ? formatUnixTsLabel(selectedSpike.StartTs, true, locale)
    : '';
  const spikeLabelEnd = selectedSpike ? formatUnixTsLabel(selectedSpike.EndTs, true, locale) : '';

  const goPrev = () => {
    if (selectedIndex === null || selectedIndex <= 0) return;
    setSelectedIndexOverride(selectedIndex - 1);
  };

  const goNext = () => {
    if (selectedIndex === null || selectedIndex >= spikes.length - 1) return;
    setSelectedIndexOverride(selectedIndex + 1);
  };

  const showEmptyRecent =
    !isLoading && spikes.length > 0 && recentSpikeIndex < 0 && selectedIndex === null;

  const chartLoading = isLoading || (selectedSpike !== undefined && windowLoading);
  const chartError = isError || windowError;

  return (
    <div className="space-y-4" data-testid="last-bid-spike-chart">
      {spikes.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs uppercase tracking-wider text-muted-foreground">
              {t('charts.spikes.count', { count: formatGroupedNumber(spikes.length, locale) })}
            </span>
            {/* Selection is by array position — the backend `Index` field is not
                guaranteed to match the array order, and mixing the two broke
                prev/next navigation. Scrolls horizontally when many spikes exist. */}
            <div
              role="group"
              aria-label={t('charts.spikes.groupAria')}
              className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none"
            >
              {spikes.map((spike, arrayIndex) => (
                <Button
                  key={`${spike.StartTs}-${spike.EndTs}`}
                  type="button"
                  size="sm"
                  variant={selectedIndex === arrayIndex ? 'default' : 'outline'}
                  aria-pressed={selectedIndex === arrayIndex}
                  onClick={() => setSelectedIndexOverride(arrayIndex)}
                  className="shrink-0 font-mono text-xs"
                >
                  #{arrayIndex + 1}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={goPrev}
              disabled={selectedIndex === null || selectedIndex <= 0}
              aria-label={t('charts.spikes.previousAria')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={goNext}
              disabled={selectedIndex === null || selectedIndex >= spikes.length - 1}
              aria-label={t('charts.spikes.nextAria')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {selectedSpike ? (
              <p className="text-xs text-muted-foreground">
                {t('charts.spikes.summary', {
                  peak: formatGroupedNumber(selectedSpike.PeakNumBids, locale),
                  total: formatGroupedNumber(selectedSpike.TotalBids, locale),
                  date: formatUnixTsLabel(selectedSpike.PeakTs, true, locale),
                })}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {chartLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : chartError ? (
        <ErrorState
          title={t('charts.spikes.loadErrorTitle')}
          message={t('charts.spikes.loadErrorMessage')}
          onRetry={() => {
            void refetch();
            void refetchWindow();
          }}
        />
      ) : spikes.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t('charts.spikes.empty')}</p>
      ) : showEmptyRecent ? (
        <div className="rounded-lg border border-dashed border-white/10 py-12 text-center">
          <p className="text-sm text-muted-foreground">{t('charts.spikes.noneRecent')}</p>
          <p className="mt-2 text-xs text-muted-foreground/80">
            {t('charts.spikes.selectEarlier')}
          </p>
        </div>
      ) : selectedSpike && chartData.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {t('charts.spikes.viewing', {
              index: selectedIndex! + 1,
              start: spikeLabelStart,
              end: spikeLabelEnd,
            })}
          </p>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="bucketTs"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(ts) => formatUnixTsLabel(Number(ts), true, locale)}
                tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 10 }}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
                allowDecimals={false}
                width={40}
              />
              <Tooltip content={<SpikeTooltip />} />
              <ReferenceArea
                x1={alignHour(selectedSpike.StartTs)}
                x2={selectedSpike.EndTs}
                fill={SPIKE_COLOR}
                strokeOpacity={0}
              />
              <Bar
                dataKey="numBids"
                fill={BAR_COLOR}
                radius={[2, 2, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground">{t('charts.frequency.openingExcluded')}</p>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t('charts.spikes.emptyWindow')}
        </p>
      )}
    </div>
  );
};
// lexicon-allow-end
