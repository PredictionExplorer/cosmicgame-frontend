import '@testing-library/jest-dom';

import { checkA11y, render, screen, within } from '@/test-utils';

const mockUseActiveWeb3React = jest.fn(() => ({ account: null as string | null }));
jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => mockUseActiveWeb3React(),
}));

// eslint-disable-next-line import/order
import ETHSpentTable from '@/components/tables/ETHSpentTable';

const address = (digit: string) => `0x${digit.repeat(40)}`;

const createGesture = (overrides = {}) => ({
  BidderAddr: address('1'),
  EthPriceEth: 0.5,
  ...overrides,
});

const dataRows = (container: HTMLElement) => Array.from(container.querySelectorAll('tbody tr'));

beforeEach(() => {
  jest.clearAllMocks();
  mockUseActiveWeb3React.mockReturnValue({ account: null });
});

describe('ETHSpentTable', () => {
  it('renders the empty state when the list is empty', () => {
    render(<ETHSpentTable list={[]} />);
    expect(screen.getByText('tables.empty.spenders')).toBeInTheDocument();
  });

  it('names the table and its columns', () => {
    render(<ETHSpentTable list={[createGesture()]} />);
    expect(screen.getByRole('table', { name: 'tables.names.ethSpent' })).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'tables.columns.spentAmountEth' }),
    ).toHaveAttribute('data-align', 'end');
  });

  it('sums each participant across gestures, whatever the address case', () => {
    const list = [
      createGesture({ BidderAddr: address('a'), EthPriceEth: 0.5 }),
      createGesture({ BidderAddr: address('A'), EthPriceEth: 0.3 }),
    ];
    const { container } = render(<ETHSpentTable list={list} />);
    expect(dataRows(container)).toHaveLength(1);
    expect(screen.getByText('0.8000')).toBeInTheDocument();
  });

  it('lists the largest spender first', () => {
    const list = [
      createGesture({ BidderAddr: address('1'), EthPriceEth: 0.1 }),
      createGesture({ BidderAddr: address('2'), EthPriceEth: 0.5 }),
    ];
    const { container } = render(<ETHSpentTable list={list} />);
    expect(dataRows(container)[0]).toHaveTextContent('0.5000');
  });

  it('leaves out participants who only gestured with CST', () => {
    // A CST gesture carries a negative ETH sentinel, not a refund.
    const list = [
      createGesture({ BidderAddr: address('1'), EthPriceEth: 0.1 }),
      createGesture({ BidderAddr: address('2'), EthPriceEth: -1e-18 }),
    ];
    const { container } = render(<ETHSpentTable list={list} />);
    expect(dataRows(container)).toHaveLength(1);
    expect(screen.queryByText(/>-0/)).not.toBeInTheDocument();
  });

  it('marks your row in its ranked place instead of moving it to the top', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: address('b') });
    const list = [
      createGesture({ BidderAddr: address('a'), EthPriceEth: 1 }),
      createGesture({ BidderAddr: address('B'), EthPriceEth: 0.2 }),
    ];
    const { container } = render(<ETHSpentTable list={list} />);

    const rows = dataRows(container);
    expect(rows[0]).not.toHaveAttribute('data-current');
    expect(rows[1]).toHaveAttribute('data-current', 'true');
    expect(within(rows[1] as HTMLElement).getByText('tables.status.youBadge')).toBeInTheDocument();
    expect(screen.getByText('tables.currentRow.position(rank=2,total=2)')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ETHSpentTable list={[createGesture()]} />);
    await checkA11y(container);
  });
});
