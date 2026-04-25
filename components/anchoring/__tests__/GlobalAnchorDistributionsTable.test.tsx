import '@testing-library/jest-dom';

import { convertTimestampToDateTime } from '@/utils';

import { render, screen, checkA11y } from '@/test-utils';

jest.mock('../../../hooks/useApiQuery', () => ({
  useCSTAnchorDistributionsByCycle: () => ({ data: [] }),
}));

import { GlobalAnchorDistributionsTable } from '../GlobalAnchorDistributionsTable';

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

describe('GlobalAnchorDistributionsTable', () => {
  it('renders empty state message', () => {
    render(<GlobalAnchorDistributionsTable list={[]} />);
    expect(screen.getByText('No distributions yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<GlobalAnchorDistributionsTable list={[createRow()]} />);
    for (const header of [
      'Deposit Datetime',
      'Cycle',
      'Total Anchored Tokens',
      'Total Deposited (ETH)',
      'Fully Retrieved?',
      'Pending to Retrieve (ETH)',
    ]) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders row data correctly', () => {
    render(<GlobalAnchorDistributionsTable list={[createRow()]} />);
    expect(
      screen.getAllByText(convertTimestampToDateTime(1701346718)).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
  });

  it('formats ETH amounts to 6 decimal places', () => {
    render(
      <GlobalAnchorDistributionsTable
        list={[createRow({ TotalDepositAmountEth: 1.5, PendingToCollectEth: 0.1 })]}
      />,
    );
    expect(screen.getByText('1.500000')).toBeInTheDocument();
    expect(screen.getByText('0.100000')).toBeInTheDocument();
  });

  it('displays FullyClaimed status', () => {
    render(<GlobalAnchorDistributionsTable list={[createRow({ FullyClaimed: true })]} />);
    expect(screen.getAllByText('Yes').length).toBeGreaterThanOrEqual(1);
  });

  it('renders round link', () => {
    render(<GlobalAnchorDistributionsTable list={[createRow({ RoundNum: 7 })]} />);
    const link = screen.getByText('7').closest('a');
    expect(link).toHaveAttribute('href', '/allocation/7');
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) => createRow({ EvtLogId: i, RoundNum: 100 + i }));
    render(<GlobalAnchorDistributionsTable list={list} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GlobalAnchorDistributionsTable list={[]} />);
    await checkA11y(container);
  });
});
