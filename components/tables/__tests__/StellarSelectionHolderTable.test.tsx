import '@testing-library/jest-dom';

import { checkA11y, render, screen } from '@/test-utils';

const mockUseActiveWeb3React = jest.fn(() => ({ account: null as string | null }));
jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => mockUseActiveWeb3React(),
}));

// eslint-disable-next-line import/order
import StellarSelectionHolderTable from '@/components/tables/StellarSelectionHolderTable';

const createGesture = (overrides = {}) => ({
  EvtLogId: 1,
  BlockNum: 100,
  TxId: 1,
  TxHash: '0xabc',
  TimeStamp: 1700000000,
  DateTime: '2023-11-14',
  RoundNum: 1,
  BidderAddr: '0x1111111111111111111111111111111111111111',
  GestureType: 0,
  GestureCostEth: 0.01,
  ERC20RewardAmountEth: 0,
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('StellarSelectionHolderTable', () => {
  it('renders empty state when list is empty', () => {
    render(<StellarSelectionHolderTable list={[]} />);
    expect(screen.getByText('No holders yet.')).toBeInTheDocument();
  });

  it('renders loading state before processing', () => {
    render(<StellarSelectionHolderTable list={[createGesture()]} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders table headers when data is processed', () => {
    render(
      <StellarSelectionHolderTable
        list={[createGesture()]}
        numRaffleEthWinner={1}
        numRaffleNFTWinner={1}
      />,
    );
    expect(screen.getAllByText('Holder').length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('Number of Stellar Selection Entries').length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('calculates and renders probability percentages', () => {
    const list = [
      createGesture({ BidderAddr: '0x' + '1'.repeat(40) }),
      createGesture({ BidderAddr: '0x' + '1'.repeat(40) }),
      createGesture({ BidderAddr: '0x' + '2'.repeat(40) }),
    ];
    render(
      <StellarSelectionHolderTable list={list} numRaffleEthWinner={1} numRaffleNFTWinner={1} />,
    );
    expect(screen.getAllByText(/\d+\.\d+%/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows "(You)" for current user', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0x' + 'a'.repeat(40) });
    const list = [createGesture({ BidderAddr: '0x' + 'a'.repeat(40) })];
    render(
      <StellarSelectionHolderTable list={list} numRaffleEthWinner={1} numRaffleNFTWinner={1} />,
    );
    expect(screen.getByText('(You)')).toBeInTheDocument();
  });

  it('shows entry count per holder', () => {
    const list = [
      createGesture({ BidderAddr: '0x' + '1'.repeat(40) }),
      createGesture({ BidderAddr: '0x' + '1'.repeat(40) }),
      createGesture({ BidderAddr: '0x' + '1'.repeat(40) }),
    ];
    render(
      <StellarSelectionHolderTable list={list} numRaffleEthWinner={1} numRaffleNFTWinner={1} />,
    );
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StellarSelectionHolderTable list={[]} />);
    await checkA11y(container);
  });
});
