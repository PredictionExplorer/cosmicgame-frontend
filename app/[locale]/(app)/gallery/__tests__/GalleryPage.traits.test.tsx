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

import { render, screen, checkA11y, fireEvent, within } from '@/test-utils';

import GalleryPage from '../GalleryPage';

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy(
      {},
      {
        get: (_t: unknown, prop: string) => {
          const Comp = React.forwardRef(function MotionProxy(
            props: Record<string, unknown>,
            ref: React.Ref<HTMLElement>,
          ) {
            const {
              initial: _i,
              animate: _a,
              exit: _e,
              transition: _tr,
              whileInView: _w,
              viewport: _v,
              variants: _va,
              custom: _c,
              layout: _l,
              ...rest
            } = props;
            return React.createElement(prop, { ...rest, ref });
          });
          Comp.displayName = `motion.${prop}`;
          return Comp;
        },
      },
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Controllable URL state: the page derives sort / trait filters from the
// search params and writes changes back through router.push.
let currentSearch = '';
const mockPush = jest.fn((href: string) => {
  const index = href.indexOf('?');
  currentSearch = index === -1 ? '' : href.slice(index + 1);
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/gallery',
  useSearchParams: () => new URLSearchParams(currentSearch),
  useParams: () => ({}),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

const mockUseCSTList = jest.fn();
jest.mock('../../../../../hooks/useApiQuery', () => ({
  useCSTList: (...args: unknown[]) => mockUseCSTList(...args),
}));

jest.mock('../../../../../services/api', () => ({
  __esModule: true,
  default: {
    get_token_by_name: jest.fn().mockResolvedValue([]),
  },
}));

const mockUseCollectionTraits = jest.fn();
jest.mock('@/hooks/useNftTraits', () => ({
  ...jest.requireActual('@/hooks/useNftTraits'),
  useCollectionTraits: (...args: unknown[]) => mockUseCollectionTraits(...args),
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

/** Token ids of the rendered gallery cards, in display order. */
function cardIds(): string[] {
  return screen
    .getAllByTestId('gallery-card')
    .map((card) => within(card).getByText(/^#\d{6}$/).textContent ?? '');
}

const nfts = [
  {
    TokenId: 1,
    TokenName: 'NUMBA 1',
    RoundNum: 0,
    Staked: false,
    Seed: 'a1',
    MintTimeStamp: 1781506802,
  },
  { TokenId: 7, TokenName: '', RoundNum: 0, Staked: true, Seed: 'a7', MintTimeStamp: 1781506802 },
  {
    TokenId: 43,
    TokenName: '',
    RoundNum: 1,
    Staked: false,
    Seed: 'a43',
    MintTimeStamp: 1786491506,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  currentSearch = '';
  mockUseCSTList.mockReturnValue({ data: nfts, isLoading: false, error: null });
  mockUseCollectionTraits.mockReturnValue({
    traits: collectionTraits,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  });
});

describe('GalleryPage with the collection trait index', () => {
  it('renders trait summaries on cards and marks legacy tokens as pending', () => {
    render(<GalleryPage />);
    const summaries = screen.getAllByTestId('trait-summary');
    expect(summaries.map((el) => el.textContent)).toEqual(
      expect.arrayContaining([expect.stringContaining('Orbit Ribbons')]),
    );
    expect(screen.getByTestId('traits-pending')).toBeInTheDocument();
  });

  it('renders the facet rail with collection counts and the DNA strip', () => {
    render(<GalleryPage />);
    const rail = screen.getByTestId('facets-rail');
    expect(within(rail).getByText('Orbit Ribbons')).toBeInTheDocument();
    expect(within(rail).getByText('Time Chords')).toBeInTheDocument();
    expect(screen.getByTestId('collection-dna')).toBeInTheDocument();
    expect(screen.getByTestId('dna-fate')).toBeInTheDocument();
  });

  it('writes a trait selection to the URL when a facet is toggled', () => {
    render(<GalleryPage />);
    const rail = screen.getByTestId('facets-rail');
    fireEvent.click(within(rail).getByLabelText('Orbit Ribbons: 1 NFTs'));
    expect(mockPush).toHaveBeenCalledWith('/gallery?structure=Orbit+Ribbons');
  });

  it('filters the grid by the trait selection in the URL', () => {
    currentSearch = 'structure=Orbit+Ribbons';
    render(<GalleryPage />);
    expect(cardIds()).toEqual(['#000001']);
    expect(screen.getByTestId('active-trait-filters')).toHaveTextContent('Orbit Ribbons');
  });

  it('filters by chaos range and removes it from the active chips', () => {
    currentSearch = 'chaos=20-30';
    render(<GalleryPage />);
    expect(cardIds()).toEqual(['#000001']);
    const chips = screen.getByTestId('active-trait-filters');
    fireEvent.click(within(chips).getByRole('button', { name: 'Clear Chaos' }));
    expect(mockPush).toHaveBeenCalledWith('/gallery');
  });

  it('sorts rarest first when asked, keeping legacy tokens last', () => {
    currentSearch = 'sort=rarity';
    render(<GalleryPage />);
    const ids = cardIds();
    expect(ids[ids.length - 1]).toBe('#000043');
    expect(ids.slice(0, 2)).toEqual(expect.arrayContaining(['#000001', '#000007']));
  });

  it('opens the quick view for a card with its trait sheet', () => {
    render(<GalleryPage />);
    fireEvent.click(screen.getByLabelText('Quick view of Cosmic Signature #000001'));
    const dialog = screen.getByTestId('nft-quick-view');
    expect(within(dialog).getByTestId('trait-sheet')).toBeInTheDocument();
    expect(within(dialog).getByText('NUMBA 1')).toBeInTheDocument();
  });

  it('applies a DNA segment as a replacing trait filter', () => {
    render(<GalleryPage />);
    const dna = screen.getByTestId('dna-fate');
    fireEvent.click(within(dna).getByRole('button', { name: /^Ejection: 1 NFTs/ }));
    expect(mockPush).toHaveBeenCalledWith('/gallery?fate=Ejection');
  });

  it('hides trait sort orders and the rail when the index failed', () => {
    mockUseCollectionTraits.mockReturnValue({
      traits: null,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    });
    render(<GalleryPage />);
    expect(screen.getByText('Trait filters are unavailable right now.')).toBeInTheDocument();
    expect(screen.queryByTestId('collection-dna')).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('trait-summary')).toHaveLength(0);
  });

  it('shows skeleton trait rows while the index loads', () => {
    mockUseCollectionTraits.mockReturnValue({
      traits: null,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    render(<GalleryPage />);
    expect(screen.getAllByTestId('trait-skeleton').length).toBeGreaterThan(0);
  });

  it('has no accessibility violations with traits rendered', async () => {
    const { container } = render(<GalleryPage />);
    await checkA11y(container);
  });
});
