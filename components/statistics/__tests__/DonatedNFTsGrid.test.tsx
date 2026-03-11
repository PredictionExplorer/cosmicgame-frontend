import { render, screen, checkA11y } from '@/test-utils';

import { DonatedNFTsGrid } from '../DonatedNFTsGrid';

jest.mock('../../donations/DonatedNFT', () => ({
  __esModule: true,
  default: ({ nft }: { nft: { RecordId: string | number } }) => (
    <div data-testid="donated-nft">{nft.RecordId}</div>
  ),
}));

jest.mock('../../common/CustomPagination', () => ({
  CustomPagination: () => <div data-testid="pagination" />,
}));

describe('DonatedNFTsGrid', () => {
  it('renders heading', () => {
    render(<DonatedNFTsGrid nftDonations={[]} />);
    expect(screen.getByText('Donated NFTs')).toBeInTheDocument();
  });

  it('shows empty message when no donations', () => {
    render(<DonatedNFTsGrid nftDonations={[]} />);
    expect(screen.getByText('No ERC721 tokens were donated on this round.')).toBeInTheDocument();
  });

  it('renders donated NFTs when list is non-empty', () => {
    const nfts = [{ RecordId: 'a' }, { RecordId: 'b' }];
    render(<DonatedNFTsGrid nftDonations={nfts} />);
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
  });

  it('renders pagination when list has items', () => {
    const nfts = [{ RecordId: 'a' }];
    render(<DonatedNFTsGrid nftDonations={nfts} />);
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DonatedNFTsGrid nftDonations={[]} />);
    await checkA11y(container);
  });
});
