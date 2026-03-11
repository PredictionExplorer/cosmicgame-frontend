import '@testing-library/jest-dom';

import { render, screen, checkA11y } from '@/test-utils';

jest.mock('@progress/kendo-react-charts', () => ({
  Chart: function MockChart({ children }: { children?: React.ReactNode }) {
    return <div data-testid="kendo-chart">{children}</div>;
  },
  ChartArea: () => null,
  ChartCategoryAxis: function MockChartCategoryAxis({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
  },
  ChartCategoryAxisItem: () => null,
  ChartLegend: () => null,
  ChartSeries: function MockChartSeries({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
  },
  ChartSeriesItem: function MockChartSeriesItem({
    data,
  }: {
    data?: Array<{ category: string; value: number }>;
  }) {
    return (
      <div data-testid="chart-series">
        {data?.map((d, i) => (
          <span key={i} data-testid="series-item">
            {d.category}: {d.value}
          </span>
        ))}
      </div>
    );
  },
  ChartValueAxis: function MockChartValueAxis({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
  },
  ChartValueAxisItem: () => null,
}));

import ChartOrPie from '../ChartOrPie';

describe('ChartOrPie', () => {
  const createData = (overrides = {}) => ({
    PrizePercentage: 25,
    RafflePercentage: 10,
    CharityPercentage: 10,
    StakingPercentage: 5,
    ChronoWarriorPercentage: 5,
    CosmicGameBalanceEth: 10,
    ...overrides,
  });

  it('renders chart component', () => {
    render(<ChartOrPie data={createData()} />);
    expect(screen.getByTestId('kendo-chart')).toBeInTheDocument();
  });

  it('renders all six series categories', () => {
    render(<ChartOrPie data={createData()} />);
    const items = screen.getAllByTestId('series-item');
    expect(items).toHaveLength(6);
  });

  it('includes Prize category', () => {
    render(<ChartOrPie data={createData({ PrizePercentage: 30 })} />);
    expect(screen.getByText(/Prize: 30/)).toBeInTheDocument();
  });

  it('includes Next round with remainder', () => {
    render(
      <ChartOrPie
        data={createData({
          PrizePercentage: 25,
          RafflePercentage: 10,
          CharityPercentage: 10,
          StakingPercentage: 5,
          ChronoWarriorPercentage: 5,
        })}
      />,
    );
    expect(screen.getByText(/Next round: 45/)).toBeInTheDocument();
  });

  it('handles undefined data gracefully', () => {
    render(<ChartOrPie />);
    expect(screen.getByTestId('kendo-chart')).toBeInTheDocument();
  });

  it('clamps percentages to valid range', () => {
    render(<ChartOrPie data={createData({ PrizePercentage: -10, RafflePercentage: 200 })} />);
    expect(screen.getByText(/Prize: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Raffle: 100/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ChartOrPie />);
    await checkA11y(container);
  });
});
