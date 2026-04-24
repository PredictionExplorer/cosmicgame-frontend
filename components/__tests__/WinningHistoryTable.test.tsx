import '@testing-library/jest-dom';

import { convertTimestampToDateTime } from '@/utils';

import WinningHistoryTable from '@/components/tables/WinningHistoryTable';
import type { WinningHistoryEntry } from '@/services/api/types';

import { render, screen, checkA11y } from '@/test-utils';

const createEntry = (overrides: Partial<WinningHistoryEntry> = {}): WinningHistoryEntry => ({
  EvtLogId: 1,
  BlockNum: 100000,
  TxId: 1,
  TxHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  TimeStamp: 1701346718,
  DateTime: '2023-11-30T12:18:38Z',
  RecordType: 0,
  RecipientAddr: '0x1234567890abcdef1234567890abcdef12345678',
  RoundNum: 42,
  AmountEth: 1.5,
  TokenAddress: '',
  TokenId: -1,
  RecipientIndex: 0,
  Claimed: true,
  ...overrides,
});

describe('WinningHistoryTable', () => {
  it('renders "No history yet." when list is empty', () => {
    render(<WinningHistoryTable winningHistory={[]} />);
    expect(screen.getByText('No history yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<WinningHistoryTable winningHistory={[createEntry()]} />);
    const headers = screen.getAllByText('Record Type');
    expect(headers.length).toBeGreaterThanOrEqual(1);
    const datetimeHeaders = screen.getAllByText('Datetime');
    expect(datetimeHeaders.length).toBeGreaterThanOrEqual(1);
  });

  it('renders datetime from TxHash link', () => {
    const entry = createEntry();
    render(<WinningHistoryTable winningHistory={[entry]} />);
    expect(screen.getByText(convertTimestampToDateTime(entry.TimeStamp))).toBeInTheDocument();
  });

  it('renders record type text for Signature Allocation ETH', () => {
    render(<WinningHistoryTable winningHistory={[createEntry({ RecordType: 0 })]} />);
    expect(screen.getByText('Signature Allocation ETH')).toBeInTheDocument();
  });

  it('renders record type text for Raffle ETH', () => {
    render(<WinningHistoryTable winningHistory={[createEntry({ RecordType: 3 })]} />);
    expect(screen.getByText('ETH Stellar Selection (for participants)')).toBeInTheDocument();
  });

  it('renders round number as link', () => {
    const entry = createEntry({ RoundNum: 42 });
    render(<WinningHistoryTable winningHistory={[entry]} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders amount in ETH for ETH record types', () => {
    render(
      <WinningHistoryTable winningHistory={[createEntry({ RecordType: 0, AmountEth: 1.5 })]} />,
    );
    expect(screen.getByText('1.5000 ETH')).toBeInTheDocument();
  });

  it('sets rel="noopener noreferrer" on all target="_blank" links', () => {
    const entry = createEntry({
      TokenAddress: '0xTokenAddress1234567890abcdef12345678901234',
      TokenId: 5,
    });
    render(<WinningHistoryTable winningHistory={[entry]} />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      if (link.getAttribute('target') === '_blank') {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  it('renders winner address when showWinnerAddr is true', () => {
    const entry = createEntry();
    render(<WinningHistoryTable winningHistory={[entry]} showWinnerAddr={true} />);
    const winnerHeaders = screen.getAllByText('Recipient');
    expect(winnerHeaders.length).toBeGreaterThanOrEqual(1);
  });

  it('hides winner column when showWinnerAddr is false', () => {
    render(<WinningHistoryTable winningHistory={[createEntry()]} showWinnerAddr={false} />);
    expect(screen.queryByText('Recipient')).not.toBeInTheDocument();
  });

  it('renders token ID link when TokenId >= 0', () => {
    const entry = createEntry({ TokenId: 10 });
    render(<WinningHistoryTable winningHistory={[entry]} />);
    const tokenLink = screen.getByText('10');
    expect(tokenLink.closest('a')).toHaveAttribute('href', '/detail/10');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<WinningHistoryTable winningHistory={[]} />);
    await checkA11y(container);
  });
});
