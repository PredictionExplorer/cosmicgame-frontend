'use client';

// lexicon-allow-start: internal analytics identifiers mirror backend wire names
import { useMemo, useState, type FC, type FocusEvent, type MouseEvent } from 'react';

import { formatUnixTsLabel, shortenHex } from '@/utils';

import { Link } from '@/i18n/navigation';
import { useTopBidderActivePeriods, useBidTimeBounds } from '@/hooks/useApiQuery';
import { useNow } from '@/hooks/useNow';
import type { BidderActivePeriod, TopBidderInfo } from '@/services/api/types';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { cn } from '@/lib/utils';

const TOP_N = 20;
const ROW_HEIGHT = 28;
const LABEL_WIDTH = 200;
const CHART_MIN_WIDTH = 720;
const MIN_BAR_PX = 3;

function bidderColor(index: number): string {
  const hue = (index * 47) % 360;
  return `hsl(${hue} 65% 52%)`;
}

type TimelineRow = {
  bidder: TopBidderInfo;
  color: string;
  periods: BidderActivePeriod[];
};

type HoverInfo = {
  period: BidderActivePeriod;
  x: number;
  y: number;
};

type BidderActivePeriodsTimelineProps = {
  enabled?: boolean;
};

/** Gantt-style timeline of active bidding bursts for the top 20 participants. */
export const BidderActivePeriodsTimeline: FC<BidderActivePeriodsTimelineProps> = ({
  enabled = true,
}) => {
  const { data: bounds } = useBidTimeBounds(enabled);
  const nowSec = Math.floor(useNow(60_000) / 1000);

  const { initTs, finTs } = useMemo(() => {
    const maxTs = bounds?.MaxTs && bounds.MaxTs > 0 ? bounds.MaxTs : nowSec;
    const minTs = bounds?.MinTs && bounds.MinTs > 0 ? bounds.MinTs : maxTs - 365 * 86400;
    return { initTs: minTs, finTs: maxTs + 3600 };
  }, [bounds, nowSec]);

  const { data, isLoading, isError, refetch } = useTopBidderActivePeriods(
    TOP_N,
    initTs,
    finTs,
    enabled && initTs > 0,
  );

  const [hover, setHover] = useState<HoverInfo | null>(null);

  const rows = useMemo((): TimelineRow[] => {
    const topBidders = data?.TopBidders ?? [];
    const periods = data?.ActivePeriods ?? [];
    return topBidders.map((bidder, index) => ({
      bidder,
      color: bidderColor(index),
      periods: periods.filter((p) => p.BidderAid === bidder.BidderAid),
    }));
  }, [data?.TopBidders, data?.ActivePeriods]);

  const range = finTs - initTs;

  const axisTicks = useMemo(() => {
    if (range <= 0) return [];
    const count = 6;
    return Array.from({ length: count }, (_, i) => {
      const ts = initTs + Math.floor((range * i) / (count - 1));
      return { ts, label: formatUnixTsLabel(ts, false) };
    });
  }, [initTs, range]);

  const handleBarEnter = (period: BidderActivePeriod, e: MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!rect) return;
    setHover({
      period,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  /** Keyboard equivalent of hover: anchor the tooltip to the focused bar. */
  const handleBarFocus = (period: BidderActivePeriod, e: FocusEvent<SVGRectElement>) => {
    const svgRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    const barRect = e.currentTarget.getBoundingClientRect();
    if (!svgRect) return;
    setHover({
      period,
      x: barRect.left - svgRect.left + barRect.width / 2,
      y: barRect.top - svgRect.top,
    });
  };

  const periodLabel = (period: BidderActivePeriod) =>
    `${shortenHex(period.BidderAddr, 6)}: ${period.NumBids} gestures from ${formatUnixTsLabel(
      period.PeriodStart,
      true,
    )} to ${formatUnixTsLabel(period.PeriodEnd, true)}`;

  return (
    <div className="space-y-3" data-testid="bidder-active-periods-timeline">
      <p className="text-xs text-muted-foreground">
        Active periods for top {TOP_N} participants (≥2 gestures with ≤6h gap between consecutive
        gestures). Each bar is one burst.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load active periods"
          message="Could not fetch top participant activity timeline."
          onRetry={() => refetch()}
        />
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No active gesture periods found for top participants.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/[0.06] bg-black/20">
          <div className="relative min-w-full" style={{ minWidth: LABEL_WIDTH + CHART_MIN_WIDTH }}>
            <div
              className="grid border-b border-white/[0.06] text-[10px] text-muted-foreground"
              style={{ gridTemplateColumns: `${LABEL_WIDTH}px 1fr` }}
            >
              <div className="px-3 py-2 font-medium uppercase tracking-wider">Participant</div>
              <div className="relative px-2 py-2">
                <div className="flex justify-between">
                  {axisTicks.map((tick) => (
                    <span key={tick.ts} className="whitespace-nowrap">
                      {tick.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {rows.map((row) => (
              <div
                key={row.bidder.BidderAid}
                className="grid border-b border-white/[0.04] last:border-b-0"
                style={{ gridTemplateColumns: `${LABEL_WIDTH}px 1fr`, height: ROW_HEIGHT }}
              >
                <div className="flex items-center gap-2 truncate px-3 text-xs">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: row.color }}
                  />
                  <Link
                    href={`/user/${row.bidder.BidderAddr}`}
                    className="truncate text-primary hover:underline"
                    title={row.bidder.BidderAddr}
                  >
                    {shortenHex(row.bidder.BidderAddr, 4)}
                  </Link>
                  <span className="text-muted-foreground">({row.bidder.NumBids})</span>
                </div>
                <div className="relative h-full px-2">
                  <svg
                    width="100%"
                    height={ROW_HEIGHT}
                    viewBox={`0 0 1000 ${ROW_HEIGHT}`}
                    preserveAspectRatio="none"
                    className="block h-full w-full"
                  >
                    {row.periods.map((period) => {
                      const x = ((period.PeriodStart - initTs) / range) * 1000;
                      const w = Math.max(
                        ((period.PeriodEnd - period.PeriodStart) / range) * 1000,
                        (MIN_BAR_PX / CHART_MIN_WIDTH) * 1000,
                      );
                      return (
                        <rect
                          key={`${period.BidderAid}-${period.PeriodStart}-${period.PeriodEnd}`}
                          x={x}
                          y={6}
                          width={w}
                          height={ROW_HEIGHT - 12}
                          rx={2}
                          fill={row.color}
                          fillOpacity={0.85}
                          className="cursor-pointer focus-visible:outline-none focus-visible:stroke-white"
                          tabIndex={0}
                          role="img"
                          aria-label={periodLabel(period)}
                          onMouseEnter={(e) => handleBarEnter(period, e)}
                          onMouseLeave={() => setHover(null)}
                          onFocus={(e) => handleBarFocus(period, e)}
                          onBlur={() => setHover(null)}
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>
            ))}

            {hover ? (
              <div
                className={cn(
                  'pointer-events-none absolute z-10 rounded-md border border-white/10',
                  'bg-background/95 px-2 py-1.5 text-xs shadow-lg',
                )}
                style={{
                  left: Math.min(hover.x + 12, LABEL_WIDTH + CHART_MIN_WIDTH - 220),
                  top: hover.y + 8,
                }}
              >
                <p className="font-medium text-white">{shortenHex(hover.period.BidderAddr, 6)}</p>
                <p className="text-muted-foreground">
                  {formatUnixTsLabel(hover.period.PeriodStart, true)}
                </p>
                <p className="text-muted-foreground">
                  → {formatUnixTsLabel(hover.period.PeriodEnd, true)}
                </p>
                <p className="text-muted-foreground">
                  {hover.period.NumBids} gestures · {Math.round(hover.period.DurationSecs / 60)} min
                  span
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
// lexicon-allow-end
