import userEvent from '@testing-library/user-event';

import {
  DataTable,
  DataTableWidth,
  nextSort,
  type DataTableColumn,
} from '@/components/ui/data-table';

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

  it('turns an initial sort around on the first click, whichever way it runs', async () => {
    // Regression: an initial sort opposite to the kind's first direction
    // (amounts smallest first) made the first click "return" to the order
    // the table was already in, so nothing happened.
    const user = userEvent.setup();
    render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={columns}
        getRowKey={(r) => r.id}
        initialSort={{ id: 'spent', direction: 'asc' }}
      />,
    );
    const header = screen.getByRole('columnheader', { name: /Spent/ });
    expect(header).toHaveAttribute('aria-sort', 'ascending');

    await user.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(bodyRows()[0]).toHaveTextContent('1.5000');

    await user.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'ascending');
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

describe('DataTable header help', () => {
  it('keeps the help box of a touch pointer off a sortable label', () => {
    // Regression: the 44px help box reached 7px into "Number of Tokens
    // Owned", so a tap on the end of the label opened help instead of sorting.
    const withHelp: DataTableColumn<Row>[] = [
      { ...columns[0]!, help: 'Who holds the tokens.' },
      { ...columns[1]!, help: 'Gestures made.' },
    ];
    render(
      <DataTable ariaLabel="Holders" data={rows} columns={withHelp} getRowKey={(r) => r.id} />,
    );
    const [plain, sortable] = screen.getAllByRole('columnheader');
    expect(within(sortable!).getByRole('button', { name: 'Gestures' }).parentElement).toHaveClass(
      'pointer-coarse:gap-5',
    );
    expect(plain!.firstElementChild).not.toHaveClass('pointer-coarse:gap-5');
  });

  // Regression: the header was named by its label and its help button
  // together ("Gestures Explain column: Gestures"), which a screen reader
  // repeated every time the reader moved into the column.
  it('names a header with help by its words alone, keeping the help button operable', () => {
    const withHelp: DataTableColumn<Row>[] = [columns[0]!, { ...columns[1]!, help: 'Made.' }];
    render(
      <DataTable ariaLabel="Holders" data={rows} columns={withHelp} getRowKey={(r) => r.id} />,
    );
    const header = screen.getByRole('columnheader', { name: 'Gestures' });
    expect(header).toHaveAttribute('aria-label', 'Gestures');
    expect(
      within(header).getByRole('button', {
        name: 'tables.tableHeaderHelp.explainColumn(column=Gestures)',
      }),
    ).toBeInTheDocument();
    // A header without help keeps its name from its content.
    expect(screen.getByRole('columnheader', { name: 'Owner' })).not.toHaveAttribute('aria-label');
  });
});

describe('nextSort', () => {
  it('cycles a column through its first direction, the other, and back', () => {
    const first = nextSort(null, 'amount', 'desc');
    expect(first).toEqual({ id: 'amount', direction: 'desc' });
    const second = nextSort(first, 'amount', 'desc');
    expect(second).toEqual({ id: 'amount', direction: 'asc' });
    expect(nextSort(second, 'amount', 'desc')).toBeNull();
  });

  it('returns to the table’s own order from another column', () => {
    const own = { id: 'date', direction: 'desc' as const };
    expect(nextSort({ id: 'amount', direction: 'asc' }, 'amount', 'desc', own)).toEqual(own);
  });

  it('always changes something on a column the table already sorts', () => {
    const own = { id: 'amount', direction: 'asc' as const };
    expect(nextSort(own, 'amount', 'desc', own)).toEqual({ id: 'amount', direction: 'desc' });
    expect(nextSort({ id: 'amount', direction: 'desc' }, 'amount', 'desc', own)).toEqual(own);
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

    await user.click(screen.getByRole('button', { name: 'tables.pagination.next' }));
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
    await user.click(screen.getByRole('button', { name: 'tables.pagination.next' }));
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

  it('puts the empty state’s title one level under the table’s heading', () => {
    // Regression: the title was always an h4, so a titled table read
    // H2 → H4 and skipped a level.
    const { rerender } = render(
      <DataTable
        ariaLabel="Holders"
        title="Contributions"
        data={[]}
        columns={columns}
        emptyTitle="No contributions yet"
      />,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Contributions' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'No contributions yet' }),
    ).toBeInTheDocument();

    rerender(
      <DataTable
        ariaLabel="Holders"
        headingLevel={3}
        data={[]}
        columns={columns}
        emptyTitle="No contributions yet"
      />,
    );
    expect(
      screen.getByRole('heading', { level: 3, name: 'No contributions yet' }),
    ).toBeInTheDocument();
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
        getRowLabel={(r) => `Gesture #${r.id}`}
      />,
    );

    // WCAG 2.5.3 Label in Name: the words a voice user sees start the link's
    // name; the destination is appended, never substituted.
    const link = screen.getByRole('link', { name: 'Record 1 Gesture #1' });
    expect(link).toHaveAttribute('href', '/records/1');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('aria-label');

    await user.click(screen.getByText('1,200'));
    expect(mockPush).toHaveBeenCalledWith('/records/2');
  });

  it('leaves a modified click on a row to the browser', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={columns}
        getRowKey={(r) => r.id}
        getRowHref={(r) => `/records/${r.id}`}
      />,
    );
    await user.keyboard('{Meta>}');
    await user.click(screen.getByText('1,200'));
    await user.keyboard('{/Meta}');
    expect(mockPush).not.toHaveBeenCalled();
  });

  // Regression: an address (or a proof-linked date) in the row-link column
  // rendered its own link inside the row link, an <a> in an <a>.
  it('drops a kind’s own link where the row link already wraps the value', () => {
    const { container } = render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={columns}
        getRowKey={(r) => r.id}
        getRowHref={(r) => `/records/${r.id}`}
      />,
    );
    expect(container.querySelector('a a')).toBeNull();
    const firstCell = container.querySelector('tbody tr:first-child td');
    expect(firstCell?.querySelectorAll('a')).toHaveLength(1);
    expect(firstCell?.querySelector('a')).toHaveAttribute('href', '/records/1');

    // Without a row link the address keeps its own profile link.
    const plain = render(
      <DataTable ariaLabel="Owners" data={rows} columns={columns} getRowKey={(r) => r.id} />,
    );
    expect(plain.container.querySelector('tbody tr:first-child td a')).toHaveAttribute(
      'href',
      `/user/${address(1)}`,
    );
  });

  it('warns in development when a custom cell nests a link in the row link', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={[
          {
            id: 'owner',
            kind: 'text',
            header: 'Owner',
            value: (r) => r.owner,
            cell: (r) => <a href={`/elsewhere/${r.id}`}>Elsewhere</a>,
          },
          ...columns.slice(1),
        ]}
        getRowKey={(r) => r.id}
        getRowHref={(r) => `/records/${r.id}`}
      />,
    );
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/link inside the row link/));
    error.mockRestore();
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

  it('moves focus to the connected wallet row after "Show my row", whose button is gone', async () => {
    // Regression: the button unmounted under the reader's focus, which fell
    // to the document body, far from the row it had just revealed.
    const user = userEvent.setup();
    render(
      <DataTable
        ariaLabel="Holders"
        data={manyRows(25)}
        columns={columns}
        getRowKey={(r) => r.id}
        isCurrentRow={(r) => r.id === 23}
      />,
    );

    screen.getByRole('button', { name: 'tables.currentRow.show' }).focus();
    await user.keyboard('{Enter}');

    const current = bodyRows().find((row) => row.getAttribute('data-current') === 'true');
    // Its first link: the owner's address.
    expect(current).toContainElement(document.activeElement as HTMLElement);
    expect(document.activeElement?.tagName).toBe('A');
  });

  it('focuses the row itself after "Show my row" when it holds no link', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        ariaLabel="Holders"
        data={manyRows(25)}
        columns={columns.slice(1)}
        getRowKey={(r) => r.id}
        isCurrentRow={(r) => r.id === 23}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'tables.currentRow.show' }));

    const current = bodyRows().find((row) => row.getAttribute('data-current') === 'true');
    expect(document.activeElement).toBe(current);
    // Focusable from script only: the row is never a tab stop.
    expect(current).toHaveAttribute('tabindex', '-1');
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

  it('points a disclosure at its details with a valid id, whatever the row key', async () => {
    // Regression: the id was built from the row key, and a group keyed
    // "(all cs nft stakers)" gave an id with spaces that aria-controls, a
    // space-separated list of ids, could not resolve.
    const user = userEvent.setup();
    render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={columns}
        getRowKey={(r) => `(all holders ${r.id})`}
        renderDetails={(r) => <p>Details for {r.id}</p>}
        detailsLabel={(_r, expanded) => (expanded ? 'Hide' : 'Show')}
      />,
    );
    await user.click(screen.getAllByRole('button', { name: 'Show' })[0]!);
    const toggle = screen.getByRole('button', { name: 'Hide' });
    const id = toggle.getAttribute('aria-controls') ?? '';
    expect(id).not.toMatch(/\s/);
    expect(document.getElementById(id)).toHaveTextContent('Details for 1');
  });
});

describe('DataTable layout and naming', () => {
  it('keeps three compact columns as a phone table and turns more into records', () => {
    const { rerender } = render(
      <DataTable ariaLabel="Holders" data={rows} columns={columns.slice(0, 3)} />,
    );
    expect(screen.getByRole('table')).toHaveAttribute('data-layout', 'compact');

    rerender(<DataTable ariaLabel="Holders" data={rows} columns={columns} />);
    expect(screen.getByRole('table')).toHaveAttribute('data-layout', 'cards');
  });

  it('turns a short table with a date or a duration into records on phones', () => {
    // Regression: /public-goods-retrievals (date, address, amount) stayed a
    // three-column table and pushed its amounts past a 320px screen.
    const dated: DataTableColumn<Row>[] = [
      { id: 'when', kind: 'datetime', header: 'Date', value: (r) => r.id * 1_700_000_000 },
      columns[0]!,
      columns[2]!,
    ];
    const { rerender } = render(<DataTable ariaLabel="Holders" data={rows} columns={dated} />);
    expect(screen.getByRole('table')).toHaveAttribute('data-layout', 'cards');

    const held: DataTableColumn<Row>[] = [
      columns[0]!,
      { id: 'held', kind: 'duration', header: 'Held', value: (r) => r.id * 3600 },
    ];
    rerender(<DataTable ariaLabel="Holders" data={rows} columns={held} />);
    expect(screen.getByRole('table')).toHaveAttribute('data-layout', 'cards');
  });

  it('leaves out columns dropped on phones when choosing the phone layout', () => {
    const withSecondary: DataTableColumn<Row>[] = [
      ...columns.slice(0, 3),
      { ...columns[3]!, priority: 'secondary' },
    ];
    render(<DataTable ariaLabel="Holders" data={rows} columns={withSecondary} />);
    expect(screen.getByRole('table')).toHaveAttribute('data-layout', 'compact');
  });

  describe('on a phone', () => {
    let restore: () => void;

    /** jsdom lays nothing out: a phone viewport, a ResizeObserver and the scroll geometry. */
    function phoneWith(scrollWidth: number, clientWidth: number) {
      const originalMatchMedia = window.matchMedia;
      const originalObserver = window.ResizeObserver;
      window.matchMedia = ((query: string) => ({
        matches: query.includes('max-width'),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      })) as typeof window.matchMedia;
      class FakeResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
      window.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
      const spies = [
        jest.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(scrollWidth),
        jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(clientWidth),
      ];
      restore = () => {
        window.matchMedia = originalMatchMedia;
        window.ResizeObserver = originalObserver;
        spies.forEach((spy) => spy.mockRestore());
      };
    }

    afterEach(() => restore());

    it('keeps three compact columns as a table while they fit', () => {
      phoneWith(288, 288);
      render(<DataTable ariaLabel="Holders" data={rows} columns={columns.slice(0, 3)} />);
      expect(screen.getByRole('table')).toHaveAttribute('data-layout', 'compact');
    });

    it('turns a compact table that is wider than the screen into records', () => {
      // Regression: at 320px a panel's padding left an owner, a count and an
      // amount 72px wider than their column, cutting the amounts off.
      phoneWith(333, 261);
      render(<DataTable ariaLabel="Holders" data={rows} columns={columns.slice(0, 3)} />);
      expect(screen.getByRole('table')).toHaveAttribute('data-layout', 'cards');
    });

    it('never overrides a layout the caller chose', () => {
      phoneWith(333, 261);
      render(
        <DataTable
          ariaLabel="Holders"
          data={rows}
          columns={columns.slice(0, 3)}
          layout="compact"
        />,
      );
      expect(screen.getByRole('table')).toHaveAttribute('data-layout', 'compact');
    });
  });

  it('keeps the phone layout a caller asks for', () => {
    render(
      <DataTable ariaLabel="Holders" data={rows} columns={columns.slice(0, 2)} layout="cards" />,
    );
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

  // Regression: a ledger's intro was 14px set 4px under its H2 while every
  // other section's was 16px at the section header's gap.
  it('heads a ledger with the site’s section header, so its intro matches every section', () => {
    render(
      <DataTable
        ariaLabel="Holders"
        title="Holders"
        description="Everyone who holds one."
        data={rows}
        columns={columns}
      />,
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Holders' });
    expect(heading).toHaveClass('type-section');
    const intro = screen.getByText('Everyone who holds one.');
    expect(intro).toHaveClass('type-body-md', 'mt-2');
    expect(heading.closest('header')).toContainElement(intro);
  });

  it('scopes a titled ledger’s header to its own section, never a page banner', async () => {
    const { container } = render(
      <>
        <DataTable ariaLabel="Holders" title="Holders" data={rows} columns={columns} />
        <DataTable ariaLabel="Owners" title="Owners" data={[]} columns={columns} />
      </>,
    );
    expect(container.querySelectorAll('section > header')).toHaveLength(2);
    // axe scopes a <header> to its sectioning ancestor: no duplicate banner.
    await checkA11y(container);
  });

  it('sets an intro inside a panel at the panel size', () => {
    render(
      <DataTable
        ariaLabel="Holders"
        title="Holders"
        headingLevel={3}
        description="Everyone who holds one."
        data={rows}
        columns={columns}
      />,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Holders' })).toHaveClass(
      'type-heading-3',
    );
    expect(screen.getByText('Everyone who holds one.')).toHaveClass('type-body-sm');
  });

  // Regression: a column with a JSX header and no label printed its
  // developer id ("quickView") beside the value in every phone record.
  it('never labels a phone record with a column id', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={[
          columns[0]!,
          {
            id: 'quickView',
            kind: 'text',
            header: <span className="sr-only">Quick view</span>,
            value: () => 'Open',
          },
        ]}
      />,
    );
    const cell = container.querySelector('tbody tr:first-child td:nth-child(2)');
    expect(cell).toHaveAttribute('data-label', '');
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/"quickView".*needs a `label`/));
    warn.mockRestore();
  });

  it('opens each phone record on the column that names it', () => {
    const { container } = render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={[{ ...columns[0]!, phone: 'title' }, ...columns.slice(1)]}
        layout="cards"
      />,
    );
    expect(container.querySelector('tbody tr:first-child td')).toHaveAttribute(
      'data-phone',
      'title',
    );
  });

  it('shows a true "none" as a dash named None, and leaves it out of a phone record', () => {
    const { container } = render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={[
          columns[0]!,
          { ...columns[2]!, whenBlank: 'none' },
          { ...columns[1]!, whenBlank: 'unknown' },
        ]}
        getRowKey={(r) => r.id}
        layout="cards"
      />,
    );
    const [, none, unknown] = [...container.querySelectorAll('tbody tr:nth-child(3) td')];
    expect(none).toHaveTextContent('tables.status.none');
    expect(none).toHaveAttribute('data-phone', 'omit');
    // A value that could not be read stays in the record, as unavailable.
    expect(unknown).toHaveTextContent('tables.status.unavailable');
    expect(unknown).not.toHaveAttribute('data-phone');
  });
});

describe('DataTable framing', () => {
  const wrapper = (container: HTMLElement) =>
    container.querySelector('[data-slot="data-table"]') as HTMLElement;

  it('keeps every short ledger at one reading width instead of stretching it', () => {
    // Two, three and four columns share the width, so short ledgers stacked
    // on one page end at the same right edge.
    for (const count of [2, 3, 4]) {
      const { container, unmount } = render(
        <DataTable ariaLabel="Holders" data={rows} columns={columns.slice(0, count)} />,
      );
      expect(wrapper(container)).toHaveClass('max-w-4xl');
      unmount();
    }

    const fill = render(
      <DataTable ariaLabel="Holders" data={rows} columns={columns} width="fill" />,
    );
    expect(wrapper(fill.container).className).not.toMatch(/max-w-/);
  });

  it('takes the width a page sets for its ledgers, unless it names its own', () => {
    const { container } = render(
      <DataTableWidth value="fill">
        <div data-testid="shared">
          <DataTable ariaLabel="Holders" data={rows} columns={columns} />
        </div>
        <div data-testid="own">
          <DataTable ariaLabel="Owners" data={rows} columns={columns} width="auto" />
        </div>
      </DataTableWidth>,
    );
    const [shared, own] = [...container.querySelectorAll('[data-slot="data-table"]')];
    expect(shared!.className).not.toMatch(/max-w-/);
    expect(own).toHaveClass('max-w-4xl');
  });

  it('centres the empty and error states on the whole section, not the reading width', () => {
    // The cap belongs to the table: a state that replaces it keeps the full
    // width, so its centred title sits in the middle of the section.
    const empty = render(
      <DataTable ariaLabel="Holders" data={[]} columns={columns} emptyTitle="Nothing yet" />,
    );
    expect(screen.getByText('Nothing yet')).toBeInTheDocument();
    expect(empty.container.innerHTML).not.toMatch(/max-w-(3|4)xl/);
    empty.unmount();

    const failed = render(
      <DataTable ariaLabel="Holders" data={[]} columns={columns} error="The list is down." />,
    );
    expect(screen.getByText('The list is down.')).toBeInTheDocument();
    expect(failed.container.innerHTML).not.toMatch(/max-w-(3|4)xl/);
    failed.unmount();

    // While the rows load, the placeholder table already has the reading width.
    const loading = render(<DataTable ariaLabel="Holders" data={[]} columns={columns} loading />);
    expect(wrapper(loading.container)).toHaveClass('max-w-4xl');
  });

  it('lets a wide ledger run the full width', () => {
    const { container } = render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={[...columns, { id: 'id', kind: 'count', header: 'Id', value: (r) => r.id }]}
      />,
    );
    expect(wrapper(container).className).not.toMatch(/max-w-/);
  });

  it('spans a group heading over the columns that share it', () => {
    const { container } = render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={[
          columns[0]!,
          { ...columns[1]!, group: 'Activity' },
          { ...columns[2]!, group: 'Activity', label: 'Spent (ETH)' },
          columns[3]!,
        ]}
      />,
    );
    const [groupRow] = [...container.querySelectorAll('thead tr')];
    const cells = [...groupRow!.children].map((cell) => [
      cell.tagName,
      cell.textContent,
      cell.getAttribute('colspan'),
    ]);
    expect(cells).toEqual([
      ['TD', '', '1'],
      ['TH', 'Activity', '2'],
      ['TD', '', '1'],
    ]);
    // A spanning column header: the table has no <colgroup> for a
    // `colgroup` scope to refer to.
    expect(screen.getByRole('columnheader', { name: 'Activity' })).toHaveAttribute('scope', 'col');
    // The blank cells over ungrouped columns are not announced.
    for (const blank of groupRow!.querySelectorAll('td')) {
      expect(blank).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('keeps a notice in every state, so it never moves the table', () => {
    const notice = <p data-testid="notice">Read-only</p>;
    const loading = render(
      <DataTable ariaLabel="Holders" data={[]} columns={columns} loading notice={notice} />,
    );
    expect(screen.getByTestId('notice')).toBeInTheDocument();
    loading.unmount();

    const failed = render(
      <DataTable ariaLabel="Holders" data={[]} columns={columns} error="Down" notice={notice} />,
    );
    expect(screen.getByTestId('notice')).toBeInTheDocument();
    failed.unmount();

    render(<DataTable ariaLabel="Holders" data={[]} columns={columns} notice={notice} />);
    expect(screen.getByTestId('notice')).toBeInTheDocument();
  });

  it('puts a caption beside the row range, after the time zone', () => {
    render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={[
          { id: 'when', kind: 'datetime', header: 'Date', value: () => 1_700_000_000 },
          ...columns,
        ]}
        caption="Muted amounts are dust."
      />,
    );
    const pager = document.querySelector('[data-slot="table-pagination"]');
    expect(pager).toHaveTextContent(/formats\.dateTime\.timeZone.*·.*Muted amounts are dust\./);
  });

  it('leaves the time zone to the page when told it is stated there', () => {
    render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={[
          { id: 'when', kind: 'datetime', header: 'Date', value: () => 1_700_000_000 },
          ...columns,
        ]}
        timeZoneNote={false}
      />,
    );
    expect(document.body).not.toHaveTextContent(/formats\.dateTime\.timeZone/);
  });

  it('underlines a quiet ledger’s links only on hover and focus', () => {
    render(<DataTable ariaLabel="Holders" data={rows} columns={columns} links="quiet" />);
    expect(screen.getByRole('table')).toHaveAttribute('data-links', 'quiet');
  });

  it('names the disclosure column on screen', () => {
    render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={columns}
        renderDetails={() => 'More'}
        detailsHeader="Records"
      />,
    );
    const header = screen.getByRole('columnheader', { name: 'Records' });
    expect(header.querySelector('.sr-only')).toBeNull();
  });
});

describe('DataTable sort affordance', () => {
  it('hints that an unsorted column can be sorted, in its padding, without moving the label', () => {
    render(<DataTable ariaLabel="Holders" data={rows} columns={columns} />);
    const sortable = screen.getByRole('columnheader', { name: /Gestures/ });
    const hint = sortable.querySelector('[data-slot="sort-hint"]');
    expect(hint).not.toBeNull();
    expect(hint).toHaveAttribute('aria-hidden', 'true');
    expect(hint).toHaveClass('absolute', 'opacity-0');
    // A static column offers nothing to sort.
    const fixed = screen.getByRole('columnheader', { name: 'Owner' });
    expect(fixed.querySelector('[data-slot="sort-hint"]')).toBeNull();
  });

  it('shows the order the table starts in on its header', () => {
    render(
      <DataTable
        ariaLabel="Holders"
        data={rows}
        columns={columns}
        initialSort={{ id: 'gestures', direction: 'desc' }}
      />,
    );
    const sorted = screen.getByRole('columnheader', { name: /Gestures/ });
    expect(sorted).toHaveAttribute('aria-sort', 'descending');
    expect(sorted.querySelector('[data-slot="sort-hint"]')).toBeNull();
  });
});

describe('DataTable amounts', () => {
  it('mutes dust and keeps a zero’s digits, so every decimal point lines up', () => {
    render(
      <DataTable
        ariaLabel="Spent"
        data={[
          { id: 1, spent: 0.1562 },
          { id: 2, spent: 0 },
          { id: 3, spent: 0.00000001 },
        ]}
        columns={[
          { id: 'id', kind: 'count', header: 'Id', value: (r) => r.id },
          {
            id: 'spent',
            kind: 'amount',
            header: 'Spent (ETH)',
            value: (r) => r.spent,
            showUnit: false,
          },
        ]}
      />,
    );
    expect(screen.getByText('0.1562')).not.toHaveClass('text-subtle');
    expect(screen.getByText('0.0000')).not.toHaveClass('text-subtle');
    const dust = screen.getByText('<0.0001');
    expect(dust).toHaveClass('text-subtle');
    // The exact value is on hover.
    expect(dust).toHaveAttribute('title', expect.stringContaining('0.00000001'));
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
