import { deriveCollectionTraits } from '@/hooks/useNftTraits';
import {
  TOKEN_1_METADATA_V2,
  TOKEN_43_METADATA_V1,
  TOKEN_7_METADATA_V2,
} from '@/lib/nftMetadata/__fixtures__/metadata';
import {
  normalizeTraitEntry,
  parseCosmicSignatureMetadata,
  type CollectionTraitIndex,
} from '@/lib/nftMetadata';

import { act, checkA11y, fireEvent, render, screen, within } from '@/test-utils';

import GalleryPage from '../GalleryPage';
import { GalleryView } from '../GalleryView';

const mockReplace = jest.fn();
const mockPush = jest.fn();
let mockSearch = '';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/gallery',
  useSearchParams: () => new URLSearchParams(mockSearch),
  useParams: () => ({}),
}));

const mockUseCSTList = jest.fn();
jest.mock('@/hooks/useApiQuery', () => ({
  useCSTList: () => mockUseCSTList(),
}));

const mockUseCollectionTraits = jest.fn();
jest.mock('@/hooks/useNftTraits', () => ({
  ...jest.requireActual('@/hooks/useNftTraits'),
  useCollectionTraits: () => mockUseCollectionTraits(),
}));

const entries = [TOKEN_1_METADATA_V2, TOKEN_7_METADATA_V2, TOKEN_43_METADATA_V1].map(
  (doc) => normalizeTraitEntry(parseCosmicSignatureMetadata(doc)!)!,
);
const index: CollectionTraitIndex = {
  version: 1,
  total: 3,
  indexed: 3,
  missing: 0,
  partial: false,
  generatedAt: '2026-09-01T00:00:00.000Z',
  entries,
};
const collectionTraits = deriveCollectionTraits(index);

const nfts = [
  { TokenId: 1, TokenName: 'NUMBA 1', RoundNum: 0, Staked: false, Seed: 'a1', TimeStamp: 1 },
  { TokenId: 7, TokenName: '', RoundNum: 0, Staked: true, Seed: 'a7', TimeStamp: 2 },
  { TokenId: 43, TokenName: '', RoundNum: 1, Staked: false, Seed: 'a43', TimeStamp: 3 },
];

function traitsState(state: 'ready' | 'loading' | 'failed') {
  return {
    traits: state === 'ready' ? collectionTraits : null,
    isLoading: state === 'loading',
    isError: state === 'failed',
    refetch: jest.fn(),
  };
}

/** Token ids of the rendered cards, in display order. */
function cardIds(): number[] {
  return screen
    .getAllByTestId('signature-card')
    .map((card) => Number(card.getAttribute('data-token-id')));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSearch = '';
  mockUseCSTList.mockReturnValue({
    data: nfts,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  });
  mockUseCollectionTraits.mockReturnValue(traitsState('ready'));
});

describe('GalleryView', () => {
  it('renders the newest Signatures first on plates with wall labels', () => {
    render(<GalleryView search="" />);
    expect(cardIds()).toEqual([43, 7, 1]);
    const named = screen.getAllByTestId('signature-card')[2]!;
    expect(within(named).getByText('NUMBA 1')).toBeInTheDocument();
    expect(within(named).getByText('#000001')).toBeInTheDocument();
    expect(screen.getByTestId('gallery-result-count')).toHaveTextContent('gallery.results.total');
  });

  it('renders only the body: the route renders the shell and the header', () => {
    render(<GalleryView search="" />);
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('reads every filter from the URL', () => {
    render(<GalleryView search="show=anchored" />);
    expect(cardIds()).toEqual([7]);
    expect(screen.getByTestId('active-trait-filters')).toHaveTextContent(
      'gallery.filters.anchored.label',
    );
  });

  it('writes a status filter to the URL without a new history entry or a scroll jump', () => {
    render(<GalleryView search="page=2" />);
    fireEvent.click(screen.getByRole('radio', { name: 'gallery.filters.named.label' }));
    expect(mockReplace).toHaveBeenCalledWith('/gallery?show=named', { scroll: false });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('filters by trait and chaos range from the URL', () => {
    const { rerender } = render(<GalleryView search="structure=Orbit+Ribbons" />);
    expect(cardIds()).toEqual([1]);
    rerender(<GalleryView search="chaos=20-30" />);
    expect(cardIds()).toEqual([1]);
    const chips = screen.getByTestId('active-trait-filters');
    fireEvent.click(within(chips).getByRole('button', { name: 'Clear Chaos' }));
    expect(mockReplace).toHaveBeenLastCalledWith('/gallery', { scroll: false });
  });

  it('sorts rarest first when asked, keeping tokens without traits last', () => {
    render(<GalleryView search="sort=rarity" />);
    const ids = cardIds();
    expect(ids[ids.length - 1]).toBe(43);
    expect(ids.slice(0, 2)).toEqual(expect.arrayContaining([1, 7]));
  });

  it('filters by a name or a token number from the URL', () => {
    const { rerender } = render(<GalleryView search="q=numba" />);
    expect(cardIds()).toEqual([1]);
    rerender(<GalleryView search="q=%23000043" />);
    expect(cardIds()).toEqual([43]);
  });

  it('commits the search to the URL after a pause in typing', () => {
    jest.useFakeTimers();
    try {
      render(<GalleryView search="" />);
      fireEvent.change(screen.getByLabelText('search.gallery.ariaLabel'), {
        target: { value: 'numba' },
      });
      expect(mockReplace).not.toHaveBeenCalled();
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(mockReplace).toHaveBeenCalledWith('/gallery?q=numba', { scroll: false });
    } finally {
      jest.useRealTimers();
    }
  });

  it('pages with a history entry and keeps the scroll where it is', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({
      TokenId: i,
      TokenName: '',
      RoundNum: 0,
      Staked: false,
      Seed: `s${i}`,
    }));
    mockUseCSTList.mockReturnValue({
      data: many,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    render(<GalleryView search="" />);
    expect(screen.getAllByTestId('signature-card')).toHaveLength(24);
    fireEvent.click(screen.getByRole('button', { name: 'tables.pagination.next' }));
    expect(mockPush).toHaveBeenCalledWith('/gallery?page=2', { scroll: false });
  });

  it('clamps a page beyond the results to the last page', () => {
    render(<GalleryView search="page=9" />);
    expect(cardIds()).toEqual([43, 7, 1]);
  });

  it('offers a way out of an empty filtered result', () => {
    render(<GalleryView search="q=nothing&fate=Ejection" />);
    expect(screen.getByRole('heading', { name: 'gallery.empty.title' })).toBeInTheDocument();
    const clear = screen.getAllByRole('button', { name: 'Clear all' });
    fireEvent.click(clear[clear.length - 1]!);
    expect(mockReplace).toHaveBeenCalledWith('/gallery', { scroll: false });
  });

  it('says the collection is empty, with no filter to clear, when nothing is imprinted', () => {
    mockUseCSTList.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    render(<GalleryView search="" />);
    expect(
      screen.getByRole('heading', { name: 'gallery.empty.collectionTitle' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument();
  });

  it('reads an empty refresh under a header that counted Signatures as a failed read', () => {
    const refetch = jest.fn();
    mockUseCSTList.mockReturnValue({ data: [], isLoading: false, isError: false, refetch });
    render(<GalleryView search="" snapshotCount={48} />);
    expect(screen.getByText('gallery.error.title')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'gallery.empty.collectionTitle' }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Try again/ }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('hands focus to the next chip, then to the result count, as filters go', () => {
    const { rerender } = render(<GalleryView search="show=anchored&q=7" />);
    const chips = within(screen.getByTestId('active-trait-filters')).getAllByRole('button');
    expect(chips).toHaveLength(2);
    chips[0]!.focus();
    fireEvent.click(chips[0]!);
    rerender(<GalleryView search="q=7" />);
    const remaining = within(screen.getByTestId('active-trait-filters')).getByRole('button');
    expect(remaining).toHaveFocus();
    fireEvent.click(remaining);
    rerender(<GalleryView search="" />);
    expect(screen.getByTestId('gallery-result-count')).toHaveFocus();
  });

  it('returns focus to the result count after Clear all', () => {
    const { rerender } = render(<GalleryView search="show=anchored" />);
    const clearAll = within(screen.getByTestId('gallery-results-bar')).getByRole('button', {
      name: 'Clear all',
    });
    clearAll.focus();
    fireEvent.click(clearAll);
    rerender(<GalleryView search="" />);
    expect(screen.getByTestId('gallery-result-count')).toHaveFocus();
  });

  it('keeps the Collection DNA panel mounted, so its disclosure always names it', () => {
    render(<GalleryView search="" />);
    const toggle = screen.getByTestId('dna-toggle');
    const panel = document.getElementById(toggle.getAttribute('aria-controls') ?? '');
    expect(panel).not.toBeNull();
    expect(panel).toHaveAttribute('hidden');
    fireEvent.click(toggle);
    expect(panel).not.toHaveAttribute('hidden');
  });

  it('shows plate skeletons while the archive loads', () => {
    mockUseCSTList.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    render(<GalleryView search="" />);
    expect(screen.getByTestId('signature-grid-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('signature-card')).not.toBeInTheDocument();
  });

  it('shows an error with a retry instead of an empty collection', () => {
    const refetch = jest.fn();
    mockUseCSTList.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });
    render(<GalleryView search="" />);
    expect(screen.getByText('gallery.error.title')).toBeInTheDocument();
    expect(screen.queryByText('gallery.empty.title')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Try again/ }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('keeps the collection on screen when a refetch fails after a load (F154)', () => {
    mockUseCSTList.mockReturnValue({
      data: nfts,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    });
    render(<GalleryView search="" />);
    expect(screen.queryByText('gallery.error.title')).not.toBeInTheDocument();
    expect(screen.queryByText('gallery.empty.title')).not.toBeInTheDocument();
    expect(cardIds().length).toBeGreaterThan(0);
  });

  it('renders the ledger in list view', () => {
    render(<GalleryView search="view=list" />);
    expect(screen.getByTestId('gallery-list')).toBeInTheDocument();
    expect(screen.queryByTestId('signature-card')).not.toBeInTheDocument();
  });

  it('opens the filter sheet from the toolbar below the rail breakpoint', () => {
    render(<GalleryView search="" />);
    fireEvent.click(screen.getByTestId('facets-toggle'));
    const sheet = screen.getByTestId('gallery-filter-sheet');
    expect(within(sheet).getByTestId('collection-dna')).toBeInTheDocument();
    expect(within(sheet).getByTestId('trait-facets')).toBeInTheDocument();
    expect(
      within(sheet).getByRole('radiogroup', { name: 'gallery.filters.ariaLabel' }),
    ).toBeInTheDocument();
  });

  it('writes a trait selection from the DNA legend to the URL', () => {
    render(<GalleryView search="" />);
    fireEvent.click(screen.getByTestId('facets-toggle'));
    const dna = screen.getByTestId('dna-fate');
    fireEvent.click(within(dna).getByRole('button', { name: /^Ejection: 1\sNFTs/ }));
    expect(mockReplace).toHaveBeenCalledWith('/gallery?fate=Ejection', { scroll: false });
  });

  it('opens the quick view from a card', () => {
    render(<GalleryView search="" />);
    fireEvent.click(screen.getByLabelText('Quick view of Cosmic Signature #000001'));
    expect(screen.getByTestId('nft-quick-view')).toBeInTheDocument();
  });

  it('keeps trait sort orders and the DNA out of reach while the index is unavailable', () => {
    mockUseCollectionTraits.mockReturnValue(traitsState('failed'));
    render(<GalleryView search="" />);
    expect(screen.queryByTestId('dna-toggle')).not.toBeInTheDocument();
    expect(screen.getAllByText('Traits pending').length).toBeGreaterThan(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GalleryView search="fate=Ejection" />);
    await checkA11y(container);
  });
});

describe('GalleryPage', () => {
  it('renders the view for the URL it is given', () => {
    mockSearch = 'show=named';
    render(<GalleryPage />);
    expect(cardIds()).toEqual([1]);
  });
});
