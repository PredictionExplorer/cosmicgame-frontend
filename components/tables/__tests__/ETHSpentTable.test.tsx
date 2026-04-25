import '@testing-library/jest-dom';

import { checkA11y, render, screen } from '@/test-utils';

const mockUseActiveWeb3React = jest.fn(() => ({ account: null as string | null }));
jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => mockUseActiveWeb3React(),
}));

// eslint-disable-next-line import/order
import ETHSpentTable from '@/components/tables/ETHSpentTable';

const createGesture = (overrides = {}) => ({
  BidderAddr: '0x1111111111111111111111111111111111111111',
  EthPriceEth: 0.5,
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('ETHSpentTable', () => {
  it('renders empty state when list is empty', () => {
    render(<ETHSpentTable list={[]} />);
    expect(screen.getByText('No spenders yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<ETHSpentTable list={[createGesture()]} />);
    expect(screen.getAllByText('User Address').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Spent Amount (ETH)').length).toBeGreaterThanOrEqual(1);
  });

  it('groups gestures by BidderAddr and sums amounts', () => {
    const list = [
      createGesture({ BidderAddr: '0x' + '1'.repeat(40), EthPriceEth: 0.5 }),
      createGesture({ BidderAddr: '0x' + '1'.repeat(40), EthPriceEth: 0.3 }),
    ];
    render(<ETHSpentTable list={list} />);
    expect(screen.getByText('0.8000 ETH')).toBeInTheDocument();
  });

  it('sorts spenders by amount descending', () => {
    const list = [
      createGesture({ BidderAddr: '0x' + '1'.repeat(40), EthPriceEth: 0.1 }),
      createGesture({ BidderAddr: '0x' + '2'.repeat(40), EthPriceEth: 0.5 }),
    ];
    render(<ETHSpentTable list={list} />);
    const rows = screen.getAllByRole('row');
    const dataRows = rows.filter((r) => r.querySelector('td'));
    expect(dataRows[0]?.textContent).toContain('0.5000 ETH');
  });

  it('shows "(You)" for current user', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0x' + 'a'.repeat(40) });
    const list = [createGesture({ BidderAddr: '0x' + 'a'.repeat(40), EthPriceEth: 1.0 })];
    render(<ETHSpentTable list={list} />);
    expect(screen.getByText('(You)')).toBeInTheDocument();
  });

  it('formats amount to 4 decimal places', () => {
    render(<ETHSpentTable list={[createGesture({ EthPriceEth: 0.1 })]} />);
    expect(screen.getByText('0.1000 ETH')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ETHSpentTable list={[]} />);
    await checkA11y(container);
  });
});
