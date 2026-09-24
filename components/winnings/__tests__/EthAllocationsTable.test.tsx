import { checkA11y, render, screen, within } from '@/test-utils';

import { EthAllocationsTable, type EthAllocationRow } from '../EthAllocationsTable';

const NOW_SECONDS = 1_800_000_000;

jest.mock('../../../hooks/useNow', () => ({
  useNow: () => NOW_SECONDS * 1000,
}));

const rows: EthAllocationRow[] = [
  {
    EvtLogId: 1,
    TxHash: '0xabc',
    TimeStamp: 1_700_000_000,
    RoundNum: 2,
    Amount: 0.58995113,
    RecordType: 10,
    Claimed: false,
  },
  {
    EvtLogId: 2,
    TxHash: '0xdef',
    TimeStamp: 1_700_000_100,
    RoundNum: 3,
    Amount: 3.5397,
    RecordType: 7,
    Claimed: true,
  },
];

function bodyRows() {
  return screen.getAllByRole('row').slice(1);
}

describe('EthAllocationsTable', () => {
  it('lists the cycle, the source and the amount at the table precision, newest first', () => {
    render(<EthAllocationsTable rows={rows} ariaLabel="ETH allocations" />);

    const [first, second] = bodyRows();
    expect(
      within(first!).getByRole('link', { name: /ethAllocations\.cycle\(cycle=3\)/ }),
    ).toHaveAttribute('href', '/allocation/3');
    expect(first).toHaveTextContent('myPages.ethAllocations.sources.chronoWarrior');
    expect(second).toHaveTextContent('myPages.ethAllocations.sources.stellarSelection');
    expect(second).toHaveTextContent('0.5900');
  });

  it('drops the source column when no row says where its ETH came from', () => {
    render(
      <EthAllocationsTable
        rows={rows.map(({ RecordType: _type, ...row }) => row)}
        ariaLabel="ETH allocations"
      />,
    );
    expect(
      screen.queryByRole('columnheader', { name: 'myPages.ethAllocations.columns.source' }),
    ).not.toBeInTheDocument();
  });

  it('shows the retrieval deadline, with an attention badge in the last week', () => {
    render(
      <EthAllocationsTable
        rows={rows}
        ariaLabel="ETH allocations"
        deadlines={{ 2: NOW_SECONDS + 3 * 24 * 3600, 3: NOW_SECONDS - 60 }}
      />,
    );

    const [expired, soon] = bodyRows();
    expect(within(soon!).getByText(/ethAllocations\.deadline\.remaining/)).toBeInTheDocument();
    expect(soon!.querySelector('[data-deadline-state="soon"]')).not.toBeNull();
    expect(
      within(expired!).getByText('myPages.ethAllocations.deadline.expired'),
    ).toBeInTheDocument();
  });

  it('marks what was retrieved when the status column is on', () => {
    render(<EthAllocationsTable rows={rows} ariaLabel="ETH allocations" showStatus />);
    const [retrieved, waiting] = bodyRows();
    expect(retrieved).toHaveTextContent('myPages.ethAllocations.status.retrieved');
    expect(waiting).toHaveTextContent('myPages.ethAllocations.status.waiting');
  });

  it('renders the designed empty state instead of an empty table', () => {
    render(
      <EthAllocationsTable
        rows={[]}
        ariaLabel="ETH allocations"
        emptyTitle="Nothing yet"
        emptyDescription="ETH appears here."
      />,
    );
    expect(screen.getByText('Nothing yet')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <EthAllocationsTable rows={rows} ariaLabel="ETH allocations" showStatus />,
    );
    await checkA11y(container);
  });
});
