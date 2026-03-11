import '@testing-library/jest-dom';

import { convertTimestampToDateTime } from '@/utils';

import { render, screen } from '@/test-utils';

import { CSTStakingRewardsByDepositTable } from '../CSTStakingRewardsByDepositTable';

const createRow = (overrides = {}) => ({
  EvtLogId: 1,
  TxHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  TimeStamp: 1701346718,
  DepositRoundNum: 10,
  DepositId: 5,
  DepositAmountEth: 1.2345,
  ClaimedAmountEth: 0.5678,
  YourClaimableAmountEth: 0.1234,
  FullyClaimed: false,
  NumStakedNFTs: 3,
  NumTokensCollected: 2,
  YourTokensStaked: 1,
  ...overrides,
});

describe('CSTStakingRewardsByDepositTable', () => {
  it('renders empty state message', () => {
    render(<CSTStakingRewardsByDepositTable list={[]} />);
    expect(screen.getByText('No rewards yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<CSTStakingRewardsByDepositTable list={[createRow()]} />);
    for (const header of [
      'Deposit Datetime',
      'Deposit Round',
      'Deposit ID',
      'Total Deposit Amount',
      'Total Claimed Amount',
      'Your Claimable Amount',
      'Fully Claimed?',
      'Total Staked NFTs',
      'Total Collected Tokens',
      'Your Staked Tokens',
    ]) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders row data correctly', () => {
    render(<CSTStakingRewardsByDepositTable list={[createRow()]} />);
    expect(
      screen.getAllByText(convertTimestampToDateTime(1701346718)).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
  });

  it('formats ETH amounts to 4 decimal places', () => {
    render(
      <CSTStakingRewardsByDepositTable
        list={[
          createRow({ DepositAmountEth: 1.5, ClaimedAmountEth: 0.1, YourClaimableAmountEth: 0.2 }),
        ]}
      />,
    );
    expect(screen.getByText('1.5000')).toBeInTheDocument();
    expect(screen.getByText('0.1000')).toBeInTheDocument();
    expect(screen.getByText('0.2000')).toBeInTheDocument();
  });

  it('displays FullyClaimed status', () => {
    render(<CSTStakingRewardsByDepositTable list={[createRow({ FullyClaimed: true })]} />);
    expect(screen.getAllByText('Yes').length).toBeGreaterThanOrEqual(1);
  });

  it('renders deposit round link', () => {
    render(<CSTStakingRewardsByDepositTable list={[createRow({ DepositRoundNum: 7 })]} />);
    const link = screen.getByText('7').closest('a');
    expect(link).toHaveAttribute('href', '/prize/7');
  });

  it('renders datetime as explorer link', () => {
    const row = createRow();
    render(<CSTStakingRewardsByDepositTable list={[row]} />);
    const datetime = screen.getByText(convertTimestampToDateTime(row.TimeStamp));
    expect(datetime.closest('a')).toHaveAttribute('target', '_blank');
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createRow({ EvtLogId: i, DepositId: 100 + i }),
    );
    render(<CSTStakingRewardsByDepositTable list={list} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });
});
