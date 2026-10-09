import '@testing-library/jest-dom';

import { phoneRecords, recordLines, wideLedger } from '@/test-utils/ledger';

import { CharityDepositTable } from '@/components/tables/CharityDepositTable';
import { formatAddress } from '@/utils/format';

import { checkA11y, render, screen, within } from '@/test-utils';

const createDonation = (overrides = {}) => ({
  EvtLogId: 1,
  TxHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  TimeStamp: 1701346718,
  RoundNum: 5,
  DonorAddr: '0x1234567890abcdef1234567890abcdef12345678',
  AmountEth: 0.5,
  ...overrides,
});

describe('CharityDepositTable', () => {
  it('renders empty state when list is empty', () => {
    render(<CharityDepositTable list={[]} />);
    expect(screen.getByText('tables.empty.contributions')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<CharityDepositTable list={[createDonation()]} />);
    expect(screen.getAllByText('tables.columns.datetime').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('tables.columns.cycle').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('tables.columns.contributor').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('tables.columns.amountEth').length).toBeGreaterThanOrEqual(1);
  });

  it('renders datetime as explorer link', () => {
    const donation = createDonation();
    render(<CharityDepositTable list={[donation]} />);
    // In the ledger's cell and in the phone record alike.
    const dates = screen.getAllByText('Nov 30, 2023, 12:18');
    expect(dates).toHaveLength(2);
    for (const datetime of dates) {
      expect(datetime.closest('a')).toHaveAttribute('target', '_blank');
      expect(datetime.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('names the cycle, never a bare number, and links it to its record', () => {
    render(<CharityDepositTable list={[createDonation({ RoundNum: 5 })]} />);
    for (const link of screen.getAllByRole('link', { name: 'tables.allocation.cycle(cycle=5)' })) {
      expect(link).toHaveAttribute('href', '/allocation/5');
    }
  });

  it('drops the cycle column when no contribution has a cycle', () => {
    render(<CharityDepositTable list={[createDonation({ RoundNum: -1 })]} />);
    expect(screen.queryByText('-1')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('columnheader', { name: 'tables.columns.cycle' }),
    ).not.toBeInTheDocument();
  });

  it('shows ETH at the ledger precision, end-aligned', () => {
    const { container } = render(
      <CharityDepositTable list={[createDonation({ AmountEth: 1.5 })]} />,
    );
    const amount = container.querySelector('td[data-kind="amount"]');
    expect(amount).toHaveTextContent(/^1\.5000$/);
    expect(amount).toHaveAttribute('data-align', 'end');
  });

  it('reads each contribution as a two-line record on a phone, with no label repeated', () => {
    const { container } = render(
      <CharityDepositTable list={[createDonation({ AmountEth: 1.5, RoundNum: 5 })]} />,
    );
    const [line1, line2] = recordLines(phoneRecords(container)[0]!);
    // The date, linked to its transaction, then the amount with its unit.
    expect(within(line1).getByText('Nov 30, 2023, 12:18').closest('a')).toHaveAttribute(
      'target',
      '_blank',
    );
    expect(line1).toHaveTextContent(/1\.5000\sETH$/);
    // Who contributed and in which cycle.
    expect(line2!.textContent!.split('·').map((fact) => fact.trim())).toEqual([
      formatAddress('0x1234567890abcdef1234567890abcdef12345678'),
      'tables.allocation.cycle(cycle=5)',
    ]);
    // Only the date, which opens the record, is a line of its own.
    const cells = [...container.querySelectorAll('tbody tr:first-child td')];
    expect(cells.map((cell) => cell.getAttribute('data-phone'))).toEqual([
      'title',
      'omit',
      'omit',
      'omit',
    ]);
  });

  it('keeps a protocol contribution’s record to its date, amount and cycle', () => {
    const { container } = render(
      <CharityDepositTable list={[createDonation({ RoundNum: 5 })]} showContributor={false} />,
    );
    const [, line2] = recordLines(phoneRecords(container)[0]!);
    expect(line2).toHaveTextContent(/^tables\.allocation\.cycle\(cycle=5\)$/);
    expect(within(wideLedger(container)).queryByText(/0x1234/)).toBeNull();
  });

  it('shows 20 contributions a page', () => {
    const list = Array.from({ length: 25 }, (_, i) =>
      createDonation({ EvtLogId: i, RoundNum: i + 1 }),
    );
    const { container } = render(<CharityDepositTable list={list} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(20);
  });

  it('names itself with a visible heading when given a title', () => {
    render(<CharityDepositTable list={[createDonation()]} title="Contribution records" />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Contribution records' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Contribution records' })).toBeInTheDocument();
  });

  it('holds placeholder rows while the page loads', () => {
    render(<CharityDepositTable list={[]} loading />);
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
  });

  it('sets rel="noopener noreferrer" on all target="_blank" links', () => {
    render(<CharityDepositTable list={[createDonation()]} />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      if (link.getAttribute('target') === '_blank') {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  it('leaves out the contributor on the protocol’s own ledger, where every row is the protocol', () => {
    render(<CharityDepositTable list={[createDonation()]} showContributor={false} />);
    expect(
      screen.queryByRole('columnheader', { name: 'tables.columns.contributor' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /tables\.columns\.amountEth/ }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CharityDepositTable list={[]} />);
    await checkA11y(container);
  });
});
