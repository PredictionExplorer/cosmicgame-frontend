import '@testing-library/jest-dom';

import { render, screen } from '@/test-utils';

jest.mock('../../../config/networks', () => ({
  __esModule: true,
  MARKETING_WALLET_ADDRESS: '0xMarketingWallet',
  networkConfig: {
    nftApiUrl: 'http://test',
    apiUrl: 'http://test',
    infuraKey: '',
    MARKET_ADDRESS: '0x0',
    NFT_ADDRESS: '0x0',
    COSMICGAME_ADDRESS: '0x0',
  },
}));
jest.mock('../../../utils', () => ({
  shortenHex: (hex: string, length = 4) =>
    hex ? `${hex.substring(0, length + 2)}....${hex.substring(hex.length - length)}` : '',
}));

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

 
import { CTBalanceDistributionChart } from '../CTBalanceDistributionChart';

const createEntry = (addr: string, balance: number) => ({
  OwnerAddr: addr,
  BalanceFloat: balance,
});

describe('CTBalanceDistributionChart', () => {
  it('returns null when list is empty', () => {
    const { container } = render(<CTBalanceDistributionChart list={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders chart when data is provided', () => {
    const list = [createEntry('0xAddr1', 100), createEntry('0xAddr2', 50)];
    render(<CTBalanceDistributionChart list={list} />);
    expect(screen.getByTestId('kendo-chart')).toBeInTheDocument();
  });

  it('renders correct number of series items', () => {
    const list = [
      createEntry('0xAddr1', 100),
      createEntry('0xAddr2', 50),
      createEntry('0xAddr3', 25),
    ];
    render(<CTBalanceDistributionChart list={list} />);
    const items = screen.getAllByTestId('series-item');
    expect(items).toHaveLength(3);
  });

  it('labels marketing wallet address as Marketing Wallet', () => {
    const list = [createEntry('0xMarketingWallet', 500)];
    render(<CTBalanceDistributionChart list={list} />);
    expect(screen.getByText(/Marketing Wallet/)).toBeInTheDocument();
  });

  it('groups entries beyond DISPLAY_LIMIT into Others', () => {
    const list = Array.from({ length: 12 }, (_, i) =>
      createEntry(`0x${String(i).padStart(40, '0')}`, 100 - i),
    );
    render(<CTBalanceDistributionChart list={list} />);
    expect(screen.getByText(/Others/)).toBeInTheDocument();
    const items = screen.getAllByTestId('series-item');
    expect(items).toHaveLength(10); // 9 + Others
  });

  it('shortens hex addresses for display', () => {
    const list = [createEntry('0x1234567890abcdef1234567890abcdef12345678', 100)];
    render(<CTBalanceDistributionChart list={list} />);
    expect(screen.getByText(/0x1234/)).toBeInTheDocument();
  });
});
