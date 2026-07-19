import { render, screen, fireEvent, checkA11y } from '@/test-utils';

import { GalleryToolbar } from '../components/GalleryToolbar';

const defaultProps = {
  searchQuery: '',
  onSearchChange: jest.fn(),
  onSearchSubmit: jest.fn(),
  filter: 'all' as const,
  onFilterChange: jest.fn(),
  sort: 'newest' as const,
  onSortChange: jest.fn(),
  viewMode: 'grid' as const,
  onViewModeChange: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('GalleryToolbar', () => {
  it('renders search input', () => {
    render(<GalleryToolbar {...defaultProps} />);
    expect(screen.getByLabelText('search.gallery.ariaLabel')).toBeInTheDocument();
  });

  it('renders filter chips', () => {
    render(<GalleryToolbar {...defaultProps} />);
    expect(screen.getByRole('radio', { name: 'gallery.filters.all.label' })).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'gallery.filters.anchored.label' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'gallery.filters.named.label' })).toBeInTheDocument();
  });

  it('renders sort control', () => {
    render(<GalleryToolbar {...defaultProps} />);
    expect(screen.getByRole('combobox', { name: 'gallery.sort.ariaLabel' })).toBeInTheDocument();
  });

  it('renders view mode toggle', () => {
    render(<GalleryToolbar {...defaultProps} />);
    expect(screen.getByRole('radio', { name: 'gallery.view.grid' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'gallery.view.list' })).toBeInTheDocument();
  });

  it('calls onFilterChange when chip is clicked', () => {
    render(<GalleryToolbar {...defaultProps} />);
    fireEvent.click(screen.getByRole('radio', { name: 'gallery.filters.anchored.label' }));
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith('staked');
  });

  it('calls onViewModeChange when toggle is clicked', () => {
    render(<GalleryToolbar {...defaultProps} />);
    fireEvent.click(screen.getByRole('radio', { name: 'gallery.view.list' }));
    expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('list');
  });

  it('calls onSearchSubmit on enter key', () => {
    render(<GalleryToolbar {...defaultProps} searchQuery="test" />);
    const input = screen.getByLabelText('search.gallery.ariaLabel');
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onSearchSubmit).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GalleryToolbar {...defaultProps} />);
    await checkA11y(container);
  });
});
