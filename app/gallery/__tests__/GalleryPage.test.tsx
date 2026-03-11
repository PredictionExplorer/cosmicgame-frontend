import { render, screen } from '@/test-utils';

import GalleryPage from '../GalleryPage';

const mockUseCSTList = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  error: null,
});

jest.mock('../../../hooks/useApiQuery', () => ({
  useCSTList: (...args: unknown[]) => mockUseCSTList(...args),
}));

jest.mock('../../../components/nft/PaginationGrid', () => ({
  __esModule: true,
  default: ({ data, loading }: { data: unknown[]; loading: boolean }) => (
    <div data-testid="grid">{loading ? 'Loading...' : `items: ${data.length}`}</div>
  ),
}));

beforeEach(() => jest.clearAllMocks());

describe('GalleryPage', () => {
  it('passes loading state to PaginationGrid', () => {
    mockUseCSTList.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<GalleryPage />);
    expect(screen.getByTestId('grid')).toHaveTextContent('Loading...');
  });

  it('sorts NFTs by TokenId descending', () => {
    mockUseCSTList.mockReturnValue({
      data: [{ TokenId: '1' }, { TokenId: '3' }, { TokenId: '2' }],
      isLoading: false,
      error: null,
    });
    render(<GalleryPage />);
    expect(screen.getByTestId('grid')).toHaveTextContent('items: 3');
  });

  it('handles empty data gracefully', () => {
    mockUseCSTList.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<GalleryPage />);
    expect(screen.getByTestId('grid')).toHaveTextContent('items: 0');
  });

  it('renders the page title', () => {
    mockUseCSTList.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<GalleryPage />);
    expect(screen.getByText('CosmicSignature')).toBeInTheDocument();
    expect(screen.getByText('NFT Gallery')).toBeInTheDocument();
  });
});
