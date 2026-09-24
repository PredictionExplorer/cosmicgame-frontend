import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen, fireEvent } from '@/test-utils';

import { CustomPagination } from '../CustomPagination';

describe('CustomPagination', () => {
  const defaultProps = {
    page: 1,
    setPage: jest.fn(),
    totalLength: 100,
    perPage: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page numbers for small page count', () => {
    render(<CustomPagination {...defaultProps} totalLength={50} perPage={10} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders first and last page when total pages > 7', () => {
    render(<CustomPagination {...defaultProps} totalLength={200} perPage={10} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('calls setPage when a page number is clicked', async () => {
    const user = userEvent.setup();
    render(<CustomPagination {...defaultProps} totalLength={50} perPage={10} />);

    await user.click(screen.getByText('3'));

    expect(defaultProps.setPage).toHaveBeenCalledWith(3);
  });

  it('shows "Go to page" input when page count >= 30', () => {
    render(<CustomPagination {...defaultProps} totalLength={300} perPage={10} />);
    expect(screen.getByLabelText('tables.pagination.goToPageAria')).toBeInTheDocument();
  });

  it('does not show "Go to page" input for small page counts', () => {
    render(<CustomPagination {...defaultProps} totalLength={50} perPage={10} />);
    expect(screen.queryByLabelText('tables.pagination.goToPageAria')).not.toBeInTheDocument();
  });

  it('renders nothing when every row fits on one page', () => {
    const { container } = render(
      <CustomPagination {...defaultProps} totalLength={5} perPage={10} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the row range and Previous and Next', () => {
    render(<CustomPagination {...defaultProps} page={2} totalLength={50} perPage={10} />);
    expect(screen.getByText('tables.pagination.range(from=11,to=20,total=50)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'tables.pagination.previousAria' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'tables.pagination.nextAria' })).toBeEnabled();
  });

  it('clamps page input to valid range', () => {
    render(<CustomPagination {...defaultProps} page={1} totalLength={300} perPage={10} />);

    const input = screen.getByLabelText('tables.pagination.goToPageAria');
    fireEvent.change(input, { target: { value: '999' } });

    expect(defaultProps.setPage).toHaveBeenCalledWith(30);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CustomPagination {...defaultProps} />);
    await checkA11y(container);
  });
});
