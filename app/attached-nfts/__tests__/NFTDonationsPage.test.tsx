import { checkA11y, render, screen } from '@/test-utils';

import NFTDonationsPage from '../NFTDonationsPage';

const mockUseDonationsNFTList = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useDonationsNFTList: (...args: unknown[]) => mockUseDonationsNFTList(...args),
}));

jest.mock('../../../components/donations/DonatedNFTTable', () => ({
  __esModule: true,
  default: ({ list }: { list: unknown[] }) => (
    <div data-testid="nft-table">rows: {list.length}</div>
  ),
}));

beforeEach(() => jest.clearAllMocks());

describe('NFTDonationsPage', () => {
  it('renders the heading', () => {
    mockUseDonationsNFTList.mockReturnValue({ data: null });
    render(<NFTDonationsPage />);
    expect(screen.getByText('Attached NFT Contributions')).toBeInTheDocument();
  });

  it('shows loading when data is null', () => {
    mockUseDonationsNFTList.mockReturnValue({ data: null });
    render(<NFTDonationsPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the table when data is available', () => {
    mockUseDonationsNFTList.mockReturnValue({
      data: [{ id: 1 }, { id: 2 }],
    });
    render(<NFTDonationsPage />);
    expect(screen.getByTestId('nft-table')).toHaveTextContent('rows: 2');
  });

  it('renders empty table for empty array', () => {
    mockUseDonationsNFTList.mockReturnValue({ data: [] });
    render(<NFTDonationsPage />);
    expect(screen.getByTestId('nft-table')).toHaveTextContent('rows: 0');
  });

  it('does not show loading when data is an array', () => {
    mockUseDonationsNFTList.mockReturnValue({ data: [] });
    render(<NFTDonationsPage />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseDonationsNFTList.mockReturnValue({ data: [] });
    const { container } = render(<NFTDonationsPage />);
    await checkA11y(container);
  });
});
