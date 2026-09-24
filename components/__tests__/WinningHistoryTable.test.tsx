import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import RecipientHistoryTable, { retrievalSection } from '@/components/tables/RecipientHistoryTable';
import type { WinningHistoryEntry } from '@/services/api/types';

import { render, screen, checkA11y, within } from '@/test-utils';

const ALICE = '0x1234567890abcdef1234567890abcdef12345678';
/** The backend's Anchor Distribution recipient placeholder (a sealed wire value). */
const ALL_ANCHOR_HOLDERS = '(All CS NFT Stakers)'; // lexicon-allow-backend-type
const BOB = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

const createEntry = (overrides: Partial<WinningHistoryEntry> = {}): WinningHistoryEntry => ({
  EvtLogId: 1,
  BlockNum: 100000,
  TxId: 1,
  TxHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  TimeStamp: 1701346718,
  DateTime: '2023-11-30T12:18:38Z',
  RecordType: 0,
  WinnerAddr: ALICE,
  RoundNum: 42,
  AmountEth: 1.5,
  TokenAddress: '',
  TokenId: -1,
  WinnerIndex: -1,
  Claimed: true,
  ...overrides,
});

describe('RecipientHistoryTable', () => {
  it('renders the empty state when the list is empty', () => {
    render(<RecipientHistoryTable winningHistory={[]} />);
    expect(screen.getByText('tables.empty.history')).toBeInTheDocument();
  });

  it('names each record by its allocation, with what it allocated', () => {
    render(
      <RecipientHistoryTable
        winningHistory={[
          createEntry({ RecordType: 0, AmountEth: 1.5 }),
          createEntry({ RecordType: 11, AmountEth: 1000, TxHash: '0x2' }),
          createEntry({ RecordType: 3, TokenId: 7, TxHash: '0x3' }),
        ]}
      />,
    );

    expect(screen.getByText('tables.recipientHistory.sources.signature')).toBeInTheDocument();
    expect(
      screen.getByText('tables.recipientHistory.sources.stellarSelection'),
    ).toBeInTheDocument();
    expect(screen.getByText('tables.recipientHistory.sources.finalCstGesture')).toBeInTheDocument();
    expect(screen.getByText('1.5000').textContent).toBe('1.5000 ETH');
    // A protocol amount of CST reads whole, grouped.
    expect(screen.getByText('1,000').textContent).toBe('1,000 CST');
    // An NFT names its token and links to it, never "N/A".
    expect(screen.getByRole('link', { name: 'tables.recipientHistory.nft(id=7)' })).toHaveAttribute(
      'href',
      '/detail/7',
    );
  });

  it('links each date to its transaction on the explorer', () => {
    const entry = createEntry();
    render(<RecipientHistoryTable winningHistory={[entry]} />);
    const time = document.querySelector(
      `time[datetime="${new Date(entry.TimeStamp * 1000).toISOString()}"]`,
    );
    const link = time?.closest('a');
    expect(link).toHaveAttribute('href', expect.stringContaining(entry.TxHash));
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('links the cycle in the same tab, as "Cycle 42" rather than a bare number', () => {
    render(<RecipientHistoryTable winningHistory={[createEntry({ RoundNum: 42 })]} />);
    const cycle = screen.getByRole('link', { name: 'tables.allocation.cycle(cycle=42)' });
    expect(cycle).toHaveAttribute('href', '/allocation/42');
    expect(cycle).not.toHaveAttribute('target');
  });

  it('numbers only a Stellar Selection by its place among the selections, from 1', () => {
    const { container } = render(
      <RecipientHistoryTable
        winningHistory={[
          createEntry({ RecordType: 0, WinnerIndex: 0, TxHash: '0x1' }),
          createEntry({ RecordType: 12, TokenId: 30, WinnerIndex: 2, TxHash: '0x2' }),
        ]}
      />,
    );
    const positions = [
      ...container.querySelectorAll('tbody td[data-label="tables.columns.position"]'),
    ].map((cell) => cell.textContent);
    // The Signature Allocation has no place to number; the selection was the third.
    expect(positions).toEqual(['', '#3']);
  });

  it('drops the position column when no record is a Stellar Selection', () => {
    render(<RecipientHistoryTable winningHistory={[createEntry({ WinnerIndex: 0 })]} />);
    expect(
      screen.queryByRole('columnheader', { name: 'tables.columns.position' }),
    ).not.toBeInTheDocument();
  });

  it('shows the recipient column only when asked', () => {
    const { rerender } = render(
      <RecipientHistoryTable winningHistory={[createEntry()]} showWinnerAddr />,
    );
    expect(
      screen.getByRole('columnheader', { name: 'tables.columns.recipient' }),
    ).toBeInTheDocument();

    rerender(<RecipientHistoryTable winningHistory={[createEntry()]} showWinnerAddr={false} />);
    expect(
      screen.queryByRole('columnheader', { name: 'tables.columns.recipient' }),
    ).not.toBeInTheDocument();
  });

  it('names Anchor Distribution rows for all anchor-holders instead of linking a placeholder', () => {
    render(
      <RecipientHistoryTable
        winningHistory={[createEntry({ RecordType: 15, WinnerAddr: ALL_ANCHOR_HOLDERS })]}
      />,
    );
    expect(screen.getByText('tables.recipientHistory.allAnchorHolders')).toBeInTheDocument();
    expect(screen.queryByText(ALL_ANCHOR_HOLDERS)).not.toBeInTheDocument();
  });

  describe('with retrieval status', () => {
    it('marks an unretrieved allocation as ready, with a way to retrieve it', () => {
      render(
        <RecipientHistoryTable
          winningHistory={[createEntry({ RecordType: 10, Claimed: false, AmountEth: 0.2 })]}
          showClaimedStatus
          showWinnerAddr={false}
        />,
      );
      expect(screen.getByText('tables.recipientHistory.readyToRetrieve')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'tables.recipientHistory.retrieve' }),
      ).toHaveAttribute('href', '/my-allocations#eth');
      // Good news is not an error: no alert, no destructive colour.
      expect(document.querySelector('.text-destructive')).not.toBeInTheDocument();
    });

    it('marks a retrieved allocation quietly', () => {
      render(
        <RecipientHistoryTable
          winningHistory={[createEntry({ Claimed: true })]}
          showClaimedStatus
          showWinnerAddr={false}
        />,
      );
      expect(screen.getByText('tables.recipientHistory.retrieved')).toBeInTheDocument();
    });

    it('sends each record to the My Allocations section that retrieves it', () => {
      expect(retrievalSection(10)).toBe('eth');
      expect(retrievalSection(15)).toBe('anchors');
      expect(retrievalSection(16)).toBe('nfts');
      expect(retrievalSection(17)).toBe('erc20');
    });

    it('sums the history above the table', () => {
      render(
        <RecipientHistoryTable
          winningHistory={[
            createEntry({ RecordType: 0, AmountEth: 1.5, RoundNum: 1 }),
            createEntry({ RecordType: 1, AmountEth: 1000, RoundNum: 1, TxHash: '0x2' }),
            createEntry({ RecordType: 2, TokenId: 3, RoundNum: 2, TxHash: '0x3' }),
          ]}
          showSummary
        />,
      );
      const summary = screen.getByText('tables.recipientHistory.totals.eth').closest('dl');
      expect(summary).not.toBeNull();
      const figures = within(summary as HTMLElement);
      expect(figures.getByText('1.5000')).toBeInTheDocument();
      expect(figures.getByText('1,000')).toBeInTheDocument();
      expect(figures.getByText('tables.recipientHistory.totals.cycles')).toBeInTheDocument();
    });
  });

  describe('grouped by recipient', () => {
    const ledger = [
      createEntry({ RecordType: 0, AmountEth: 11.0616, WinnerAddr: ALICE, TxHash: '0x1' }),
      createEntry({ RecordType: 1, AmountEth: 1000, WinnerAddr: ALICE, TxHash: '0x2' }),
      createEntry({ RecordType: 2, TokenId: 24, WinnerAddr: ALICE, TxHash: '0x3' }),
      createEntry({ RecordType: 10, AmountEth: 0.3, WinnerAddr: BOB, TxHash: '0x4' }),
    ];

    it('shows one row per recipient with what they received', () => {
      const { container } = render(
        <RecipientHistoryTable winningHistory={ledger} groupBy="recipient" />,
      );
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(2);
      expect(rows[0]).toHaveTextContent('11.0616');
      expect(rows[0]).toHaveTextContent('1,000');
      expect(rows[0]).toHaveTextContent('tables.recipientHistory.nft(id=24)');
      expect(rows[1]).toHaveTextContent('tables.recipientHistory.sources.stellarSelection');
      // The disclosure column is named on screen.
      expect(
        screen.getByRole('columnheader', { name: 'tables.recipientHistory.recordsHeader' }),
      ).toBeInTheDocument();
    });

    it('counts several NFTs instead of listing every number in the row', () => {
      const { container } = render(
        <RecipientHistoryTable
          winningHistory={[
            createEntry({ RecordType: 7, AmountEth: 3.5397, WinnerAddr: BOB, TxHash: '0x1' }),
            ...[26, 27, 29, 30].map((id, index) =>
              createEntry({ RecordType: 12, TokenId: id, WinnerAddr: BOB, TxHash: `0x${index}` }),
            ),
          ]}
          groupBy="recipient"
        />,
      );
      const row = container.querySelector('tbody tr');
      expect(row).toHaveTextContent('3.5397');
      expect(row).toHaveTextContent('tables.recipientHistory.nftCount(count=4)');
      expect(row).not.toHaveTextContent('tables.recipientHistory.nft(id=26)');
    });

    it('tags an Anchored-NFT Stellar Selection by the short form the NFT pages use', () => {
      const { container } = render(
        <RecipientHistoryTable
          winningHistory={[createEntry({ RecordType: 13, TokenId: 31, WinnerAddr: BOB })]}
          groupBy="recipient"
        />,
      );
      const row = container.querySelector('tbody tr');
      expect(row).toHaveTextContent('tables.recipientHistory.sourceTags.anchoredStellarSelection');
      expect(row).not.toHaveTextContent('tables.recipientHistory.sources.anchoredStellarSelection');
    });

    it('expands a recipient to their individual records', async () => {
      const user = userEvent.setup();
      render(<RecipientHistoryTable winningHistory={ledger} groupBy="recipient" />);

      const toggle = screen.getByRole('button', {
        name: /tables\.recipientHistory\.showRecords\(count=3\)/,
      });
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      const details = document.getElementById(toggle.getAttribute('aria-controls') ?? '');
      expect(details).not.toBeNull();
      expect(within(details as HTMLElement).getAllByRole('listitem')).toHaveLength(3);
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <RecipientHistoryTable winningHistory={[createEntry()]} showClaimedStatus />,
    );
    await checkA11y(container);
  });
});
