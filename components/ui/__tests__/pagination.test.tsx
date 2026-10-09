import * as React from 'react';
import userEvent from '@testing-library/user-event';

import {
  TablePagination,
  pageCountFor,
  pageItemKey,
  visiblePages,
} from '@/components/ui/pagination';

import { checkA11y, fireEvent, render, screen } from '@/test-utils';

describe('pageCountFor', () => {
  it('rounds up and never reports fewer than one page', () => {
    expect(pageCountFor(0, 20)).toBe(1);
    expect(pageCountFor(20, 20)).toBe(1);
    expect(pageCountFor(21, 20)).toBe(2);
    expect(pageCountFor(1140, 20)).toBe(57);
  });

  it('treats an unusable page size as a single page', () => {
    expect(pageCountFor(10, 0)).toBe(1);
    expect(pageCountFor(10, Number.NaN)).toBe(1);
  });
});

describe('visiblePages', () => {
  it('lists every page up to seven', () => {
    expect(visiblePages(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('keeps the ends and the current page neighbours, with gaps', () => {
    expect(visiblePages(1, 57)).toEqual([1, 2, 'ellipsis', 57]);
    expect(visiblePages(20, 57)).toEqual([1, 'ellipsis', 19, 20, 21, 'ellipsis', 57]);
    expect(visiblePages(57, 57)).toEqual([1, 'ellipsis', 56, 57]);
  });
});

describe('TablePagination', () => {
  const props = { page: 1, pageSize: 20, total: 1140, onPageChange: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it('renders nothing when every row fits on one page', () => {
    const { container } = render(<TablePagination {...props} total={12} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('still shows a caption for a single page', () => {
    render(<TablePagination {...props} total={12} caption="Time zone: UTC" />);
    expect(screen.getByText('Time zone: UTC')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('states the row range with grouped numbers', () => {
    render(<TablePagination {...props} page={57} />);
    expect(
      screen.getByText('tables.pagination.range(from=1,121,to=1,140,total=1,140)'),
    ).toBeInTheDocument();
  });

  it('offers Previous and Next, unavailable at the ends but still focusable', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TablePagination {...props} />);
    const previous = screen.getByRole('button', { name: 'tables.pagination.previous' });
    // aria-disabled, never natively disabled: a disabled button drops focus.
    expect(previous).toHaveAttribute('aria-disabled', 'true');
    expect(previous).toBeEnabled();
    await user.click(previous);
    expect(props.onPageChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'tables.pagination.next' }));
    expect(props.onPageChange).toHaveBeenCalledWith(2);

    rerender(<TablePagination {...props} page={57} />);
    const next = screen.getByRole('button', { name: 'tables.pagination.next' });
    expect(next).toHaveAttribute('aria-disabled', 'true');
    expect(next).toBeEnabled();
  });

  it('names Previous and Next by their visible words (label in name)', () => {
    render(<TablePagination {...props} page={2} />);
    for (const word of ['tables.pagination.previous', 'tables.pagination.next']) {
      const button = screen.getByRole('button', { name: word });
      expect(button).not.toHaveAttribute('aria-label');
      expect(button).toHaveTextContent(word);
    }
  });

  describe('keeps keyboard focus while paging', () => {
    /** A parent that pages for real, as DataTable does. */
    function Paged({ initial, total = 400 }: { initial: number; total?: number }) {
      const [page, setPage] = React.useState(initial);
      return <TablePagination page={page} pageSize={20} total={total} onPageChange={setPage} />;
    }

    it('on a page number whose place in the window moves', async () => {
      // 20 pages: on page 4 the window is 1 … 3 4 5 … 20; on page 5 it is
      // 1 … 4 5 6 … 20, so page 5 moves from the fifth entry to the fourth.
      const user = userEvent.setup();
      render(<Paged initial={4} />);
      const five = screen.getByRole('button', { name: '5' });
      five.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('button', { name: '5' })).toHaveAttribute('aria-current', 'page');
      expect(document.activeElement).toBe(five);
    });

    it('on the last page number, jumped to from the start', async () => {
      const user = userEvent.setup();
      render(<Paged initial={1} />);
      const last = screen.getByRole('button', { name: '20' });
      last.focus();
      await user.keyboard('{Enter}');
      expect(document.activeElement).toBe(last);
    });

    it('on Previous when it reaches the first page', async () => {
      const user = userEvent.setup();
      render(<Paged initial={2} />);
      const previous = screen.getByRole('button', { name: 'tables.pagination.previous' });
      previous.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page');
      expect(previous).toHaveAttribute('aria-disabled', 'true');
      expect(document.activeElement).toBe(previous);
    });

    it('on Next when it reaches the last page, and ignores it there', async () => {
      const user = userEvent.setup();
      render(<Paged initial={19} />);
      const next = screen.getByRole('button', { name: 'tables.pagination.next' });
      next.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('button', { name: '20' })).toHaveAttribute('aria-current', 'page');
      expect(document.activeElement).toBe(next);
      await user.keyboard('{Enter}');
      expect(screen.getByRole('button', { name: '20' })).toHaveAttribute('aria-current', 'page');
    });
  });

  it('keys every entry of the window by what it is, not where it sits', () => {
    const middle = visiblePages(10, 20);
    expect(middle.map((item, index) => pageItemKey(item, index, middle))).toEqual([
      '1',
      'ellipsis-start',
      '9',
      '10',
      '11',
      'ellipsis-end',
      '20',
    ]);
    const start = visiblePages(1, 20);
    expect(start.map((item, index) => pageItemKey(item, index, start))).toEqual([
      '1',
      '2',
      'ellipsis-start',
      '20',
    ]);
  });

  it('offers a phone the go-to field from five pages, where no page numbers show', () => {
    const { rerender } = render(<TablePagination {...props} total={80} />);
    expect(screen.queryByLabelText('tables.pagination.goToPageAria')).not.toBeInTheDocument();

    rerender(<TablePagination {...props} total={100} />);
    const phoneOnly = screen.getByLabelText('tables.pagination.goToPageAria').closest('label');
    expect(phoneOnly).toHaveClass('flex', 'sm:hidden');

    rerender(<TablePagination {...props} />);
    const everywhere = screen.getByLabelText('tables.pagination.goToPageAria').closest('label');
    expect(everywhere).toHaveClass('flex');
    expect(everywhere).not.toHaveClass('sm:hidden');
  });

  it('marks the current page and moves to a chosen one', async () => {
    const user = userEvent.setup();
    render(<TablePagination {...props} page={2} />);
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');

    await user.click(screen.getByRole('button', { name: '57' }));
    expect(props.onPageChange).toHaveBeenCalledWith(57);
  });

  it('clamps the go-to field to the pages that exist', () => {
    render(<TablePagination {...props} />);
    const field = screen.getByLabelText('tables.pagination.goToPageAria');
    fireEvent.change(field, { target: { value: '999' } });
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(props.onPageChange).toHaveBeenCalledWith(57);
  });

  it('goes to a typed page only once it is committed', async () => {
    // Regression: the field followed every keystroke, so typing "37" visited
    // page 3 first, and clearing it snapped straight back to the page.
    const user = userEvent.setup();
    render(<TablePagination {...props} page={5} />);
    const field = screen.getByLabelText('tables.pagination.goToPageAria');

    await user.clear(field);
    expect(field).toHaveValue(null);
    await user.type(field, '37');
    expect(field).toHaveValue(37);
    expect(props.onPageChange).not.toHaveBeenCalled();

    await user.keyboard('{Enter}');
    expect(props.onPageChange).toHaveBeenCalledTimes(1);
    expect(props.onPageChange).toHaveBeenCalledWith(37);
  });

  it('commits the typed page when the field is left, and forgets a cleared one', async () => {
    const user = userEvent.setup();
    render(<TablePagination {...props} page={5} />);
    const field = screen.getByLabelText('tables.pagination.goToPageAria');

    await user.clear(field);
    await user.tab();
    expect(props.onPageChange).not.toHaveBeenCalled();
    expect(field).toHaveValue(5);

    await user.clear(field);
    await user.type(field, '12');
    await user.tab();
    expect(props.onPageChange).toHaveBeenCalledWith(12);
  });

  it('announces the new range after paging, not whenever the total changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TablePagination {...props} />);
    const status = screen.getByRole('status');
    // The visible range is not a live region: a live table's total changes
    // on its own, and that must not be read out.
    expect(
      screen.getByText('tables.pagination.range(from=1,to=20,total=1,140)'),
    ).not.toHaveAttribute('aria-live');
    expect(status).toBeEmptyDOMElement();

    rerender(<TablePagination {...props} total={1141} />);
    expect(status).toBeEmptyDOMElement();

    await user.click(screen.getByRole('button', { name: 'tables.pagination.next' }));
    expect(status).toHaveTextContent('tables.pagination.range(from=21,to=40,total=1,141)');
  });

  it('offers no go-to field for a short table', () => {
    render(<TablePagination {...props} total={60} />);
    expect(screen.queryByLabelText('tables.pagination.goToPageAria')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TablePagination {...props} page={3} />);
    await checkA11y(container);
  });
});
