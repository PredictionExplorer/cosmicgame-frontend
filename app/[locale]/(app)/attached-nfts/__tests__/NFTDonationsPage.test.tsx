import { checkA11y, fireEvent, render, screen } from '@/test-utils';

import NFTDonationsPage from '../NFTDonationsPage';

const mockUseDonationsNFTList = jest.fn();
jest.mock('@/hooks/useApiQuery', () => ({
  useDonationsNFTList: () => mockUseDonationsNFTList(),
}));

jest.mock('@/components/attachments/AttachedNFT', () => ({
  __esModule: true,
  default: ({ nft, showRecord }: { nft: { NFTTokenId: number }; showRecord?: boolean }) => (
    <article data-testid="attached-nft" data-record={showRecord ? 'true' : undefined}>
      #{nft.NFTTokenId}
    </article>
  ),
}));

const record = (id: number, time: number) => ({
  RecordId: id,
  TokenAddr: '0x1111111111111111111111111111111111111111',
  NFTTokenId: id,
  RoundNum: 0,
  DonorAddr: '0x2222222222222222222222222222222222222222',
  TimeStamp: time,
});

const state = (overrides = {}) => ({
  data: undefined,
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('NFTDonationsPage', () => {
  it('renders the fallback header without a server summary', () => {
    mockUseDonationsNFTList.mockReturnValue(state({ data: [] }));
    render(<NFTDonationsPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Attached NFT Contributions' }),
    ).toBeInTheDocument();
  });

  it('hangs the attached NFTs as works, newest first, with their records', () => {
    mockUseDonationsNFTList.mockReturnValue(state({ data: [record(1, 100), record(2, 300)] }));
    render(<NFTDonationsPage />);
    const cards = screen.getAllByTestId('attached-nft');
    expect(cards.map((card) => card.textContent)).toEqual(['#2', '#1']);
    expect(cards[0]).toHaveAttribute('data-record', 'true');
  });

  it('pages twelve at a time', () => {
    mockUseDonationsNFTList.mockReturnValue(
      state({ data: Array.from({ length: 14 }, (_, i) => record(i + 1, i)) }),
    );
    render(<NFTDonationsPage />);
    expect(screen.getAllByTestId('attached-nft')).toHaveLength(12);
    fireEvent.click(screen.getByRole('button', { name: 'tables.pagination.nextAria' }));
    expect(screen.getAllByTestId('attached-nft')).toHaveLength(2);
  });

  it('shows square plate skeletons while loading', () => {
    mockUseDonationsNFTList.mockReturnValue(state({ isLoading: true }));
    render(<NFTDonationsPage />);
    expect(screen.getByRole('status', { name: 'tables.skeleton.loadingNft' })).toBeInTheDocument();
  });

  it('says what fills an empty page', () => {
    mockUseDonationsNFTList.mockReturnValue(state({ data: [] }));
    render(<NFTDonationsPage />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'No attached NFTs yet' }),
    ).toBeInTheDocument();
  });

  it('offers a retry when the records cannot be read', () => {
    const refetch = jest.fn();
    mockUseDonationsNFTList.mockReturnValue(state({ isError: true, refetch }));
    render(<NFTDonationsPage />);
    fireEvent.click(screen.getByRole('button', { name: /Try again/ }));
    expect(refetch).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    mockUseDonationsNFTList.mockReturnValue(state({ data: [record(1, 100)] }));
    const { container } = render(<NFTDonationsPage />);
    await checkA11y(container);
  });
});
