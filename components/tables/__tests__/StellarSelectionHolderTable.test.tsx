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
    expect(screen.getByText('tables.empty.stellarEntries')).toBeInTheDocument();
  });

  it('shows the pool without waiting for the selection counts', () => {
    render(<StellarSelectionHolderTable list={[createGesture()]} />);
    expect(screen.getByRole('table')).not.toHaveAttribute('aria-busy');
    expect(screen.getByText('100.0%')).toBeInTheDocument();
    // Without the counts there is nothing to say about the draws.
    expect(screen.queryByText(/tables\.stellarSelection\.draws/)).not.toBeInTheDocument();
  });

  it('has three short columns: participant, gestures this cycle and share of the pool', () => {
    render(
      <StellarSelectionHolderTable
        list={[createGesture()]}
        numRaffleEthWinner={3}
        numRaffleNFTWinner={10}
      />,
    );
    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);
    expect(headers).toEqual([
      'tables.columns.participant',
      'tables.columns.gesturesThisCycle',
      'tables.columns.shareOfPool',
    ]);
    // Three compact columns stay a real table on a phone.
    expect(screen.getByRole('table')).toHaveAttribute('data-layout', 'compact');
  });

  it('shows each participant’s linear share of the pool, never a compounded chance', () => {
    const list = [
      createGesture({ BidderAddr: '0x' + '1'.repeat(40) }),
      createGesture({ BidderAddr: '0x' + '1'.repeat(40) }),
      createGesture({ BidderAddr: '0x' + '1'.repeat(40) }),
      createGesture({ BidderAddr: '0x' + '2'.repeat(40) }),
    ];
    render(
      <StellarSelectionHolderTable list={list} numRaffleEthWinner={3} numRaffleNFTWinner={10} />,
    );
    // 3 of 4 gestures is 75% of the pool (compounded over 10 draws it would
    // read 100.0%); 1 of 4 is 25%.
    expect(screen.getByText('75.0%')).toBeInTheDocument();
    expect(screen.getByText('25.0%')).toBeInTheDocument();
    expect(screen.queryByText('100.0%')).not.toBeInTheDocument();
  });

  it('says how many selections finalization draws from the pool', () => {
    render(
      <StellarSelectionHolderTable
        list={[createGesture()]}
        numRaffleEthWinner={3}
        numRaffleNFTWinner={10}
      />,
    );
    expect(screen.getByText('tables.stellarSelection.draws(eth=3,nft=10)')).toBeInTheDocument();
  });

  it('keeps your row at its true rank, marked You', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0x' + 'a'.repeat(40) });
    const list = [
      createGesture({ BidderAddr: '0x' + '1'.repeat(40) }),
      createGesture({ BidderAddr: '0x' + '1'.repeat(40) }),
      createGesture({ BidderAddr: '0x' + 'A'.repeat(40) }),
    ];
    const { container } = render(
      <StellarSelectionHolderTable list={list} numRaffleEthWinner={1} numRaffleNFTWinner={1} />,
    );
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0]).not.toHaveAttribute('data-current');
    expect(rows[1]).toHaveAttribute('data-current', 'true');
    expect(screen.getAllByText('tables.status.youBadge').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('tables.currentRow.position(rank=2,total=2)')).toBeInTheDocument();
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
