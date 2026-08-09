import userEvent from '@testing-library/user-event';

import {
  ResponsiveTable,
  ResponsiveTableBody,
  ResponsiveTableCell,
  ResponsiveTableContainer,
  ResponsiveTableHead,
  ResponsiveTableHeadCell,
  ResponsiveTableRow,
  TABLE_ROW_LINK_CLASS,
} from '@/components/ui/responsive-table';

import { checkA11y, render, screen, within } from '@/test-utils';

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

    expect(container.querySelector('tr')).not.toHaveAttribute('role');
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

    expect(row).not.toHaveAttribute('role');
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

  it('keeps a visible focus ring on the row link, which is the keyboard target', () => {
    expect(TABLE_ROW_LINK_CLASS).toContain('focus-visible:ring-2');
  });
});

describe('ResponsiveTableContainer', () => {
  it('is keyboard focusable so its scroll area can be reached without a pointer', () => {
    render(
      <ResponsiveTableContainer data-testid="scroller">
        <ResponsiveTable aria-label="Test table" />
      </ResponsiveTableContainer>,
    );

    const scroller = screen.getByTestId('scroller');
    expect(scroller).toHaveAttribute('tabindex', '0');

    scroller.focus();
    expect(scroller).toHaveFocus();
  });

  it('stays an unnamed plain element when given no label', () => {
    // A nameless region is worse for screen-reader users than no landmark.
    render(
      <ResponsiveTableContainer data-testid="scroller">
        <ResponsiveTable aria-label="Test table" />
      </ResponsiveTableContainer>,
    );

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.getByTestId('scroller')).not.toHaveAttribute('role');
    expect(screen.getByTestId('scroller')).not.toHaveAttribute('aria-label');
  });

  it('becomes a named region when given a label', () => {
    render(
      <ResponsiveTableContainer label="Cycle history">
        <ResponsiveTable aria-label="Cycle history" />
      </ResponsiveTableContainer>,
    );

    expect(screen.getByRole('region', { name: 'Cycle history' })).toBeInTheDocument();
  });

  it('keeps the caller className alongside its own styling', () => {
    render(
      <ResponsiveTableContainer className="mt-8" data-testid="scroller">
        <ResponsiveTable aria-label="Test table" />
      </ResponsiveTableContainer>,
    );

    const scroller = screen.getByTestId('scroller');
    expect(scroller).toHaveClass('mt-8');
    expect(scroller).toHaveClass('overflow-x-auto');
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

    const region = screen.getByRole('region', { name: 'Cycle history' });
    expect(within(region).getByRole('table', { name: 'Cycle history' })).toBeInTheDocument();
  });
});

describe('ResponsiveTable', () => {
  it('renders a real table element that assistive tech can name', () => {
    render(<ResponsiveTable aria-label="Cycle history" />);

    expect(screen.getByRole('table', { name: 'Cycle history' })).toBeInTheDocument();
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
