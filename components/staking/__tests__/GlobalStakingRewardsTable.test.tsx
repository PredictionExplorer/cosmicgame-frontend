import '@testing-library/jest-dom';

import { convertTimestampToDateTime } from '@/utils';

import { render, screen, checkA11y } from '@/test-utils';

jest.mock('../../../hooks/useApiQuery', () => ({
  useStakingCSTRewardsByRound: () => ({ data: [] }),
}));

import { GlobalStakingRewardsTable } from '../GlobalStakingRewardsTable';

const createRow = (overrides = {}) => ({
  EvtLogId: 1,
  TxHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  TimeStamp: 1701346718,
  RoundNum: 10,
  TokenId: 0,
  NumStakedNFTs: 5,
  TotalDepositAmountEth: 1.234567,
  FullyClaimed: false,
  PendingToCollectEth: 0.567891,
  ...overrides,
});

describe('GlobalStakingRewardsTable', () => {
  it('renders empty state message', () => {
    render(<GlobalStakingRewardsTable list={[]} />);
    expect(screen.getByText('No rewards yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<GlobalStakingRewardsTable list={[createRow()]} />);
    for (const header of [
      'Deposit Datetime',
      'Round',
      'Total Staked Tokens',
      'Total Deposited (ETH)',
      'Fully Claimed?',
      'Pending to Collect (ETH)',
    ]) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders row data correctly', () => {
    render(<GlobalStakingRewardsTable list={[createRow()]} />);
    expect(
      screen.getAllByText(convertTimestampToDateTime(1701346718)).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
  });

  it('formats ETH amounts to 6 decimal places', () => {
    render(
      <GlobalStakingRewardsTable
        list={[createRow({ TotalDepositAmountEth: 1.5, PendingToCollectEth: 0.1 })]}
      />,
    );
    expect(screen.getByText('1.500000')).toBeInTheDocument();
    expect(screen.getByText('0.100000')).toBeInTheDocument();
  });

  it('displays FullyClaimed status', () => {
    render(<GlobalStakingRewardsTable list={[createRow({ FullyClaimed: true })]} />);
    expect(screen.getAllByText('Yes').length).toBeGreaterThanOrEqual(1);
  });

  it('renders round link', () => {
    render(<GlobalStakingRewardsTable list={[createRow({ RoundNum: 7 })]} />);
    const link = screen.getByText('7').closest('a');
    expect(link).toHaveAttribute('href', '/prize/7');
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) => createRow({ EvtLogId: i, RoundNum: 100 + i }));
    render(<GlobalStakingRewardsTable list={list} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GlobalStakingRewardsTable list={[]} />);
    await checkA11y(container);
  });
});
