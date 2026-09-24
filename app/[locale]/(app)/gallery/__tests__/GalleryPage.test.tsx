import { render, screen, checkA11y, fireEvent, waitFor } from '@/test-utils';

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

const mockUseCSTList = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  error: null,
});

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useCSTList: (...args: unknown[]) => mockUseCSTList(...args),
}));

jest.mock('../../../../../services/api', () => ({
  __esModule: true,
  default: {
    get_token_by_name: jest.fn().mockResolvedValue([]),
  },
}));

const mockNFTs = [
  {
    TokenId: 1,
    TokenName: 'Alpha',
    RoundNum: 1,
    Staked: false,
    Seed: 'aaa',
    MintTimeStamp: 1700000000,
    EvtLogId: 1,
    BlockNum: 1,
    TxId: 1,
    TxHash: '0x1',
    TimeStamp: 1700000000,
    DateTime: '',
  },
  {
    TokenId: 2,
    TokenName: '',
    RoundNum: 1,
    Staked: true,
    Seed: 'bbb',
    MintTimeStamp: 1700001000,
    EvtLogId: 2,
    BlockNum: 2,
    TxId: 2,
    TxHash: '0x2',
    TimeStamp: 1700001000,
    DateTime: '',
  },
  {
    TokenId: 3,
    TokenName: 'Gamma',
    RoundNum: 2,
    Staked: true,
    Seed: 'ccc',
    MintTimeStamp: 1700002000,
    EvtLogId: 3,
    BlockNum: 3,
    TxId: 3,
    TxHash: '0x3',
    TimeStamp: 1700002000,
    DateTime: '',
  },
];

beforeEach(() => jest.clearAllMocks());

describe('GalleryPage', () => {
  it.each([
    { state: 'loaded', isLoading: false, isError: false },
    { state: 'loading', isLoading: true, isError: false },
    { state: 'failed', isLoading: false, isError: true },
  ])('renders only the body when $state: the route renders the shell and header', (query) => {
    mockUseCSTList.mockReturnValue({ ...query, data: [], refetch: jest.fn() });
    render(<GalleryPage />);

    expect(screen.queryByRole('main')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    // The collection figures and the marketplace action live in the server header.
    expect(
      screen.queryByRole('link', { name: 'nav.ecosystem.axiomZero.ariaLabel' }),
    ).not.toBeInTheDocument();
  });

  it('shows skeleton loading state', () => {
    mockUseCSTList.mockReturnValue({ data: undefined, isLoading: true, error: null });
    const { container } = render(<GalleryPage />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders NFT cards when data is loaded', () => {
    mockUseCSTList.mockReturnValue({ data: mockNFTs, isLoading: false, error: null });
    render(<GalleryPage />);
    expect(screen.getAllByText('#000003').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('#000002')).toBeInTheDocument();
    expect(screen.getByText('#000001')).toBeInTheDocument();
  });

  it('rings the featured plate while its link has keyboard focus', () => {
    mockUseCSTList.mockReturnValue({ data: mockNFTs, isLoading: false, error: null });
    render(<GalleryPage />);
    const link = screen.getByRole('link', { name: 'gallery.featured.viewAria(id=#000003)' });
    // The vignette, hue strip and badge paint over the link, so an outline on
    // the link itself never showed; the plate draws it instead.
    expect(link).toHaveClass('focus-ring-none');
    expect(link.parentElement).toHaveClass('focus-ring-within');
  });

  it('shows empty state when no data', () => {
    mockUseCSTList.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<GalleryPage />);
    expect(screen.getByText('gallery.empty.title')).toBeInTheDocument();
  });

  it('renders search input', () => {
    mockUseCSTList.mockReturnValue({ data: mockNFTs, isLoading: false, error: null });
    render(<GalleryPage />);
    expect(screen.getByLabelText('search.gallery.ariaLabel')).toBeInTheDocument();
  });

  it('renders filter chips', () => {
    mockUseCSTList.mockReturnValue({ data: mockNFTs, isLoading: false, error: null });
    render(<GalleryPage />);
    expect(screen.getByRole('radio', { name: 'gallery.filters.all.label' })).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'gallery.filters.anchored.label' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'gallery.filters.named.label' })).toBeInTheDocument();
  });

  it('filters NFTs when Anchored chip is clicked', () => {
    mockUseCSTList.mockReturnValue({ data: mockNFTs, isLoading: false, error: null });
    render(<GalleryPage />);
    fireEvent.click(screen.getByRole('radio', { name: 'gallery.filters.anchored.label' }));
    expect(screen.getAllByText('#000003').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('#000002')).toBeInTheDocument();
    expect(screen.queryByText('#000001')).not.toBeInTheDocument();
  });

  it('filters NFTs when Named chip is clicked', () => {
    mockUseCSTList.mockReturnValue({ data: mockNFTs, isLoading: false, error: null });
    render(<GalleryPage />);
    fireEvent.click(screen.getByRole('radio', { name: 'gallery.filters.named.label' }));
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  it('renders view mode toggle', () => {
    mockUseCSTList.mockReturnValue({ data: mockNFTs, isLoading: false, error: null });
    render(<GalleryPage />);
    expect(screen.getByRole('radio', { name: 'gallery.view.grid' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'gallery.view.list' })).toBeInTheDocument();
  });

  it('filters by numeric search on enter', async () => {
    mockUseCSTList.mockReturnValue({ data: mockNFTs, isLoading: false, error: null });
    render(<GalleryPage />);
    const input = screen.getByLabelText('search.gallery.ariaLabel');
    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByText('#000001')).toBeInTheDocument();
    });
  });

  it('has no accessibility violations', async () => {
    mockUseCSTList.mockReturnValue({ data: mockNFTs, isLoading: false, error: null });
    const { container } = render(<GalleryPage />);
    await checkA11y(container);
  });

  it('handles null data gracefully', () => {
    mockUseCSTList.mockReturnValue({ data: null, isLoading: false, error: null });
    render(<GalleryPage />);
    expect(screen.getByText('gallery.empty.title')).toBeInTheDocument();
  });

  describe('when the archive read fails', () => {
    it('shows an error state instead of an empty collection', () => {
      mockUseCSTList.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: jest.fn(),
      });

      render(<GalleryPage />);

      expect(screen.getByText('gallery.error.title')).toBeInTheDocument();
      expect(screen.getByText('gallery.error.message')).toBeInTheDocument();
      expect(screen.queryByText('gallery.empty.title')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('search.gallery.ariaLabel')).not.toBeInTheDocument();
    });

    it('keeps the collection on screen when a refetch fails after a load (F154)', () => {
      mockUseCSTList.mockReturnValue({
        data: mockNFTs,
        isLoading: false,
        isError: true,
        refetch: jest.fn(),
      });

      render(<GalleryPage />);

      expect(screen.queryByText('gallery.error.title')).not.toBeInTheDocument();
      expect(screen.queryByText('gallery.empty.title')).not.toBeInTheDocument();
    });

    it('refetches the collection when the retry action is used', () => {
      const refetch = jest.fn();
      mockUseCSTList.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch,
      });

      render(<GalleryPage />);
      fireEvent.click(screen.getByRole('button', { name: /Try again/ }));

      expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('has no accessibility violations in the error state', async () => {
      mockUseCSTList.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: jest.fn(),
      });

      const { container } = render(<GalleryPage />);
      await checkA11y(container);
    });
  });
});
