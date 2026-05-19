import { render, screen } from '@testing-library/react';

import {
  CSTTotalSupplyHistoryByBidChart,
  toBidChartPoints,
} from '../CSTTotalSupplyHistoryByBidChart';
import type { CTTotalSupplyHistoryByBidRecord } from '@/services/api/types';

const mockUseCTTotalSupplyHistoryByBid = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useCTTotalSupplyHistoryByBid: (...args: unknown[]) => mockUseCTTotalSupplyHistoryByBid(...args),
}));

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

const sampleRecord: CTTotalSupplyHistoryByBidRecord = {
  BidInfoId: 42,
  BidType: 2,
  MintAmountEth: 5,
  BurnAmountEth: 1,
  AmountEth: 4,
  TotalSupplyEth: 100,
  DateTime: '2026-05-06 12:00:00',
};

describe('toBidChartPoints', () => {
  it('maps API records to chart points with bid index labels', () => {
    const points = toBidChartPoints([sampleRecord]);
    expect(points).toHaveLength(1);
    expect(points[0]?.label).toBe('#1');
    expect(points[0]?.totalSupplyEth).toBe(100);
    expect(points[0]?.bidTypeLabel).toBe('CST');
  });
});

describe('CSTTotalSupplyHistoryByBidChart', () => {
  beforeEach(() => {
    mockUseCTTotalSupplyHistoryByBid.mockReturnValue({
      data: [sampleRecord],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  it('renders chart without date controls', () => {
    render(<CSTTotalSupplyHistoryByBidChart />);
    expect(screen.getByTestId('cst-total-supply-history-by-bid-chart')).toBeInTheDocument();
    expect(screen.queryByLabelText('From')).not.toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    mockUseCTTotalSupplyHistoryByBid.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    render(<CSTTotalSupplyHistoryByBidChart />);
    expect(screen.getByText(/no supply history by bid/i)).toBeInTheDocument();
  });

  it('passes enabled flag to hook', () => {
    render(<CSTTotalSupplyHistoryByBidChart enabled={false} />);
    expect(mockUseCTTotalSupplyHistoryByBid).toHaveBeenCalledWith(false);
  });
});
