import { checkA11y, fireEvent, render, screen, within } from '@/test-utils';

import { GalleryGrid, gridColumnsClass } from '../components/GalleryGrid';

const items = [
  { TokenId: 3, Seed: 'ccc', TokenName: 'Gamma', RoundNum: 1, Staked: false, TimeStamp: 3 },
  { TokenId: 2, Seed: 'bbb', TokenName: '', RoundNum: 1, Staked: true, TimeStamp: 2 },
];

function renderGrid(overrides: Partial<Parameters<typeof GalleryGrid>[0]> = {}) {
  const props = {
    items,
    loading: false,
    viewMode: 'grid' as const,
    skeletonCount: 6,
    railOpen: false,
    collectionTraits: null,
    filtered: false,
    onClearFilters: jest.fn(),
    onQuickView: jest.fn(),
    ...overrides,
  };
  return { ...render(<GalleryGrid {...props} />), props };
}

describe('GalleryGrid', () => {
  it('hangs each Signature on a plate with its wall label, linked to its page', () => {
    renderGrid();
    const cards = screen.getAllByTestId('signature-card');
    expect(cards).toHaveLength(2);
    expect(within(cards[0]!).getByRole('link')).toHaveAttribute('href', '/detail/3');
    expect(within(cards[0]!).getByText('Gamma')).toBeInTheDocument();
    expect(within(cards[1]!).getByText('#000002')).toBeInTheDocument();
  });

  it('marks an anchored Signature once, quietly', () => {
    renderGrid();
    const cards = screen.getAllByTestId('signature-card');
    expect(within(cards[1]!).getByTestId('anchored-mark')).toBeInTheDocument();
    expect(within(cards[0]!).queryByTestId('anchored-mark')).not.toBeInTheDocument();
  });

  it('uses three columns once plates can be about 300px wide', () => {
    expect(gridColumnsClass(false)).toBe('md:grid-cols-3');
    expect(gridColumnsClass(true)).toBe('xl:grid-cols-3');
    renderGrid({ railOpen: true });
    expect(screen.getByTestId('gallery-grid')).toHaveClass('xl:grid-cols-3');
  });

  it('shows plate skeletons, or ledger rows in list view, while loading', () => {
    const { rerender, props } = renderGrid({ loading: true, items: [] });
    expect(screen.getByTestId('signature-grid-skeleton').children).toHaveLength(6);
    rerender(<GalleryGrid {...props} loading viewMode="list" items={[]} />);
    expect(screen.queryByTestId('signature-grid-skeleton')).not.toBeInTheDocument();
  });

  it('offers to clear the filters when they leave nothing', () => {
    const { props } = renderGrid({ items: [], filtered: true });
    expect(screen.getByRole('heading', { name: 'gallery.empty.title' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(props.onClearFilters).toHaveBeenCalled();
  });

  it('says plainly that the collection is empty when nothing narrows it', () => {
    renderGrid({ items: [] });
    expect(
      screen.getByRole('heading', { name: 'gallery.empty.collectionTitle' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders the ledger in list view, with each row linked to its page', () => {
    renderGrid({ viewMode: 'list' });
    const list = screen.getByTestId('gallery-list');
    expect(within(list).getByRole('link', { name: /Gamma/ })).toHaveAttribute('href', '/detail/3');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderGrid();
    await checkA11y(container);
  });

  it('has no accessibility violations in list view', async () => {
    const { container } = renderGrid({ viewMode: 'list' });
    await checkA11y(container);
  });
});
