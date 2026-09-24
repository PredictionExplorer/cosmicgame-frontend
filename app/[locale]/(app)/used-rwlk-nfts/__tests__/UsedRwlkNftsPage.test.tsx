import { checkA11y, fireEvent, render, screen, within } from '@/test-utils';

import UsedRwlkNftsPage, { newestFirst, toUsedRwlkNftRecords } from '../UsedRwlkNftsPage';

const mockUseUsedRWLKNFTs = jest.fn();
jest.mock('@/hooks/useApiQuery', () => ({
  useUsedRWLKNFTs: () => mockUseUsedRWLKNFTs(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill: _f, priority: _p, unoptimized: _u, fetchPriority: _fp, ...rest } = props;
    return <img {...rest} />;
  },
}));

const PARTICIPANT = '0x4A9A3815060C3Bd08fb4d44C9e74513874771b0C';

const record = (overrides = {}) => ({
  RWalkTokenId: 215,
  BidderAddr: PARTICIPANT,
  RoundNum: 1,
  TxHash: '0xabc',
  TimeStamp: 1786335030,
  ...overrides,
});

const state = (overrides = {}) => ({
  data: [],
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('toUsedRwlkNftRecords', () => {
  it('keeps the proof only when the indexer reports it', () => {
    expect(
      toUsedRwlkNftRecords([
        { RWalkTokenId: 1, BidderAddr: PARTICIPANT, RoundNum: 0, TxHash: '0x1', TimeStamp: '5' },
        { RWalkTokenId: 2, BidderAddr: PARTICIPANT, RoundNum: 0 },
      ]),
    ).toEqual([
      { RWalkTokenId: 1, BidderAddr: PARTICIPANT, RoundNum: 0, TxHash: '0x1', TimeStamp: 5 },
      { RWalkTokenId: 2, BidderAddr: PARTICIPANT, RoundNum: 0, TxHash: null, TimeStamp: null },
    ]);
  });
});

describe('newestFirst', () => {
  it('puts the latest use first and records without a time last', () => {
    const [a, b, c] = [
      { ...record({ RWalkTokenId: 1, TimeStamp: 10 }), TxHash: null },
      { ...record({ RWalkTokenId: 2, TimeStamp: null }), TxHash: null },
      { ...record({ RWalkTokenId: 3, TimeStamp: 30 }), TxHash: null },
    ];
    expect(newestFirst([a, b, c]).map((r) => r.RWalkTokenId)).toEqual([3, 1, 2]);
  });
});

describe('UsedRwlkNftsPage', () => {
  it('renders the fallback header without a server summary', () => {
    mockUseUsedRWLKNFTs.mockReturnValue(state());
    render(<UsedRwlkNftsPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Used Random Walk NFTs' })).toBeVisible();
  });

  it('hangs each used RandomWalk NFT on a plate, with its page, cycle and participant', () => {
    mockUseUsedRWLKNFTs.mockReturnValue(state({ data: [record()] }));
    render(<UsedRwlkNftsPage />);
    const wall = screen.getByRole('list', { name: 'Used Random Walk NFTs' });
    const card = within(wall).getByTestId('used-rwlk-nft');
    expect(within(card).getByAltText('RandomWalk NFT #000215')).toHaveAttribute(
      'src',
      expect.stringContaining('000215_black_thumb.jpg'),
    );
    // The plate and its number are one link, named by the plate's alt text.
    const tokenLink = within(card).getByRole('link', { name: /RandomWalk NFT #000215/ });
    expect(tokenLink).toHaveAttribute('href', 'https://www.randomwalknft.com/detail/215');
    expect(tokenLink).toHaveAttribute('target', '_blank');
    expect(within(card).getByRole('link', { name: 'Cycle #1' })).toHaveAttribute(
      'href',
      '/allocation/1',
    );
    expect(within(card).getByRole('link', { name: /0x4A9A/ })).toHaveAttribute(
      'href',
      `/user/${PARTICIPANT}`,
    );
    expect(within(card).getByText('Used by')).toBeInTheDocument();
    expect(within(card).getByRole('time')).toHaveAttribute('dateTime', expect.any(String));
  });

  it('shows the newest use first and pages twelve at a time', () => {
    mockUseUsedRWLKNFTs.mockReturnValue(
      state({
        data: Array.from({ length: 14 }, (_, i) =>
          record({ RWalkTokenId: i, TxHash: `0x${i}`, TimeStamp: 1000 + i }),
        ),
      }),
    );
    render(<UsedRwlkNftsPage />);
    const cards = screen.getAllByTestId('used-rwlk-nft');
    expect(cards).toHaveLength(12);
    expect(within(cards[0]!).getByAltText('RandomWalk NFT #000013')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'tables.pagination.nextAria' }));
    expect(screen.getAllByTestId('used-rwlk-nft')).toHaveLength(2);
  });

  it('shows plate skeletons while loading', () => {
    mockUseUsedRWLKNFTs.mockReturnValue(state({ isLoading: true, data: undefined }));
    render(<UsedRwlkNftsPage />);
    expect(screen.getByRole('status', { name: 'tables.skeleton.loadingNft' })).toBeInTheDocument();
  });

  it('says what fills an empty page', () => {
    mockUseUsedRWLKNFTs.mockReturnValue(state());
    render(<UsedRwlkNftsPage />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'No RandomWalk NFTs used yet' }),
    ).toBeInTheDocument();
  });

  it('offers a retry when the records cannot be read', () => {
    const refetch = jest.fn();
    mockUseUsedRWLKNFTs.mockReturnValue(state({ isError: true, refetch }));
    render(<UsedRwlkNftsPage />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Used RandomWalk NFTs could not be loaded' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Try again/ }));
    expect(refetch).toHaveBeenCalled();
  });

  it('never says nothing was used under a header that counted uses', () => {
    mockUseUsedRWLKNFTs.mockReturnValue(state());
    render(<UsedRwlkNftsPage snapshotCount={3} />);
    expect(screen.queryByRole('heading', { name: 'No RandomWalk NFTs used yet' })).toBeNull();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Used RandomWalk NFTs could not be loaded' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseUsedRWLKNFTs.mockReturnValue(state({ data: [record()] }));
    const { container } = render(<UsedRwlkNftsPage />);
    await checkA11y(container);
  });
});
