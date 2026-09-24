import userEvent from '@testing-library/user-event';

import {
  ResponsiveTable,
  ResponsiveTableBody,
  ResponsiveTableCell,
  ResponsiveTableContainer,
  ResponsiveTableHead,
  ResponsiveTableHeadCell,
  ResponsiveTableRow,
  TABLE_LINK_CLASS,
  TABLE_ROW_LINK_CLASS,
} from '@/components/ui/responsive-table';

import { act, checkA11y, render, screen } from '@/test-utils';

/** Wraps cells in the minimum valid table so jsdom nesting stays legal. */
function TableWith({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveTable aria-label="Test table">
      <ResponsiveTableBody>{children}</ResponsiveTableBody>
    </ResponsiveTable>
  );
}

function cellLabels(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('tbody td')).map(
    (td) => td.getAttribute('data-label') ?? '',
  );
}

describe('ResponsiveTable roles', () => {
  it('states every table role, which a phone record would lose in WebKit', () => {
    // Below 40em the records set table, rows and cells to display: block;
    // WebKit drops implicit table semantics then, so each part says its role.
    const { container } = render(
      <ResponsiveTable aria-label="Test table">
        <ResponsiveTableHead>
          <ResponsiveTableRow>
            <ResponsiveTableHeadCell>Cycle</ResponsiveTableHeadCell>
          </ResponsiveTableRow>
        </ResponsiveTableHead>
        <ResponsiveTableBody>
          <ResponsiveTableRow>
            <ResponsiveTableCell label="Cycle">7</ResponsiveTableCell>
          </ResponsiveTableRow>
        </ResponsiveTableBody>
      </ResponsiveTable>,
    );
    expect(container.querySelector('table')).toHaveAttribute('role', 'table');
    for (const group of container.querySelectorAll('thead, tbody')) {
      expect(group).toHaveAttribute('role', 'rowgroup');
    }
    for (const row of container.querySelectorAll('tr')) expect(row).toHaveAttribute('role', 'row');
    expect(container.querySelector('th')).toHaveAttribute('role', 'columnheader');
    expect(container.querySelector('td')).toHaveAttribute('role', 'cell');
  });
});

describe('ResponsiveTableCell labels', () => {
  it('publishes its own label for the mobile card layout to render', () => {
    render(
      <TableWith>
        <ResponsiveTableRow>
          <ResponsiveTableCell label="Cycle">7</ResponsiveTableCell>
        </ResponsiveTableRow>
      </TableWith>,
    );

    expect(screen.getByRole('cell', { name: '7' })).toHaveAttribute('data-label', 'Cycle');
  });

  it('labels each cell independently, so no cell can inherit a sibling label', () => {
    const { container } = render(
      <TableWith>
        <ResponsiveTableRow>
          <ResponsiveTableCell label="Cycle">7</ResponsiveTableCell>
          <ResponsiveTableCell label="Amount">2 ETH</ResponsiveTableCell>
          <ResponsiveTableCell label="Participant">0xabc</ResponsiveTableCell>
        </ResponsiveTableRow>
      </TableWith>,
    );

    expect(cellLabels(container)).toEqual(['Cycle', 'Amount', 'Participant']);
  });

  it('keeps labels correct when a middle column is conditionally omitted', () => {
    // The regression that motivated this component: the previous library
    // derived labels from the header row by array index, so dropping a
    // column shifted every label after it by one.
    function Row({ withAmount }: { withAmount: boolean }) {
      return (
        <TableWith>
          <ResponsiveTableRow>
            <ResponsiveTableCell label="Cycle">7</ResponsiveTableCell>
            {withAmount ? <ResponsiveTableCell label="Amount">2 ETH</ResponsiveTableCell> : null}
            <ResponsiveTableCell label="Participant">0xabc</ResponsiveTableCell>
          </ResponsiveTableRow>
        </TableWith>
      );
    }

    const { container, rerender } = render(<Row withAmount />);
    expect(cellLabels(container)).toEqual(['Cycle', 'Amount', 'Participant']);

    rerender(<Row withAmount={false} />);
    expect(cellLabels(container)).toEqual(['Cycle', 'Participant']);
    expect(screen.getByRole('cell', { name: '0xabc' })).toHaveAttribute(
      'data-label',
      'Participant',
    );
  });

  it('labels the first row correctly on first paint, with no second pass', () => {
    // The old implementation filled labels in from an effect, so the first
    // paint shipped blank labels and every parent re-render redid the table.
    const { container } = render(
      <TableWith>
        <ResponsiveTableRow>
          <ResponsiveTableCell label="Cycle">7</ResponsiveTableCell>
        </ResponsiveTableRow>
      </TableWith>,
    );

    expect(cellLabels(container)).toEqual(['Cycle']);
  });

  it('keeps labels stable across a parent re-render', () => {
    function Row({ value }: { value: string }) {
      return (
        <TableWith>
          <ResponsiveTableRow>
            <ResponsiveTableCell label="Cycle">{value}</ResponsiveTableCell>
            <ResponsiveTableCell label="Amount">2 ETH</ResponsiveTableCell>
          </ResponsiveTableRow>
        </TableWith>
      );
    }

    const { container, rerender } = render(<Row value="7" />);
    rerender(<Row value="8" />);

    expect(cellLabels(container)).toEqual(['Cycle', 'Amount']);
  });
});

describe('ResponsiveTableCell empty detection', () => {
  function labelledCell(children?: React.ReactNode) {
    render(
      <TableWith>
        <ResponsiveTableRow>
          <ResponsiveTableCell label="Value" data-testid="subject">
            {children}
          </ResponsiveTableCell>
        </ResponsiveTableRow>
      </TableWith>,
    );
    return screen.getByTestId('subject');
  }

  it('marks a cell with no children as empty', () => {
    expect(labelledCell()).toHaveAttribute('data-empty', 'true');
  });

  it('marks an empty string as empty', () => {
    expect(labelledCell('')).toHaveAttribute('data-empty', 'true');
  });

  it('marks a whitespace-only string as empty', () => {
    expect(labelledCell('   ')).toHaveAttribute('data-empty', 'true');
  });

  it('marks a cell whose condition rendered nothing as empty', () => {
    const show = false;
    expect(labelledCell(show && <span>hidden</span>)).toHaveAttribute('data-empty', 'true');
  });

  it('marks a null child as empty', () => {
    expect(labelledCell(null)).toHaveAttribute('data-empty', 'true');
  });

  it('marks an undefined child as empty', () => {
    expect(labelledCell(undefined)).toHaveAttribute('data-empty', 'true');
  });

  it('does not mark a cell with text as empty', () => {
    expect(labelledCell('2 ETH')).not.toHaveAttribute('data-empty');
  });

  it('does not mark a zero as empty, since zero is a real value', () => {
    // A card that hid every "0" would silently drop balances and counts.
    expect(labelledCell(0)).not.toHaveAttribute('data-empty');
  });

  it('does not mark a cell containing an element as empty', () => {
    expect(labelledCell(<span>—</span>)).not.toHaveAttribute('data-empty');
  });

  it('does not mark a partially filled cell as empty', () => {
    expect(
      labelledCell(
        <>
          {''}
          <span>0xabc</span>
        </>,
      ),
    ).not.toHaveAttribute('data-empty');
  });
});

describe('column priority', () => {
  it('defaults both head and body cells to primary', () => {
    render(
      <ResponsiveTable aria-label="Test table">
        <ResponsiveTableHead>
          <tr>
            <ResponsiveTableHeadCell>Cycle</ResponsiveTableHeadCell>
          </tr>
        </ResponsiveTableHead>
        <ResponsiveTableBody>
          <ResponsiveTableRow>
            <ResponsiveTableCell label="Cycle">7</ResponsiveTableCell>
          </ResponsiveTableRow>
        </ResponsiveTableBody>
      </ResponsiveTable>,
    );

    expect(screen.getByRole('columnheader')).toHaveAttribute('data-priority', 'primary');
    expect(screen.getByRole('cell')).toHaveAttribute('data-priority', 'primary');
  });

  it('carries a secondary priority onto both the head cell and the body cell', () => {
    // The mobile stylesheet hides secondary columns off `data-priority`; if the
    // attribute only reached one of the two, the header and the data would
    // disagree about which column is showing.
    render(
      <ResponsiveTable aria-label="Test table">
        <ResponsiveTableHead>
          <tr>
            <ResponsiveTableHeadCell priority="secondary">Transaction</ResponsiveTableHeadCell>
          </tr>
        </ResponsiveTableHead>
        <ResponsiveTableBody>
          <ResponsiveTableRow>
            <ResponsiveTableCell label="Transaction" priority="secondary">
              0xdead
            </ResponsiveTableCell>
          </ResponsiveTableRow>
        </ResponsiveTableBody>
      </ResponsiveTable>,
    );

    expect(screen.getByRole('columnheader')).toHaveAttribute('data-priority', 'secondary');
    expect(screen.getByRole('cell')).toHaveAttribute('data-priority', 'secondary');
  });

  it('scopes head cells to their column for screen readers', () => {
    render(
      <ResponsiveTable aria-label="Test table">
        <ResponsiveTableHead>
          <tr>
            <ResponsiveTableHeadCell>Cycle</ResponsiveTableHeadCell>
          </tr>
        </ResponsiveTableHead>
      </ResponsiveTable>,
    );

    expect(screen.getByRole('columnheader')).toHaveAttribute('scope', 'col');
  });
});

describe('ResponsiveTableRow activation', () => {
  function rowWith(onActivate: () => void) {
    return render(
      <TableWith>
        <ResponsiveTableRow onActivate={onActivate}>
          <ResponsiveTableCell label="Cycle">7</ResponsiveTableCell>
          <ResponsiveTableCell label="Explorer">
            <a href="#explorer">explorer</a>
          </ResponsiveTableCell>
          <ResponsiveTableCell label="Actions">
            <button type="button">Claim</button>
          </ResponsiveTableCell>
          <ResponsiveTableCell label="Menu">
            <span role="button" tabIndex={0}>
              More
            </span>
          </ResponsiveTableCell>
        </ResponsiveTableRow>
      </TableWith>,
    );
  }

  it('fires on a click anywhere in the row body', async () => {
    const user = userEvent.setup();
    const onActivate = jest.fn();
    rowWith(onActivate);

    await user.click(screen.getByRole('cell', { name: '7' }));

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('does not fire when the click starts on a nested link', async () => {
    // Tapping an explorer link used to navigate to the row's detail page
    // instead of following the link.
    const user = userEvent.setup();
    const onActivate = jest.fn();
    rowWith(onActivate);

    await user.click(screen.getByRole('link', { name: 'explorer' }));

    expect(onActivate).not.toHaveBeenCalled();
  });

  it('does not fire when the click starts on a nested button', async () => {
    const user = userEvent.setup();
    const onActivate = jest.fn();
    rowWith(onActivate);

    await user.click(screen.getByRole('button', { name: 'Claim' }));

    expect(onActivate).not.toHaveBeenCalled();
  });

  it('does not fire for an element with a button role', async () => {
    const user = userEvent.setup();
    const onActivate = jest.fn();
    rowWith(onActivate);

    await user.click(screen.getByRole('button', { name: 'More' }));

    expect(onActivate).not.toHaveBeenCalled();
  });

  it('does not fire when the click starts on content inside a link', async () => {
    // The guard has to walk up from the event target: clicking the label
    // inside an anchor still belongs to the anchor.
    const user = userEvent.setup();
    const onActivate = jest.fn();
    render(
      <TableWith>
        <ResponsiveTableRow onActivate={onActivate}>
          <ResponsiveTableCell label="Explorer">
            <a href="#explorer">
              <span>0xdead…beef</span>
            </a>
          </ResponsiveTableCell>
        </ResponsiveTableRow>
      </TableWith>,
    );

    await user.click(screen.getByText('0xdead…beef'));

    expect(onActivate).not.toHaveBeenCalled();
  });

  it('does not fire when the click starts on a nested form control', async () => {
    const user = userEvent.setup();
    const onActivate = jest.fn();
    render(
      <TableWith>
        <ResponsiveTableRow onActivate={onActivate}>
          <ResponsiveTableCell label="Select">
            <input type="checkbox" aria-label="Select row" />
          </ResponsiveTableCell>
        </ResponsiveTableRow>
      </TableWith>,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Select row' }));

    expect(onActivate).not.toHaveBeenCalled();
  });

  it('still calls a caller onClick alongside onActivate', async () => {
    const user = userEvent.setup();
    const onActivate = jest.fn();
    const onClick = jest.fn();
    render(
      <TableWith>
        <ResponsiveTableRow onActivate={onActivate} onClick={onClick}>
          <ResponsiveTableCell label="Cycle">7</ResponsiveTableCell>
        </ResponsiveTableRow>
      </TableWith>,
    );

    await user.click(screen.getByRole('cell', { name: '7' }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('lets a caller onClick veto activation with preventDefault', async () => {
    const user = userEvent.setup();
    const onActivate = jest.fn();
    render(
      <TableWith>
        <ResponsiveTableRow onActivate={onActivate} onClick={(event) => event.preventDefault()}>
          <ResponsiveTableCell label="Cycle">7</ResponsiveTableCell>
        </ResponsiveTableRow>
      </TableWith>,
    );

    await user.click(screen.getByRole('cell', { name: '7' }));

    expect(onActivate).not.toHaveBeenCalled();
  });

  it('supports a plain onClick row with no onActivate', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <TableWith>
        <ResponsiveTableRow onClick={onClick}>
          <ResponsiveTableCell label="Cycle">7</ResponsiveTableCell>
        </ResponsiveTableRow>
      </TableWith>,
    );

    await user.click(screen.getByRole('cell', { name: '7' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('leaves a plain row inert', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TableWith>
        <ResponsiveTableRow>
          <ResponsiveTableCell label="Cycle">7</ResponsiveTableCell>
        </ResponsiveTableRow>
      </TableWith>,
    );

    await user.click(screen.getByRole('cell', { name: '7' }));

    // Only its table role: a click gives a plain row no control semantics.
    expect(container.querySelector('tr')).toHaveAttribute('role', 'row');
  });
});

describe('ResponsiveTableRow accessibility', () => {
  it('never puts an interactive role or tab stop on an activatable row', () => {
    // A row carries links of its own; role="button" would nest them inside a
    // control (a nested-interactive violation) and make the row a tab stop
    // that announces the whole row as one ambiguous button.
    render(
      <TableWith>
        <ResponsiveTableRow onActivate={jest.fn()}>
          <ResponsiveTableCell label="Cycle">7</ResponsiveTableCell>
        </ResponsiveTableRow>
      </TableWith>,
    );

    const row = screen.getByRole('row');

    // The row keeps its table role (stated for WebKit's phone records) and
    // never becomes a button.
    expect(row).toHaveAttribute('role', 'row');
    expect(row).not.toHaveAttribute('tabindex');
  });

  it('is not reachable by keyboard, so the row link stays the only entry point', async () => {
    const user = userEvent.setup();
    const onActivate = jest.fn();
    render(
      <TableWith>
        <ResponsiveTableRow onActivate={onActivate}>
          <ResponsiveTableCell label="Cycle">
            <a href="#detail" className={TABLE_ROW_LINK_CLASS}>
              7
            </a>
          </ResponsiveTableCell>
        </ResponsiveTableRow>
      </TableWith>,
    );

    await user.tab();

    expect(screen.getByRole('link', { name: '7' })).toHaveFocus();
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('has no violations when an activatable row contains a nested link', async () => {
    const { container } = render(
      <ResponsiveTableContainer label="Cycle history">
        <ResponsiveTable aria-label="Cycle history">
          <ResponsiveTableHead>
            <tr>
              <ResponsiveTableHeadCell>Cycle</ResponsiveTableHeadCell>
              <ResponsiveTableHeadCell priority="secondary">Transaction</ResponsiveTableHeadCell>
            </tr>
          </ResponsiveTableHead>
          <ResponsiveTableBody>
            <ResponsiveTableRow onActivate={jest.fn()}>
              <ResponsiveTableCell label="Cycle">
                <a href="#detail" className={TABLE_ROW_LINK_CLASS}>
                  7
                </a>
              </ResponsiveTableCell>
              <ResponsiveTableCell label="Transaction" priority="secondary">
                <a href="https://example.com/tx/0xdead">0xdead</a>
              </ResponsiveTableCell>
            </ResponsiveTableRow>
          </ResponsiveTableBody>
        </ResponsiveTable>
      </ResponsiveTableContainer>,
    );

    await checkA11y(container);
  });

  it('has no violations for an empty-bodied table', async () => {
    const { container } = render(
      <ResponsiveTableContainer label="Cycle history">
        <ResponsiveTable aria-label="Cycle history">
          <ResponsiveTableHead>
            <tr>
              <ResponsiveTableHeadCell>Cycle</ResponsiveTableHeadCell>
            </tr>
          </ResponsiveTableHead>
          <ResponsiveTableBody />
        </ResponsiveTable>
      </ResponsiveTableContainer>,
    );

    await checkA11y(container);
  });

  it('styles the row link as a link, leaving the focus ring to the shared outline', () => {
    expect(TABLE_ROW_LINK_CLASS).toBe(TABLE_LINK_CLASS);
    expect(TABLE_LINK_CLASS).toContain('underline');
    expect(TABLE_LINK_CLASS).not.toContain('outline-none');
  });
});

describe('ResponsiveTableContainer', () => {
  /** jsdom lays nothing out: fake a ResizeObserver and the scroll geometry. */
  function mockOverflow(scrollWidth: number, clientWidth: number) {
    const observe = jest.fn(function observe(this: { callback: () => void }) {
      this.callback();
    });
    class FakeResizeObserver {
      callback: () => void;
      constructor(callback: () => void) {
        this.callback = callback;
      }
      observe = observe;
      disconnect() {}
      unobserve() {}
    }
    const original = window.ResizeObserver;
    window.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
    const widths = [
      jest.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(scrollWidth),
      jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(clientWidth),
    ];
    return () => {
      window.ResizeObserver = original;
      widths.forEach((spy) => spy.mockRestore());
    };
  }

  it('adds no tab stop while the table fits', () => {
    const restore = mockOverflow(600, 600);
    render(
      <ResponsiveTableContainer data-testid="scroller" label="Cycle history">
        <ResponsiveTable aria-label="Cycle history" />
      </ResponsiveTableContainer>,
    );
    const scroller = screen.getByTestId('scroller');
    expect(scroller).not.toHaveAttribute('tabindex');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    restore();
  });

  it('becomes a focusable, named region when the table is wider than its box', async () => {
    const restore = mockOverflow(900, 320);
    render(
      <ResponsiveTableContainer data-testid="scroller" label="Cycle history">
        <ResponsiveTable aria-label="Cycle history" />
      </ResponsiveTableContainer>,
    );
    await act(async () => {});

    const region = screen.getByRole('region', { name: 'Cycle history' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region).toHaveAttribute('data-overflowing', 'true');
    region.focus();
    expect(region).toHaveFocus();
    restore();
  });

  it('stays an unnamed element without a label, even when it scrolls', async () => {
    // A nameless region is worse for screen-reader users than no landmark.
    const restore = mockOverflow(900, 320);
    render(
      <ResponsiveTableContainer data-testid="scroller">
        <ResponsiveTable aria-label="Test table" />
      </ResponsiveTableContainer>,
    );
    await act(async () => {});

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.getByTestId('scroller')).toHaveAttribute('tabindex', '0');
    restore();
  });

  it('draws no box of its own unless asked to', () => {
    const { rerender } = render(
      <ResponsiveTableContainer className="mt-8" data-testid="scroller">
        <ResponsiveTable aria-label="Test table" />
      </ResponsiveTableContainer>,
    );

    const scroller = screen.getByTestId('scroller');
    expect(scroller).toHaveClass('mt-8', 'overflow-x-auto', 'cs-table-scroll');
    expect(scroller.className).not.toMatch(/\bborder\b|bg-/);

    rerender(
      <ResponsiveTableContainer variant="framed" data-testid="scroller">
        <ResponsiveTable aria-label="Test table" />
      </ResponsiveTableContainer>,
    );
    expect(screen.getByTestId('scroller')).toHaveClass('border', 'border-rule');
  });

  it('renders its table children', () => {
    render(
      <ResponsiveTableContainer label="Cycle history">
        <ResponsiveTable aria-label="Cycle history">
          <ResponsiveTableBody>
            <ResponsiveTableRow>
              <ResponsiveTableCell label="Cycle">7</ResponsiveTableCell>
            </ResponsiveTableRow>
          </ResponsiveTableBody>
        </ResponsiveTable>
      </ResponsiveTableContainer>,
    );

    expect(screen.getByRole('table', { name: 'Cycle history' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '7' })).toBeInTheDocument();
  });
});

describe('column alignment', () => {
  it('states one alignment on the header and its cells', () => {
    const { container } = render(
      <ResponsiveTable aria-label="Test table">
        <ResponsiveTableHead>
          <tr>
            <ResponsiveTableHeadCell align="right" numeric>
              Amount
            </ResponsiveTableHeadCell>
            <ResponsiveTableHeadCell>Recipient</ResponsiveTableHeadCell>
          </tr>
        </ResponsiveTableHead>
        <ResponsiveTableBody>
          <ResponsiveTableRow>
            <ResponsiveTableCell label="Amount" align="right" numeric>
              1.5
            </ResponsiveTableCell>
            <ResponsiveTableCell label="Recipient">0xabc</ResponsiveTableCell>
          </ResponsiveTableRow>
        </ResponsiveTableBody>
      </ResponsiveTable>,
    );

    const [amountHead, recipientHead] = Array.from(container.querySelectorAll('th'));
    const [amountCell, recipientCell] = Array.from(container.querySelectorAll('td'));
    expect(amountHead).toHaveAttribute('data-align', 'end');
    expect(amountCell).toHaveAttribute('data-align', 'end');
    expect(amountCell).toHaveAttribute('data-numeric', 'true');
    expect(recipientHead).toHaveAttribute('data-align', 'start');
    expect(recipientCell).toHaveAttribute('data-align', 'start');
  });

  it('wraps each cell in exactly one value node, however many children it has', () => {
    const { container } = render(
      <TableWith>
        <ResponsiveTableRow>
          <ResponsiveTableCell label="Result">
            0% <span>(0/2)</span> <em>CST only</em>
          </ResponsiveTableCell>
        </ResponsiveTableRow>
      </TableWith>,
    );

    const cell = container.querySelector('td');
    expect(cell?.children).toHaveLength(1);
    expect(cell?.firstElementChild).toHaveAttribute('data-slot', 'value');
  });

  it('marks long text to sit under its label on a phone', () => {
    const { container } = render(
      <TableWith>
        <ResponsiveTableRow>
          <ResponsiveTableCell label="Message" stack>
            A long message
          </ResponsiveTableCell>
        </ResponsiveTableRow>
      </TableWith>,
    );
    expect(container.querySelector('td')).toHaveAttribute('data-stack', 'true');
  });

  it('marks the connected wallet row without moving it', () => {
    render(
      <TableWith>
        <ResponsiveTableRow current>
          <ResponsiveTableCell label="Holder">0xabc</ResponsiveTableCell>
        </ResponsiveTableRow>
      </TableWith>,
    );
    expect(screen.getByRole('row')).toHaveAttribute('data-current', 'true');
  });
});

describe('ResponsiveTable', () => {
  it('renders a real table element that assistive tech can name', () => {
    render(<ResponsiveTable aria-label="Cycle history" />);

    expect(screen.getByRole('table', { name: 'Cycle history' })).toBeInTheDocument();
  });

  it('lays rows out as phone records by default, or keeps a compact table', () => {
    const { rerender } = render(<ResponsiveTable aria-label="Cycle history" />);
    expect(screen.getByRole('table')).toHaveAttribute('data-layout', 'cards');
    rerender(<ResponsiveTable aria-label="Cycle history" layout="compact" />);
    expect(screen.getByRole('table')).toHaveAttribute('data-layout', 'compact');
  });

  it('merges a caller className without dropping the mobile card class', () => {
    render(<ResponsiveTable aria-label="Cycle history" className="text-left" />);

    const table = screen.getByRole('table');
    expect(table).toHaveClass('text-left');
    expect(table).toHaveClass('cs-table');
  });

  it('exposes rows and cells through the standard table roles', () => {
    render(
      <ResponsiveTable aria-label="Cycle history">
        <ResponsiveTableHead>
          <tr>
            <ResponsiveTableHeadCell>Cycle</ResponsiveTableHeadCell>
          </tr>
        </ResponsiveTableHead>
        <ResponsiveTableBody>
          <ResponsiveTableRow>
            <ResponsiveTableCell label="Cycle">7</ResponsiveTableCell>
          </ResponsiveTableRow>
        </ResponsiveTableBody>
      </ResponsiveTable>,
    );

    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByRole('columnheader', { name: 'Cycle' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '7' })).toBeInTheDocument();
  });
});
