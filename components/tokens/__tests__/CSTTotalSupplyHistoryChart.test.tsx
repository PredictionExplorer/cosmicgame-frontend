import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { CTTotalSupplyHistoryByDateRecord } from '@/services/api/types';

import { CSTTotalSupplyHistoryChart, toChartPoints } from '../CSTTotalSupplyHistoryChart';

const mockUseCTTotalSupplyHistoryByDate = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useCTTotalSupplyHistoryByDate: (...args: unknown[]) => mockUseCTTotalSupplyHistoryByDate(...args),
}));

jest.mock('../../../components/ui/date-picker', () => ({
  DatePicker: ({
    id,
    label,
    value,
    onChange,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  ),
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

const sampleRecord: CTTotalSupplyHistoryByDateRecord = {
  Date: '20260506',
  DateTime: '2026-05-06',
  TimeStamp: 1746576000,
  NumBids: 5,
  MintAmountEth: 10,
  BurnAmountEth: 2,
  AmountEth: 8,
  TotalSupplyEth: 1000,
};

describe('toChartPoints', () => {
  it('maps API records to chart points', () => {
    const points = toChartPoints([sampleRecord]);
    expect(points).toHaveLength(1);
    expect(points[0]?.totalSupplyEth).toBe(1000);
    expect(points[0]?.numBids).toBe(5);
    expect(points[0]?.label).toContain('2026');
  });
});

describe('CSTTotalSupplyHistoryChart', () => {
  beforeEach(() => {
    mockUseCTTotalSupplyHistoryByDate.mockReturnValue({
      data: [sampleRecord],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  it('renders form and chart container', async () => {
    render(<CSTTotalSupplyHistoryChart />);
    expect(screen.getByTestId('cst-total-supply-history-chart')).toBeInTheDocument();
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update chart/i })).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText('From')).toHaveValue('2026-05-06');
      expect(screen.getByLabelText('To')).toHaveValue('2026-05-06');
    });
  });

  it('sets date pickers to min and max dates from API data on first load', async () => {
    mockUseCTTotalSupplyHistoryByDate.mockReturnValue({
      data: [
        { ...sampleRecord, Date: '20260101' },
        { ...sampleRecord, Date: '20260315' },
      ],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    render(<CSTTotalSupplyHistoryChart />);
    await waitFor(() => {
      expect(screen.getByLabelText('From')).toHaveValue('2026-01-01');
      expect(screen.getByLabelText('To')).toHaveValue('2026-03-15');
    });
  });

  it('shows empty state when no data', () => {
    mockUseCTTotalSupplyHistoryByDate.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    render(<CSTTotalSupplyHistoryChart />);
    expect(screen.getByText(/no supply history/i)).toBeInTheDocument();
  });

  it('shows range error when from is after to', async () => {
    const user = userEvent.setup();
    render(<CSTTotalSupplyHistoryChart />);
    const from = screen.getByLabelText('From');
    const to = screen.getByLabelText('To');
    await user.clear(from);
    await user.type(from, '2026-05-31');
    await user.clear(to);
    await user.type(to, '2026-05-01');
    await user.click(screen.getByRole('button', { name: /update chart/i }));
    expect(screen.getByText(/start date must be on or before end date/i)).toBeInTheDocument();
  });
});
