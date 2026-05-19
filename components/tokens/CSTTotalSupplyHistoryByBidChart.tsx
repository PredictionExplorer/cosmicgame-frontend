'use client';

import { useMemo, type FC } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useCTTotalSupplyHistoryByBid } from '@/hooks/useApiQuery';
import type { CTTotalSupplyHistoryByBidRecord } from '@/services/api/types';
import { formatCSTValue } from '@/utils';

import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';

const CHART_HEIGHT = 320;
const LINE_COLOR = '#15bffd';

type ChartPoint = {
  bidNum: number;
  label: string;
  totalSupplyEth: number;
  mintAmountEth: number;
  burnAmountEth: number;
  amountEth: number;
  bidInfoId: number;
  bidTypeLabel: string;
  dateTime: string;
};

function bidTypeLabel(bidType: number): string {
  if (bidType === 2) return 'CST';
  if (bidType === 1) return 'RandomWalk';
  return 'ETH';
}

export function toBidChartPoints(records: CTTotalSupplyHistoryByBidRecord[]): ChartPoint[] {
  return records.map((r, index) => {
    const bidNum = index + 1;
    return {
      bidNum,
      label: `#${bidNum}`,
      totalSupplyEth: r.TotalSupplyEth ?? 0,
      mintAmountEth: r.MintAmountEth ?? 0,
      burnAmountEth: r.BurnAmountEth ?? 0,
      amountEth: r.AmountEth ?? 0,
      bidInfoId: r.BidInfoId ?? 0,
      bidTypeLabel: bidTypeLabel(r.BidType ?? 0),
      dateTime: r.DateTime ?? '',
    };
  });
}

type SupplyByBidTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ChartPoint }>;
};

function SupplyByBidTooltip({ active, payload }: SupplyByBidTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as ChartPoint | undefined;
  if (!point) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-[#0d1117]/95 px-3 py-2 text-sm shadow-lg">
      <p className="mb-2 font-medium text-white">
        Bid {point.bidNum}
        {point.dateTime ? ` · ${point.dateTime}` : ''}
      </p>
      <dl className="space-y-1 text-muted-foreground">
        <div className="flex justify-between gap-4">
          <dt>Total supply</dt>
          <dd className="text-white">{formatCSTValue(point.totalSupplyEth)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Mint</dt>
          <dd className="text-white">{formatCSTValue(point.mintAmountEth)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Burn</dt>
          <dd className="text-white">{formatCSTValue(point.burnAmountEth)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Net</dt>
          <dd className="text-white">{formatCSTValue(point.amountEth)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Bid type</dt>
          <dd className="text-white">{point.bidTypeLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Bid info id</dt>
          <dd className="text-white">{point.bidInfoId}</dd>
        </div>
      </dl>
    </div>
  );
}

type CSTTotalSupplyHistoryByBidChartProps = {
  enabled?: boolean;
};

/** Line chart of CST total supply after each bid (chronological). */
export const CSTTotalSupplyHistoryByBidChart: FC<CSTTotalSupplyHistoryByBidChartProps> = ({
  enabled = true,
}) => {
  const { data, isLoading, isError, refetch } = useCTTotalSupplyHistoryByBid(enabled);

  const chartData = useMemo(() => toBidChartPoints(data ?? []), [data]);
  const showDots = chartData.length <= 200;

  return (
    <div className="space-y-4" data-testid="cst-total-supply-history-by-bid-chart">
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load supply history"
          message="Could not fetch CST total supply by bid."
          onRetry={() => refetch()}
        />
      ) : chartData.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No supply history by bid.</p>
      ) : (
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
              interval="preserveStartEnd"
              minTickGap={32}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
              tickFormatter={(v) => (typeof v === 'number' ? v.toFixed(0) : String(v))}
              width={56}
            />
            <Tooltip content={<SupplyByBidTooltip />} />
            <Line
              type="monotone"
              dataKey="totalSupplyEth"
              stroke={LINE_COLOR}
              strokeWidth={2}
              dot={showDots ? { r: 3, fill: LINE_COLOR, strokeWidth: 0 } : false}
              activeDot={{ r: 5, fill: LINE_COLOR, stroke: '#fff', strokeWidth: 1 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
