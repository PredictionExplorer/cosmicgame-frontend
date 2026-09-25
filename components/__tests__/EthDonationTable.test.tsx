import '@testing-library/jest-dom';

import { phoneRecords, recordLines, wideLedger } from '@/test-utils/ledger';

import { formatAddress } from '@/utils/format';

import { render, screen, checkA11y, within } from '@/test-utils';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// eslint-disable-next-line import/order
import EthDonationTable from '@/components/tables/EthDonationTable';

const createDonation = (overrides = {}) => ({
  EvtLogId: '1',
  TxHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  TimeStamp: 1701346718,
  RecordType: 0,
  CGRecordId: '100',
  RoundNum: '5',
  DonorAddr: '0x1234567890abcdef1234567890abcdef12345678',
  AmountEth: 0.5,
  ...overrides,
});

describe('EthDonationTable', () => {
  it('renders "No contributions yet." when list is empty', () => {
    render(<EthDonationTable list={[]} />);
    expect(screen.getByText('tables.empty.contributions')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<EthDonationTable list={[createDonation()]} />);
    const headers = screen.getAllByText('tables.columns.datetime');
    expect(headers.length).toBeGreaterThanOrEqual(1);
  });

  it('renders datetime from data', () => {
    const donation = createDonation();
    const { container } = render(<EthDonationTable list={[donation]} />);
    expect(within(wideLedger(container)).getAllByText('Nov 30, 2023, 12:18')).toHaveLength(1);
  });

  it('names the cycle as "Cycle 5", linked to that cycle’s contributions', () => {
    render(<EthDonationTable list={[createDonation({ RoundNum: '5' })]} />);
    // In the ledger's cell and in the phone record alike.
    const links = screen.getAllByRole('link', { name: 'tables.allocation.cycle(cycle=5)' });
    expect(links).toHaveLength(2);
    for (const link of links) expect(link).toHaveAttribute('href', '/eth-contribution/round/5');
  });

  it('renders amount', () => {
    const { container } = render(<EthDonationTable list={[createDonation({ AmountEth: 0.5 })]} />);
    // The column's header names the unit; the figure alone sits under it.
    expect(within(wideLedger(container)).getByText('0.5000')).toHaveTextContent(/^0\.5000$/);
  });

  it('reads each contribution as a two-line record on a phone, with no label repeated', () => {
    const { container } = render(
      <EthDonationTable
        list={[createDonation({ RecordType: 1, CGRecordId: '7', AmountEth: 0.5, RoundNum: '5' })]}
      />,
    );
    const [record] = phoneRecords(container);
    const [line1, line2] = recordLines(record!);
    // The date opens the record and leads to the contribution's record; the
    // amount, with its unit, closes the line.
    expect(
      within(line1).getByRole('link', {
        name: /tables\.ethContribution\.viewContribution\(id=7\)$/,
      }),
    ).toHaveAttribute('href', '/eth-contribution/detail/7');
    expect(line1).toHaveTextContent(/0\.5000\sETH$/);
    // Who, which cycle, and the note, in the second tier.
    const facts = line2!.textContent!.split('·').map((fact) => fact.trim());
    expect(facts).toEqual([
      formatAddress('0x1234567890abcdef1234567890abcdef12345678'),
      'tables.allocation.cycle(cycle=5)',
      'tables.ethContribution.withNote',
    ]);
    // The record says every column but the date, which opens it.
    const cells = [...container.querySelectorAll('tbody tr:first-child td')];
    expect(cells.map((cell) => cell.getAttribute('data-phone'))).toEqual([
      'title',
      'omit',
      'omit',
      'omit',
      'omit',
    ]);
  });

  it('links a plain contribution’s date in its record to the transaction', () => {
    const { container } = render(<EthDonationTable list={[createDonation({ RecordType: 0 })]} />);
    const [line1] = recordLines(phoneRecords(container)[0]!);
    const proof = within(line1).getByText('Nov 30, 2023, 12:18').closest('a');
    expect(proof).toHaveAttribute('target', '_blank');
    expect(proof?.getAttribute('href')).toMatch(/\/tx\/0xabc123/);
  });

  it('says in the Note column which contributions carry a note, in the form’s words', () => {
    render(
      <EthDonationTable
        list={[
          createDonation({ RecordType: 1, EvtLogId: '1', CGRecordId: '100' }),
          createDonation({ RecordType: 0, EvtLogId: '2', CGRecordId: '101' }),
        ]}
        showType={true}
      />,
    );
    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);
    // Last, after when, which cycle, who and how much.
    expect(headers.at(-1)).toBe('tables.columns.note');
    expect(
      within(wideLedger(document.body)).getAllByText('tables.ethContribution.withNote'),
    ).toHaveLength(1);
    // No note leaves the cell blank, not a dash per row.
    expect(screen.queryByText('tables.status.none')).not.toBeInTheDocument();
    expect(screen.queryByText(/ethContribution\.(simple|withInfo)/)).not.toBeInTheDocument();
  });

  // Every current contribution was plain, so the column was a line of dashes.
  it('drops the Note column when no contribution on the page has a note (regression)', () => {
    render(<EthDonationTable list={[createDonation({ RecordType: 0 })]} showType={true} />);
    expect(screen.queryByRole('columnheader', { name: 'tables.columns.note' })).toBeNull();
  });

  it('names a contribution’s record link by its date, then the record it opens', () => {
    render(<EthDonationTable list={[createDonation({ RecordType: 1, CGRecordId: '7' })]} />);
    // The ledger's cell and the phone record name it alike.
    const links = screen.getAllByRole('link', {
      name: /^\S.* tables\.ethContribution\.viewContribution\(id=7\)$/,
    });
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/eth-contribution/detail/7');
      expect(link).not.toHaveAttribute('aria-label');
    }
  });

  it('shows the newest contribution first, and says so on the Date header', () => {
    render(
      <EthDonationTable
        list={[
          createDonation({ EvtLogId: '1', TimeStamp: 1_700_000_000, AmountEth: 1 }),
          createDonation({ EvtLogId: '2', TimeStamp: 1_700_100_000, AmountEth: 2 }),
        ]}
      />,
    );
    expect(screen.getByRole('columnheader', { name: /tables\.columns\.datetime/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    const amounts = [...document.querySelectorAll('tbody td[data-kind="amount"]')].map(
      (cell) => cell.textContent,
    );
    expect(amounts).toEqual(['2.0000', '1.0000']);
  });

  it('sets rel="noopener noreferrer" on all target="_blank" links', () => {
    render(<EthDonationTable list={[createDonation()]} />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      if (link.getAttribute('target') === '_blank') {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  it('renders TxHash datetime as a link to explorer', () => {
    const donation = createDonation();
    render(<EthDonationTable list={[donation]} />);
    for (const datetime of screen.getAllByText('Nov 30, 2023, 12:18')) {
      expect(datetime.closest('a')).toHaveAttribute('target', '_blank');
      expect(datetime.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('links the cycle to its contribution list in the same tab', () => {
    render(<EthDonationTable list={[createDonation({ RoundNum: '5' })]} />);
    for (const roundLink of screen.getAllByText('tables.allocation.cycle(cycle=5)')) {
      expect(roundLink.closest('a')).toHaveAttribute('href', '/eth-contribution/round/5');
      expect(roundLink.closest('a')).not.toHaveAttribute('target');
    }
  });

  it('hides the cycle column on a page about one cycle', () => {
    render(<EthDonationTable list={[createDonation({ RoundNum: '5' })]} showCycle={false} />);
    expect(
      screen.queryByRole('columnheader', { name: 'tables.columns.round' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('tables.allocation.cycle(cycle=5)')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<EthDonationTable list={[]} />);
    await checkA11y(container);
  });
});
