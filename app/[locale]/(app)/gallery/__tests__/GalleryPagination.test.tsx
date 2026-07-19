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
  // The global next-intl mock renders t.rich() as the bare message key, so
  // the computed start/end/total values are not observable here — only the
  // key itself is asserted.
  it('renders the showing summary', () => {
    render(<GalleryPagination {...defaultProps} />);
    expect(screen.getByText('gallery.pagination.showing')).toBeInTheDocument();
  });

  it('renders the showing summary on page 2', () => {
    render(<GalleryPagination {...defaultProps} currentPage={2} />);
    expect(screen.getByText('gallery.pagination.showing')).toBeInTheDocument();
  });

  it('renders per-page selector', () => {
    render(<GalleryPagination {...defaultProps} />);
    expect(screen.getByText('gallery.pagination.perPage')).toBeInTheDocument();
  });

  it('calls onPageChange when page link is clicked', () => {
    render(<GalleryPagination {...defaultProps} />);
    fireEvent.click(screen.getByText('3'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);
  });

  it('renders Next button when not on last page', () => {
    render(<GalleryPagination {...defaultProps} />);
    expect(screen.getByLabelText('tables.pagination.nextAria')).toBeInTheDocument();
  });

  it('does not render Previous button on first page', () => {
    render(<GalleryPagination {...defaultProps} />);
    expect(screen.queryByLabelText('tables.pagination.previousAria')).not.toBeInTheDocument();
  });

  it('renders Previous button on page 2', () => {
    render(<GalleryPagination {...defaultProps} currentPage={2} />);
    expect(screen.getByLabelText('tables.pagination.previousAria')).toBeInTheDocument();
  });

  it('returns null when totalItems is 0', () => {
    const { container } = render(
      <GalleryPagination {...defaultProps} totalItems={0} totalPages={0} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('does not render pagination links when totalPages is 1', () => {
    render(<GalleryPagination {...defaultProps} totalPages={1} totalItems={5} />);
    expect(screen.queryByLabelText('tables.pagination.nextAria')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GalleryPagination {...defaultProps} />);
    await checkA11y(container);
  });
});
