import { checkA11y, fireEvent, render, screen, within } from '@/test-utils';

import NamedNFTsPage from '../NamedNFTsPage';
import type { NamedSignature } from '../namedWall';

const mockUseQuery = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
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

const NAMER = '0x232351e4217F8cB46BcA6c94e873C382ae2B99AE';

function row(overrides: Partial<NamedSignature>): NamedSignature {
  return {
    tokenId: 1,
    name: 'Alpha',
    seed: 'a1',
    anchored: false,
    imprintedAt: 1000,
    namedAt: 1786935062,
    namedBy: NAMER,
    namedTx: '0x196087f0ceb1ded3f6f15ae3f0215cce400c8c5ee38dcbcb8579e553b86d3696',
    ...overrides,
  };
}

// Most recently named first, as readNamedWall orders them.
const wall = [
  row({ tokenId: 25, name: 'Twisted Mind', anchored: true }),
  row({ tokenId: 1, name: 'NUMBA 1', namedAt: 1781506802, namedTx: null, namedBy: null }),
];

function query(state: Record<string, unknown>) {
  mockUseQuery.mockReturnValue({ isLoading: false, isError: false, refetch: jest.fn(), ...state });
}

beforeEach(() => {
  jest.clearAllMocks();
  query({ data: wall });
  mockUseCollectionTraits.mockReturnValue({ traits: null, isLoading: false, isError: true });
});

describe('NamedNFTsPage', () => {
  it('renders the fallback header without a server summary', () => {
    render(<NamedNFTsPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Named Cosmic Signature NFTs' }),
    ).toBeInTheDocument();
  });

  it('hangs every named Signature as art, titled by its name, in the order named', () => {
    render(<NamedNFTsPage />);
    const list = screen.getByRole('list', { name: 'Named Cosmic Signature NFTs' });
    const cards = within(list).getAllByTestId('signature-card');
    expect(cards).toHaveLength(2);
    expect(within(cards[0]!).getByText('Twisted Mind')).toBeInTheDocument();
    expect(within(cards[0]!).getAllByRole('link')[0]).toHaveAttribute('href', '/detail/25');
    expect(within(cards[0]!).getByTestId('anchored-mark')).toBeInTheDocument();
    expect(within(cards[1]!).queryByTestId('anchored-mark')).not.toBeInTheDocument();
  });

  it('says who named each Signature and when, with the proof', () => {
    render(<NamedNFTsPage />);
    const [first, second] = screen.getAllByTestId('signature-card');
    expect(within(first!).getByText('Named')).toBeInTheDocument();
    expect(within(first!).getByText('Named by')).toBeInTheDocument();
    const proof = within(first!)
      .getAllByRole('link')
      .find((link) => link.getAttribute('href')?.includes('/tx/0x196087f0'));
    expect(proof).toBeDefined();
    expect(within(first!).getByRole('link', { name: /0x2323/ })).toHaveAttribute(
      'href',
      `/user/${NAMER}`,
    );
    // No proof or namer read: the date alone.
    expect(within(second!).queryByText('Named by')).not.toBeInTheDocument();
  });

  it('never nests a link inside the card link', () => {
    const { container } = render(<NamedNFTsPage />);
    expect(container.querySelectorAll('a a')).toHaveLength(0);
  });

  it('links to the gallery filtered to named Signatures', () => {
    render(<NamedNFTsPage />);
    expect(screen.getByRole('link', { name: 'See them in the gallery' })).toHaveAttribute(
      'href',
      '/gallery?show=named',
    );
  });

  it('waits for the trait index when a record gave no seed, rather than flash unavailable plates', () => {
    query({ data: [row({ seed: null })] });
    mockUseCollectionTraits.mockReturnValue({ traits: null, isLoading: true, isError: false });
    render(<NamedNFTsPage />);
    expect(screen.getByTestId('signature-grid-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('pending-plate')).not.toBeInTheDocument();
  });

  it('says so when no Signature has a name yet', () => {
    query({ data: [] });
    render(<NamedNFTsPage />);
    expect(screen.getByRole('heading', { level: 2, name: 'No named NFTs' })).toBeInTheDocument();
    expect(screen.getByText('No Cosmic Signature NFTs have been named yet.')).toBeInTheDocument();
  });

  it('offers a retry instead of an empty wall when the list cannot be read', () => {
    const refetch = jest.fn();
    query({ data: undefined, isError: true, refetch });
    render(<NamedNFTsPage />);
    expect(screen.queryByRole('heading', { name: 'No named NFTs' })).toBeNull();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Named NFTs could not be loaded' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Try again/ }));
    expect(refetch).toHaveBeenCalled();
  });

  // A failed background refetch keeps the data it had (TanStack sets isError).
  it('keeps the wall when a refetch fails after a load', () => {
    query({ data: wall, isError: true });
    render(<NamedNFTsPage />);
    expect(screen.getAllByTestId('signature-card')).toHaveLength(2);
    expect(screen.queryByRole('heading', { name: 'Named NFTs could not be loaded' })).toBeNull();
  });

  it('never says nothing is named under a header that counted named NFTs', () => {
    query({ data: [] });
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
