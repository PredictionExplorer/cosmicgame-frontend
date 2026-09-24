import { render, screen, fireEvent, checkA11y } from '@/test-utils';

import { GalleryToolbar, type GalleryToolbarProps } from '../components/GalleryToolbar';

function renderToolbar(overrides: Partial<GalleryToolbarProps> = {}) {
  const props: GalleryToolbarProps = {
    search: '',
    onSearchCommit: jest.fn(),
    status: 'all',
    onStatusChange: jest.fn(),
    sort: 'newest',
    onSortChange: jest.fn(),
    view: 'grid',
    onViewChange: jest.fn(),
    onToggleFilters: jest.fn(),
    filtersOpen: false,
    activeFilterCount: 0,
    traitSortsAvailable: true,
    ...overrides,
  };
  return { ...render(<GalleryToolbar {...props} />), props };
}

describe('GalleryToolbar', () => {
  it('holds the search, status filter, Filters, sort and view in one row', () => {
    renderToolbar();
    expect(screen.getByRole('searchbox', { name: 'search.gallery.ariaLabel' })).toBeInTheDocument();
    expect(
      screen.getByRole('radiogroup', { name: 'gallery.filters.ariaLabel' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'gallery.toolbar.filters' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'gallery.sort.ariaLabel' })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'gallery.view.ariaLabel' })).toBeInTheDocument();
  });

  it('stays under the header only from lg, and keeps phone-only controls in the sheet', () => {
    renderToolbar();
    const toolbar = screen.getByTestId('gallery-toolbar');
    expect(toolbar).toHaveClass('lg:sticky');
    expect(toolbar).not.toHaveClass('sticky');
    // Below lg the status filter, sort and view live in the filter sheet.
    expect(screen.getByRole('radiogroup', { name: 'gallery.filters.ariaLabel' })).toHaveClass(
      'max-lg:hidden',
    );
  });

  it('counts active filters on the Filters button and reports the rail as pressed', () => {
    renderToolbar({ activeFilterCount: 3, filtersOpen: true });
    const button = screen.getByTestId('facets-toggle');
    expect(button).toHaveTextContent('gallery.toolbar.filtersWithCount(count=3)');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('reports choices to the page', () => {
    const { props } = renderToolbar();
    fireEvent.click(screen.getByRole('radio', { name: 'gallery.filters.anchored.label' }));
    expect(props.onStatusChange).toHaveBeenCalledWith('anchored');
    fireEvent.click(screen.getByRole('radio', { name: 'gallery.view.list' }));
    expect(props.onViewChange).toHaveBeenCalledWith('list');
    fireEvent.click(screen.getByTestId('facets-toggle'));
    expect(props.onToggleFilters).toHaveBeenCalled();
  });

  it('commits the search on Enter', () => {
    const { props } = renderToolbar();
    const input = screen.getByRole('searchbox', { name: 'search.gallery.ariaLabel' });
    fireEvent.change(input, { target: { value: ' 47 ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(props.onSearchCommit).toHaveBeenCalledWith('47');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderToolbar({ activeFilterCount: 1 });
    await checkA11y(container);
  });
});
