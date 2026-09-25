import '@testing-library/jest-dom';

import { convertTimestampToDateTime } from '@/utils';

import { render, screen, checkA11y } from '@/test-utils';

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
    render(<EthDonationTable list={[donation]} />);
    expect(screen.getByText(convertTimestampToDateTime(donation.TimeStamp))).toBeInTheDocument();
  });

  it('names the cycle as "Cycle 5", linked to that cycle’s contributions', () => {
    render(<EthDonationTable list={[createDonation({ RoundNum: '5' })]} />);
    expect(screen.getByRole('link', { name: 'tables.allocation.cycle(cycle=5)' })).toHaveAttribute(
      'href',
      '/eth-contribution/round/5',
    );
  });

  it('renders amount', () => {
    render(<EthDonationTable list={[createDonation({ AmountEth: 0.5 })]} />);
    expect(screen.getByText('0.5000')).toBeInTheDocument();
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
    expect(screen.getByText('tables.ethContribution.withNote')).toBeInTheDocument();
    // No note leaves the cell blank (a phone record drops the line), not a dash per row.
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
    const link = screen.getByRole('link', {
      name: /^\S.* tables\.ethContribution\.viewContribution\(id=7\)$/,
    });
    expect(link).toHaveAttribute('href', '/eth-contribution/detail/7');
    expect(link).not.toHaveAttribute('aria-label');
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
    const datetimeLink = screen.getByText(convertTimestampToDateTime(donation.TimeStamp));
    expect(datetimeLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(datetimeLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('links the cycle to its contribution list in the same tab', () => {
    render(<EthDonationTable list={[createDonation({ RoundNum: '5' })]} />);
    const roundLink = screen.getByText('tables.allocation.cycle(cycle=5)');
    expect(roundLink.closest('a')).toHaveAttribute('href', '/eth-contribution/round/5');
    expect(roundLink.closest('a')).not.toHaveAttribute('target');
  });

  it('hides the cycle column on a page about one cycle', () => {
    render(<EthDonationTable list={[createDonation({ RoundNum: '5' })]} showCycle={false} />);
    expect(
      screen.queryByRole('columnheader', { name: 'tables.columns.round' }),
    ).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<EthDonationTable list={[]} />);
    await checkA11y(container);
  });
});
