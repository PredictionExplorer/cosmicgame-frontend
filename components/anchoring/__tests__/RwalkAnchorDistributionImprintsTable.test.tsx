import '@testing-library/jest-dom';

import { convertTimestampToDateTime } from '@/utils';

import { render, screen, checkA11y } from '@/test-utils';

import { RwalkAnchorDistributionImprintsTable } from '../RwalkAnchorDistributionImprintsTable';

const createRow = (overrides = {}) => ({
  EvtLogId: 1,
  TxHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  TimeStamp: 1701346718,
  WinnerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  RoundNum: 10,
  TokenId: 42,
  ...overrides,
});

describe('RwalkAnchorDistributionImprintsTable', () => {
  it('renders empty state message', () => {
    render(<RwalkAnchorDistributionImprintsTable list={[]} />);
    expect(screen.getByText('No allocations yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<RwalkAnchorDistributionImprintsTable list={[createRow()]} />);
    for (const header of ['Datetime', 'Recipient', 'Cycle', 'Token ID']) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders row data correctly', () => {
    render(<RwalkAnchorDistributionImprintsTable list={[createRow()]} />);
    expect(
      screen.getAllByText(convertTimestampToDateTime(1701346718)).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('42').length).toBeGreaterThanOrEqual(1);
  });

  it('renders round link', () => {
    render(<RwalkAnchorDistributionImprintsTable list={[createRow({ RoundNum: 7 })]} />);
    const link = screen.getByText('7').closest('a');
    expect(link).toHaveAttribute('href', '/allocation/7');
  });

  it('renders token ID link', () => {
    render(<RwalkAnchorDistributionImprintsTable list={[createRow({ TokenId: 99 })]} />);
    const link = screen.getByText('99').closest('a');
    expect(link).toHaveAttribute('href', '/detail/99');
  });

  it('renders datetime as explorer link', () => {
    const row = createRow();
    render(<RwalkAnchorDistributionImprintsTable list={[row]} />);
    const datetime = screen.getByText(convertTimestampToDateTime(row.TimeStamp));
    expect(datetime.closest('a')).toHaveAttribute('target', '_blank');
    expect(datetime.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) => createRow({ EvtLogId: i, TokenId: 100 + i }));
    render(<RwalkAnchorDistributionImprintsTable list={list} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RwalkAnchorDistributionImprintsTable list={[]} />);
    await checkA11y(container);
  });
});
