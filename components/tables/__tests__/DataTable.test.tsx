import '@testing-library/jest-dom';

import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';

import { checkA11y, fireEvent, render, screen } from '@/test-utils';

interface Row {
  id: number;
  name: string;
  amount: number;
}

const columns: DataTableColumn<Row>[] = [
  { id: 'id', header: 'ID', accessor: (r) => r.id, sortable: true },
  { id: 'name', header: 'Name', accessor: (r) => r.name, sortable: true },
  { id: 'amount', header: 'Amount', accessor: (r) => r.amount, sortable: true, align: 'right' },
];

const rows: Row[] = [
  { id: 1, name: 'alpha', amount: 100 },
  { id: 2, name: 'bravo', amount: 50 },
  { id: 3, name: 'charlie', amount: 75 },
];

beforeEach(() => {
  window.localStorage.clear();
});

describe('DataTable', () => {
  it('renders column headers and rows', () => {
    render(
      <DataTable ariaLabel="Test data" data={rows} columns={columns} getRowKey={(r) => r.id} />,
    );
    expect(screen.getByRole('table', { name: /test data/i })).toBeInTheDocument();
    // react-super-responsive-table renders each header twice (thead + pivoted
    // mobile labels via td::before clones); getAllByText covers both.
    expect(screen.getAllByText('ID').length).toBeGreaterThan(0);
    expect(screen.getAllByText('alpha').length).toBeGreaterThan(0);
    expect(screen.getAllByText('bravo').length).toBeGreaterThan(0);
  });

  it('renders a density toggle and switches density on click', () => {
    render(<DataTable ariaLabel="Test" data={rows} columns={columns} getRowKey={(r) => r.id} />);
    const compact = screen.getByRole('button', { name: /compact/i });
    const comfortable = screen.getByRole('button', { name: /comfortable/i });
    expect(comfortable).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(compact);
    expect(compact).toHaveAttribute('aria-pressed', 'true');
  });

  it('persists density to localStorage', () => {
    render(
      <DataTable
        ariaLabel="Test"
        data={rows}
        columns={columns}
        getRowKey={(r) => r.id}
        densityStorageKey="test.density"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /compact/i }));
    expect(window.localStorage.getItem('test.density')).toBe('compact');
  });

  it('skips localStorage when densityStorageKey is null', () => {
    render(
      <DataTable
        ariaLabel="Test"
        data={rows}
        columns={columns}
        getRowKey={(r) => r.id}
        densityStorageKey={null}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /compact/i }));
    expect(window.localStorage.length).toBe(0);
  });

  // Helper: returns the in-thead sort trigger (not the mobile-pivot clone).
  function getSortButton(name: RegExp): HTMLElement {
    const buttons = screen.getAllByRole('button', { name });
    // The first match lives inside the real <thead>; the clone lives inside
    // the td::before-style pivot cell. Prefer the one whose closest <th>
    // actually has aria-sort set by us.
    const inThead = buttons.find((b) => b.closest('th')?.hasAttribute('aria-sort'));
    const btn = inThead ?? buttons[0];
    if (!btn) throw new Error(`No sort button found for ${name}`);
    return btn;
  }

  function amountCellsInDataOrder(container: HTMLElement) {
    // Walk each td and read only its own text nodes (excluding the
    // `.tdBefore` pivot label that super-responsive-table splices in).
    const tbody = container.querySelector('tbody');
    const tds = Array.from(tbody?.querySelectorAll('td') ?? []);
    const values = tds.map((td) => {
      return Array.from(td.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent?.trim())
        .join('');
    });
    return values.filter((t) => t && ['50', '75', '100'].includes(t));
  }

  it('sorts ascending on first header click', () => {
    const { container } = render(
      <DataTable ariaLabel="Test" data={rows} columns={columns} getRowKey={(r) => r.id} />,
    );
    fireEvent.click(getSortButton(/^amount$/i));
    expect(amountCellsInDataOrder(container)).toEqual(['50', '75', '100']);
  });

  it('toggles to descending on second header click', () => {
    const { container } = render(
      <DataTable ariaLabel="Test" data={rows} columns={columns} getRowKey={(r) => r.id} />,
    );
    fireEvent.click(getSortButton(/^amount$/i));
    fireEvent.click(getSortButton(/^amount$/i));
    expect(amountCellsInDataOrder(container)).toEqual(['100', '75', '50']);
  });

  it('clears sort on third header click', () => {
    render(<DataTable ariaLabel="Test" data={rows} columns={columns} getRowKey={(r) => r.id} />);
    const amountHeader = getSortButton(/^amount$/i);
    fireEvent.click(amountHeader);
    fireEvent.click(amountHeader);
    fireEvent.click(amountHeader);
    const headerTh = amountHeader.closest('th');
    expect(headerTh).toHaveAttribute('aria-sort', 'none');
  });

  it('fires onRowClick when a row is clicked', () => {
    const onRowClick = jest.fn();
    render(
      <DataTable
        ariaLabel="Test"
        data={rows}
        columns={columns}
        getRowKey={(r) => r.id}
        onRowClick={onRowClick}
      />,
    );
    fireEvent.click(screen.getByText('bravo').closest('tr')!);
    expect(onRowClick).toHaveBeenCalledWith(rows[1], 1);
  });

  it('activates row on Enter key when clickable', () => {
    const onRowClick = jest.fn();
    render(
      <DataTable
        ariaLabel="Test"
        data={rows}
        columns={columns}
        getRowKey={(r) => r.id}
        onRowClick={onRowClick}
      />,
    );
    const row = screen.getByText('alpha').closest('tr')!;
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onRowClick).toHaveBeenCalledWith(rows[0], 0);
  });

  it('renders empty state when data is empty', () => {
    render(
      <DataTable
        ariaLabel="Test"
        data={[]}
        columns={columns}
        getRowKey={(r) => r.id}
        emptyTitle="Nothing to see"
        emptyDescription="Check back later"
      />,
    );
    expect(screen.getByText('Nothing to see')).toBeInTheDocument();
    expect(screen.getByText('Check back later')).toBeInTheDocument();
  });

  it('renders error state with retry when error is set', () => {
    const onRetry = jest.fn();
    render(
      <DataTable
        ariaLabel="Test"
        data={[]}
        columns={columns}
        getRowKey={(r) => r.id}
        error="Network went dark"
        onRetry={onRetry}
      />,
    );
    expect(screen.getByText(/network went dark/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders loading skeleton rows when loading', () => {
    const { container } = render(
      <DataTable
        ariaLabel="Test"
        data={[]}
        columns={columns}
        getRowKey={(r) => r.id}
        loading
        skeletonRows={4}
      />,
    );
    expect(screen.getByRole('status', { name: /loading rows/i })).toBeInTheDocument();
    // SkeletonTableRow renders one wrapper per row
    const rowWrappers = container.querySelectorAll('[role="status"][aria-label="Loading row"]');
    expect(rowWrappers.length).toBe(4);
  });

  it('uses custom render when provided', () => {
    const columnsWithRender: DataTableColumn<Row>[] = [
      {
        id: 'name',
        header: 'Name',
        render: (row) => <span data-testid={`custom-${row.id}`}>★ {row.name}</span>,
      },
    ];
    render(
      <DataTable
        ariaLabel="Test"
        data={rows}
        columns={columnsWithRender}
        getRowKey={(r) => r.id}
      />,
    );
    expect(screen.getByTestId('custom-1')).toHaveTextContent('★ alpha');
  });

  it('has no accessibility violations with data', async () => {
    const { container } = render(
      <DataTable ariaLabel="Test" data={rows} columns={columns} getRowKey={(r) => r.id} />,
    );
    await checkA11y(container);
  });

  it('has no accessibility violations when empty', async () => {
    const { container } = render(
      <DataTable ariaLabel="Test" data={[]} columns={columns} getRowKey={(r) => r.id} />,
    );
    await checkA11y(container);
  });
});
