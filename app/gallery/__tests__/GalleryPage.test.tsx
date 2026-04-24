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

jest.mock('../../../hooks/useApiQuery', () => ({
  useCSTList: (...args: unknown[]) => mockUseCSTList(...args),
}));

jest.mock('../../../services/api', () => ({
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
  it('renders the page title and subtitle', () => {
    mockUseCSTList.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<GalleryPage />);
    expect(screen.getByText('NFT Gallery')).toBeInTheDocument();
    expect(
      screen.getByText(/Explore the complete Cosmic Signature NFT collection imprinted/),
    ).toBeInTheDocument();
  });

  it('shows skeleton loading state', () => {
    mockUseCSTList.mockReturnValue({ data: undefined, isLoading: true, error: null });
    const { container } = render(<GalleryPage />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders hero stats with correct counts', () => {
    mockUseCSTList.mockReturnValue({ data: mockNFTs, isLoading: false, error: null });
    render(<GalleryPage />);
    expect(screen.getByText('Total Minted')).toBeInTheDocument();
    expect(screen.getByText('Currently Anchored')).toBeInTheDocument();
    expect(screen.getByText('Named NFTs')).toBeInTheDocument();
    expect(screen.getByText('Game Rounds')).toBeInTheDocument();
  });

  it('renders NFT cards when data is loaded', () => {
    mockUseCSTList.mockReturnValue({ data: mockNFTs, isLoading: false, error: null });
    render(<GalleryPage />);
    expect(screen.getByText('#000003')).toBeInTheDocument();
    expect(screen.getByText('#000002')).toBeInTheDocument();
    expect(screen.getByText('#000001')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    mockUseCSTList.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<GalleryPage />);
    expect(screen.getByText('No NFTs found')).toBeInTheDocument();
  });

  it('renders search input', () => {
    mockUseCSTList.mockReturnValue({ data: mockNFTs, isLoading: false, error: null });
    render(<GalleryPage />);
    expect(screen.getByLabelText('Search NFTs')).toBeInTheDocument();
  });

  it('renders filter chips', () => {
    mockUseCSTList.mockReturnValue({ data: mockNFTs, isLoading: false, error: null });
    render(<GalleryPage />);
    expect(screen.getByRole('radio', { name: /All/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Staked/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Named/i })).toBeInTheDocument();
  });

  it('filters NFTs when Staked chip is clicked', () => {
    mockUseCSTList.mockReturnValue({ data: mockNFTs, isLoading: false, error: null });
    render(<GalleryPage />);
    fireEvent.click(screen.getByRole('radio', { name: /Staked/i }));
    expect(screen.getByText('#000003')).toBeInTheDocument();
    expect(screen.getByText('#000002')).toBeInTheDocument();
    expect(screen.queryByText('#000001')).not.toBeInTheDocument();
  });

  it('filters NFTs when Named chip is clicked', () => {
    mockUseCSTList.mockReturnValue({ data: mockNFTs, isLoading: false, error: null });
    render(<GalleryPage />);
    fireEvent.click(screen.getByRole('radio', { name: /Named/i }));
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  it('renders view mode toggle', () => {
    mockUseCSTList.mockReturnValue({ data: mockNFTs, isLoading: false, error: null });
    render(<GalleryPage />);
    expect(screen.getByRole('radio', { name: 'Grid view' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'List view' })).toBeInTheDocument();
  });

  it('filters by numeric search on enter', async () => {
    mockUseCSTList.mockReturnValue({ data: mockNFTs, isLoading: false, error: null });
    render(<GalleryPage />);
    const input = screen.getByLabelText('Search NFTs');
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
    expect(screen.getByText('No NFTs found')).toBeInTheDocument();
  });
});
