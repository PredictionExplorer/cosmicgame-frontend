import { render, screen, fireEvent, checkA11y } from '@/test-utils';

import { GalleryPagination } from '../components/GalleryPagination';

const defaultProps = {
  currentPage: 1,
  totalPages: 5,
  totalItems: 60,
  perPage: 12,
  onPageChange: jest.fn(),
  onPerPageChange: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('GalleryPagination', () => {
  it('renders showing text with correct range', () => {
    render(<GalleryPagination {...defaultProps} />);
    const showingText = screen.getByText(/Showing/);
    expect(showingText).toBeInTheDocument();
    expect(showingText.textContent).toContain('1');
    expect(showingText.textContent).toContain('12');
    expect(showingText.textContent).toContain('60');
  });

  it('renders correct range for page 2', () => {
    render(<GalleryPagination {...defaultProps} currentPage={2} />);
    const showingText = screen.getByText(/Showing/);
    expect(showingText.textContent).toContain('13');
    expect(showingText.textContent).toContain('24');
  });

  it('renders per-page selector', () => {
    render(<GalleryPagination {...defaultProps} />);
    expect(screen.getByText('Per page')).toBeInTheDocument();
  });

  it('calls onPageChange when page link is clicked', () => {
    render(<GalleryPagination {...defaultProps} />);
    fireEvent.click(screen.getByText('3'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);
  });

  it('renders Next button when not on last page', () => {
    render(<GalleryPagination {...defaultProps} />);
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
  });

  it('does not render Previous button on first page', () => {
    render(<GalleryPagination {...defaultProps} />);
    expect(screen.queryByLabelText('Go to previous page')).not.toBeInTheDocument();
  });

  it('renders Previous button on page 2', () => {
    render(<GalleryPagination {...defaultProps} currentPage={2} />);
    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
  });

  it('returns null when totalItems is 0', () => {
    const { container } = render(
      <GalleryPagination {...defaultProps} totalItems={0} totalPages={0} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('does not render pagination links when totalPages is 1', () => {
    render(<GalleryPagination {...defaultProps} totalPages={1} totalItems={5} />);
    expect(screen.queryByLabelText('Go to next page')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GalleryPagination {...defaultProps} />);
    await checkA11y(container);
  });
});
