import { useMemo, type FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, LabelList, ResponsiveContainer, Cell } from 'recharts';

import { shortenHex } from '@/utils';

import { useContractAddresses } from '@/contexts/ContractAddressesContext';

/** Maximum number of individual addresses to highlight before grouping the rest */
const DISPLAY_LIMIT = 9;
const BAR_HEIGHT = 36;
const CHART_PADDING = 40;

/**
 * Balance entry as returned by the backend.
 */
export interface BalanceDistribution {
  /** Wallet address */
  OwnerAddr: string;
  /** Floating-point token balance */
  BalanceFloat: number;
}

/** Props for `<CTBalanceDistributionChart>` */
interface CTBalanceDistributionChartProps {
  /** Full list of owner balances sorted by `BalanceFloat` DESC */
  list: BalanceDistribution[];
}

/**
 * Converts the raw list of balances into two things: a processed list that
 * contains at most `DISPLAY_LIMIT` addresses plus an optional "Others" bucket,
 * and the maximum value so we can scale the chart with some breathing room.
 */
const useProcessedBalances = (list: BalanceDistribution[], limit: number) => {
  return useMemo(() => {
    if (list.length === 0) return { processed: [], max: 0 };

    if (list.length <= limit) {
      return { processed: list, max: list[0]?.BalanceFloat ?? 0 };
    }

    const othersValue = list.slice(limit).reduce((sum, curr) => sum + curr.BalanceFloat, 0);

    const processed: BalanceDistribution[] = [
      ...list.slice(0, limit),
      { OwnerAddr: 'Others', BalanceFloat: othersValue },
    ];

    const max = Math.max(list[0]?.BalanceFloat ?? 0, othersValue);

    return { processed, max };
  }, [list, limit]);
};

const formatLabel: import('recharts/types/component/Label').LabelFormatter = (value) =>
  Number(value ?? 0).toFixed(2);

/**
 * Bar chart that shows the distribution of token balances among top holders.
 * Remaining holders are aggregated into an "Others" bucket.
 */
export const CTBalanceDistributionChart: FC<CTBalanceDistributionChartProps> = ({ list }) => {
  const { marketing } = useContractAddresses();
  const { processed: data, max } = useProcessedBalances(list, DISPLAY_LIMIT);

  const chartData = useMemo(
    () =>
      data.map((entry) => ({
        category:
          marketing &&
          entry.OwnerAddr &&
          entry.OwnerAddr.toLowerCase() === marketing.toLowerCase()
            ? 'Marketing Wallet'
            : entry.OwnerAddr === 'Others'
              ? 'Others'
              : shortenHex(entry.OwnerAddr, 6),
        value: entry.BalanceFloat,
      })),
    [data, marketing],
  );

  if (chartData.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={chartData.length * BAR_HEIGHT + CHART_PADDING}>
      <BarChart data={chartData} layout="vertical" margin={{ right: 80 }}>
        <XAxis type="number" hide domain={[0, max * 1.4]} />
        <YAxis
          type="category"
          dataKey="category"
          tick={{ fill: 'white', fontSize: 13 }}
          width={130}
          axisLine={false}
          tickLine={false}
        />
        <Bar dataKey="value" fill="#15bffd" isAnimationActive={false} barSize={20}>
          {chartData.map((entry) => (
            <Cell key={entry.category} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            fill="white"
            fontSize={12}
            formatter={formatLabel}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
