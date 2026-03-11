import { checkA11y, render, screen } from '@/test-utils';

import UsedRwlkNftsPage from '../UsedRwlkNftsPage';

const mockUseUsedRWLKNFTs = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useUsedRWLKNFTs: (...args: unknown[]) => mockUseUsedRWLKNFTs(...args),
}));

jest.mock('../../../components/common/CustomPagination', () => ({
  CustomPagination: () => <div data-testid="pagination">Pagination</div>,
}));

jest.mock('../../../utils', () => ({
  getExplorerUrl: (type: string, hash: string) => `https://explorer/${type}/${hash}`,
  convertTimestampToDateTime: (ts: number) => `date-${ts}`,
}));

beforeEach(() => jest.clearAllMocks());

describe('UsedRwlkNftsPage', () => {
  it('renders the heading', () => {
    mockUseUsedRWLKNFTs.mockReturnValue({ data: [], isLoading: false });
    render(<UsedRwlkNftsPage />);
    expect(screen.getByText('Used Random Walk NFTs')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseUsedRWLKNFTs.mockReturnValue({ data: [], isLoading: true });
    render(<UsedRwlkNftsPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows empty message when no NFTs', () => {
    mockUseUsedRWLKNFTs.mockReturnValue({ data: [], isLoading: false });
    render(<UsedRwlkNftsPage />);
    expect(screen.getByText('No NFTs yet.')).toBeInTheDocument();
  });

  it('renders table rows for NFT data', () => {
    mockUseUsedRWLKNFTs.mockReturnValue({
      data: [
        {
          RWalkTokenId: 42,
          BidderAddr: '0xABC',
          RoundNum: 5,
          TxHash: '0xTX1',
          TimeStamp: 1000,
        },
      ],
      isLoading: false,
    });
    render(<UsedRwlkNftsPage />);
    expect(screen.getByText('0xABC')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders pagination when data exists', () => {
    mockUseUsedRWLKNFTs.mockReturnValue({
      data: [
        {
          RWalkTokenId: 1,
          BidderAddr: '0x1',
          RoundNum: 1,
          TxHash: '0xT',
          TimeStamp: 1000,
        },
      ],
      isLoading: false,
    });
    render(<UsedRwlkNftsPage />);
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('does not render pagination when empty', () => {
    mockUseUsedRWLKNFTs.mockReturnValue({ data: [], isLoading: false });
    render(<UsedRwlkNftsPage />);
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseUsedRWLKNFTs.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<UsedRwlkNftsPage />);
    await checkA11y(container);
  });
});
