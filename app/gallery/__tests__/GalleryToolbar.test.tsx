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
    expect(screen.getByLabelText('Search NFTs')).toBeInTheDocument();
  });

  it('renders filter chips', () => {
    render(<GalleryToolbar {...defaultProps} />);
    expect(screen.getByRole('radio', { name: /All/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Staked/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Named/i })).toBeInTheDocument();
  });

  it('renders sort control', () => {
    render(<GalleryToolbar {...defaultProps} />);
    expect(screen.getByRole('combobox', { name: 'Sort order' })).toBeInTheDocument();
  });

  it('renders view mode toggle', () => {
    render(<GalleryToolbar {...defaultProps} />);
    expect(screen.getByRole('radio', { name: 'Grid view' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'List view' })).toBeInTheDocument();
  });

  it('calls onFilterChange when chip is clicked', () => {
    render(<GalleryToolbar {...defaultProps} />);
    fireEvent.click(screen.getByRole('radio', { name: /Staked/i }));
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith('staked');
  });

  it('calls onViewModeChange when toggle is clicked', () => {
    render(<GalleryToolbar {...defaultProps} />);
    fireEvent.click(screen.getByRole('radio', { name: 'List view' }));
    expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('list');
  });

  it('calls onSearchSubmit on enter key', () => {
    render(<GalleryToolbar {...defaultProps} searchQuery="test" />);
    const input = screen.getByLabelText('Search NFTs');
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onSearchSubmit).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GalleryToolbar {...defaultProps} />);
    await checkA11y(container);
  });
});
