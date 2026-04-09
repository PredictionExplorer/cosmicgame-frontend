import { checkA11y, render, screen } from '@/test-utils';

import NamedNFTsPage from '../NamedNFTsPage';

const mockUseNamedNFTs = jest.fn();

jest.mock('../../../../hooks/useApiQuery', () => ({
  useNamedNFTs: (...args: unknown[]) => mockUseNamedNFTs(...args),
}));

jest.mock('../../../../components/common/CustomPagination', () => ({
  CustomPagination: () => <div data-testid="pagination">Pagination</div>,
}));

jest.mock('../../../../utils', () => ({
  convertTimestampToDateTime: (ts: number) => `date-${ts}`,
}));

beforeEach(() => jest.clearAllMocks());

describe('NamedNFTsPage', () => {
  it('renders the heading', () => {
    mockUseNamedNFTs.mockReturnValue({ data: [], isLoading: false });
    render(<NamedNFTsPage />);
    expect(screen.getByText('Named Cosmic Signature Tokens')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseNamedNFTs.mockReturnValue({ data: [], isLoading: true });
    render(<NamedNFTsPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows empty message when no NFTs', () => {
    mockUseNamedNFTs.mockReturnValue({ data: [], isLoading: false });
    render(<NamedNFTsPage />);
    expect(screen.getByText('No named tokens')).toBeInTheDocument();
  });

  it('renders table rows for NFT data', () => {
    mockUseNamedNFTs.mockReturnValue({
      data: [
        { MintTimeStamp: 1000, TokenId: 1, TokenName: 'Alpha' },
        { MintTimeStamp: 2000, TokenId: 2, TokenName: 'Beta' },
      ],
      isLoading: false,
    });
    render(<NamedNFTsPage />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('renders pagination when data exists', () => {
    mockUseNamedNFTs.mockReturnValue({
      data: [{ MintTimeStamp: 1000, TokenId: 1, TokenName: 'Alpha' }],
      isLoading: false,
    });
    render(<NamedNFTsPage />);
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('does not render pagination when empty', () => {
    mockUseNamedNFTs.mockReturnValue({ data: [], isLoading: false });
    render(<NamedNFTsPage />);
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseNamedNFTs.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<NamedNFTsPage />);
    await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
  });
});
