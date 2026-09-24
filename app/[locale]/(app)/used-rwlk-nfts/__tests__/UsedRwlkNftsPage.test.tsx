import { checkA11y, fireEvent, render, screen, within } from '@/test-utils';

import UsedRwlkNftsPage, { toUsedRwlkNftRecords } from '../UsedRwlkNftsPage';

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

describe('UsedRwlkNftsPage', () => {
  it('renders the fallback header without a server summary', () => {
    mockUseUsedRWLKNFTs.mockReturnValue(state());
    render(<UsedRwlkNftsPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Used Random Walk NFTs' })).toBeVisible();
  });

  it('shows each used RandomWalk NFT with its art, its page, the participant and the cycle', () => {
    mockUseUsedRWLKNFTs.mockReturnValue(state({ data: [record()] }));
    render(<UsedRwlkNftsPage />);
    const table = screen.getAllByRole('table')[0]!;
    expect(within(table).getByAltText('RandomWalk NFT #000215')).toHaveAttribute(
      'src',
      expect.stringContaining('000215_black_thumb.jpg'),
    );
    expect(within(table).getByRole('link', { name: /#000215/ })).toHaveAttribute(
      'href',
      'https://www.randomwalknft.com/detail/215',
    );
    expect(within(table).getByRole('link', { name: '1' })).toHaveAttribute('href', '/allocation/1');
    expect(within(table).getByRole('link', { name: /0x4A9A/ })).toHaveAttribute(
      'href',
      `/user/${PARTICIPANT}`,
    );
  });

  it('pages a long ledger instead of five rows at a time', () => {
    mockUseUsedRWLKNFTs.mockReturnValue(
      state({
        data: Array.from({ length: 25 }, (_, i) => record({ RWalkTokenId: i, TxHash: `0x${i}` })),
      }),
    );
    render(<UsedRwlkNftsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'tables.pagination.nextAria' }));
    expect(screen.getAllByText(/tables\.pagination\.range\(from=21/)[0]).toBeInTheDocument();
  });

  it('says what fills an empty ledger', () => {
    mockUseUsedRWLKNFTs.mockReturnValue(state());
    render(<UsedRwlkNftsPage />);
    expect(screen.getByText('No RandomWalk NFTs used yet')).toBeInTheDocument();
  });

  it('offers a retry when the ledger cannot be read', () => {
    const refetch = jest.fn();
    mockUseUsedRWLKNFTs.mockReturnValue(state({ isError: true, refetch }));
    render(<UsedRwlkNftsPage />);
    fireEvent.click(screen.getByRole('button', { name: /Try again/ }));
    expect(refetch).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    mockUseUsedRWLKNFTs.mockReturnValue(state({ data: [record()] }));
    const { container } = render(<UsedRwlkNftsPage />);
    await checkA11y(container);
  });
});
