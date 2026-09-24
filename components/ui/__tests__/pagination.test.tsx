import userEvent from '@testing-library/user-event';

import { TablePagination, pageCountFor, visiblePages } from '@/components/ui/pagination';

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

  it('offers Previous and Next, disabled at the ends', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TablePagination {...props} />);
    expect(screen.getByRole('button', { name: 'tables.pagination.previousAria' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'tables.pagination.nextAria' }));
    expect(props.onPageChange).toHaveBeenCalledWith(2);

    rerender(<TablePagination {...props} page={57} />);
    expect(screen.getByRole('button', { name: 'tables.pagination.nextAria' })).toBeDisabled();
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
    fireEvent.change(screen.getByLabelText('tables.pagination.goToPageAria'), {
      target: { value: '999' },
    });
    expect(props.onPageChange).toHaveBeenCalledWith(57);
  });

  it('offers no go-to field for a short table', () => {
    render(<TablePagination {...props} total={100} />);
    expect(screen.queryByLabelText('tables.pagination.goToPageAria')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TablePagination {...props} page={3} />);
    await checkA11y(container);
  });
});
