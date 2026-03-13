import '@testing-library/jest-dom';

import { render, screen, checkA11y } from '@/test-utils';

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

jest.mock('recharts', () => {
  const Original = jest.requireActual('recharts');
  return {
    ...Original,
    ResponsiveContainer: function MockResponsiveContainer({
      children,
    }: {
      children: React.ReactNode;
    }) {
      return <div data-testid="responsive-container">{children}</div>;
    },
    BarChart: function MockBarChart({
      children,
      data,
    }: {
      children?: React.ReactNode;
      data?: Array<{ category: string; value: number }>;
    }) {
      return (
        <div data-testid="bar-chart">
          {data?.map((d, i) => (
            <span key={i} data-testid="series-item">
              {d.category}: {d.value}
            </span>
          ))}
          {children}
        </div>
      );
    },
    Bar: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    XAxis: () => null,
    YAxis: () => null,
    LabelList: () => null,
    Cell: () => null,
  };
});

import {
  CTBalanceDistributionChart,
  type BalanceDistribution,
} from '../CTBalanceDistributionChart';

const createEntry = (addr: string, balance: number): BalanceDistribution => ({
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
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders inside a responsive container', () => {
    const list = [createEntry('0xAddr1', 100)];
    render(<CTBalanceDistributionChart list={list} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
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

  it('computes correct Others total when grouping', () => {
    const list = Array.from({ length: 11 }, (_, i) =>
      createEntry(`0x${String(i).padStart(40, '0')}`, 10),
    );
    render(<CTBalanceDistributionChart list={list} />);
    // entries 9 and 10 should be grouped: 10 + 10 = 20
    expect(screen.getByText(/Others: 20/)).toBeInTheDocument();
  });

  it('does not group when list size equals DISPLAY_LIMIT', () => {
    const list = Array.from({ length: 9 }, (_, i) =>
      createEntry(`0x${String(i).padStart(40, '0')}`, 100 - i),
    );
    render(<CTBalanceDistributionChart list={list} />);
    expect(screen.queryByText(/Others/)).not.toBeInTheDocument();
    expect(screen.getAllByTestId('series-item')).toHaveLength(9);
  });

  it('shortens hex addresses for display', () => {
    const list = [createEntry('0x1234567890abcdef1234567890abcdef12345678', 100)];
    render(<CTBalanceDistributionChart list={list} />);
    expect(screen.getByText(/0x1234/)).toBeInTheDocument();
  });

  it('renders single entry without Others bucket', () => {
    const list = [createEntry('0xSoloAddr', 42)];
    render(<CTBalanceDistributionChart list={list} />);
    expect(screen.getAllByTestId('series-item')).toHaveLength(1);
    expect(screen.queryByText(/Others/)).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const list = [createEntry('0xAddr1', 100)];
    const { container } = render(<CTBalanceDistributionChart list={list} />);
    await checkA11y(container);
  });
});
