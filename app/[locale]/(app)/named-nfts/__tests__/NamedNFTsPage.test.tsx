import { checkA11y, fireEvent, render, screen, within } from '@/test-utils';

import NamedNFTsPage from '../NamedNFTsPage';

const mockUseNamedNFTs = jest.fn();
const mockUseCSTList = jest.fn();
jest.mock('@/hooks/useApiQuery', () => ({
  useNamedNFTs: () => mockUseNamedNFTs(),
  useCSTList: () => mockUseCSTList(),
}));

const mockUseCollectionTraits = jest.fn();
jest.mock('@/hooks/useNftTraits', () => ({
  useCollectionTraits: () => mockUseCollectionTraits(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill: _f, priority: _p, unoptimized: _u, fetchPriority: _fp, ...rest } = props;
    return <img {...rest} />;
  },
}));

const named = [
  { MintTimeStamp: 1000, TokenId: 1, TokenName: 'Alpha' },
  { MintTimeStamp: 2000, TokenId: 2, TokenName: 'Beta' },
];
const collection = [
  { TokenId: 1, Seed: 'a1', Staked: true },
  { TokenId: 2, Seed: 'a2', Staked: false },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseNamedNFTs.mockReturnValue({ data: named, isLoading: false });
  mockUseCSTList.mockReturnValue({ data: collection, isLoading: false });
  mockUseCollectionTraits.mockReturnValue({ traits: null, isLoading: false, isError: true });
});

describe('NamedNFTsPage', () => {
  it('renders the fallback header without a server summary', () => {
    render(<NamedNFTsPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Named Cosmic Signature NFTs' }),
    ).toBeInTheDocument();
  });

  it('hangs every named Signature as art, titled by its name', () => {
    render(<NamedNFTsPage />);
    const wall = screen.getByRole('list', { name: 'Named Cosmic Signature NFTs' });
    const cards = within(wall).getAllByTestId('signature-card');
    expect(cards).toHaveLength(2);
    expect(within(cards[0]!).getByText('Alpha')).toBeInTheDocument();
    expect(within(cards[0]!).getByRole('link')).toHaveAttribute('href', '/detail/1');
    // The anchored state comes from the collection list.
    expect(within(cards[0]!).getByTestId('anchored-mark')).toBeInTheDocument();
    expect(within(cards[1]!).queryByTestId('anchored-mark')).not.toBeInTheDocument();
  });

  it('links to the gallery filtered to named Signatures', () => {
    render(<NamedNFTsPage />);
    expect(screen.getByRole('link', { name: 'See them in the gallery' })).toHaveAttribute(
      'href',
      '/gallery?show=named',
    );
  });

  it('waits for a seed source rather than flashing unavailable plates', () => {
    mockUseCSTList.mockReturnValue({ data: undefined, isLoading: true });
    mockUseCollectionTraits.mockReturnValue({ traits: null, isLoading: true, isError: false });
    render(<NamedNFTsPage />);
    expect(screen.getByTestId('signature-grid-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('pending-plate')).not.toBeInTheDocument();
  });

  it('says so when no Signature has a name yet', () => {
    mockUseNamedNFTs.mockReturnValue({ data: [], isLoading: false });
    render(<NamedNFTsPage />);
    expect(screen.getByRole('heading', { level: 2, name: 'No named NFTs' })).toBeInTheDocument();
    expect(screen.getByText('No Cosmic Signature NFTs have been named yet.')).toBeInTheDocument();
  });

  it('offers a retry instead of an empty wall when the list cannot be read', () => {
    const refetch = jest.fn();
    mockUseNamedNFTs.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });
    render(<NamedNFTsPage />);
    expect(screen.queryByRole('heading', { name: 'No named NFTs' })).toBeNull();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Named NFTs could not be loaded' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Try again/ }));
    expect(refetch).toHaveBeenCalled();
  });

  it('never says nothing is named under a header that counted named NFTs', () => {
    mockUseNamedNFTs.mockReturnValue({ data: [], isLoading: false, refetch: jest.fn() });
    render(<NamedNFTsPage snapshotCount={3} />);
    expect(screen.queryByRole('heading', { name: 'No named NFTs' })).toBeNull();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Named NFTs could not be loaded' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NamedNFTsPage />);
    await checkA11y(container);
  });
});
