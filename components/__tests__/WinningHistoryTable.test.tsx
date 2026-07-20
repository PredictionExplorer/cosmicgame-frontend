import '@testing-library/jest-dom';

import { convertTimestampToDateTime } from '@/utils';

import RecipientHistoryTable from '@/components/tables/RecipientHistoryTable';
import type { WinningHistoryEntry } from '@/services/api/types';

import { render, screen, checkA11y } from '@/test-utils';

const mockConvertTimestampToDateTime = jest.fn();
jest.mock('@/utils', () => {
  const actual = jest.requireActual<typeof import('@/utils')>('@/utils');
  return {
    ...actual,
    convertTimestampToDateTime: (timestamp: number, showSecond?: boolean, locale?: string) => {
      mockConvertTimestampToDateTime(timestamp, showSecond, locale);
      return actual.convertTimestampToDateTime(timestamp, showSecond, locale);
    },
  };
});

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

beforeEach(() => jest.clearAllMocks());

describe('RecipientHistoryTable', () => {
  it('renders "No history yet." when list is empty', () => {
    render(<RecipientHistoryTable winningHistory={[]} />);
    expect(screen.getByText('tables.empty.history')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<RecipientHistoryTable winningHistory={[createEntry()]} />);
    const headers = screen.getAllByText('tables.columns.recordType');
    expect(headers.length).toBeGreaterThanOrEqual(1);
    const datetimeHeaders = screen.getAllByText('tables.columns.datetime');
    expect(datetimeHeaders.length).toBeGreaterThanOrEqual(1);
  });

  it('renders datetime from TxHash link', () => {
    const entry = createEntry();
    render(<RecipientHistoryTable winningHistory={[entry]} />);
    expect(screen.getByText(convertTimestampToDateTime(entry.TimeStamp))).toBeInTheDocument();
    expect(mockConvertTimestampToDateTime).toHaveBeenCalledWith(entry.TimeStamp, false, 'en');
  });

  it('renders record type text for Main ETH Allocation', () => {
    render(<RecipientHistoryTable winningHistory={[createEntry({ RecordType: 0 })]} />);
    expect(screen.getByText('tables.recipientHistory.types.mainEth')).toBeInTheDocument();
  });

  it('renders record type text for Final CST Gesture CS NFT', () => {
    render(<RecipientHistoryTable winningHistory={[createEntry({ RecordType: 3, TokenId: 1 })]} />);
    expect(screen.getByText('tables.recipientHistory.types.finalCstNft')).toBeInTheDocument();
    expect(screen.getByText('tables.recipientHistory.notApplicable')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('href', '/detail/1');
  });

  it('renders record type text for Stellar Selection ETH', () => {
    render(
      <RecipientHistoryTable
        winningHistory={[createEntry({ RecordType: 10, AmountEth: 0.329286 })]}
      />,
    );
    expect(
      screen.getByText('tables.recipientHistory.types.participantStellarEth'),
    ).toBeInTheDocument();
    expect(screen.getByText('0.3293 ETH')).toBeInTheDocument();
  });

  it('renders round number as link', () => {
    const entry = createEntry({ RoundNum: 42 });
    render(<RecipientHistoryTable winningHistory={[entry]} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders amount in ETH for ETH record types', () => {
    render(
      <RecipientHistoryTable winningHistory={[createEntry({ RecordType: 0, AmountEth: 1.5 })]} />,
    );
    expect(screen.getByText('1.5000 ETH')).toBeInTheDocument();
  });

  it('renders CST amounts as whole numbers without decimals', () => {
    render(
      <RecipientHistoryTable winningHistory={[createEntry({ RecordType: 11, AmountEth: 1000 })]} />,
    );
    expect(screen.getByText('1000 CST')).toBeInTheDocument();
    expect(screen.queryByText('1000.00 CST')).not.toBeInTheDocument();
  });

  it('sets rel="noopener noreferrer" on all target="_blank" links', () => {
    const entry = createEntry({
      TokenAddress: '0xTokenAddress1234567890abcdef12345678901234',
      TokenId: 5,
    });
    render(<RecipientHistoryTable winningHistory={[entry]} />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      if (link.getAttribute('target') === '_blank') {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  it('renders recipient address when showWinnerAddr is true', () => {
    const entry = createEntry();
    render(<RecipientHistoryTable winningHistory={[entry]} showWinnerAddr={true} />);
    const recipientHeaders = screen.getAllByText('tables.columns.recipient');
    expect(recipientHeaders.length).toBeGreaterThanOrEqual(1);
  });

  it('hides recipient column when showWinnerAddr is false', () => {
    render(<RecipientHistoryTable winningHistory={[createEntry()]} showWinnerAddr={false} />);
    expect(screen.queryByText('tables.columns.recipient')).not.toBeInTheDocument();
  });

  it('renders token ID link when TokenId >= 0', () => {
    const entry = createEntry({ TokenId: 10 });
    render(<RecipientHistoryTable winningHistory={[entry]} />);
    const tokenLink = screen.getByText('10');
    expect(tokenLink.closest('a')).toHaveAttribute('href', '/detail/10');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RecipientHistoryTable winningHistory={[]} />);
    await checkA11y(container);
  });
});
