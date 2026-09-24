import userEvent from '@testing-library/user-event';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

import { checkA11y, render, screen, within } from '@/test-utils';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

interface Row {
  id: number;
  owner: string;
  gestures: number | null;
  spent: number | null;
  share: number;
  note?: string;
}

const address = (n: number) => `0x${n.toString(16).padStart(40, '0')}`;

const rows: Row[] = [
  { id: 1, owner: address(1), gestures: 12, spent: 1.5, share: 0.25 },
  { id: 2, owner: address(2), gestures: 1200, spent: 0.1, share: 0.5 },
  { id: 3, owner: address(3), gestures: null, spent: null, share: 0.125 },
];

const columns: DataTableColumn<Row>[] = [
  { id: 'owner', kind: 'address', header: 'Owner', value: (r) => r.owner },
  { id: 'gestures', kind: 'count', header: 'Gestures', value: (r) => r.gestures, sortable: true },
  {
    id: 'spent',
    kind: 'amount',
    header: 'Spent (ETH)',
    value: (r) => r.spent,
    showUnit: false,
    sortable: true,
  },
  {
    id: 'share',
    kind: 'percent',
    header: 'Share',
    value: (r) => r.share,
    percentScale: 'ratio',
  },
];

const manyRows = (count: number): Row[] =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    owner: address(index + 1),
    gestures: index + 1,
    spent: index / 10,
    share: 0,
  }));

const bodyRows = () => within(screen.getAllByRole('rowgroup')[1]!).getAllByRole('row');

beforeEach(() => mockPush.mockClear());

describe('DataTable column kinds', () => {
  it('aligns each column once, on its header and its cells', () => {
    const { container } = render(
      <DataTable ariaLabel="Holders" data={rows} columns={columns} getRowKey={(r) => r.id} />,
    );

    const headers = Array.from(container.querySelectorAll('th'));
    const cells = Array.from(container.querySelectorAll('tbody tr:first-child td'));
    expect(headers.map((th) => th.getAttribute('data-align'))).toEqual([
      'start',
      'end',
      'end',
      'end',
    ]);
    expect(cells.map((td) => td.getAttribute('data-align'))).toEqual([
      'start',
      'end',
      'end',
      'end',
    ]);
    expect(cells[1]).toHaveAttribute('data-numeric', 'true');
    expect(cells[0]).toHaveAttribute('data-kind', 'address');
  });

  it('formats values through the formatting layer', () => {
    render(<DataTable ariaLabel="Holders" data={rows} columns={columns} getRowKey={(r) => r.id} />);

    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('1.5000')).toBeInTheDocument();
    // A percent column keeps one decimal, so its decimal points line up.
    expect(screen.getByText('50.0%')).toBeInTheDocument();
    expect(screen.getByText('12.5%')).toBeInTheDocument();
    // An address reads in the one short form and links to its participant page.
    expect(screen.getByRole('link', { name: '0x0000…⁠0001' })).toHaveAttribute(
      'href',
      `/user/${address(1)}`,
    );
  });

  it('shows a missing figure as unavailable rather than zero', () => {
    render(<DataTable ariaLabel="Holders" data={rows} columns={columns} getRowKey={(r) => r.id} />);
    expect(screen.getAllByText('tables.status.unavailable')).toHaveLength(2);
  });

  it('names a blank value with the column’s own label', () => {
    render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={[
          { ...columns[2]!, blankLabel: 'None' },
          { id: 'owner', kind: 'address', header: 'Owner', value: (r) => r.owner },
        ]}
        getRowKey={(r) => r.id}
      />,
    );
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('drops a column no row has a value for', () => {
    render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={[
          ...columns,
          { id: 'note', header: 'Note', value: (r) => r.note, hideWhenEmpty: true },
        ]}
        getRowKey={(r) => r.id}
      />,
    );
    expect(screen.queryByRole('columnheader', { name: 'Note' })).not.toBeInTheDocument();
  });
});

describe('DataTable sorting', () => {
  it('sorts a number column largest first, then smallest, then back', async () => {
    const user = userEvent.setup();
    render(<DataTable ariaLabel="Holders" data={rows} columns={columns} getRowKey={(r) => r.id} />);
    const header = screen.getByRole('columnheader', { name: /Gestures/ });
    expect(header).toHaveAttribute('aria-sort', 'none');

    await user.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'descending');
    // Blank values stay last whichever way the column is sorted.
    expect(bodyRows().map((row) => row.textContent)).toEqual([
      expect.stringContaining('1,200'),
      expect.stringContaining('12'),
      expect.stringContaining('tables.status.unavailable'),
    ]);

    await user.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(bodyRows()[0]).toHaveTextContent('12');
    expect(bodyRows()[2]).toHaveTextContent('tables.status.unavailable');

    await user.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'none');
  });

  it('starts from an initial sort', () => {
    render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={columns}
        getRowKey={(r) => r.id}
        initialSort={{ id: 'spent', direction: 'desc' }}
      />,
    );
    expect(bodyRows()[0]).toHaveTextContent('1.5000');
  });
});

describe('DataTable pages', () => {
  it('shows 20 rows at a time with the range and Next', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        ariaLabel="Holders"
        data={manyRows(25)}
        columns={columns}
        getRowKey={(r) => r.id}
      />,
    );
    expect(bodyRows()).toHaveLength(20);
    expect(screen.getByText('tables.pagination.range(from=1,to=20,total=25)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'tables.pagination.nextAria' }));
    expect(bodyRows()).toHaveLength(5);
  });

  it('shows no pagination for a single page', () => {
    render(<DataTable ariaLabel="Holders" data={rows} columns={columns} getRowKey={(r) => r.id} />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('returns to page 1 when the reset key changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <DataTable
        ariaLabel="Holders"
        data={manyRows(25)}
        columns={columns}
        getRowKey={(r) => r.id}
        resetPageKey="a"
      />,
    );
    await user.click(screen.getByRole('button', { name: 'tables.pagination.nextAria' }));
    expect(bodyRows()).toHaveLength(5);

    rerender(
      <DataTable
        ariaLabel="Holders"
        data={manyRows(25)}
        columns={columns}
        getRowKey={(r) => r.id}
        resetPageKey="b"
      />,
    );
    expect(bodyRows()).toHaveLength(20);
  });
});

describe('DataTable states', () => {
  it('holds placeholder rows while loading', () => {
    const { container } = render(
      <DataTable ariaLabel="Holders" data={[]} columns={columns} loading skeletonRows={3} />,
    );
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('tables.skeleton.loadingRows');
    // Placeholder rows are hidden from assistive tech; the status speaks for them.
    const placeholders = container.querySelectorAll('tbody tr');
    expect(placeholders).toHaveLength(3);
    expect(placeholders[0]).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('shows the empty state with its title and description', () => {
    render(
      <DataTable
        ariaLabel="Holders"
        data={[]}
        columns={columns}
        emptyTitle="No holders yet"
        emptyDescription="Holders appear after the first gesture."
      />,
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('No holders yet')).toBeInTheDocument();
    expect(screen.getByText('Holders appear after the first gesture.')).toBeInTheDocument();
  });

  it('shows the error state with a retry', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={columns}
        error="The list could not be loaded."
        onRetry={onRetry}
      />,
    );
    expect(screen.getByText('The list could not be loaded.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('DataTable rows', () => {
  it('turns the first cell into the row link and follows it from anywhere on the row', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={[
          { id: 'id', kind: 'text', header: 'Record', value: (r) => `Record ${r.id}` },
          ...columns.slice(1),
        ]}
        getRowKey={(r) => r.id}
        getRowHref={(r) => `/records/${r.id}`}
        getRowLabel={(r) => `Open record ${r.id}`}
      />,
    );

    const link = screen.getByRole('link', { name: 'Open record 1' });
    expect(link).toHaveAttribute('href', '/records/1');
    expect(link).not.toHaveAttribute('target');

    await user.click(screen.getByText('1,200'));
    expect(mockPush).toHaveBeenCalledWith('/records/2');
  });

  it('marks the connected wallet row in place and offers to jump to its page', async () => {
    const user = userEvent.setup();
    const data = manyRows(25);
    render(
      <DataTable
        ariaLabel="Holders"
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        isCurrentRow={(r) => r.id === 23}
      />,
    );

    expect(screen.getByText('tables.currentRow.position(rank=23,total=25)')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'tables.currentRow.show' }));

    const current = bodyRows().find((row) => row.getAttribute('data-current') === 'true');
    expect(current).toBeDefined();
    expect(within(current!).getAllByText('tables.status.youBadge').length).toBeGreaterThan(0);
    expect(
      screen.queryByRole('button', { name: 'tables.currentRow.show' }),
    ).not.toBeInTheDocument();
  });

  it('expands a row to its details', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={columns}
        getRowKey={(r) => r.id}
        renderDetails={(r) => <p>Details for {r.id}</p>}
        detailsLabel={(_r, expanded) => (expanded ? 'Hide' : 'Show')}
      />,
    );

    const [toggle] = screen.getAllByRole('button', { name: 'Show' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle!);
    expect(screen.getByRole('button', { name: 'Hide' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Details for 1')).toBeInTheDocument();
  });
});

describe('DataTable layout and naming', () => {
  it('keeps three columns or fewer as a compact phone table and turns more into records', () => {
    const { rerender } = render(
      <DataTable ariaLabel="Holders" data={rows} columns={columns.slice(0, 3)} />,
    );
    expect(screen.getByRole('table')).toHaveAttribute('data-layout', 'compact');

    rerender(<DataTable ariaLabel="Holders" data={rows} columns={columns} />);
    expect(screen.getByRole('table')).toHaveAttribute('data-layout', 'cards');
  });

  it('is named by its visible title at the level the page needs', () => {
    render(
      <DataTable
        ariaLabel="Holders"
        title="Stellar Selection entries"
        headingLevel={3}
        data={rows}
        columns={columns}
      />,
    );
    expect(
      screen.getByRole('heading', { level: 3, name: 'Stellar Selection entries' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Stellar Selection entries' })).toBeInTheDocument();
  });

  it('is named by its aria label without a title', () => {
    render(<DataTable ariaLabel="Holders" data={rows} columns={columns} />);
    expect(screen.getByRole('table', { name: 'Holders' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <DataTable
        ariaLabel="Holders"
        data={manyRows(25)}
        columns={columns}
        getRowKey={(r) => r.id}
        isCurrentRow={(r) => r.id === 2}
      />,
    );
    await checkA11y(container);
  });
});
