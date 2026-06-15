import '@testing-library/jest-dom';

import { convertTimestampToDateTime, shortenHex } from '@/utils';

import { AllocationTable } from '@/components/tables/AllocationTable';

import { checkA11y, render, screen } from '@/test-utils';

const createAllocation = (overrides = {}) => ({
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

describe('AllocationTable', () => {
  it('renders skeleton rows when loading', () => {
    render(<AllocationTable list={[]} loading={true} />);
    expect(screen.getByRole('status', { name: /loading allocation cycles/i })).toBeInTheDocument();
  });

  it('renders empty state when not loading and list is empty', () => {
    render(<AllocationTable list={[]} loading={false} />);
    expect(screen.getByText(/no recipients yet/i)).toBeInTheDocument();
  });

  it('renders compact two-line allocation row data', () => {
    render(<AllocationTable list={[createAllocation()]} loading={false} />);
    expect(screen.getByText('Cycle 1')).toBeInTheDocument();
    expect(screen.getByText(convertTimestampToDateTime(1701346718))).toBeInTheDocument();
    expect(screen.getByText('1.5000 ETH')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('2.5000')).toBeInTheDocument();
    expect(screen.getByText('0.7500')).toBeInTheDocument();
  });

  it('shows shortened recipient address', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    render(<AllocationTable list={[createAllocation({ WinnerAddr: addr })]} loading={false} />);
    expect(screen.getByText(shortenHex(addr, 6))).toBeInTheDocument();
  });

  it('shows "-" when WinnerAddr is empty', () => {
    render(<AllocationTable list={[createAllocation({ WinnerAddr: '' })]} loading={false} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('cycle title links to the allocation detail page', () => {
    render(<AllocationTable list={[createAllocation({ RoundNum: 7 })]} loading={false} />);
    expect(screen.getByRole('link', { name: 'Cycle 7' })).toHaveAttribute('href', '/allocation/7');
  });

  it('Explore button links to the cycle detail page', () => {
    render(<AllocationTable list={[createAllocation({ RoundNum: 7 })]} loading={false} />);
    expect(screen.getByRole('link', { name: 'Explore cycle 7' })).toHaveAttribute(
      'href',
      '/allocation/7',
    );
  });

  it('renders only first page of results (perPage=10)', () => {
    const list = Array.from({ length: 12 }, (_, i) => createAllocation({ RoundNum: i + 1 }));
    render(<AllocationTable list={list} loading={false} />);
    expect(screen.getByText('Cycle 10')).toBeInTheDocument();
    expect(screen.queryByText('Cycle 11')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AllocationTable list={[]} loading={false} />);
    await checkA11y(container);
  });

  it('has no accessibility violations with data', async () => {
    const { container } = render(<AllocationTable list={[createAllocation()]} loading={false} />);
    await checkA11y(container);
  });
});
