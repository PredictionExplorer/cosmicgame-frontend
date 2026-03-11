import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/react';

import { convertTimestampToDateTime, shortenHex } from '@/utils';

import { checkA11y, render, screen } from '@/test-utils';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, prefetch: jest.fn() }),
}));

// eslint-disable-next-line import/order
import { PrizeTable } from '@/components/tables/PrizeTable';

const createPrize = (overrides = {}) => ({
  RoundNum: 1,
  WinnerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  AmountEth: 1.5,
  TokenId: 100,
  TxHash: '0xabc',
  TimeStamp: 1701346718,
  DateTime: '2023-11-30',
  RoundStats: {
    TotalBids: 42,
    TotalDonatedNFTs: 5,
    TotalRaffleEthDepositsEth: 2.5,
    TotalRaffleNFTs: 3,
  },
  StakingDepositAmountEth: 0.75,
  RaffleNFTWinners: [],
  StakingNFTWinners: [],
  RaffleETHDeposits: [],
  AllPrizes: [],
  CSTAmountEth: 0,
  CharityAddress: '0x0000000000000000000000000000000000000000',
  CharityAmountETH: 0,
  StakingPerTokenEth: 0,
  StakingNumStakedTokens: 0,
  EnduranceWinnerAddr: '0x0000000000000000000000000000000000000000',
  EnduranceERC721TokenId: 0,
  EnduranceERC20AmountEth: 0,
  LastCstBidderAddr: '0x0000000000000000000000000000000000000000',
  LastCstBidderERC721TokenId: 0,
  LastCstBidderERC20AmountEth: 0,
  ChronoWarriorAddr: '0x0000000000000000000000000000000000000000',
  ChronoWarriorAmountEth: 0,
  ChronoWarriorCstAmountEth: 0,
  ChronoWarriorNftTokenId: 0,
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('PrizeTable', () => {
  it('renders loading state', () => {
    render(<PrizeTable list={[]} loading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders empty state when not loading', () => {
    render(<PrizeTable list={[]} loading={false} />);
    expect(screen.getByText('No winners yet.')).toBeInTheDocument();
  });

  it('renders all 9 table headers', () => {
    render(<PrizeTable list={[createPrize()]} loading={false} />);
    for (const header of [
      'Round',
      'Finalized',
      'Winner',
      'Prize Amount',
      'Bids',
      'Donated NFTs',
      'Raffle Deposits',
      'Staking Deposit',
      'NFTs Awarded',
    ]) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders prize data', () => {
    render(<PrizeTable list={[createPrize()]} loading={false} />);
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(convertTimestampToDateTime(1701346718)).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('42').length).toBeGreaterThanOrEqual(1);
  });

  it('formats ETH amounts to 4 decimal places', () => {
    render(
      <PrizeTable
        list={[createPrize({ AmountEth: 1.5, StakingDepositAmountEth: 0.75 })]}
        loading={false}
      />,
    );
    expect(screen.getByText('1.5000')).toBeInTheDocument();
    expect(screen.getByText('0.7500')).toBeInTheDocument();
  });

  it('shows shortened winner address', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    render(<PrizeTable list={[createPrize({ WinnerAddr: addr })]} loading={false} />);
    expect(screen.getByText(shortenHex(addr, 6))).toBeInTheDocument();
  });

  it('shows "-" when WinnerAddr is empty', () => {
    render(<PrizeTable list={[createPrize({ WinnerAddr: '' })]} loading={false} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('navigates to prize page on row click', () => {
    render(<PrizeTable list={[createPrize({ RoundNum: 7 })]} loading={false} />);
    const row = screen.getByText('7').closest('tr');
    fireEvent.click(row!);
    expect(mockPush).toHaveBeenCalledWith('/prize/7');
  });

  it('renders only first page of results (perPage=10)', () => {
    const list = Array.from({ length: 12 }, (_, i) => createPrize({ RoundNum: i + 1 }));
    render(<PrizeTable list={list} loading={false} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.queryByText('11')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PrizeTable list={[]} loading={false} />);
    await checkA11y(container);
  });
});
