import '@testing-library/jest-dom';

import { convertTimestampToDateTime } from '@/utils';

import { render, screen, checkA11y } from '@/test-utils';

import { CSTAnchorDistributionsByDepositTable } from '../CSTAnchorDistributionsByDepositTable';

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

describe('CSTAnchorDistributionsByDepositTable', () => {
  it('renders empty state message', () => {
    render(<CSTAnchorDistributionsByDepositTable list={[]} />);
    expect(screen.getByText('No distributions yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<CSTAnchorDistributionsByDepositTable list={[createRow()]} />);
    for (const header of [
      'Deposit Datetime',
      'Deposit Cycle',
      'Deposit ID',
      'Total Deposit Amount',
      'Total Retrieved Amount',
      'Your Retrievable Amount',
      'Fully Retrieved?',
      'Total Anchored NFTs',
      'Total Retrieved Tokens',
      'Your Anchored Tokens',
    ]) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders row data correctly', () => {
    render(<CSTAnchorDistributionsByDepositTable list={[createRow()]} />);
    expect(
      screen.getAllByText(convertTimestampToDateTime(1701346718)).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
  });

  it('formats ETH amounts to 4 decimal places', () => {
    render(
      <CSTAnchorDistributionsByDepositTable
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
    render(<CSTAnchorDistributionsByDepositTable list={[createRow({ FullyClaimed: true })]} />);
    expect(screen.getAllByText('Yes').length).toBeGreaterThanOrEqual(1);
  });

  it('renders deposit round link', () => {
    render(<CSTAnchorDistributionsByDepositTable list={[createRow({ DepositRoundNum: 7 })]} />);
    const link = screen.getByText('7').closest('a');
    expect(link).toHaveAttribute('href', '/allocation/7');
  });

  it('renders datetime as explorer link', () => {
    const row = createRow();
    render(<CSTAnchorDistributionsByDepositTable list={[row]} />);
    const datetime = screen.getByText(convertTimestampToDateTime(row.TimeStamp));
    expect(datetime.closest('a')).toHaveAttribute('target', '_blank');
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createRow({ EvtLogId: i, DepositId: 100 + i }),
    );
    render(<CSTAnchorDistributionsByDepositTable list={list} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CSTAnchorDistributionsByDepositTable list={[]} />);
    await checkA11y(container);
  });
});
