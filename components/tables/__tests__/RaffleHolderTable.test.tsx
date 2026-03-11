import '@testing-library/jest-dom';

import { checkA11y, render, screen } from '@/test-utils';

const mockUseActiveWeb3React = jest.fn(() => ({ account: null as string | null }));
jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => mockUseActiveWeb3React(),
}));

// eslint-disable-next-line import/order
import RaffleHolderTable from '@/components/tables/RaffleHolderTable';

const createBid = (overrides = {}) => ({
  EvtLogId: 1,
  BlockNum: 100,
  TxId: 1,
  TxHash: '0xabc',
  TimeStamp: 1700000000,
  DateTime: '2023-11-14',
  RoundNum: 1,
  BidderAddr: '0x1111111111111111111111111111111111111111',
  BidType: 0,
  BidPriceEth: 0.01,
  ERC20RewardAmountEth: 0,
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('RaffleHolderTable', () => {
  it('renders empty state when list is empty', () => {
    render(<RaffleHolderTable list={[]} />);
    expect(screen.getByText('No holders yet.')).toBeInTheDocument();
  });

  it('renders loading state before processing', () => {
    render(<RaffleHolderTable list={[createBid()]} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders table headers when data is processed', () => {
    render(
      <RaffleHolderTable list={[createBid()]} numRaffleEthWinner={1} numRaffleNFTWinner={1} />,
    );
    expect(screen.getAllByText('Holder').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Number of Raffle Tickets').length).toBeGreaterThanOrEqual(1);
  });

  it('calculates and renders probability percentages', () => {
    const list = [
      createBid({ BidderAddr: '0x' + '1'.repeat(40) }),
      createBid({ BidderAddr: '0x' + '1'.repeat(40) }),
      createBid({ BidderAddr: '0x' + '2'.repeat(40) }),
    ];
    render(<RaffleHolderTable list={list} numRaffleEthWinner={1} numRaffleNFTWinner={1} />);
    expect(screen.getAllByText(/\d+\.\d+%/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows "(You)" for current user', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0x' + 'a'.repeat(40) });
    const list = [createBid({ BidderAddr: '0x' + 'a'.repeat(40) })];
    render(<RaffleHolderTable list={list} numRaffleEthWinner={1} numRaffleNFTWinner={1} />);
    expect(screen.getByText('(You)')).toBeInTheDocument();
  });

  it('shows ticket count per holder', () => {
    const list = [
      createBid({ BidderAddr: '0x' + '1'.repeat(40) }),
      createBid({ BidderAddr: '0x' + '1'.repeat(40) }),
      createBid({ BidderAddr: '0x' + '1'.repeat(40) }),
    ];
    render(<RaffleHolderTable list={list} numRaffleEthWinner={1} numRaffleNFTWinner={1} />);
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RaffleHolderTable list={[]} />);
    await checkA11y(container);
  });
});
