import userEvent from '@testing-library/user-event';

import { render, screen, fireEvent } from '@/test-utils';

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
    expect(screen.getByLabelText('go to page')).toBeInTheDocument();
  });

  it('does not show "Go to page" input for small page counts', () => {
    render(<CustomPagination {...defaultProps} totalLength={50} perPage={10} />);
    expect(screen.queryByLabelText('go to page')).not.toBeInTheDocument();
  });

  it('renders single page when totalLength <= perPage', () => {
    render(<CustomPagination {...defaultProps} totalLength={5} perPage={10} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('clamps page input to valid range', () => {
    render(<CustomPagination {...defaultProps} page={1} totalLength={300} perPage={10} />);

    const input = screen.getByLabelText('go to page');
    fireEvent.change(input, { target: { value: '999' } });

    expect(defaultProps.setPage).toHaveBeenCalledWith(30);
  });
});
